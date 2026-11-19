import { test, expect, type Locator } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

/** The hub and zoom surface the use case reads. */
interface ZoomableHub extends HTMLElement {
  selectedIndex: number;
}

/** Where the hub sits and how far the given section is from the gutter line. */
function hubState(
  hub: Locator,
  index: number
): Promise<{ selectedIndex: number; gap: number }> {
  return hub.evaluate((host, target) => {
    const container = host.shadowRoot?.querySelector<HTMLElement>(
      ".hub-container"
    );
    if (!container) throw new Error("the hub renders no section container");
    const section = Array.from(
      host.querySelectorAll("metro-hub-section")
    )[target];
    if (!section) throw new Error(`the hub has no section ${target + 1}`);

    const style = getComputedStyle(container);
    const gutter = parseFloat(style.paddingInlineStart) || 0;
    const rect = container.getBoundingClientRect();

    return {
      selectedIndex: (host as unknown as ZoomableHub).selectedIndex,
      gap: Math.round(section.getBoundingClientRect().left - (rect.left + gutter)),
    };
  }, index);
}

/**
 * A section's inline-start gap from the container's gutter line. The edge
 * follows the direction: in RTL the inline start is the right edge and the
 * scroll offsets run negative, so left-edge math would measure the wrong
 * side. Mirrors the component's own `#targets` measurement.
 */
function hubInlineGap(hub: Locator, index: number): Promise<number> {
  return hub.evaluate((host, target) => {
    const container = host.shadowRoot?.querySelector<HTMLElement>(
      ".hub-container"
    );
    if (!container) throw new Error("the hub renders no section container");
    const section = Array.from(
      host.querySelectorAll("metro-hub-section")
    )[target];
    if (!section) throw new Error(`the hub has no section ${target + 1}`);

    const style = getComputedStyle(container);
    const rtl = style.direction === "rtl";
    const gutter = parseFloat(style.paddingInlineStart) || 0;
    const rect = container.getBoundingClientRect();
    const edge = section.getBoundingClientRect();
    return rtl
      ? Math.round(edge.right - (rect.right - gutter))
      : Math.round(edge.left - (rect.left + gutter));
  }, index);
}

/** The `data-group-key` of every overview tile, in the order they are drawn. */
function overviewKeys(hub: Locator): Promise<(string | null)[]> {
  return hub
    .locator(".hub-overview button")
    .evaluateAll((tiles) =>
      tiles.map((tile) => tile.getAttribute("data-group-key"))
    );
}

