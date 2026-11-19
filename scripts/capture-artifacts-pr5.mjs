/**
 * Captures the PR5 artifacts into artifacts/pr5/ for human review: the pivot row
 * following a swipe (two mid-drag frames), the state after a swipe wraps from the
 * last section to the first, and a content dialog opening under
 * prefers-reduced-motion with no entrance motion.
 *
 * The demo server must already be running:
 *   pnpm exec vite --mode demo --strictPort --no-open
 *   node scripts/capture-artifacts-pr5.mjs
 *
 * The swipe frames are taken while the pointer is still down, between two moves,
 * so the row is genuinely caught mid-drag rather than after it settled.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:5173";
const outDir = "artifacts/pr5";

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

/**
 * Waits until the page takes input again. A route change runs the root turnstile
 * inside a view transition, and the document is not hit-testable while one is
 * active: a drag that starts during it never reaches the pivot, which is how the
 * earlier captures came out at rest. Same wait the e2e helper (gotoReadyRoute)
 * uses.
 */
async function waitReady() {
  await page
    .waitForFunction(
      () =>
        !document
          .getAnimations()
          .some((animation) =>
            (animation.animationName ?? "").includes("view-transition")
          ),
      undefined,
      { timeout: 10_000 }
    )
    .catch(() => {});
}

/** Bounding box of the pivot content area, scrolled into view. */
async function pivotContentBox() {
  await page.goto(`${baseUrl}/#/navigation`);
  await page.locator("metrino-navigation-page h1").waitFor();
  await waitReady();
  const pivot = page.locator("#metro-pivot metro-pivot");
  await pivot.scrollIntoViewIfNeeded();
  return pivot.locator(".pivot-content").boundingBox();
}

/** Drags the content horizontally, holding the pointer at `holdPx` for a frame. */
async function dragAndHold(box, holdPx, file, clip) {
  const x = box.x + box.width / 2;
  const y = box.y + Math.min(40, box.height / 2);

  await page.mouse.move(x, y);
  await page.mouse.down();
  const steps = 10;
  for (let step = 1; step <= steps; step++) {
    const offset = (holdPx * step) / steps;
    await page.mouse.move(x + offset, y);
    await page.waitForTimeout(16);
  }
  if (file !== null) {
    await page.screenshot({ path: `${outDir}/${file}`, clip });
  }
  return { x, y };
}

const box = await pivotContentBox();
const pivot = page.locator("#metro-pivot metro-pivot");
const clip = await pivot.boundingBox();

// Mid-swipe: the row is under the pointer, between the first and second panels.
const held = await dragAndHold(box, -140, "pivot-swipe-mid-1.png", clip);
// Continue the same held drag to -220px in small steps, still inside the first
// panel: a single large jump left the content and the row read back at rest.
for (let step = 1; step <= 8; step++) {
  await page.mouse.move(held.x - 140 - step * 10, held.y);
  await page.waitForTimeout(16);
}
await page.screenshot({ path: `${outDir}/pivot-swipe-mid-2.png`, clip });
await page.mouse.up();
await page.waitForTimeout(500);

// Wrapped state: the last section swiped forward lands on the first one, with the
// row slid over one virtual position instead of running the track back.
await page.locator('#metro-pivot [role="tab"]', { hasText: "Fourth" }).click();
await page.waitForTimeout(500);
const fourthBox = await pivot.locator(".pivot-content").boundingBox();
await dragAndHold(fourthBox, -160, null, clip);
await page.mouse.up();
await page.waitForTimeout(700);
await page.screenshot({ path: `${outDir}/pivot-wrapped-first.png`, clip });

// Reduced motion: the dialog is open with no entrance transition running.
const reducedPage = await browser.newPage({
  viewport: { width: 1024, height: 768 },
  reducedMotion: "reduce",
});
await reducedPage.goto(`${baseUrl}/#/dialogs`);
await reducedPage.locator("metrino-dialogs-page h1").waitFor();
await reducedPage
  .locator("metro-button", { hasText: "Open Content Dialog" })
  .click();
await reducedPage.getByRole("dialog", { name: "Content Dialog" }).waitFor();
await reducedPage.screenshot({
  path: `${outDir}/dialog-reduced-motion.png`,
});
await reducedPage.close();

await browser.close();
console.log(`Captured artifacts into ${outDir}/`);
