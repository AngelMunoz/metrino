import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

async function openTiles(page: Page): Promise<void> {
  await gotoReadyRoute(page, "/#/tiles", page.locator("metrino-tiles-page h1"));
}

/**
 * Feeds a live tile two headlines and the given interval through the real
 * imperative API the demo documents.
 */
async function fillLiveTile(tile: Locator, interval: number | null): Promise<void> {
  await tile.evaluate((el, value) => {
    const tile = el as HTMLElement & {
      interval?: number;
      setItems: (items: { title: string }[]) => void;
    };
    if (value !== null) tile.interval = value;
    tile.setItems([{ title: "First" }, { title: "Second" }]);
  }, interval);
}

test.describe("tiles page use cases", () => {
  test("user sets a live tile interval and the tile keeps to it", async ({
    page,
  }) => {
    await openTiles(page);
    await fillLiveTile(page.locator("#live-tile-demo"), 800);

    const headline = page.locator("#live-tile-demo .live-content.active .live-title");
    await expect(headline).toHaveText("First");
    await expect(headline).toHaveText("Second", { timeout: 3_000 });
  });

  test("user taps a tile once and the page sees one click", async ({ page }) => {
    await openTiles(page);

    // A page-level counter on each tile host. The listener body has to be
    // self-contained: Playwright serializes it into the page without its scope.
    const countClicks = (el: Element) => {
      const store = window as unknown as { tileClicks: Record<string, number> };
      store.tileClicks ??= {};
      store.tileClicks[el.id || el.tagName] = 0;
      el.addEventListener("click", (e) => {
        store.tileClicks[el.id || el.tagName] += 1;
        // Tiles navigate in a real app; here that would reload the page.
        e.preventDefault();
      });
    };
    await page.locator("#cycle-tile-demo").evaluate(countClicks);
    await page.locator("metro-iconic-tile").first().evaluate(countClicks);

    await page.locator("#cycle-tile-demo").click();
    await page.locator("metro-iconic-tile").first().click();

    const counts = await page.evaluate(
      () => (window as unknown as { tileClicks: Record<string, number> }).tileClicks
    );
    expect(counts["cycle-tile-demo"]).toBe(1);
    expect(counts["METRO-ICONIC-TILE"]).toBe(1);
  });
});
