/**
 * Captures the PR6 artifacts into artifacts/pr6/ for human review: the semantic
 * zoom overview built from grouped content, the list after re-entering a group
 * from that overview, and the long list selector's full-screen jump grid.
 *
 * The demo server must already be running:
 *   pnpm exec vite --mode demo --strictPort --no-open
 *   node scripts/capture-artifacts-pr6.mjs
 *
 * The re-entry capture waits for the group header to actually reach the top of
 * the list, so the picture shows where the component landed rather than a frame
 * of the glide.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:5173";
const outDir = "artifacts/pr6";

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 768 } });

/**
 * Waits until the page takes input again. A route change runs the root turnstile
 * inside a view transition, and the document is not hit-testable while one is
 * active. Same wait the e2e helper (gotoReadyRoute) uses.
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

await page.goto(`${baseUrl}/#/selection`);
await page.locator("metrino-selection-page h1").waitFor();
await waitReady();

const zoom = page.locator("metro-semantic-zoom");
await zoom.scrollIntoViewIfNeeded();
const clip = await zoom.boundingBox();
if (!clip) throw new Error("the semantic zoom has no bounding box");

// Overview: the four groups as tiles, each carrying its key and its count.
await zoom.locator(".zoom-hint").click();
await page.waitForFunction(
  (host) => host.getAttribute("zoomed") === "out",
  await zoom.elementHandle()
);
await page.waitForTimeout(600);
await page.screenshot({ path: `${outDir}/zoom-overview.png`, clip });

// Re-entry: the third tile is tapped, the zoomed-in list glides to that group.
const tiles = zoom.locator('[slot="zoomed-out"] [data-group-key]');
const target = await tiles.nth(2).getAttribute("data-group-key");
if (!target) throw new Error("the overview has no third group");
await tiles.nth(2).click();

await page.waitForFunction(
  ({ host, groupKey }) => {
    if (host.getAttribute("zoomed") !== "in") return false;
    const header = host.querySelector(
      `[slot="zoomed-in"] [data-group-key="${groupKey}"]`
    );
    const scroller = host.querySelector("[slot='zoomed-in']");
    if (!header || !scroller) return false;
    return (
      Math.abs(
        header.getBoundingClientRect().top - scroller.getBoundingClientRect().top
      ) <= 4
    );
  },
  { host: await zoom.elementHandle(), groupKey: target }
);
await page.screenshot({ path: `${outDir}/zoom-reentered-group.png`, clip });

// Jump grid: one tile per group of the 10,000-item list, opened from a header.
const list = page.locator("metro-long-list-selector");
await list.scrollIntoViewIfNeeded();
await list.locator(".group-header").first().click();
const dialog = list.locator('[role="dialog"]');
await dialog.waitFor();
await page.waitForTimeout(600);
await page.screenshot({ path: `${outDir}/jump-grid-open.png` });

await browser.close();
console.log(`Captured artifacts into ${outDir}/`);
