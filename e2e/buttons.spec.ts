import { test, expect } from "@playwright/test";

test.describe("buttons page use cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/buttons");
    await expect(page.locator("metrino-buttons-page h1")).toHaveText(
      "Buttons",
    );
  });

  test("user clicks a button and hears it; a disabled button stays silent", async ({
    page,
  }) => {
    const count = page.locator("#button-click-count");
    await expect(count).toHaveText("0");

    await page.locator("#button-clicker").click();
    await expect(count).toHaveText("1");

    // Disabled hosts opt out of pointer events, so the click is forced at
    // their position: a real user tapping there hears nothing either.
    await page.locator("#button-clicker-disabled").click({ force: true });
    await expect(count).toHaveText("1");
  });

  test("user activates a button from the keyboard", async ({ page }) => {
    const count = page.locator("#button-click-count");
    await page.locator("#button-clicker button").focus();
    await page.keyboard.press("Enter");
    await expect(count).toHaveText("1");
    await page.keyboard.press(" ");
    await expect(count).toHaveText("2");
  });

  test("button submits its owner form; button-type and disabled buttons do not", async ({
    page,
  }) => {
    const outcome = page.locator("#button-form-outcome");
    await expect(outcome).toHaveText("idle");

    await page.locator("#button-form-field").fill("typed");
    await page.locator("#button-form-nobutton").click();
    await expect(outcome).toHaveText("idle");

    await page.locator("#button-form-disabled").click({ force: true });
    await expect(outcome).toHaveText("idle");

    await page.locator("#button-form-submit").click();
    await expect(outcome).toHaveText("submitted:typed");
  });

  test("user submits the form from the keyboard", async ({ page }) => {
    const outcome = page.locator("#button-form-outcome");
    await page.locator("#button-form-field").fill("typed");
    await page.locator("#button-form-submit button").focus();
    await page.keyboard.press("Enter");
    await expect(outcome).toHaveText("submitted:typed");
  });

  test("reset button restores the form without submitting", async ({ page }) => {
    const field = page.locator("#button-form-field");
    const outcome = page.locator("#button-form-outcome");
    await field.fill("typed");
    await expect(field).toHaveValue("typed");

    await page.locator("#button-form-reset").click();
    await expect(field).toHaveValue("default");
    await expect(outcome).toHaveText("idle");
  });

  test("user opens a dropdown, hears it open, and picks an item", async ({
    page,
  }) => {
    const pick = page.locator("#dropdown-pick");
    const item = page.locator("#dropdown-options > .menu-item", {
      hasText: "Edit",
    });
    await expect(item).toBeHidden();

    await page.locator("#dropdown-options").evaluate((el) => {
      const win = window as Window & { dropdownEvents?: string[] };
      win.dropdownEvents = [];
      el.addEventListener("show", () => win.dropdownEvents?.push("show"));
      el.addEventListener("hide", () => win.dropdownEvents?.push("hide"));
    });

    await page.locator("#dropdown-options").click();
    await expect(item).toBeVisible();
    await item.click();
    await expect(pick).toHaveText("Edit");
    await expect(item).toBeHidden();
    await expect
      .poll(() =>
        page
          .locator("#dropdown-options")
          .evaluate(
            () =>
              (window as Window & { dropdownEvents?: string[] })
                .dropdownEvents ?? [],
          ),
      )
      .toEqual(["show", "hide"]);
  });

  test("user light-dismisses a dropdown; a disabled dropdown never opens", async ({
    page,
  }) => {
    const item = page.locator("#dropdown-options > .menu-item", {
      hasText: "Copy",
    });
    await page.locator("#dropdown-options").click();
    await expect(item).toBeVisible();

    await page.locator("metrino-buttons-page h1").click();
    await expect(item).toBeHidden();

    await page.locator("#dropdown-disabled").click({ force: true });
    await expect(
      page.locator("#dropdown-disabled > .menu-item").first(),
    ).toBeHidden();
  });

  test("user activates a hyperlink with pointer and keyboard; disabled link stays silent", async ({
    page,
  }) => {
    const urlBefore = page.url();
    const outcome = page.locator("#hyperlink-outcome");
    await expect(outcome).toHaveText("0");

    await page.locator("#hyperlink-action").click();
    await expect(outcome).toHaveText("1");
    // Button mode renders no href, so activating it navigates nowhere.
    expect(page.url()).toBe(urlBefore);

    await page.locator("#hyperlink-action a").focus();
    await page.keyboard.press("Enter");
    await expect(outcome).toHaveText("2");
    await page.keyboard.press(" ");
    await expect(outcome).toHaveText("3");
    expect(page.url()).toBe(urlBefore);

    await page.locator("#hyperlink-disabled").click({ force: true });
    await expect(outcome).toHaveText("3");
  });

  test("unsafe hyperlink with a target never opens a new tab", async ({
    page,
  }) => {
    // Setup is programmatic because the demo ships no unsafe link by design;
    // the trigger (a real click) and the outcome (no popup, same URL) are real.
    const urlBefore = page.url();
    await page.locator("#hyperlink-action").evaluate((el) => {
      const link = el as HTMLElement & { href?: string; target?: string };
      link.href = "javascript:alert(1)";
      link.target = "_blank";
      const win = window as Window & { openedPopups?: number };
      win.openedPopups = 0;
      window.open = ((..._args: unknown[]) => {
        win.openedPopups = (win.openedPopups ?? 0) + 1;
        return null;
      }) as typeof window.open;
    });

    await page.locator("#hyperlink-action").click();
    expect(page.url()).toBe(urlBefore);
    expect(page.context().pages()).toHaveLength(1);
    expect(
      await page.evaluate(
        () => (window as Window & { openedPopups?: number }).openedPopups,
      ),
    ).toBe(0);
  });

  test("user holds a repeat button and it keeps firing until release", async ({
    page,
  }) => {
    const count = page.locator("#repeat-count");
    await page.locator("#repeat-reset").click();
    await expect(count).toHaveText("0");

    const hold = page.locator("metro-repeat-button", { hasText: "Click Me" });
    await hold.hover();
    await page.mouse.down();
    // The first click fires synchronously on press, before the 500ms delay.
    await expect
      .poll(async () => Number(await count.textContent()), { timeout: 5_000 })
      .toBeGreaterThanOrEqual(1);
    // Holding past the delay keeps firing on the 100ms interval.
    await expect
      .poll(async () => Number(await count.textContent()), { timeout: 8_000 })
      .toBeGreaterThanOrEqual(4);
    await page.mouse.up();
  });
});
