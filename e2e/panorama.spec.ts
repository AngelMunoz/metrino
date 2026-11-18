import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

declare global {
  interface Window {
    /** `scroll-snap-type` of the panorama container, sampled once per frame. */
    __panoramaSnap?: string[];
    /** `scrollLeft` of the panorama container, sampled once per frame. */
    __panoramaScroll?: number[];
  }
}

/**
 * Samples the panorama scroll state every frame. Recording the whole glide
 * instead of reading it once keeps the test free of timing races: a snap
 * takeover that lasts a single frame is still observed.
 */
async function recordGlide(container: Locator): Promise<void> {
  await container.evaluate((el) => {
    window.__panoramaSnap = [];
    window.__panoramaScroll = [];
    const sample = () => {
      window.__panoramaSnap?.push(getComputedStyle(el).scrollSnapType);
      window.__panoramaScroll?.push(el.scrollLeft);
      requestAnimationFrame(sample);
    };
    sample();
  });
}

/** Drags the panorama to the left and releases it with momentum. */
async function flingLeft(page: Page, container: Locator): Promise<void> {
  const box = await container.boundingBox();
  if (!box) throw new Error("panorama container has no bounding box");

  // The demo clips the host to 300px while the items keep their 400px
  // min-height, so the container's layout box reaches below the visible area.
  // Start the drag near its top edge, where hit-testing still resolves here.
  const y = box.y + 40;
  let x = box.x + box.width * 0.9;

  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let step = 0; step < 12; step++) {
    x -= 30;
    await page.mouse.move(x, y);
    await page.waitForTimeout(8);
  }
  await page.mouse.up();
}

test.describe("panorama use cases", () => {
  test("user flings the panorama and it settles on an item boundary", async ({
    page,
  }) => {
    const panorama = page.locator("#metro-panorama metro-panorama");
    await gotoReadyRoute(page, "/#/navigation", panorama);
    await panorama.scrollIntoViewIfNeeded();
    const container = panorama.locator(".panorama-container");
    await recordGlide(container);

    await flingLeft(page, container);

    // The scripted glide owns the scroll position, so it holds the snap points
    // off for its duration. Mandatory snap would re-snap every frame it writes.
    await expect
      .poll(
        () => container.evaluate((el) => getComputedStyle(el).scrollSnapType),
        { message: "the glide never finished", timeout: 15_000 }
      )
      .toContain("mandatory");

    const samples = await page.evaluate(() => ({
      snap: window.__panoramaSnap ?? [],
      scroll: window.__panoramaScroll ?? [],
    }));
    expect(
      samples.snap,
      "the glide must suppress the snap points while it runs"
    ).toContain("none");
    expect(
      Math.max(...samples.scroll),
      "the fling must actually scroll the panorama"
    ).toBeGreaterThan(100);

    const rest = await container.evaluate((el) => {
      const host = (el.getRootNode() as ShadowRoot).host as HTMLElement;
      const items = Array.from(
        host.querySelectorAll<HTMLElement>("metro-panorama-item")
      );
      const padding = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const offsets = items.map((item) =>
        Math.min(Math.max(item.offsetLeft - padding, 0), maxScroll)
      );
      const scrollLeft = el.scrollLeft;
      const nearest = offsets.reduce(
        (best, offset) =>
          Math.abs(offset - scrollLeft) < Math.abs(best - scrollLeft)
            ? offset
            : best,
        offsets[0] ?? 0
      );
      return {
        scrollLeft,
        nearest,
        snapType: getComputedStyle(el).scrollSnapType,
      };
    });

    expect(rest.snapType, "snap must be handed back to the browser").toContain(
      "x mandatory"
    );
    expect(
      Math.abs(rest.scrollLeft - rest.nearest),
      `settled at ${rest.scrollLeft}, nearest item boundary is ${rest.nearest}`
    ).toBeLessThanOrEqual(2);
  });

  test("parallax background follows the scroll without transition lag", async ({
    page,
  }) => {
    await page.goto("/#/navigation");
    const panorama = page.locator("#metro-panorama metro-panorama");
    const parallax = panorama.locator(".parallax-bg");

    await expect(parallax).toHaveCount(1);
    await expect(parallax).toHaveCSS("transition-duration", "0s");
  });
});
