import { test, expect, type Locator } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

/**
 * Distance from a rendered group header to the top of the list's scroller, or
 * `null` while that group is outside the rendered window. A jump glides, so a
 * group far below the viewport is only rendered a few frames later.
 */
function headerGap(list: Locator, key: string): Promise<number | null> {
  return list.evaluate((host, groupKey) => {
    const root = host.shadowRoot;
    const header = root?.querySelector<HTMLElement>(
      `.group-header[data-group-key="${CSS.escape(groupKey)}"]`
    );
    const container = root?.querySelector<HTMLElement>(".list-container");
    if (!header || !container) return null;
    return Math.abs(
      header.getBoundingClientRect().top - container.getBoundingClientRect().top
    );
  }, key);
}

/** Where the list is scrolled to. */
function scrollTop(list: Locator): Promise<number> {
  return list.evaluate(
    (host) =>
      host.shadowRoot?.querySelector<HTMLElement>(".list-container")
        ?.scrollTop ?? -1
  );
}

test.describe("long list selector jump grid", () => {
  test("a group header opens the grid and a tile jumps to its group", async ({
    page,
  }) => {
    const list = page.locator("metro-long-list-selector");
    await gotoReadyRoute(page, "/#/selection", list);
    await list.scrollIntoViewIfNeeded();

    const dialog = list.locator('[role="dialog"]');
    await expect(
      dialog,
      "the grid must not be in the page until it is asked for"
    ).toHaveCount(0);

    await list.locator(".group-header").first().click();
    await expect(dialog).toBeVisible();

    const tiles = dialog.locator("[data-group-key]");
    const letters = list.locator(".jump-item:not(.disabled)");
    expect(
      await tiles.count(),
      "the grid must hold one tile per group the list reports"
    ).toBe(await letters.count());

    expect(
      await dialog.evaluate((el) => getComputedStyle(el).animationName),
      "the grid enters with the turnstile animation"
    ).toBe("metro-turnstile-in");

    const keys = await tiles.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("data-group-key") ?? "")
    );
    const last = keys.length - 1;
    const target = keys[last];
    if (!target) throw new Error("the jump grid has no tiles");

    const before = await scrollTop(list);
    await tiles.nth(last).click();

    await expect(dialog, "choosing a group closes the grid").toHaveCount(0);

    await expect
      .poll(
        async () => (await headerGap(list, target)) ?? Number.MAX_SAFE_INTEGER,
        {
          message: `the "${target}" header never reached the top of the list`,
          timeout: 10_000,
        }
      )
      .toBeLessThanOrEqual(4);

    expect(
      await scrollTop(list),
      "the jump must scroll the list forward from where it was"
    ).toBeGreaterThan(before);
  });

  test("Escape closes the grid without moving the list", async ({ page }) => {
    const list = page.locator("metro-long-list-selector");
    await gotoReadyRoute(page, "/#/selection", list);
    await list.scrollIntoViewIfNeeded();

    const dialog = list.locator('[role="dialog"]');
    const trigger = list.locator(".group-header").first();
    await trigger.click();
    await expect(dialog).toBeVisible();

    await expect(
      dialog.locator("[data-group-key]").first(),
      "the grid must put the caret on its first tile"
    ).toBeFocused();

    const before = await scrollTop(list);
    await page.keyboard.press("Escape");

    await expect(dialog).toHaveCount(0);
    expect(await scrollTop(list), "closing must leave the list alone").toBe(
      before
    );
    await expect(
      trigger,
      "closing must hand focus back to the header that opened the grid"
    ).toBeFocused();
  });

  test("Tab cycles within the grid and Shift+Tab wraps back", async ({
    page,
  }) => {
    const list = page.locator("metro-long-list-selector");
    await gotoReadyRoute(page, "/#/selection", list);
    await list.scrollIntoViewIfNeeded();

    const dialog = list.locator('[role="dialog"]');
    await list.locator(".group-header").first().click();
    await expect(dialog).toBeVisible();

    const tiles = dialog.locator("[data-group-key]");
    const count = await tiles.count();
    expect(count, "the grid needs at least two tiles for a wrap test").toBeGreaterThan(1);

    await expect(
      tiles.first(),
      "the grid must put the caret on its first tile"
    ).toBeFocused();

    for (let i = 1; i < count; i++) {
      await page.keyboard.press("Tab");
    }
    await expect(
      tiles.nth(count - 1),
      "Tab must walk the caret to the last tile"
    ).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(
      tiles.first(),
      "Tab past the last tile must wrap to the first tile"
    ).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expect(
      tiles.nth(count - 1),
      "Shift+Tab from the first tile must wrap to the last tile"
    ).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(dialog, "Escape must still close the grid").toHaveCount(0);
  });

  test("the alphabet strip still jumps directly without jump-grid", async ({
    page,
  }) => {
    const list = page.locator("metro-long-list-selector");
    await gotoReadyRoute(page, "/#/selection", list);
    await list.scrollIntoViewIfNeeded();

    await list.evaluate((el) => el.removeAttribute("jump-grid"));

    const letters = list.locator(".jump-item:not(.disabled)");
    await letters.nth(3).click();

    await expect(
      list.locator('[role="dialog"]'),
      "the strip is a direct jump while jump-grid is off"
    ).toHaveCount(0);

    await expect
      .poll(() => scrollTop(list), {
        message: "the strip never scrolled the list",
        timeout: 10_000,
      })
      .toBeGreaterThan(0);
  });
});
