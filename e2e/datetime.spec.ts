import { test, expect } from "@playwright/test";

test.describe("datetime use cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/datetime");
    await expect(page.locator("metrino-datetime-page")).toBeVisible();
  });

  test("calendar day click selects a date the page hears", async ({ page }) => {
    const calendar = page.locator("#bounded-calendar");
    const echo = page.locator("#bounded-value");
    await expect(echo).toContainText("None");

    await calendar
      .locator('button[aria-label="2025-06-15"]')
      .click();
    await expect(echo).toContainText("Jun 15, 2025");
  });

  test("calendar month navigation updates the visible month", async ({
    page,
  }) => {
    // The unbounded calendar has no min/max, so its nav buttons stay enabled.
    const calendar = page.locator("metro-calendar").first();
    const header = calendar.locator(".month-year");
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    const start = (await header.textContent()) ?? "";
    const [startName, startYear] = start.trim().split(" ");
    const nextIndex = (months.indexOf(startName) + 1) % 12;
    const nextYear =
      nextIndex === 0 ? String(Number(startYear) + 1) : startYear;
    const expectedNext = `${months[nextIndex]} ${nextYear}`;

    await calendar.locator('button[aria-label="Next month"]').click();
    await expect(header).toHaveText(expectedNext);

    await calendar.locator('button[aria-label="Previous month"]').click();
    await expect(header).toHaveText(start.trim());
  });

  test("bounded calendar blocks days outside min/max", async ({ page }) => {
    const calendar = page.locator("#bounded-calendar");
    const echo = page.locator("#bounded-value");

    const blocked = calendar.locator('button[aria-label="2025-06-05"]');
    await expect(blocked).toBeDisabled();
    // A real tap at a disabled day's position selects nothing.
    await blocked.click({ force: true });
    await expect(echo).toContainText("None");

    await calendar
      .locator('button[aria-label="2025-06-12"]')
      .click();
    await expect(echo).toContainText("Jun 12, 2025");
  });

  test("date roller wheel selects a new month the page hears", async ({
    page,
  }) => {
    const roller = page.locator("metro-date-picker-roller").first();
    const echo = page.locator(".demo-item", { has: roller }).locator(
      ".value-display"
    );
    await expect(echo).toContainText("Selected:");

    const before = await echo.textContent();
    await roller.locator(".picker-column--month").hover();
    await page.mouse.wheel(0, 120);
    await expect
      .poll(async () => echo.textContent(), { timeout: 5_000 })
      .not.toBe(before);
  });

  test("time roller period wheel toggles AM/PM the page hears", async ({
    page,
  }) => {
    const roller = page.locator(
      'metro-time-picker-roller[hour-format="12"]'
    );
    const echo = page.locator(".demo-item", { has: roller }).locator(
      ".value-display"
    );
    await expect(echo).toContainText("Selected:");

    // Wheel one step over the period column: down from AM lands on PM, up
    // from PM lands on AM (the column clamps at both ends, one step each).
    const before = (await echo.textContent()) ?? "";
    const target = before.includes("AM") ? "PM" : "AM";
    await roller.locator(".picker-column--period").hover();
    await page.mouse.wheel(0, target === "PM" ? 120 : -120);
    await expect(echo).toContainText(target);
  });

  test("date and time picker entry is heard by the page", async ({ page }) => {
    const dateEcho = page.locator(".demo-item", {
      has: page.locator('metro-date-picker[label="Select Date"]'),
    }).locator(".value-display");
    await page
      .locator('metro-date-picker[label="Select Date"]')
      .locator("input")
      .fill("2025-06-15");
    await expect(dateEcho).toContainText("Jun 15, 2025");

    const timeEcho = page.locator(".demo-item", {
      has: page.locator('metro-time-picker[label="Select Time"]'),
    }).locator(".value-display");
    await page
      .locator('metro-time-picker[label="Select Time"]')
      .locator("input")
      .fill("13:30");
    await expect(timeEcho).toContainText("13:30");
  });
});
