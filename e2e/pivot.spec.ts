import { test, expect } from "@playwright/test";
import type { Locator } from "@playwright/test";

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
});
