/**
 * Captures the PR7 artifacts into artifacts/pr7/ for human review: the two
 * frames on either side of the panorama's circular-wrap seam, the zoomable
 * hub's section overview, and the hub after re-entering a section from it.
 *
 * The demo server must already be running:
 *   pnpm exec vite --mode demo --strictPort --no-open
 *   node scripts/capture-artifacts-pr7.mjs
 *
 * The seam frames are the crossing itself: the frame held mid-glide just
 * before the seam, where the copy of the first item comes in, and the frame at
 * rest on the first item's own snap position one cycle earlier. A reviewer
 * checks that the copy and the real item are the same picture.
 *
 * The route content lives inside the app shell's shadow root, so every read
 * goes through a locator (which pierces) rather than `document.querySelector`.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:5173";
const outDir = "artifacts/pr7";

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
    await page.waitForTimeout(100);
  }
}

/**
 * Waits until the page takes input again. A route change runs the root turnstile
 * inside a view transition, and the document is not hit-testable while one is
 * active. Same wait the e2e helper (gotoReadyRoute) uses.
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

await page.goto(`${baseUrl}/#/navigation`);
await page.locator("metrino-navigation-page h1").waitFor();
await waitReady();

const panorama = page.locator("metro-panorama").first();
await panorama.scrollIntoViewIfNeeded();
await page.waitForTimeout(300);

// The host clips the container to its own box, which is what the reader sees.
const clip = await panorama.boundingBox();
if (!clip) throw new Error("the panorama has no bounding box");

const geometry = await panorama.evaluate((host) => {
  const container = host.shadowRoot.querySelector(".panorama-container");
  const real = Array.from(
    host.querySelectorAll("metro-panorama-item:not([data-panorama-clone])")
  );
  const copy = host.querySelector('metro-panorama-item[data-panorama-clone="end"]');
  if (!copy) throw new Error("the demo panorama does not wrap");
  return {
    firstReal: real[0].offsetLeft,
    lastReal: real[real.length - 1].offsetLeft,
    seam: copy.offsetLeft,
    clientWidth: container.clientWidth,
    copies: host.querySelectorAll("metro-panorama-item[data-panorama-clone]").length,
  };
});

/**
 * Writes one panorama scroll position. With `hold`, the snap points stay off
 * for the caller's screenshot: a scripted write with them live is re-snapped by
 * the browser, which lands on the copy and hands it straight back to its real
 * twin — the component never rests past the seam.
 */
async function setScroll(offset, { hold = false } = {}) {
  await panorama.evaluate(
    (host, { value, freeze }) => {
      const container = host.shadowRoot.querySelector(".panorama-container");
      container.style.scrollSnapType = freeze ? "none" : "";
      container.scrollLeft = value;
    },
    { value: offset, freeze: hold }
  );
  await page.waitForTimeout(400);
  return panorama.evaluate((host) =>
    Math.round(host.shadowRoot.querySelector(".panorama-container").scrollLeft)
  );
}

/** Hands the snap points back to the browser. */
async function releaseScroll() {
  await panorama.evaluate((host) => {
    host.shadowRoot.querySelector(".panorama-container").style.scrollSnapType = "";
  });
  await page.waitForTimeout(300);
}

// Just before the crossing, held the way a glide holds it: the last item
// leaves the line and the copy of the first item is already coming in.
const beforeSeam = await setScroll(geometry.seam - 300, { hold: true });
await page.screenshot({ path: `${outDir}/wrap-seam-before.png`, clip });
await releaseScroll();

// Just after it: the first item itself, one cycle earlier, at rest on its own
// snap position.
const afterSeam = await setScroll(geometry.firstReal);
await page.screenshot({ path: `${outDir}/wrap-seam-after.png`, clip });

console.log(
  `panorama: ${geometry.copies} seam copies, scrollport ${geometry.clientWidth}, ` +
    `first item ${geometry.firstReal}, last ${geometry.lastReal}, seam ${geometry.seam}, ` +
    `cycle ${geometry.seam - geometry.firstReal}; frames hold ${beforeSeam} and ${afterSeam}`
);

// The zoomable hub: its overview of the four sections, then one section
// re-entered from a tile.
const hub = page.locator("metro-hub").first();
await hub.scrollIntoViewIfNeeded();
const hubClip = await hub.boundingBox();
if (!hubClip) throw new Error("the hub has no bounding box");

await hub.locator(".zoom-hint").click();
await waitFor(
  "the hub to zoom out",
  () =>
    hub.evaluate((host) => {
      const zoom = host.shadowRoot.querySelector("metro-semantic-zoom");
      return zoom.getAttribute("zoomed") === "out";
    })
);
await page.waitForTimeout(700);
await page.screenshot({ path: `${outDir}/hub-overview.png`, clip: hubClip });

await hub.locator('.hub-overview button[data-group-key="Section 3"]').click();
await waitFor(
  "Section 3 to reach the gutter line",
  () =>
    hub.evaluate((host) => {
      const zoom = host.shadowRoot.querySelector("metro-semantic-zoom");
      if (zoom.getAttribute("zoomed") !== "in") return false;
      const container = host.shadowRoot.querySelector(".hub-container");
      const section = host.querySelectorAll("metro-hub-section")[2];
      const gutter =
        parseFloat(getComputedStyle(container).paddingInlineStart) || 0;
      return (
        host.selectedIndex === 2 &&
        Math.abs(
          section.getBoundingClientRect().left -
            (container.getBoundingClientRect().left + gutter)
        ) <= 2
      );
    })
);
await page.screenshot({ path: `${outDir}/hub-reentered-section.png`, clip: hubClip });

await browser.close();
console.log(`Captured artifacts into ${outDir}/`);
