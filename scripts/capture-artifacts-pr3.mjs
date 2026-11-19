/**
 * Captures the PR3 scroll-motion artifacts into artifacts/pr3/ for human
 * review: a panorama fling mid-glide and at rest, the semantic zoom overview,
 * and the semantic-zoom fallback transition on an engine without View
 * Transitions.
 *
 * The demo server must already be running:
 *   pnpm exec vite --mode demo --strictPort --no-open
 *   node scripts/capture-artifacts-pr3.mjs
 *
 * The fallback frames come from a paused animation clock, so each one lands at
 * a fixed offset. The panorama glide is scripted per-frame scrolling with no
 * animation object to pause, so its frames are spaced in real time.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:5173";
const outDir = "artifacts/pr3";

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  hasTouch: true,
});

/**
 * Resolves once no view transition holds the document, so input reaches the
 * page instead of the snapshot layer. The route renders inside the
 * transition's update callback, so the content is waited for first: that makes
 * sure the transition has started before it is waited out.
 * @param {import("playwright").Page} page - The page to watch
 * @param {string} selector - A CSS selector inside the route, shadow-piercing
 */
async function waitForRoute(page, selector) {
  await page.waitForSelector(selector, { timeout: 15_000 });
  await page
    .waitForFunction(
      () =>
        !document
          .getAnimations()
          .some((animation) =>
            (animation.animationName ?? "").includes("view-transition")
          ),
      null,
      { timeout: 10_000 }
    )
    .catch(() => {});
}

/**
 * Screenshots a transition frame by frame from a held animation clock.
 *
 * The clock runs as a rAF loop that pauses the transition and seeks it to the
 * requested offset, so a short transition cannot finish before the first
 * screenshot the way it does when the pause is applied after the trigger.
 * The animations are read off the animating elements, because
 * `document.getAnimations()` does not report animations of elements inside a
 * shadow root.
 * @param {import("playwright").Page} page - The page to capture
 * @param {string} prefix - File name stem; files become `<prefix>-<n>.png`.
 * @param {number[]} offsets - Animation-time offsets in ms.
 * @param {string[]} targets - Selectors of the elements that transition
 * @param {() => Promise<unknown>} trigger - The interaction that starts the transition.
 */
async function captureFrames(page, prefix, offsets, targets, trigger) {
  const handles = await Promise.all(
    targets.map((selector) => page.locator(selector).elementHandle())
  );

  await page.evaluate((elements) => {
    window.__clock = { time: 0 };
    const hold = () => {
      for (const element of elements) {
        for (const animation of element.getAnimations()) {
          animation.pause();
          animation.currentTime = window.__clock.time;
        }
      }
      requestAnimationFrame(hold);
    };
    requestAnimationFrame(hold);
  }, handles);

  await trigger();

  for (let index = 0; index < offsets.length; index += 1) {
    await page.evaluate((offset) => {
      window.__clock.time = offset;
    }, offsets[index]);
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(resolve))
    );
    await page.screenshot({ path: `${outDir}/${prefix}-${index + 1}.png` });
  }

  await page.evaluate(
    (elements) => {
      for (const element of elements) {
        for (const animation of element.getAnimations()) animation.play();
      }
    },
    handles
  );
}

// ─── Panorama: the glide is no longer re-snapped every frame ─────────────────

const page = await context.newPage();
await page.goto(`${baseUrl}/#/navigation`);
await waitForRoute(page, "#metro-panorama metro-panorama");

const panorama = page.locator("#metro-panorama metro-panorama");
await panorama.scrollIntoViewIfNeeded();
const container = panorama.locator(".panorama-container");
const box = await container.boundingBox();

// The demo clips the host to 300px while the items keep their 400px min-height,
// so the drag starts near the container's top edge, where it is still visible.
const dragY = Math.round(box.y + 40);
let dragX = Math.round(box.x + box.width * 0.9);

await page.mouse.move(dragX, dragY);
await page.mouse.down();
for (let step = 0; step < 12; step += 1) {
  dragX -= 30;
  await page.mouse.move(dragX, dragY);
  await page.waitForTimeout(8);
}
await page.mouse.up();

for (let index = 1; index <= 3; index += 1) {
  await page.screenshot({ path: `${outDir}/panorama-fling-frame-${index}.png` });
  await page.waitForTimeout(350);
}

await page.waitForFunction(() => {
  const scroller = document
    .querySelector("metrino-app")
    ?.shadowRoot?.querySelector("metrino-navigation-page")
    ?.shadowRoot?.querySelector("metro-panorama")
    ?.shadowRoot?.querySelector(".panorama-container");
  return (
    scroller &&
    getComputedStyle(scroller).scrollSnapType.includes("mandatory")
  );
}, null, { timeout: 15_000 });
await page.screenshot({ path: `${outDir}/panorama-settled.png` });
await page.close();

// ─── Semantic zoom: the overview after a pinch ───────────────────────────────

const touchPage = await context.newPage();
await touchPage.goto(`${baseUrl}/#/selection`);
await waitForRoute(touchPage, "metro-semantic-zoom");

const zoom = touchPage.locator("metro-semantic-zoom");
await zoom.scrollIntoViewIfNeeded();
const zoomBox = await zoom.boundingBox();
const centerX = Math.round(zoomBox.x + zoomBox.width / 2);
const centerY = Math.round(zoomBox.y + zoomBox.height / 2);

const cdp = await touchPage.context().newCDPSession(touchPage);
const send = (type, points) =>
  cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });
const pinchPoints = (gap) => [
  { x: centerX - gap, y: centerY, id: 1 },
  { x: centerX + gap, y: centerY, id: 2 },
];

await send("touchStart", pinchPoints(120));
for (let step = 1; step <= 6; step += 1) {
  await send("touchMove", pinchPoints(120 - step * 18));
  await touchPage.waitForTimeout(16);
}
await send("touchEnd", []);

await touchPage.waitForSelector("metro-semantic-zoom[zoomed='out']", {
  timeout: 10_000,
});
await touchPage.screenshot({ path: `${outDir}/semantic-zoom-overview.png` });
await cdp.detach();
await touchPage.close();

// ─── Semantic zoom: the fallback transition without View Transitions ─────────

const fallbackPage = await context.newPage();
await fallbackPage.addInitScript(() => {
  delete Document.prototype.startViewTransition;
});
await fallbackPage.goto(`${baseUrl}/#/selection`);
await waitForRoute(fallbackPage, "metro-semantic-zoom");
await fallbackPage.locator("metro-semantic-zoom").scrollIntoViewIfNeeded();

await captureFrames(
  fallbackPage,
  "semantic-zoom-fallback-frame",
  [0, 150, 300],
  ["metro-semantic-zoom .zoomed-in", "metro-semantic-zoom .zoomed-out"],
  () => fallbackPage.locator("metro-semantic-zoom .zoom-hint").click()
);

await fallbackPage.close();
await browser.close();
console.log(`Captured artifacts into ${outDir}/`);
