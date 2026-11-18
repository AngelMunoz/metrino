import { test, expect } from "@playwright/test";

test.describe("input page use cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/input");
    await expect(page.locator("metrino-input-page")).toBeVisible();
  });

  test("user types a username and the page echoes the value", async ({
    page,
  }) => {
    const box = page.locator('metro-text-box[label="Username"]');
    await box.locator("input").fill("scythes");
    await box.locator("input").press("Tab");
    await expect(
      page.locator(".value-display", { hasText: "Value: scythes" })
    ).toBeVisible();
  });

  test("user checks a box and the state echoes", async ({ page }) => {
    const box = page.locator("metro-check-box", { hasText: "Checked:" });
    await box.getByRole("checkbox").click();
    await expect(box.getByRole("checkbox")).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await expect(
      page.locator("metro-check-box", { hasText: "Checked: true" })
    ).toBeVisible();
  });

  test("user toggles a switch and the label follows", async ({ page }) => {
    const toggle = page.locator("metro-toggle-switch", { hasText: "OFF" });
    await toggle.click();
    await expect(
      page.locator("metro-toggle-switch", { hasText: "ON" })
    ).toBeVisible();
  });
});
