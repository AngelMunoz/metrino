import { test, expect, type Locator } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

declare global {
  interface Window {
    /** Keys reported by `groupchanged`, in the order the page saw them. */
    __groupChanges?: (string | null)[];
  }
}

/** The group side of the `metro-semantic-zoom` contract. */
interface SemanticZoomHost extends HTMLElement {
  currentGroup: string | null;
  scrollToGroup(key: string): Promise<void>;
}

const ZOOM_IN_SELECTOR = '[slot="zoomed-in"]';

/**
 * Scrolls the zoomed-in list without going through the component API.
 * `where` is either a group key to align with the top of the scroller or
 * `"end"`, which puts the scroller at the bottom of its content.
 */
function scrollZoomedIn(zoom: Locator, where: string): Promise<void> {
  return zoom.evaluate((host, target) => {
    // A page function is serialised on its own, so the selectors it needs are
    // written out here rather than taken from the module above.
    const outer = host.querySelector<HTMLElement>('[slot="zoomed-in"]');
    const roots = outer
      ? [outer, ...Array.from(outer.querySelectorAll<HTMLElement>("*"))]
      : [];
    const scroller = roots.find(
      (element) =>
        element.scrollHeight > element.clientHeight + 1 &&
        /^(auto|scroll)$/.test(getComputedStyle(element).overflowY)
    );
    if (!scroller) throw new Error("the zoomed-in view has no scroller");

    if (target === "end") {
      scroller.scrollTop = scroller.scrollHeight;
      return;
    }

    const header = scroller.querySelector<HTMLElement>(
      `[data-group-key="${CSS.escape(target)}"]`
    );
    if (!header) throw new Error(`no zoomed-in group "${target}"`);
    scroller.scrollTop +=
      header.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
  }, where);
}

/**
 * Measures one zoomed-in group against the scroller that holds it: the
 * distance from the header's top to the top of the visible area, where that
 * scroller currently sits, and whether it overflows at all.
 */
function zoomedInGroup(zoom: Locator, key: string): Promise<{
  gap: number;
  top: number;
  overflow: boolean;
}> {
  return zoom.evaluate((host, groupKey) => {
    const outer = host.querySelector<HTMLElement>('[slot="zoomed-in"]');
    const roots = outer
      ? [outer, ...Array.from(outer.querySelectorAll<HTMLElement>("*"))]
      : [];
    const scroller = roots.find(
      (element) =>
        element.scrollHeight > element.clientHeight + 1 &&
        /^(auto|scroll)$/.test(getComputedStyle(element).overflowY)
    );
    const layer = host.shadowRoot?.querySelector<HTMLElement>(".zoomed-in");
    const view = scroller ?? layer;
    if (!view) throw new Error("the zoomed-in view has no scroller");

    const header = host.querySelector<HTMLElement>(
      '[slot="zoomed-in"] [data-group-key="' + CSS.escape(groupKey) + '"]'
    );
    if (!header) throw new Error(`no zoomed-in group "${groupKey}"`);

    return {
      gap: Math.abs(
        header.getBoundingClientRect().top - view.getBoundingClientRect().top
      ),
      top: view.scrollTop,
      overflow: view.scrollHeight > view.clientHeight + 1,
    };
  }, key);
}

/** The `data-group-key` of every tile or header, in document order. */
function groupKeys(scope: Locator): Promise<string[]> {
  return scope.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("data-group-key") ?? "")
  );
}

