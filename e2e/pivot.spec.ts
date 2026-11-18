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

/**
 * Drags the pointer horizontally over an element and releases it. The steps are
 * slow enough that a short drag stays under the paging velocity as well as under
 * the paging distance.
 */
async function dragHorizontally(
  page: Page,
  target: Locator,
  delta: number,
  whileHeld?: () => Promise<void>
): Promise<void> {
  const box = await target.boundingBox();
  if (!box) throw new Error("the drag target has no bounding box");
  const x = box.x + box.width / 2;
  const y = box.y + Math.min(40, box.height / 2);

  await page.mouse.move(x, y);
  await page.mouse.down();
  const steps = 8;
  for (let step = 1; step <= steps; step++) {
    await page.mouse.move(x + (delta * step) / steps, y);
    await page.waitForTimeout(12);
  }
  if (whileHeld) await whileHeld();
  await page.mouse.up();
}

/** Horizontal offset (px) a computed transform carries. */
function translateX(value: string): number {
  if (value === "none") return 0;
  const open = value.indexOf("(");
  const close = value.lastIndexOf(")");
  if (open < 0 || close < 0) return Number.NaN;
  const numbers = value.slice(open + 1, close).split(",");
  return Number.parseFloat(numbers[numbers.length > 6 ? 12 : 4]);
}

/** Dispatches one trusted touch swipe with the Chromium input pipeline. */
async function touchSwipe(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number }
): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  const send = (
    type: "touchStart" | "touchMove" | "touchEnd",
    points: Array<{ x: number; y: number; id: number }>
  ) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });

  await send("touchStart", [{ ...from, id: 1 }]);
  const steps = 10;
  for (let step = 1; step <= steps; step++) {
    await send("touchMove", [
      {
        x: Math.round(from.x + ((to.x - from.x) * step) / steps),
        y: Math.round(from.y + ((to.y - from.y) * step) / steps),
        id: 1,
      },
    ]);
    await page.waitForTimeout(16);
  }
  await send("touchEnd", []);
  await cdp.detach();
}

/** Label of the header that holds focus inside the pivot's shadow root. */
function focusedHeader(pivot: Locator): Promise<string> {
  return pivot.evaluate((host) => {
    const active = (host.shadowRoot as ShadowRoot).activeElement;
    return active?.textContent?.trim() ?? "";
  });
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
    const { pivot, content, section, tab } = openPivot(page);
    await gotoReadyRoute(page, "/#/navigation", content);

    await tab("First").focus();
    await expect
      .poll(() => isInsideViewport(section("First"), content))
      .toBe(true);

    await page.keyboard.press("ArrowRight");
    await expect(tab("Second")).toHaveAttribute("aria-selected", "true");
    expect(await focusedHeader(pivot)).toBe("Second");

    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(tab("Fourth")).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => isInsideViewport(section("Fourth"), content))
      .toBe(true);
    expect(await focusedHeader(pivot)).toBe("Fourth");
    // Roving tabindex: only the active header is in the tab sequence.
    await expect(tab("Fourth")).toHaveAttribute("tabindex", "0");
    await expect(tab("First")).toHaveAttribute("tabindex", "-1");

    // ArrowRight past the last header loops to the first one.
    await page.keyboard.press("ArrowRight");
    await expect(tab("First")).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => isInsideViewport(section("First"), content))
      .toBe(true);
    expect(await focusedHeader(pivot)).toBe("First");

    // ArrowLeft before the first header loops back to the last one.
    await page.keyboard.press("ArrowLeft");
    await expect(tab("Fourth")).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => isInsideViewport(section("Fourth"), content))
      .toBe(true);
    expect(await focusedHeader(pivot)).toBe("Fourth");

    await page.keyboard.press("Home");
    await expect(tab("First")).toHaveAttribute("aria-selected", "true");
    expect(await focusedHeader(pivot)).toBe("First");

    await page.keyboard.press("End");
    await expect(tab("Fourth")).toHaveAttribute("aria-selected", "true");
    expect(await focusedHeader(pivot)).toBe("Fourth");
  });

  test("user swipes the content to the next section", async ({ page }) => {
    const { pivot, content, section, tab } = openPivot(page);
    await gotoReadyRoute(page, "/#/navigation", content);
    await expect
      .poll(() => isInsideViewport(section("First"), content))
      .toBe(true);

    // The row follows the pointer while the drag is held, offset from its
    // resting position by the distance travelled so far.
    let heldTransform = "";
    await dragHorizontally(page, content, -90, async () => {
      heldTransform = await pivot
        .locator(".pivot-slides")
        .evaluate((el) => getComputedStyle(el).transform);
    });
    const held = translateX(heldTransform);
    expect(
      held,
      `the row did not follow the drag: ${heldTransform}`
    ).toBeLessThan(-50);
    expect(held, `the row overshot the drag: ${heldTransform}`).toBeGreaterThan(
      -120
    );

    await expect(tab("Second")).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => isInsideViewport(section("Second"), content))
      .toBe(true);

    await dragHorizontally(page, content, 90);

    await expect(tab("First")).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => isInsideViewport(section("First"), content))
      .toBe(true);
  });

  test("a short drag returns to the current section", async ({ page }) => {
    const { pivot, content, section, tab } = openPivot(page);
    await gotoReadyRoute(page, "/#/navigation", content);

    await dragHorizontally(page, content, -20);

    await expect(tab("First")).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => isInsideViewport(section("First"), content))
      .toBe(true);
    await expect
      .poll(() => isInsideViewport(section("Second"), content))
      .toBe(false);
    await expect(
      pivot.locator('metro-pivot-item[header="First"]')
    ).toHaveAttribute("active", "");
  });

  test("swipe wraps from last to first", async ({ page }) => {
    const { pivot, content, section, tab } = openPivot(page);
    await gotoReadyRoute(page, "/#/navigation", content);

    await tab("Fourth").click();
    await expect
      .poll(() => isInsideViewport(section("Fourth"), content))
      .toBe(true);

    await dragHorizontally(page, content, -90);

    await expect(tab("First")).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => isInsideViewport(section("First"), content))
      .toBe(true);
    await expect(
      pivot.locator('metro-pivot-item[header="First"]')
    ).toHaveAttribute("active", "");
  });
});

test.describe("pivot touch paging", () => {
  test.use({ hasTouch: true });

  test("user swipes the content with a touch pointer", async ({
    page,
    browserName,
  }) => {
    // A trusted touch that the pivot has to read as a drag needs the Chromium
    // input pipeline; Playwright only exposes tap on Firefox.
    test.skip(
      browserName !== "chromium",
      "touch swiping can only be synthesised on Chromium"
    );

    const { content, section, tab } = openPivot(page);
    await gotoReadyRoute(page, "/#/navigation", content);
    await expect
      .poll(() => isInsideViewport(section("First"), content))
      .toBe(true);

    const box = await content.boundingBox();
    if (!box) throw new Error("pivot content has no bounding box");
    const y = Math.round(box.y + Math.min(40, box.height / 2));

    await touchSwipe(
      page,
      { x: Math.round(box.x + box.width * 0.85), y },
      { x: Math.round(box.x + box.width * 0.15), y }
    );

    await expect(tab("Second")).toHaveAttribute("aria-selected", "true");
    await expect
      .poll(() => isInsideViewport(section("Second"), content))
      .toBe(true);
  });
});
