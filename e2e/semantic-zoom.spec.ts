import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

declare global {
  interface Window {
    /** `opacity` of the zoomed-out layer, sampled once per frame. */
    __zoomOpacity?: number[];
    /** Text of every semantic-zoom view-transition rule set the page injected. */
    __zoomScopeRules?: string[];
  }
}

/** Deletes `startViewTransition`, emulating an engine without View Transitions. */
async function withoutViewTransitions(page: Page): Promise<void> {
  await page.addInitScript(() => {
    delete (
      Document.prototype as unknown as { startViewTransition?: unknown }
    ).startViewTransition;
  });
}

/**
 * Reads the zoomed-in view: its largest `scrollTop` and whether anything in it
 * can scroll at all. The scan includes the scroller of a component slotted into
 * the view, because the demo slots a `metro-list-view` and its own container is
 * what a pan actually moves.
 *
 * @param zoom - The `metro-semantic-zoom` host
 * @param fill - Append tall slot content when nothing overflows
 */
function zoomedInScroll(
  zoom: Locator,
  fill = false
): Promise<{ top: number; scrollable: boolean }> {
  return zoom.evaluate((host) => {
    let top = 0;
    let scrollable = false;
    const scan = (): void => {
      top = 0;
      scrollable = false;
      const visit = (element: Element): void => {
        if (
          element instanceof HTMLElement &&
          element.scrollHeight > element.clientHeight + 1
        ) {
          scrollable = true;
          top = Math.max(top, element.scrollTop);
        }
        if (element.shadowRoot) {
          for (const child of Array.from(element.shadowRoot.children)) {
            visit(child);
          }
        }
        for (const child of Array.from(element.children)) visit(child);
      };
      visit(host);
    };

    scan();
    if (!scrollable && fill) {
      const filler = document.createElement("div");
      filler.setAttribute("slot", "zoomed-in");
      filler.style.height = "2000px";
      host.appendChild(filler);
      scan();
    }
    return { top, scrollable };
  });
}

/** Drags one finger from one viewport point to another. */
async function swipe(
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

/** Moves two fingers from `startGap` apart to `endGap` apart. */
async function pinch(
  page: Page,
  center: { x: number; y: number },
  startGap: number,
  endGap: number
): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  const send = (
    type: "touchStart" | "touchMove" | "touchEnd",
    points: Array<{ x: number; y: number; id: number }>
  ) => cdp.send("Input.dispatchTouchEvent", { type, touchPoints: points });

  const points = (gap: number) => [
    { x: Math.round(center.x - gap), y: center.y, id: 1 },
    { x: Math.round(center.x + gap), y: center.y, id: 2 },
  ];
  await send("touchStart", points(startGap));
  const steps = 6;
  for (let step = 1; step <= steps; step++) {
    await send(
      "touchMove",
      points(startGap - ((startGap - endGap) * step) / steps)
    );
    await page.waitForTimeout(16);
  }
  await send("touchEnd", []);
  await cdp.detach();
}

test.describe("semantic zoom touch use cases", () => {
  test.use({ hasTouch: true });

  test("user pans the zoomed-in content with a touch swipe", async ({
    page,
    browserName,
  }) => {
    // A trusted touch pan needs the Chromium input pipeline; Playwright only
    // exposes tap on Firefox, which cannot drive native scrolling.
    test.skip(
      browserName !== "chromium",
      "touch panning can only be synthesised on Chromium"
    );

    const zoom = page.locator("metro-semantic-zoom");
    await gotoReadyRoute(page, "/#/selection", zoom);
    await zoom.scrollIntoViewIfNeeded();

    // The host owns pinch, so it declares its own touch-action. Declaring
    // "none" also tells the engine that no touch inside the zoom may pan,
    // which is what froze the zoomed-in list on spec-conforming engines.
    const touchAction = await zoom.evaluate((el) =>
      getComputedStyle(el).touchAction
    );
    expect(
      touchAction,
      "a touch that starts inside the zoom must be allowed to pan"
    ).not.toBe("none");

    const setup = await zoomedInScroll(zoom, true);
    expect(setup.scrollable, "the zoomed-in view must overflow").toBe(true);

    const box = await zoom.locator(".zoomed-in").boundingBox();
    if (!box) throw new Error("zoomed-in layer has no bounding box");

    const before = await zoomedInScroll(zoom);
    const pageTopBefore = await page.evaluate(() => Math.round(window.scrollY));
    expect(before.top).toBe(0);

    await swipe(
      page,
      { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height - 30) },
      { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + 30) }
    );

    await expect
      .poll(async () => (await zoomedInScroll(zoom)).top, {
        message: "the touch swipe never scrolled the zoomed-in content",
      })
      .toBeGreaterThan(0);

    // The pan belongs to the zoomed-in content, not to the page behind it.
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(
      pageTopBefore
    );
  });

  test("user pinches out to the overview", async ({ page, browserName }) => {
    test.skip(
      browserName !== "chromium",
      "pinch can only be synthesised on Chromium"
    );

    const zoom = page.locator("metro-semantic-zoom");
    await gotoReadyRoute(page, "/#/selection", zoom);
    await zoom.scrollIntoViewIfNeeded();
    const box = await zoom.boundingBox();
    if (!box) throw new Error("semantic zoom has no bounding box");

    await pinch(
      page,
      { x: Math.round(box.x + box.width / 2), y: Math.round(box.y + box.height / 2) },
      120,
      12
    );

    await expect(zoom).toHaveAttribute("zoomed", "out");
    await expect(zoom.locator(".zoomed-out")).toHaveCSS("opacity", "1");
  });
});