test.describe("semantic zoom group contract", () => {
  test("tapping a zoomed-out group re-enters the list at that group", async ({
    page,
  }) => {
    const zoom = page.locator("metro-semantic-zoom");
    await gotoReadyRoute(page, "/#/selection", zoom);
    await zoom.scrollIntoViewIfNeeded();

    const tiles = zoom.locator('[slot="zoomed-out"] [data-group-key]');
    const keys = await groupKeys(tiles);
    expect(
      keys.length,
      "the overview must show one tile per group"
    ).toBeGreaterThanOrEqual(3);
    const target = keys[2];
    if (!target) throw new Error("the overview has no third group");

    await zoom.locator(".zoom-hint").click();
    await expect(zoom).toHaveAttribute("zoomed", "out");

    await tiles.nth(2).click();

    await expect(
      zoom,
      "tapping an overview group must zoom back in"
    ).toHaveAttribute("zoomed", "in");

    await expect
      .poll(() => zoomedInGroup(zoom, target).then((state) => state.gap), {
        message: `the "${target}" header never reached the top of the list`,
        timeout: 10_000,
      })
      .toBeLessThanOrEqual(4);

    const state = await zoomedInGroup(zoom, target);
    expect(state.overflow, "the groups must overflow the view").toBe(true);
    expect(
      state.top,
      "re-entering a later group must scroll past the earlier ones"
    ).toBeGreaterThan(0);

    await expect
      .poll(() =>
        zoom.evaluate((el) => (el as unknown as SemanticZoomHost).currentGroup)
      )
      .toBe(target);
  });

  test("scrolling the zoomed-in view reports the current group", async ({
    page,
  }) => {
    const zoom = page.locator("metro-semantic-zoom");
    await gotoReadyRoute(page, "/#/selection", zoom);
    await zoom.scrollIntoViewIfNeeded();

    await page.evaluate(() => {
      window.__groupChanges = [];
      document.addEventListener("groupchanged", (event) => {
        window.__groupChanges?.push(
          (event as CustomEvent<{ key: string | null }>).detail?.key ?? null
        );
      });
    });

    const headers = zoom.locator(`${ZOOM_IN_SELECTOR} [data-group-key]`);
    const keys = await groupKeys(headers);
    expect(keys.length, "the list must show at least two groups").toBeGreaterThanOrEqual(2);
    const target = keys[1];
    if (!target) throw new Error("the list has no second group");

    await scrollZoomedIn(zoom, target);

    await expect
      .poll(
        () =>
          page.evaluate(
            (key) => (window.__groupChanges ?? []).includes(key),
            target
          ),
        {
          message: `the page never saw groupchanged for "${target}"`,
          timeout: 10_000,
        }
      )
      .toBe(true);

    await expect
      .poll(() =>
        zoom.evaluate((el) => (el as unknown as SemanticZoomHost).currentGroup)
      )
      .toBe(target);
  });

  test("scrollToGroup realigns the list while already zoomed in", async ({
    page,
  }) => {
    const zoom = page.locator("metro-semantic-zoom");
    await gotoReadyRoute(page, "/#/selection", zoom);
    await zoom.scrollIntoViewIfNeeded();

    const headers = zoom.locator(`${ZOOM_IN_SELECTOR} [data-group-key]`);
    const keys = await groupKeys(headers);
    const first = keys[0];
    if (!first) throw new Error("the list has no first group");

    // Move away from the top first, so the call has a real scroll to undo.
    await scrollZoomedIn(zoom, "end");
    await expect
      .poll(() => zoomedInGroup(zoom, first).then((state) => state.gap))
      .toBeGreaterThan(4);

    await zoom.evaluate(
      (el, key) =>
        (el as unknown as SemanticZoomHost).scrollToGroup(key).then(() => true),
      first
    );

    await expect
      .poll(() => zoomedInGroup(zoom, first).then((state) => state.gap), {
        message: `scrollToGroup("${first}") never aligned the first group`,
        timeout: 10_000,
      })
      .toBeLessThanOrEqual(4);

    // Poll the strict condition: a single sample can land mid-settle of the
    // smooth scroll and read a few pixels of remaining glide as misalignment.
    await expect
      .poll(() => zoomedInGroup(zoom, first).then((state) => state.top), {
        message: "the first group never settled at the top of the content",
        timeout: 10_000,
      })
      .toBeLessThanOrEqual(1);
  });
});