test.describe("zoomable hub use cases", () => {
  test("the hub zooms out to a section overview", async ({ page }) => {
    const hub = page.locator("#metro-hub metro-hub");
    await gotoReadyRoute(page, "/#/navigation", hub);
    await hub.scrollIntoViewIfNeeded();

    const zoom = hub.locator("metro-semantic-zoom");
    await expect(zoom, "a zoomable hub is a semantic zoom").toHaveCount(1);
    await expect(hub.locator(".hub-container")).toHaveAttribute(
      "slot",
      "zoomed-in"
    );

    await zoom.locator(".zoom-hint").click();

    await expect(zoom).toHaveAttribute("zoomed", "out");

    const tiles = hub.locator(".hub-overview button");
    await expect(tiles).toHaveCount(4);
    const keys = await overviewKeys(hub);
    const headers = await hub.evaluate((host) =>
      Array.from(host.querySelectorAll("metro-hub-section")).map((section) =>
        section.getAttribute("header")
      )
    );
    expect(
      keys,
      "the overview is a map of the sections, in their order"
    ).toEqual(headers);

    const firstTile = tiles.first();
    await expect(firstTile).toHaveText("Section 1");
    await expect(firstTile).toHaveCSS("border-style", "solid");
    await expect(
      zoom.locator(".zoomed-in"),
      "the overview must hide the sections it maps"
    ).toHaveCSS("opacity", "0");
  });

  test("tapping an overview tile re-enters at that section", async ({
    page,
  }) => {
    const hub = page.locator("#metro-hub metro-hub");
    await gotoReadyRoute(page, "/#/navigation", hub);
    await hub.scrollIntoViewIfNeeded();

    const zoom = hub.locator("metro-semantic-zoom");
    await zoom.locator(".zoom-hint").click();
    await expect(zoom).toHaveAttribute("zoomed", "out");

    await hub.locator('.hub-overview button[data-group-key="Section 3"]').click();

    await expect(zoom, "re-entering a section must put the sections back").toHaveAttribute(
      "zoomed",
      "in"
    );

    // The third section's inline start has to reach the container's gutter
    // line, which is where the hub itself puts it. Poll the strict condition:
    // a single sample can land mid-glide of the smooth scroll.
    await expect
      .poll(async () => Math.abs((await hubState(hub, 2)).gap), {
        message: "the overview tile never brought Section 3 to the gutter line",
        timeout: 10_000,
      })
      .toBeLessThanOrEqual(2);

    const state = await hubState(hub, 2);
    expect(
      state.selectedIndex,
      `Section 3 sits on the line, so the hub must read index 2, saw ${state.selectedIndex}`
    ).toBe(2);
    await expect(
      page.locator("#metro-hub .hub-readout"),
      "the page's readout must follow the re-entry"
    ).toHaveText("in view: section 3");
  });

  test("rtl: tapping an overview tile re-enters at that section", async ({
    page,
  }) => {
    const hub = page.locator("#metro-hub metro-hub");
    await gotoReadyRoute(page, "/#/navigation", hub);
    await hub.scrollIntoViewIfNeeded();

    // The demo's own direction fixture: the toggle writes dir on the hub host.
    await page
      .locator("#metro-hub .hub-controls .control-btn", { hasText: "LTR" })
      .click();
    await expect(hub).toHaveAttribute("dir", "rtl");

    const zoom = hub.locator("metro-semantic-zoom");
    await zoom.locator(".zoom-hint").click();
    await expect(zoom).toHaveAttribute("zoomed", "out");

    await hub.locator('.hub-overview button[data-group-key="Section 3"]').click();

    await expect(zoom, "re-entering a section must put the sections back").toHaveAttribute(
      "zoomed",
      "in"
    );

    // The third section's inline start has to reach the container's gutter
    // line from the right side now, which is where the hub itself puts it.
    await expect
      .poll(async () => Math.abs(await hubInlineGap(hub, 2)), {
        message: "the overview tile never brought Section 3 to the gutter line in RTL",
        timeout: 10_000,
      })
      .toBeLessThanOrEqual(2);

    const state = await hubState(hub, 2);
    expect(
      state.selectedIndex,
      `Section 3 sits on the line, so the hub must read index 2, saw ${state.selectedIndex}`
    ).toBe(2);
    await expect(
      page.locator("#metro-hub .hub-readout"),
      "the page's readout must follow the re-entry"
    ).toHaveText("in view: section 3");
  });

  test("the zoom reports the section the hub scrolls to", async ({ page }) => {
    const hub = page.locator("#metro-hub metro-hub");
    await gotoReadyRoute(page, "/#/navigation", hub);
    await hub.scrollIntoViewIfNeeded();
    const zoom = hub.locator("metro-semantic-zoom");

    await page.evaluate(() => {
      const w = window as unknown as { __hubGroups?: string[] };
      w.__hubGroups = [];
      document.addEventListener("groupchanged", (event) => {
        w.__hubGroups?.push(
          (event as CustomEvent<{ key: string | null }>).detail.key ?? "null"
        );
      });
    });

    // Scroll the hub itself (not the zoom API): the read must follow the axis
    // the hub pans on, not the top edge of a horizontal row.
    await hub.evaluate((host) => {
      const container = host.shadowRoot?.querySelector<HTMLElement>(
        ".hub-container"
      );
      const section = host.querySelectorAll("metro-hub-section")[1];
      if (!container || !section) throw new Error("hub missing container/section");
      const gutter =
        parseFloat(getComputedStyle(container).paddingInlineStart) || 0;
      const delta =
        section.getBoundingClientRect().left -
        container.getBoundingClientRect().left -
        gutter;
      container.scrollTo({ left: container.scrollLeft + delta, behavior: "auto" });
    });

    await expect
      .poll(
        () =>
          zoom.evaluate(
            (el) => (el as unknown as { currentGroup: string | null }).currentGroup
          ),
        { message: "the zoom never reported the scrolled-to section", timeout: 5_000 }
      )
      .toBe("Section 2");

    const seen = await page.evaluate(
      () => (window as unknown as { __hubGroups: string[] }).__hubGroups
    );
    expect(seen, "groupchanged must announce the horizontal move").toContain(
      "Section 2"
    );
  });

  test("clicking a section header brings it to the gutter and focuses it", async ({
    page,
  }) => {
    const hub = page.locator("#metro-hub metro-hub");
    await gotoReadyRoute(page, "/#/navigation", hub);
    await hub.scrollIntoViewIfNeeded();

    await hub
      .locator('metro-hub-section[header="Section 3"] .section-header')
      .click();

    await expect
      .poll(async () => Math.abs((await hubState(hub, 2)).gap), {
        message: "the header click never brought Section 3 to the gutter line",
        timeout: 10_000,
      })
      .toBeLessThanOrEqual(2);

    const focusInside = await hub.evaluate((host) => {
      const section = host.querySelectorAll("metro-hub-section")[2];
      if (!section) return false;
      let active: Element | null = document.activeElement;
      while (active?.shadowRoot?.activeElement) {
        active = active.shadowRoot.activeElement;
      }
      return active === section || section.contains(active);
    });
    expect(focusInside, "focus must land inside the clicked section").toBe(true);
  });

  test("the hub scrollbar appears while panning and hides at idle", async ({
    page,
    browserName,
  }) => {
    const hub = page.locator("#metro-hub metro-hub");
    await gotoReadyRoute(page, "/#/navigation", hub);
    await hub.scrollIntoViewIfNeeded();
    const container = hub.locator(".hub-container");

    // The reveal state is the cross-engine observable: headless Firefox reports
    // scrollbar-width "none" even for a revealed horizontal-only scroller, and
    // headless scrollbars are overlay, so neither computed width nor geometry
    // can gate this in both engines.
    const revealed = () =>
      container.evaluate(
        (el) =>
          el.classList.contains("pointed") || el.classList.contains("scrolling")
      );

    expect(await revealed(), "at rest the scrollbar is hidden").toBe(false);

    await container.hover();
    await expect
      .poll(revealed, { message: "pointing at the hub reveals the scrollbar", timeout: 3_000 })
      .toBe(true);
    if (browserName === "chromium") {
      expect(
        await container.evaluate((el) => getComputedStyle(el).scrollbarWidth),
        "the revealed scrollbar is the thin Metro one"
      ).toBe("thin");
    }

    await page.mouse.move(10, 10);
    await expect.poll(revealed, { timeout: 3_000 }).toBe(false);

    await container.hover();
    await page.mouse.wheel(240, 0);
    expect(await revealed(), "panning reveals the scrollbar").toBe(true);

    await page.mouse.move(10, 10);
    await expect
      .poll(revealed, { message: "the scrollbar never hid after the pan", timeout: 4_000 })
      .toBe(false);
  });

  test("zoomable off renders no wrapper", async ({ page }) => {
    const hub = page.locator("#metro-hub metro-hub");
    await gotoReadyRoute(page, "/#/navigation", hub);
    await hub.scrollIntoViewIfNeeded();

    await hub.evaluate((host) => {
      host.removeAttribute("zoomable");
    });

    await expect(hub.locator("metro-semantic-zoom")).toHaveCount(0);
    await expect(hub.locator(".hub-overview")).toHaveCount(0);
    const container = hub.locator(".hub-container");
    await expect(container).toHaveCount(1);
    await expect(container).not.toHaveAttribute("slot");

    const keys = await hub.evaluate((host) =>
      Array.from(host.querySelectorAll("metro-hub-section")).map((section) =>
        section.getAttribute("data-group-key")
      )
    );
    expect(
      keys,
      "the hub owns the group keys it wrote, and only those"
    ).toEqual([null, null, null, null]);
  });
});
