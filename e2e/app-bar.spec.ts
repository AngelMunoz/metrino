import { test, expect, type Page } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

async function openNavigation(page: Page): Promise<void> {
  await gotoReadyRoute(
    page,
    "/#/navigation",
    page.locator("metrino-navigation-page h1")
  );
}

test.describe("app bar use cases", () => {
  test("user expands the app bar and reads the button labels", async ({
    page,
  }) => {
    await openNavigation(page);

    // A slotted button, so the reveal has to cross into the bar's expansion.
    const label = page.locator(
      "#metro-app-bar metro-app-bar-button[label='Refresh'] .label"
    );
    await expect(label).toBeHidden();

    // The bar's own toggle control sits under the fixed bar at the bottom of the
    // viewport, so the demo drives it from the keyboard.
    const toggle = page.locator("#metro-app-bar .control-btn");
    await toggle.press("Enter");
    await expect(label).toBeVisible();
    await expect(label).toHaveCSS("opacity", "1");

    await toggle.press("Enter");
    await expect(label).toBeHidden();
  });

  test("user sees the label of an app bar button outside any bar", async ({
    page,
  }) => {
    await openNavigation(page);

    const label = page.locator(
      "#metro-app-bar-button metro-app-bar-button[label='Home'] .label"
    );
    await expect(label).toBeVisible();
    await expect(label).toHaveCSS("opacity", "1");
  });

  test("user hides a separator and the app bar keeps its spacing", async ({
    page,
  }) => {
    await openNavigation(page);

    const section = page.locator("#metro-app-bar-separator");
    const separator = section.locator("metro-app-bar-separator").first();
    const follower = section.locator("metro-app-bar-button").nth(1);

    const lineWidth = await separator.evaluate((el) => el.getBoundingClientRect().width);
    const followerX = await follower.evaluate((el) => el.getBoundingClientRect().x);
    expect(lineWidth).toBeCloseTo(1, 0);

    await separator.evaluate((el) => el.removeAttribute("visible"));
    await expect(separator).toBeHidden();

    // The line is gone but its space is not: nothing in the bar moved.
    expect(await separator.evaluate((el) => el.getBoundingClientRect().width)).toBeCloseTo(lineWidth, 0);
    expect(await follower.evaluate((el) => el.getBoundingClientRect().x)).toBe(followerX);
    await expect(section.locator("metro-app-bar-separator").nth(1)).toBeVisible();
  });
});