test.describe("semantic zoom transition duration", () => {
  test("user zooms out on an engine without View Transitions and sees it animate", async ({
    page,
  }) => {
    await withoutViewTransitions(page);
    const zoom = page.locator("metro-semantic-zoom");
    await gotoReadyRoute(page, "/#/selection", zoom);
    const layer = zoom.locator(".zoomed-out");

    await layer.evaluate((el) => {
      window.__zoomOpacity = [];
      const sample = () => {
        window.__zoomOpacity?.push(parseFloat(getComputedStyle(el).opacity));
        requestAnimationFrame(sample);
      };
      sample();
    });

    await zoom.locator(".zoom-hint").click();

    await expect(zoom).toHaveAttribute("zoomed", "out");
    await expect
      .poll(() => layer.evaluate((el) => getComputedStyle(el).opacity), {
        message: "the fallback transition never reached the overview",
        timeout: 10_000,
      })
      .toBe("1");

    const samples = await page.evaluate(() => window.__zoomOpacity ?? []);
    expect(
      samples.some((value) => value > 0 && value < 1),
      `the zoom cut straight from 0 to 1, no frame in between: ${samples
        .map((value) => value.toFixed(3))
        .join(", ")}`
    ).toBe(true);

    await expect
      .poll(() =>
        layer.evaluate((el) => getComputedStyle(el).transitionDuration)
      )
      .toMatch(/^0\.4s(, 0\.4s)*$/);
  });

  test("transition-duration is honored without View Transitions", async ({
    page,
  }) => {
    await withoutViewTransitions(page);
    const zoom = page.locator("metro-semantic-zoom");
    await gotoReadyRoute(page, "/#/selection", zoom);

    await zoom.evaluate((el) => el.setAttribute("transition-duration", "600"));

    await expect
      .poll(() =>
        zoom
          .locator(".zoomed-out")
          .evaluate((el) => getComputedStyle(el).transitionDuration)
      )
      .toMatch(/^0\.6s(, 0\.6s)*$/);
  });

  test("transition-duration reaches the view-transition rules", async ({
    page,
  }) => {
    const zoom = page.locator("metro-semantic-zoom");
    await gotoReadyRoute(page, "/#/selection", zoom);
    test.skip(
      !(await page.evaluate(() => "startViewTransition" in document)),
      "View Transitions not supported"
    );

    await page.evaluate(() => {
      window.__zoomScopeRules = [];
      const record = () => {
        for (const style of Array.from(document.head.querySelectorAll("style"))) {
          const text = style.textContent ?? "";
          if (text.includes("active-view-transition-type(semantic-zoom)")) {
            window.__zoomScopeRules?.push(text);
          }
        }
      };
      new MutationObserver(record).observe(document.head, { childList: true });
      record();
    });

    await zoom.evaluate((el) => el.setAttribute("transition-duration", "600"));
    await zoom.locator(".zoom-hint").click();
    await expect(zoom).toHaveAttribute("zoomed", "out");

    const rules = await page.evaluate(() => window.__zoomScopeRules ?? []);
    expect(
      rules.some((text) => text.includes("animation-duration: 600ms")),
      `the injected rules never used the 600ms duration: ${rules.join(" | ")}`
    ).toBe(true);
  });
});
