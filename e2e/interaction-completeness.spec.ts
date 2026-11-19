import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * Grab-to-pan, list entrance stagger and tree expand glide: the interaction
 * completeness batch. Every gate drives the real demo with mouse/keyboard and
 * asserts observable outcomes, not internals.
 */

async function mouseDrag(
  page: Page,
  target: Locator,
  axis: "x" | "y",
  delta: number
): Promise<void> {
  const box = await target.boundingBox();
  expect(box, "the scroller has no box to drag").not.toBeNull();
  const cx = box!.x + Math.min(box!.width / 2, 400);
  const cy = box!.y + Math.min(box!.height / 2, 200);
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + (axis === "x" ? delta : 0), cy + (axis === "y" ? delta : 0), {
    steps: 12,
  });
  await page.mouse.up();
}

const scrollOf = (target: Locator, axis: "x" | "y"): Promise<number> =>
  target.evaluate((el, a) => (a === "x" ? el.scrollLeft : el.scrollTop), axis);

/** During a view transition the snapshot tree owns input: drags must wait it out. */
async function waitTurnstileSettled(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(() => !document.documentElement.matches(":active-view-transition"))
    )
    .toBe(true);
}

/** Wait for the scroll to rest: three consecutive equal reads. */
async function waitScrollRest(target: Locator, axis: "x" | "y"): Promise<void> {
  let last = -1;
  let stable = 0;
  await expect
    .poll(
      async () => {
        const value = await scrollOf(target, axis);
        stable = value === last ? stable + 1 : 0;
        last = value;
        return stable;
      },
      { timeout: 6000, intervals: [100] }
    )
    .toBeGreaterThanOrEqual(2);
}

const hubScroller = (page: Page) =>
  page.locator("metro-hub").first().locator(".hub-container");
const gridScroller = (page: Page) =>
  page.locator("metro-grid-view").first().locator(".grid-container");
const listScroller = (page: Page) =>
  page.locator("metro-list-view").first().locator(".list-container");
const longListScroller = (page: Page) =>
  page.locator("metro-long-list-selector").first().locator(".list-container");

test.describe("grab-to-pan", () => {
  test("mouse drag pans the hub and the fling carries on", async ({ page }) => {
    await page.goto("/#/");
    await page.locator(".hub-item").first().waitFor();
    const hub = hubScroller(page);
    await hub.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await waitTurnstileSettled(page);

    const start = await scrollOf(hub, "x");
    await mouseDrag(page, hub, "x", -250);
    const released = await scrollOf(hub, "x");

    expect(released, "the drag never panned the hub").toBeGreaterThan(start);
    expect(page.url(), "a pan must not activate the item under the pointer").toContain(
      "#/"
    );
    expect(page.url()).not.toContain("#/buttons");

    // A plain tap still navigates: the pan suppression must not eat real clicks.
    await page.locator(".hub-item").first().click();
    await expect(page.locator("metrino-buttons-page h1")).toBeVisible();
  });

  test("a drag pans without selecting text", async ({ page }) => {
    await page.goto("/#/");
    await page.locator(".hub-item").first().waitFor();
    const hub = hubScroller(page);
    await hub.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await waitTurnstileSettled(page);

    // A consumer-styled scroller must keep its own user-select after the drag.
    await hub.evaluate((el) => {
      el.style.userSelect = "text";
    });
    const box = await hub.boundingBox();
    const cx = box!.x + 500;
    const cy = box!.y + 150;
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx - 200, cy, { steps: 10 });
    expect(
      await page.evaluate(() => window.getSelection()?.toString() ?? ""),
      "the pan selected text mid-drag"
    ).toBe("");
    await page.mouse.up();
    expect(
      await page.evaluate(() => window.getSelection()?.toString() ?? ""),
      "the pan left a text selection behind"
    ).toBe("");
    expect(
      await hub.evaluate((el) => el.style.userSelect),
      "the pan clobbered a consumer-set user-select"
    ).toBe("text");
  });

  test("mouse drag pans the grid vertically and taps still select", async ({
    page,
  }) => {
    await page.goto("/#/selection");
    await page.locator("metro-grid-view .grid-item").first().waitFor();
    const grid = gridScroller(page);
    await grid.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await waitTurnstileSettled(page);

    const start = await scrollOf(grid, "y");
    await mouseDrag(page, grid, "y", -250);
    const released = await scrollOf(grid, "y");
    expect(released, "the drag never panned the grid").toBeGreaterThan(start);

    // Cross-axis gesture must not grab: horizontal drag leaves the scroll alone.
    // Let the vertical fling rest first, or its carry-on reads as a cross-axis pan.
    await waitScrollRest(grid, "y");
    const before = await scrollOf(grid, "y");
    await mouseDrag(page, grid, "x", -250);
    expect(await scrollOf(grid, "y"), "a horizontal drag panned vertically").toBe(
      before
    );
    expect(
      await page.evaluate(() => window.getSelection()?.toString() ?? ""),
      "a cross-axis drag selected text"
    ).toBe("");

    const itemClick = page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          document.addEventListener(
            "itemclick",
            (e) => resolve((e as CustomEvent<{ index: number }>).detail.index),
            { once: true }
          );
        })
    );
    const tapped = page.locator("metro-grid-view .grid-item").first();
    const tappedIndex = Number(await tapped.getAttribute("data-index"));
    await tapped.click();
    expect(await itemClick, "a tap after panning never reached the item").toBe(
      tappedIndex
    );
  });

  test("mouse drag pans list-view and long-list-selector", async ({ page }) => {
    await page.goto("/#/selection");
    await page.locator("metro-list-view .list-item").first().waitFor();
    await page.locator("metro-long-list-selector .list-item").first().waitFor();

    await waitTurnstileSettled(page);
    for (const scroller of [listScroller(page), longListScroller(page)]) {
      await scroller.evaluate((el) => el.scrollIntoView({ block: "center" }));
      const start = await scrollOf(scroller, "y");
      await mouseDrag(page, scroller, "y", -200);
      expect(
        await scrollOf(scroller, "y"),
        "the drag never panned the list"
      ).toBeGreaterThan(start);
    }
  });

});

