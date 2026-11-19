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
