import { test, expect } from "@playwright/test";

test.describe("dialogs page use cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/dialogs");
    await expect(page.locator("metrino-dialogs-page h1")).toHaveText("Dialogs");
  });

  // FIXME(3.11): content-dialog initial focus races the View Transition; focus
  // stays on the opener, so Escape never reaches the dialog key handler.
  test.fixme("user opens a content dialog, reads it, and dismisses with Escape", async ({
    page,
  }) => {
    await page
      .locator("metro-button", { hasText: "Open Content Dialog" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Content Dialog" });
    await expect(dialog).toBeVisible();
    await expect(
      page.locator("#content-dialog p", { hasText: "slot for any content" })
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("user confirms a content dialog with OK", async ({ page }) => {
    await page
      .locator("metro-button", { hasText: "Open Content Dialog" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Content Dialog" });
    await expect(dialog).toBeVisible();
    await page
      .locator("#content-dialog metro-button", { hasText: "OK" })
      .click();
    await expect(dialog).toBeHidden();
  });

  test("user acknowledges a message dialog", async ({ page }) => {
    await page
      .locator("metro-button", { hasText: "Show Message Dialog" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Information" });
    await expect(dialog).toBeVisible();
    await page
      .locator("#message-dialog metro-button", { hasText: "OK" })
      .click();
    await expect(dialog).toBeHidden();
  });

  // FIXME(3.11): message-dialog never moves focus into the dialog and has no
  // document-level Escape listener, so Escape is dead in real flows.
  test.fixme("user dismisses a message dialog with Escape", async ({ page }) => {
    await page
      .locator("metro-button", { hasText: "Show Message Dialog" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Information" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("user opens a flyout and light-dismisses it", async ({ page }) => {
    await page.locator("#flyout-bottom-btn").click();
    const flyout = page.locator("#demo-flyout");
    await expect(flyout.locator("h4")).toHaveText("Flyout Title");
    await expect(flyout.locator("h4")).toBeVisible();
    await expect(flyout.locator(".flyout")).toHaveCSS("opacity", "1");
    // The View Transition overlay swallows pointer input until it finishes.
    await page.waitForTimeout(350);
    await page.mouse.click(20, 20);
    await expect(flyout.locator("h4")).toBeHidden();
  });

  test("user opens narrow and wide settings flyouts", async ({ page }) => {
    const flyout = page.locator("#settings-flyout");
    const panel = flyout.locator(".flyout-panel");
    const label = flyout.locator(".settings-item label", {
      hasText: "Notifications",
    });

    await page.locator("metro-button", { hasText: "Open Settings" }).click();
    await expect(label).toBeVisible();
    await expect(panel).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
    const narrow = await panel.boundingBox();
    expect(narrow?.width).toBeCloseTo(346, 0);

    await page.keyboard.press("Escape");
    await expect(panel).toHaveCSS("transform", "matrix(1, 0, 0, 1, 346, 0)");

    await page
      .locator("metro-button", { hasText: "Open Wide Settings" })
      .click();
    await expect(label).toBeVisible();
    await expect(panel).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
    const wide = await panel.boundingBox();
    expect(wide?.width).toBeCloseTo(646, 0);
  });

  test("user sees a toast and it auto-dismisses", async ({ page }) => {
    await page.locator("metro-button", { hasText: "Info Toast" }).click();
    const message = page.locator("#page-toast .toast-message");
    await expect(message).toHaveText(
      "This is a informational toast notification."
    );
    await expect(message).toBeHidden({ timeout: 6_000 });
  });

  test("user picks an action from the menu flyout and gets a toast", async ({
    page,
  }) => {
    await page.locator("#menu-flyout-btn").click();
    const saveItem = page.locator("#demo-menu-flyout .menu-item", {
      hasText: "Save",
    });
    await expect(saveItem).toBeVisible();
    await saveItem.click();
    await expect(page.locator("#page-toast .toast-title")).toHaveText("Save");
    await expect(saveItem).toBeHidden();
  });
});
