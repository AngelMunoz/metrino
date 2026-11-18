/**
 * Captures the PR4 motion artifacts into artifacts/pr4/ for human review: the
 * indeterminate progress dots travelling with a transform, the one progress-ring orbit in
 * both the component and the animations page, and a flip tile turning on the Y axis.
 *
 * The demo server must already be running:
 *   pnpm exec vite --mode demo --strictPort --no-open
 *   node scripts/capture-artifacts-pr4.mjs
 *
 * Frames come from a paused animation clock, so each one lands at a fixed offset instead
 * of depending on screenshot latency. The flip tile transitions rather than animates, so
 * its frame is taken by timing.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:5173";
const outDir = "artifacts/pr4";

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
// A 2x scale makes the 2-4px ring dots and the progress dots readable in a still frame.
const page = await browser.newPage({
  viewport: { width: 1024, height: 768 },
  deviceScaleFactor: 2,
});

/**
 * Screenshots one element with every animation of the page frozen at `atMs`.
 * @param {string} selector - Playwright selector of the element to capture.
 * @param {string} file - File name inside the artifact folder.
 * @param {number} atMs - Animation time to freeze at.
 */
async function frozenFrame(selector, file, atMs) {
  await page.waitForFunction(() => document.getAnimations().length > 0);
  await page.evaluate((offset) => {
    document.getAnimations().forEach((animation) => {
      animation.pause();
      animation.currentTime = offset;
    });
  }, atMs);
  await page.locator(selector).screenshot({ path: `${outDir}/${file}` });
  await page.evaluate(() => {
    document.getAnimations().forEach((animation) => animation.play());
  });
}

await page.goto(`${baseUrl}/#/progress`);
await page.locator("metrino-progress-page h1").waitFor();

// The track is 4px tall, so the frames show the section that holds it.
const dotsSection =
  "metrino-progress-page .section:has(metro-progress-bar[indeterminate])";

await page.locator(dotsSection).waitFor();
await frozenFrame(dotsSection, "progress-dots-1.png", 300);
await frozenFrame(dotsSection, "progress-dots-2.png", 1500);

await frozenFrame("metrino-progress-page .ring-row", "ring-orbit-1.png", 0);
await frozenFrame("metrino-progress-page .ring-row", "ring-orbit-2.png", 1000);

await page.goto(`${baseUrl}/#/tiles`);
await page.locator("metrino-tiles-page h1").waitFor();
const tile = page.locator("metro-flip-tile#flip-tile-medium");
await tile.scrollIntoViewIfNeeded();
// The flip is a 333ms transition, so a screenshot by timing lands after it settled.
// Slowing the token that drives it puts a real mid-turn frame inside the wait.
await tile.evaluate((el) =>
  el.style.setProperty("--metro-transition-slow", "3000ms"),
);
await tile.click();
await page.waitForTimeout(900);
// An element screenshot waits for the element to stop moving, which is exactly what a
// mid-turn frame is not, so the whole viewport is captured with the tile in it.
await page.screenshot({ path: `${outDir}/flip-mid.png` });

await browser.close();
console.log(`Captured artifacts into ${outDir}/`);
