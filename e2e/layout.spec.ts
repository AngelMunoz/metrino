import { test, expect, type Locator } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

/** Top-left point of every box a locator matches. */
async function origins(locator: Locator): Promise<{ x: number; y: number }[]> {
  return locator.evaluateAll((els) =>
    els.map((el) => {
      const rect = el.getBoundingClientRect();
      return { x: Math.round(rect.x), y: Math.round(rect.y) };
    })
  );
}

test.describe("layout page use cases", () => {
  test.beforeEach(async ({ page }) => {
    await gotoReadyRoute(
      page,
      "/#/layout",
      page.locator("metrino-layout-page h1")
    );
  });

  test("user wraps a vertical panel downwards and then across", async ({
    page,
  }) => {
    const items = await origins(
      page.locator("#vertical-wrap-panel .demo-box")
    );

    // A column panel fills its height first, so the next item lands below.
    expect(items[1].y).toBeGreaterThan(items[0].y);
    expect(items[1].x).toBe(items[0].x);
    // 200px of height holds three 60px boxes, so the fourth starts a column.
    expect(items[3].x).toBeGreaterThan(items[0].x);
    expect(items[3].y).toBe(items[0].y);
  });

  test("user wraps a horizontal panel across and then down", async ({
    page,
  }) => {
    const items = await origins(
      page.locator("metro-wrap-panel[orientation='horizontal'] .demo-box")
    );

    expect(items[1].x).toBeGreaterThan(items[0].x);
    expect(items[1].y).toBe(items[0].y);
    // 400px wide holds five 80px boxes, so the sixth drops to the next row.
    expect(items[5].y).toBeGreaterThan(items[0].y);
    expect(items[5].x).toBe(items[0].x);
  });
});
