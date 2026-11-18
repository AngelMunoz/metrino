import { test, expect } from "@playwright/test";

test.describe("app navigation", () => {
  test("user opens the app and lands on home", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("metrino-home h1.title")).toHaveText("Metrino");
  });

  test("user navigates to Buttons through the app bar and back home", async ({
    page,
  }) => {
    await page.goto("/");
    await page.locator('metro-app-bar-button[label="Buttons"]').click();
    await expect(page.locator("metrino-buttons-page h1")).toHaveText("Buttons");
    await expect(page).toHaveTitle("Buttons | Metrino");
    await page.locator('metro-app-bar-button[label="Home"]').click();
    await expect(page.locator("metrino-home h1.title")).toBeVisible();
  });

  test("user deep-links to the dialogs page", async ({ page }) => {
    await page.goto("/#/dialogs");
    await expect(page.locator("metrino-dialogs-page h1")).toHaveText("Dialogs");
  });

  test("user switches to the light theme", async ({ page }) => {
    await page.goto("/");
    await page
      .locator(".theme-controls .theme-btn", { hasText: "Light" })
      .click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("user picks an accent color in the settings panel", async ({ page }) => {
    await page.goto("/");
    await page.locator(".settings-btn").click();
    await page.locator('.accent-swatch[title="red"]').click();
    await expect(page.locator("html")).toHaveAttribute("accent", "red");
  });
});
