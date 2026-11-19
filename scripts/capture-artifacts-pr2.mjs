/**
 * Captures the PR2 motion artifacts into artifacts/pr2/ for human review:
 * the content dialog swivel entrance, the open settings flyout, and the root
 * turnstile route change.
 *
 * The demo server must already be running:
 *   pnpm exec vite --mode demo --strictPort --no-open
 *   node scripts/capture-artifacts-pr2.mjs
 *
 * Frames come from a paused animation clock, so each one lands at a fixed
 * offset instead of depending on screenshot latency. When the browser exposes
 * no animation to pause, the script falls back to real-time spacing.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:5173";
const outDir = "artifacts/pr2";

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

/**
 * Screenshots an entrance frame by frame.
 * @param {string} prefix - File name stem; files become `<prefix>-<n>.png`.
 * @param {number} count - Number of frames.
 * @param {number} stepMs - Animation-time offset between frames.
 * @param {() => Promise<void>} trigger - The interaction that starts the animation.
 */
async function captureFrames(prefix, count, stepMs, trigger) {
  await trigger();
  await page
    .waitForFunction(() => document.getAnimations().length > 0, null, {
      timeout: 5_000,
    })
    .catch(() => {});

  const pausable = await page.evaluate(() => {
    const animations = document.getAnimations();
    animations.forEach((animation) => animation.pause());
    return animations.length;
  });

  for (let index = 0; index < count; index += 1) {
    if (pausable) {
      await page.evaluate((offset) => {
        document
          .getAnimations()
          .forEach((animation) => (animation.currentTime = offset));
      }, index * stepMs);
    } else if (index > 0) {
      await page.waitForTimeout(stepMs);
    }
    await page.screenshot({ path: `${outDir}/${prefix}-${index + 1}.png` });
  }

  if (pausable) {
    await page.evaluate(() => {
      document.getAnimations().forEach((animation) => animation.play());
    });
  }
}

await page.goto(`${baseUrl}/#/dialogs`);
await page.locator("metrino-dialogs-page h1").waitFor();

await captureFrames(
  "content-dialog-swivel-frame",
  6,
  40,
  () =>
    page.locator("metro-button", { hasText: "Open Content Dialog" }).click(),
);
await page.locator("#content-dialog metro-button", { hasText: "OK" }).click();
await page.locator("#content-dialog").waitFor({ state: "hidden" });

await page.locator("metro-button", { hasText: "Open Settings" }).click();
await page.waitForFunction(() => {
  const host = document
    .querySelector("metrino-app")
    ?.shadowRoot?.querySelector("metrino-dialogs-page")
    ?.shadowRoot?.querySelector("#settings-flyout");
  const panel = host?.shadowRoot?.querySelector(".flyout-panel");
  return panel && getComputedStyle(panel).transform === "matrix(1, 0, 0, 1, 0, 0)";
});
await page.screenshot({ path: `${outDir}/settings-flyout-open.png` });

await page.keyboard.press("Escape");
await page.waitForFunction(() => {
  const host = document
    .querySelector("metrino-app")
    ?.shadowRoot?.querySelector("metrino-dialogs-page")
    ?.shadowRoot?.querySelector("#settings-flyout");
  const panel = host?.shadowRoot?.querySelector(".flyout-panel");
  return panel && getComputedStyle(panel).transform === "matrix(1, 0, 0, 1, 346, 0)";
});

await captureFrames(
  "route-turnstile-frame",
  3,
  120,
  () => page.locator('metro-app-bar-button[label="Home"]').click(),
);
await page.locator("metrino-home h1.title").waitFor({ state: "visible" });

await browser.close();
console.log(`Captured artifacts into ${outDir}/`);
