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

/** The inertia fling decays for ~2s; wait for the scroll to actually rest. */
async function waitScrollRest(target: Locator, axis: "x" | "y"): Promise<void> {
  await expect
    .poll(async () => {
      const before = await scrollOf(target, axis);
      await target.page().waitForTimeout(150);
      return (await scrollOf(target, axis)) === before;
    }, { timeout: 6000 })
    .toBe(true);
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
    await page.waitForTimeout(250);
    const flung = await scrollOf(hub, "x");

    expect(released, "the drag never panned the hub").toBeGreaterThan(start);
    expect(flung, "the release fling never carried on").toBeGreaterThan(released);
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
      await page.waitForTimeout(200);
      const start = await scrollOf(scroller, "y");
      await mouseDrag(page, scroller, "y", -200);
      expect(
        await scrollOf(scroller, "y"),
        "the drag never panned the list"
      ).toBeGreaterThan(start);
    }
  });

  test.describe("under reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the drag pans but the release does not fling", async ({ page }) => {
      await page.goto("/#/");
      await page.locator(".hub-item").first().waitFor();
      const hub = hubScroller(page);
      await hub.evaluate((el) => el.scrollIntoView({ block: "center" }));
      await waitTurnstileSettled(page);

      await mouseDrag(page, hub, "x", -250);
      const released = await scrollOf(hub, "x");
      await page.waitForTimeout(300);
      expect(
        await scrollOf(hub, "x"),
        "reduced motion still flung the hub"
      ).toBe(released);
      expect(released, "reduced motion broke the drag itself").toBeGreaterThan(0);
    });
  });
});

test.describe("list entrance stagger", () => {
  test("items enter staggered on load and recycling stays plain", async ({
    page,
  }) => {
    // Commit-level goto: the read must land inside the 600ms stagger window.
    await page.goto("/#/selection", { waitUntil: "commit" });
    const item = page.locator("metro-grid-view .grid-item").first();
    await item.waitFor();
    expect(
      await item.evaluate((el) => getComputedStyle(el).animationName),
      "the grid items popped in without the entrance stagger"
    ).toBe("metro-entrance-stagger");

    // After the stagger window, virtualization recycling must not re-animate.
    await page.waitForTimeout(800);
    await waitTurnstileSettled(page);
    const grid = gridScroller(page);
    await grid.evaluate((el) => el.scrollIntoView({ block: "center" }));
    const box = await grid.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(300);
    const late = page.locator("metro-grid-view .grid-item").last();
    expect(
      await late.evaluate((el) => getComputedStyle(el).animationName),
      "scroll recycling re-ran the entrance stagger"
    ).toBe("none");
  });

  test.describe("under reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("items render visible without entrance motion", async ({ page }) => {
      await page.goto("/#/selection");
      const item = page.locator("metro-grid-view .grid-item").first();
      await item.waitFor();
      const style = await item.evaluate((el) => ({
        name: getComputedStyle(el).animationName,
        opacity: getComputedStyle(el).opacity,
      }));
      expect(style.name, "reduced motion ran the entrance stagger").toBe("none");
      expect(style.opacity, "reduced motion left items invisible").toBe("1");
    });
  });
});

test.describe("tree-view expand glide", () => {
  const firstParent = (page: Page) =>
    page
      .locator("metro-tree-view .tree-item")
      .filter({ has: page.locator(".chevron:not(.empty)") })
      .first();

  const rowsOf = (group: Locator): Promise<number> =>
    group.evaluate((el) => {
      const value = getComputedStyle(el).gridTemplateRows;
      return Number.parseFloat(value);
    });

  test("children glide open and closed, collapsed children stay out of reach", async ({
    page,
  }) => {
    await page.goto("/#/selection");
    await page.locator("metro-tree-view .tree-item").first().waitFor();
    await waitTurnstileSettled(page);
    const parent = firstParent(page);
    await parent.scrollIntoViewIfNeeded();
    const group = parent.locator("xpath=following-sibling::div[1]");

    expect(
      await group.locator("> .children-inner").evaluate((el) => getComputedStyle(el).visibility),
      "collapsed children are reachable"
    ).toBe("hidden");
    expect(await rowsOf(group), "collapsed group is not at zero").toBe(0);

    await parent.click();
    await page.waitForTimeout(120);
    const mid = await rowsOf(group);
    await page.waitForTimeout(400);
    const open = await rowsOf(group);
    expect(mid, "the expand never glided").toBeGreaterThan(0);
    expect(mid, "the expand jumped straight open").toBeLessThan(open);
    expect(
      await group.locator("> .children-inner").evaluate((el) => getComputedStyle(el).visibility),
      "expanded children stay hidden"
    ).toBe("visible");

    await parent.click();
    await page.waitForTimeout(120);
    const closing = await rowsOf(group);
    await page.waitForTimeout(400);
    expect(closing, "the collapse never glided").toBeGreaterThan(0);
    expect(closing, "the collapse jumped straight shut").toBeLessThan(open);
    expect(await rowsOf(group), "the group never closed").toBe(0);
    expect(
      await group.locator("> .children-inner").evaluate((el) => getComputedStyle(el).visibility),
      "closed children are reachable again"
    ).toBe("hidden");
  });

  test("keyboard collapses and re-expands the same glide", async ({ page }) => {
    await page.goto("/#/selection");
    await page.locator("metro-tree-view .tree-item").first().waitFor();
    await waitTurnstileSettled(page);
    const parent = firstParent(page);
    await parent.scrollIntoViewIfNeeded();
    const group = parent.locator("xpath=following-sibling::div[1]");

    // The click sets the roving focus; the keys then drive the disclosure.
    await parent.click();
    await page.waitForTimeout(350);
    await parent.press("ArrowLeft");
    await page.waitForTimeout(350);
    expect(await rowsOf(group), "ArrowLeft never collapsed").toBe(0);
    await parent.press("Enter");
    await expect
      .poll(() => rowsOf(group), "Enter never expanded the tree item")
      .toBeGreaterThan(0);
  });

  test.describe("under reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("expansion is instant", async ({ page }) => {
      await page.goto("/#/selection");
      await page.locator("metro-tree-view .tree-item").first().waitFor();
      await waitTurnstileSettled(page);
      const parent = firstParent(page);
      await parent.scrollIntoViewIfNeeded();
      const group = parent.locator("xpath=following-sibling::div[1]");
      await parent.click();
      await page.waitForTimeout(50);
      const rows = await rowsOf(group);
      expect(rows, "reduced motion glided the expand").toBeGreaterThan(0);
      await page.waitForTimeout(300);
      expect(await rowsOf(group), "reduced motion never finished").toBe(rows);
    });
  });
});
