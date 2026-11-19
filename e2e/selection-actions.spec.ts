import { test, expect, type Page } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

async function openSelection(page: Page): Promise<void> {
  await gotoReadyRoute(
    page,
    "/#/selection",
    page.locator("metrino-selection-page h1")
  );
}

function cardWith(page: Page, tag: string) {
  return page.locator(".demo-card", { has: page.locator(tag) });
}

test.describe("selection actions use cases", () => {
  test("list keyboard Enter selects the focused item the page hears", async ({
    page,
  }) => {
    await openSelection(page);
    const card = cardWith(page, "metro-list-view");
    await card.getByRole("button", { name: "Single", exact: true }).click();

    const echo = card.locator(".stats");
    await expect(echo).toContainText("Selection: None");

    // Real keyboard selection only: focusing a row and pressing Enter goes
    // through the component's keydown path (no pointer click on any row).
    // The row is virtualized, so assert the single-selection shape, not an index.
    await card.getByRole("option").first().press("Enter");

    await expect(echo).toContainText(/Selection: Items: \d+/);
  });

  test("grid arrow keys move focus and Space selects the focused item the page hears", async ({
    page,
  }) => {
    await openSelection(page);
    const card = cardWith(page, "metro-grid-view");
    await card.getByRole("button", { name: "Single", exact: true }).click();

    const echo = card.locator(".stats");
    await expect(echo).toContainText("Selection: None");

    await card.locator('metro-grid-view [data-index="0"]').press("ArrowRight");
    await page.keyboard.press("Space");

    await expect(echo).toContainText("Items: 1");
  });

  test("tree arrow keys walk the nodes and Enter selects the focused node the page hears", async ({
    page,
  }) => {
    await openSelection(page);
    const card = cardWith(page, "metro-tree-view");
    const echo = card.locator(".selection-info");

    await card.locator('metro-tree-view [data-id="documents"]').click();
    await expect(echo).toHaveText("Selected Node: documents");

    // The click focuses Documents and expands it; step to the first child
    // with a real arrow key and confirm with Enter.
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    await expect(echo).toHaveText("Selected Node: doc1");
  });

  test("list-box Shift range and Ctrl toggle build the selection the page hears", async ({
    page,
  }) => {
    await openSelection(page);
    const card = cardWith(page, "metro-list-box");
    await card.getByRole("button", { name: "Extended", exact: true }).click();

    const echo = card.locator(".selection-info");
    await expect(echo).toHaveText("Selected: None");

    await card.locator('[data-value="item1"]').click();
    await card.locator('[data-value="item3"]').click({ modifiers: ["Shift"] });
    await expect(echo).toContainText("Item 1 - First Option");
    await expect(echo).toContainText("Item 2 - Second Option");
    await expect(echo).toContainText("Item 3 - Third Option");

    await card.locator('[data-value="item2"]').click({ modifiers: ["Control"] });
    await expect(echo).toContainText("Item 1 - First Option");
    await expect(echo).toContainText("Item 3 - Third Option");
    await expect(echo).not.toContainText("Item 2 - Second Option");
  });

  test("flip-view next and previous buttons walk the items the page hears", async ({
    page,
  }) => {
    await openSelection(page);
    const flip = page.locator("metro-flip-view");
    const echo = page.locator("#flip-index");
    await expect(echo).toHaveText("Index: 0");

    await flip.getByRole("button", { name: "Next" }).click();
    await expect(echo).toHaveText("Index: 1");

    await flip.getByRole("button", { name: "Previous" }).click();
    await expect(echo).toHaveText("Index: 0");
  });

  test("flip-view indicator jumps straight to an item the page hears", async ({
    page,
  }) => {
    await openSelection(page);
    const flip = page.locator("metro-flip-view");
    const echo = page.locator("#flip-index");
    await expect(echo).toHaveText("Index: 0");

    await flip.getByRole("tab", { name: "Go to item 3" }).click();
    await expect(echo).toHaveText("Index: 2");
  });
});
