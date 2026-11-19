import { test, expect, type Page } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

async function openNavigation(page: Page): Promise<void> {
  await gotoReadyRoute(
    page,
    "/#/navigation",
    page.locator("metrino-navigation-page h1")
  );
}

test.describe("navigation actions use cases", () => {
  test("user opens the split-view pane and closes it from the backdrop", async ({
    page,
  }) => {
    await openNavigation(page);
    const section = page.locator("#metro-split-view");
    const toggle = section.getByRole("button", { name: "Open Pane" });
    const backdrop = page.locator("metro-split-view .backdrop");
    const pane = page.locator("metro-split-view .split-pane");

    // Closed: the overlay backdrop is fully transparent and inert.
    await expect(backdrop).toHaveCSS("opacity", "0");
    const closedX = (await pane.boundingBox())?.x ?? 0;

    await toggle.click();

    // Open: the demo hears the toggle and the pane slides in over a backdrop.
    await expect(section.getByRole("button", { name: "Close Pane" })).toBeVisible();
    await expect(backdrop).toHaveCSS("opacity", "1");
    await expect
      .poll(async () => (await pane.boundingBox())?.x ?? 0)
      .not.toBe(closedX);

    // A real press on the backdrop closes the pane again.
    await backdrop.click();
    await expect(backdrop).toHaveCSS("opacity", "0");
  });

  test("user clicks a tab and the new panel shows while the page hears the switch", async ({
    page,
  }) => {
    await openNavigation(page);
    const section = page.locator("#metro-tab-view");
    const echo = section.locator("#tab-selection");
    await expect(echo).toHaveText("Selected tab: 0");

    await section.getByRole("tab", { name: "Documents" }).click();

    await expect(echo).toHaveText("Selected tab: 1");
    await expect(
      page.locator('metro-tab-view-item[header="Documents"]')
    ).toBeVisible();
    await expect(page.locator('metro-tab-view-item[header="Home"]')).toBeHidden();
  });

  test("tab arrow keys move selection and focus together", async ({
    page,
  }) => {
    await openNavigation(page);
    const section = page.locator("#metro-tab-view");
    const echo = section.locator("#tab-selection");
    const homeTab = section.getByRole("tab", { name: "Home" });
    const documentsTab = section.getByRole("tab", { name: "Documents" });

    await homeTab.click();
    await expect(echo).toHaveText("Selected tab: 0");

    await homeTab.press("ArrowRight");
    await expect(echo).toHaveText("Selected tab: 1");
    await expect(documentsTab).toBeFocused();

    await page.keyboard.press("ArrowLeft");
    await expect(echo).toHaveText("Selected tab: 0");
    await expect(homeTab).toBeFocused();
  });

  test("user clicks a breadcrumb crumb and the page hears which one", async ({
    page,
  }) => {
    await openNavigation(page);
    const section = page.locator("#metro-breadcrumb-bar");
    const echo = section.locator("#crumb-selection");
    await expect(echo).toHaveText("Last clicked: None");

    await section.getByRole("button", { name: "Documents" }).click();

    await expect(echo).toHaveText("Last clicked: Documents (index 1)");
  });
});
