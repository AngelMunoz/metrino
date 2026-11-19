/**
 * Captures the PR8 artifacts into artifacts/pr8/ for human review: the three frames of
 * one continuum flight a home tile makes into its page — at the origin, mid-flight, and
 * landed.
 *
 * The demo server must already be running:
 *   pnpm exec vite --mode demo --strictPort --no-open
 *   node scripts/capture-artifacts-pr8.mjs
 *
 * The flight is 150ms and its `transitionend` wait is bounded at 250ms, so the middle
 * frame cannot be photographed by waiting: most of an ease-out travel is done inside the
 * first 50ms. The capture therefore pauses the browser's own `CSSTransition` for the
 * clone and seeks it to a tenth of its running time, which is half of its distance on
 * that curve. That is the real transition of the real click, held at a chosen point
 * rather than a fabricated drawing; the timing the suite measures is the 150ms in
 * `styles/animations.css` and `utils/continuum.ts`, asserted in
 * `e2e/continuum.spec.ts`.
 *
 * A reviewer checks that the flying box is the tapped tile (same text, same accent fill),
 * that it travels on a translate alone (scale factors stay 1), and that it rests on the
 * destination title rather than anywhere else on the page.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:5173";
const outDir = "artifacts/pr8";

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

/** Waits until `check` reports true, then returns. */
async function waitFor(label, check, timeout = 10_000) {
  const started = Date.now();
  while (!(await check())) {
    if (Date.now() - started > timeout) {
      throw new Error(`timed out waiting for ${label}`);
    }
    await page.waitForTimeout(16);
  }
}

/**
 * Waits until the page takes input again. A route change runs the root turnstile inside a
 * view transition, and the document is not hit-testable while one is active. Same wait the
 * e2e helper (gotoReadyRoute) uses.
 */
async function waitReady() {
  await waitFor(
    "the route transition to settle",
    () =>
      page.evaluate(() =>
        !document
          .getAnimations()
          .some((animation) =>
            (animation.animationName ?? "").includes("view-transition")
          )
      ),
    10_000
  ).catch(() => {});
}

/**
 * Reads the clone's box and its travel so far. The two scale factors of the matrix are
 * what a reviewer checks: a translate keeps both at 1.
 */
async function readFlight() {
  return page.evaluate(() => {
    const clone = document.querySelector("body > [data-continuum-flight]");
    if (!clone) return null;

    const box = clone.getBoundingClientRect();
    const style = getComputedStyle(clone);
    const value = style.transform;

    let numbers = [1, 0, 0, 1, 0, 0];
    if (value !== "none") {
      const open = value.indexOf("(");
      numbers = value
        .slice(open + 1, value.lastIndexOf(")"))
        .split(",")
        .map(Number.parseFloat);
    }
    const three = numbers.length > 6;

    return {
      x: Math.round(box.x),
      y: Math.round(box.y),
      width: Math.round(box.width),
      height: Math.round(box.height),
      transform: value,
      duration: style.transitionDuration,
      scaleX: numbers[0],
      scaleY: three ? numbers[5] : numbers[3],
      travelledX: three ? numbers[12] : numbers[4],
      travelledY: three ? numbers[13] : numbers[5]
    };
  });
}

/**
 * Holds the clone's own transition at `fraction` of its running time, so the frame can be
 * photographed. Returns what was paused, or null when the transition had already finished
 * (the clone is then gone and there is nothing to hold).
 */
async function holdFlightAt(fraction) {
  return page.evaluate((part) => {
    const clone = document.querySelector("body > [data-continuum-flight]");
    if (!clone) return null;

    const transitions = document
      .getAnimations()
      .filter(
        (animation) =>
          animation.effect?.target === clone &&
          animation.transitionProperty === "transform"
      );
    if (transitions.length === 0) return null;

    for (const transition of transitions) {
      transition.pause();
      const time = (transition.effect?.getTotalTime?.() ?? 150) * part;
      transition.currentTime = time;
    }
    return {
      held: transitions.length,
      atMs: Math.round(
        (transitions[0].effect?.getTotalTime?.() ?? 150) * part
      )
    };
  }, fraction);
}

await page.goto(`${baseUrl}/#/`);
await page.locator("metrino-home h1").waitFor();
await waitReady();

const tile = page
  .locator("metrino-home .hub-item")
  .filter({ hasText: "metro-button" })
  .first();
const origin = await tile.boundingBox();
if (!origin) throw new Error("the metro-button tile has no bounding box");

await tile.click();

// Frame 1: the copy sits exactly where the tapped tile was, held there while the route
// module loads and the destination renders.
await waitFor(
  "the flight clone to appear",
  async () => (await readFlight()) !== null
);
const start = await readFlight();
await page.screenshot({ path: `${outDir}/flight-1-origin.png` });

// Frame 2: the real transition, paused and seeked to a tenth of its 150ms. The ease-out
// curve spends half its distance inside that tenth, so this is the frame that shows the
// item between the two places rather than at either of them.
await waitFor(
  "the clone's transition to start",
  async () => (await holdFlightAt(0.1)) !== null
);
const mid = await readFlight();
await page.screenshot({ path: `${outDir}/flight-2-mid.png` });

// The guard releases the hold: the clone is removed when the flight is over, and the
// destination is what is left on screen.
await waitFor(
  "the clone to be removed after landing",
  async () => (await readFlight()) === null,
  6_000
);
const landing = await page.locator("metrino-buttons-page h1").boundingBox();
await page.screenshot({ path: `${outDir}/flight-3-landed.png` });

const after = await readFlight();

console.log(
  `tile at ${Math.round(origin.x)},${Math.round(origin.y)} ` +
    `(${Math.round(origin.width)}x${Math.round(origin.height)}); ` +
    `start ${JSON.stringify(start)}; mid ${JSON.stringify(mid)}; ` +
    `clone after landing ${JSON.stringify(after)}; destination title at ` +
    `${landing && Math.round(landing.x)},${landing && Math.round(landing.y)}`
);
console.log(
  mid && mid.scaleX === 1 && mid.scaleY === 1
    ? "mid frame is translate-only (scale factors 1)"
    : `CHECK mid frame transform: ${mid && mid.transform}`
);

await browser.close();
console.log(`Captured artifacts into ${outDir}/`);
