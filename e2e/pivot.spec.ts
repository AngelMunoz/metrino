import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

async function isInsideViewport(
  target: Locator,
  container: Locator
): Promise<boolean> {
  const box = await target.boundingBox();
  const area = await container.boundingBox();
  if (!box || !area) return false;
  return (
    box.x >= area.x - 1 && box.x + box.width <= area.x + area.width + 1
  );
}





function openPivot(page: Page): {
  pivot: Locator;
  content: Locator;
  section: (name: string) => Locator;
  tab: (name: string) => Locator;
} {
  const pivot = page.locator("#metro-pivot metro-pivot");
  const content = pivot.locator(".pivot-content");
  return {
    pivot,
    content,
    section: (name) =>
      pivot.locator(`metro-pivot-item[header="${name}"] p`),
    tab: (name) => pivot.getByRole("tab", { name }),
  };
}

test.describe("pivot use cases", () => {
  test("user switches pivot sections by clicking headers", async ({ page }) => {
    await page.goto("/#/navigation");
    const pivot = page.locator("#metro-pivot metro-pivot");
    const content = pivot.locator(".pivot-content");
    const first = pivot.locator('metro-pivot-item[header="First"] p');
    const second = pivot.locator('metro-pivot-item[header="Second"] p');

    await expect
      .poll(() => isInsideViewport(first, content))
      .toBe(true);
    await expect(pivot.getByRole("tab", { name: "First" })).toHaveAttribute(
      "aria-selected",
      "true"
    );

    await pivot.getByRole("tab", { name: "Second" }).click();

    await expect
      .poll(() => isInsideViewport(second, content))
      .toBe(true);
    await expect
      .poll(() => isInsideViewport(first, content))
      .toBe(false);
    await expect(pivot.getByRole("tab", { name: "Second" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    await expect(
      pivot.locator('metro-pivot-item[header="Second"]')
    ).toHaveAttribute("active", "");
  });

  test("user pages with the keyboard and wraps around", async ({ page }) => {
    const { content, section, tab } = openPivot(page);
    await gotoReadyRoute(page, "/#/navigation", content);

    await tab("First").focus();
    await expect
      .poll(() => isInsideViewport(section("First"), content))
      .toBe(true);

    await page.keyboard.press("ArrowRight");
    await expect(tab("Second")).toHaveAttribute("aria-selected", "true");
    await expect(tab("Second")).toBeFocused();

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(tab("Fourth")).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => isInsideViewport(section("Fourth"), content))
      .toBe(true);
    await expect(tab("Fourth")).toBeFocused();
    // Roving tabindex: only the active header is in the tab sequence.
    await expect(tab("Fourth")).toHaveAttribute("tabindex", "0");
    await expect(tab("First")).toHaveAttribute("tabindex", "-1");

    // ArrowRight past the last header loops to the first one.
    await page.keyboard.press("ArrowRight");
    await expect(tab("First")).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => isInsideViewport(section("First"), content))
      .toBe(true);
    await expect(tab("First")).toBeFocused();

    // ArrowLeft before the first header loops back to the last one.
    await page.keyboard.press("ArrowLeft");
    await expect(tab("Fourth")).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => isInsideViewport(section("Fourth"), content))
      .toBe(true);
    await expect(tab("Fourth")).toBeFocused();

    await page.keyboard.press("Home");
    await expect(tab("First")).toHaveAttribute("aria-selected", "true");
    await expect(tab("First")).toBeFocused();

    await page.keyboard.press("End");
    await expect(tab("Fourth")).toHaveAttribute("aria-selected", "true");
    await expect(tab("Fourth")).toBeFocused();
  });
});
