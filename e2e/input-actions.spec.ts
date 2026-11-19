import { test, expect } from "@playwright/test";

test.describe("input actions use cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/input");
    await expect(page.locator("metrino-input-page")).toBeVisible();
  });

  test("user opens a combo box and picks an option the page hears", async ({
    page,
  }) => {
    const combo = page.locator("#demo-combo");
    const echo = page.locator(".demo-item", { has: combo }).locator(
      ".value-display"
    );
    const option = combo.locator(".dropdown-item", { hasText: "Option 2" });
    await expect(option).toBeHidden();

    await combo.locator("input").click();
    await expect(option).toBeVisible();

    await option.click();
    await expect(echo).toHaveText("Selected: Option 2");
    await expect(option).toBeHidden();
  });

  test("combo Escape and outside click close it; a disabled combo never opens", async ({
    page,
  }) => {
    const combo = page.locator("#demo-combo");
    const option = combo.locator(".dropdown-item", { hasText: "Option 1" });

    await combo.locator("input").click();
    await expect(option).toBeVisible();
    await combo.locator("input").press("Escape");
    await expect(option).toBeHidden();

    await combo.locator("input").click();
    await expect(option).toBeVisible();
    await page.locator("metrino-input-page h1").click();
    await expect(option).toBeHidden();

    const disabled = page.locator('metro-combo-box[placeholder="Disabled"]');
    await expect(disabled.locator("input")).toBeDisabled();
    await disabled.locator("input").click({ force: true });
    await expect(disabled.locator(".dropdown-item")).toHaveCount(0);
  });

  test("slider keyboard input changes the value the page hears", async ({
    page,
  }) => {
    const slider = page.locator("metro-slider").first();
    const echo = slider.locator("..").locator(".value-display").first();
    await expect(echo).toHaveText("Value: 50");

    await slider.locator("input").focus();
    await page.keyboard.press("ArrowRight");
    await expect(echo).toHaveText("Value: 51");

    await page.keyboard.press("ArrowLeft");
    await expect(echo).toHaveText("Value: 50");
  });

  test("slider pointer interaction changes the value the page hears", async ({
    page,
  }) => {
    const slider = page.locator("metro-slider").first();
    const echo = slider.locator("..").locator(".value-display").first();
    await expect(echo).toHaveText("Value: 50");

    // The control defers to its native range input: a real pointer press on
    // the track fires input/change the page hears. (Raw mouse drags do not
    // move this Chromium's native range control, so the pointer half of this
    // test uses a real track press instead.)
    const track = slider.locator("input");
    const box = await track.boundingBox();
    expect(box).not.toBeNull();
    await track.click({
      position: { x: box!.width * 0.85, y: box!.height / 2 },
    });

    await expect
      .poll(
        async () =>
          Number((await echo.textContent())?.replace("Value:", "").trim()),
        { timeout: 5_000 }
      )
      .toBeGreaterThan(50);
  });

  test("rating click sets the value the page hears; readonly and disabled ignore clicks", async ({
    page,
  }) => {
    const interactive = page.locator("metro-rating").first();
    const echo = page.locator(".value-display", { hasText: "/ 5 stars" }).first();
    await expect(echo).toHaveText("3 / 5 stars");

    await page.locator("metro-rating").evaluateAll((ratings) => {
      const win = window as Window & { ratingEvents?: string[] };
      win.ratingEvents = [];
      for (const rating of ratings) {
        rating.addEventListener("change", (e) =>
          win.ratingEvents?.push(String((e as CustomEvent).detail.value))
        );
      }
    });

    await interactive.locator(".star").nth(4).click();
    await expect(echo).toHaveText("5 / 5 stars");

    const readonly = page.locator("metro-rating[readonly]");
    const disabled = page.locator("metro-rating[disabled]");
    await readonly.locator(".star").first().click();
    await disabled.locator(".star").first().click({ force: true });
    await expect(echo).toHaveText("5 / 5 stars");
    const events = await page.evaluate(
      () => (window as Window & { ratingEvents?: string[] }).ratingEvents
    );
    expect(events).toEqual(["5"]);
  });

  test("radio group clicking selects one option and the page hears it", async ({
    page,
  }) => {
    const echo = page.locator("#radio-value");
    await expect(echo).toHaveText("Selected: None");

    await page
      .locator('metro-radio-button[name="demo-radio"][value="option2"]')
      .getByRole("radio")
      .click();
    await expect(echo).toHaveText("Selected: option2");

    await page
      .locator('metro-radio-button[name="demo-radio"][value="option3"]')
      .getByRole("radio")
      .click();
    await expect(echo).toHaveText("Selected: option3");

    const second = page
      .locator('metro-radio-button[name="demo-radio"][value="option2"]')
      .getByRole("radio");
    await second.focus();
    await page.keyboard.press("Space");
    await expect(echo).toHaveText("Selected: option2");
  });
});
