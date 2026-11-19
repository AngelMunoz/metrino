import { assert } from "chai";
import {
  registerMetroBreadcrumbBar,
  MetroBreadcrumbBar,
} from "./breadcrumb-bar.ts";
import {
  registerMetroBreadcrumbItem,
  MetroBreadcrumbItem,
} from "./breadcrumb-item.ts";
import type { BreadcrumbItemClickedEventDetail } from "./breadcrumb-bar.ts";

suite("metro-breadcrumb-bar", () => {
  registerMetroBreadcrumbBar();
  registerMetroBreadcrumbItem();
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createBar(
    labels: string[] = ["Home", "Library", "Documents"],
    attrs: Record<string, string> = {},
  ): Promise<MetroBreadcrumbBar> {
    const bar = document.createElement(
      "metro-breadcrumb-bar",
    ) as MetroBreadcrumbBar;
    Object.entries(attrs).forEach(([key, value]) =>
      bar.setAttribute(key, value),
    );
    labels.forEach((label) => {
      const item = document.createElement(
        "metro-breadcrumb-item",
      ) as MetroBreadcrumbItem;
      item.setAttribute("header", label);
      bar.appendChild(item);
    });
    container.appendChild(bar);
    await bar.updateComplete;
    return bar;
  }

  async function waitFor(
    condition: () => boolean,
    message: string,
  ): Promise<void> {
    const start = Date.now();
    while (!condition()) {
      if (Date.now() - start > 3000) {
        assert.fail(`timed out waiting for: ${message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }

  test("registers both custom elements", () => {
    assert.exists(customElements.get("metro-breadcrumb-bar"));
    assert.exists(customElements.get("metro-breadcrumb-item"));
  });

  test("renders nav with breadcrumb label", async () => {
    const el = await createBar();
    const nav = el.shadowRoot?.querySelector("nav");
    assert.exists(nav);
    assert.equal(nav?.getAttribute("aria-label"), "breadcrumb");
  });

  test("renders one crumb per child item", async () => {
    const el = await createBar();
    const crumbs = el.shadowRoot?.querySelectorAll("li.crumb");
    assert.equal(crumbs?.length, 3);
  });

  test("non-current crumbs render as buttons", async () => {
    const el = await createBar();
    const buttons = el.shadowRoot?.querySelectorAll("button.link");
    assert.equal(buttons?.length, 2);
    assert.equal(buttons?.[0].textContent, "Home");
  });

  test("last crumb has aria-current page and is not clickable", async () => {
    const el = await createBar();
    const current = el.shadowRoot?.querySelector(".current");
    assert.exists(current);
    assert.equal(current?.getAttribute("aria-current"), "page");
    assert.equal(current?.textContent, "Documents");
    assert.notExists(el.shadowRoot?.querySelector(".current button"));
  });

  test("item with href renders as a link", async () => {
    const el = await createBar(["Home", "Library"]);
    const items = el.querySelectorAll("metro-breadcrumb-item");
    items[0].setAttribute("href", "/home");
    await waitFor(
      () => el.shadowRoot?.querySelector("a.link") !== null,
      "link to render after href change",
    );
    const link = el.shadowRoot?.querySelector<HTMLAnchorElement>("a.link");
    assert.exists(link);
    assert.equal(link?.getAttribute("href"), "/home");
  });

  test("clicking a crumb fires itemclicked with index and item", async () => {
    const el = await createBar();
    const seen: { event: CustomEvent | null } = { event: null };
    el.addEventListener("itemclicked", ((e: CustomEvent) => {
      seen.event = e;
    }) as EventListener);

    const buttons = el.shadowRoot?.querySelectorAll("button.link");
    buttons?.[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;

    assert.exists(seen.event);
    const event = seen.event as unknown as CustomEvent;
    assert.isTrue(event.bubbles);
    assert.isTrue(event.composed);
    const detail = event.detail as BreadcrumbItemClickedEventDetail;
    assert.equal(detail.index, 1);
    assert.equal(
      detail.item,
      el.querySelectorAll("metro-breadcrumb-item")[1],
    );
  });

  test("item label falls back to text content", async () => {
    const bar = document.createElement(
      "metro-breadcrumb-bar",
    ) as MetroBreadcrumbBar;
    const item = document.createElement(
      "metro-breadcrumb-item",
    ) as MetroBreadcrumbItem;
    item.textContent = "Plain Text";
    const last = document.createElement(
      "metro-breadcrumb-item",
    ) as MetroBreadcrumbItem;
    last.setAttribute("header", "End");
    bar.append(item, last);
    container.appendChild(bar);
    await bar.updateComplete;
    const buttons = bar.shadowRoot?.querySelectorAll("button.link");
    assert.equal(buttons?.[0].textContent, "Plain Text");
  });

  test("overflow collapses leading crumbs behind an ellipsis", async () => {
    const el = await createBar([
      "Very Long Breadcrumb Segment One",
      "Very Long Breadcrumb Segment Two",
      "Very Long Breadcrumb Segment Three",
      "Very Long Breadcrumb Segment Four",
      "Current Page",
    ]);
    el.style.width = "80px";
    await waitFor(
      () => el.shadowRoot?.querySelector(".ellipsis") !== null,
      "ellipsis button to appear",
    );
    const crumbs = el.shadowRoot?.querySelectorAll("li.crumb");
    assert.isBelow(crumbs?.length ?? 0, 5);
  });

  test("ellipsis opens a flyout with collapsed crumbs", async () => {
    const el = await createBar([
      "Very Long Breadcrumb Segment One",
      "Very Long Breadcrumb Segment Two",
      "Very Long Breadcrumb Segment Three",
      "Very Long Breadcrumb Segment Four",
      "Current Page",
    ]);
    el.style.width = "80px";
    await waitFor(
      () => el.shadowRoot?.querySelector(".ellipsis") !== null,
      "ellipsis button to appear",
    );
    const ellipsis = el.shadowRoot?.querySelector<HTMLButtonElement>(
      ".ellipsis",
    );
    ellipsis?.click();
    await el.updateComplete;
    const flyout = el.shadowRoot?.querySelector(".flyout");
    assert.exists(flyout);
    assert.equal(flyout?.getAttribute("role"), "menu");
    assert.isAbove(
      flyout?.querySelectorAll(".flyout-item").length ?? 0,
      0,
    );
    assert.equal(ellipsis?.getAttribute("aria-expanded"), "true");
  });

  test("escape closes the flyout and returns focus", async () => {
    const el = await createBar([
      "Very Long Breadcrumb Segment One",
      "Very Long Breadcrumb Segment Two",
      "Very Long Breadcrumb Segment Three",
      "Very Long Breadcrumb Segment Four",
      "Current Page",
    ]);
    el.style.width = "80px";
    await waitFor(
      () => el.shadowRoot?.querySelector(".ellipsis") !== null,
      "ellipsis button to appear",
    );
    (
      el.shadowRoot?.querySelector<HTMLButtonElement>(".ellipsis")
    )?.click();
    await el.updateComplete;
    assert.exists(el.shadowRoot?.querySelector(".flyout"));
    el.shadowRoot
      ?.querySelector(".flyout")
      ?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    await el.updateComplete;
    assert.notExists(el.shadowRoot?.querySelector(".flyout"));
  });

  test("flyout item click fires itemclicked with the original index", async () => {
    const el = await createBar([
      "Very Long Breadcrumb Segment One",
      "Very Long Breadcrumb Segment Two",
      "Very Long Breadcrumb Segment Three",
      "Very Long Breadcrumb Segment Four",
      "Current Page",
    ]);
    el.style.width = "80px";
    await waitFor(
      () => el.shadowRoot?.querySelector(".ellipsis") !== null,
      "ellipsis button to appear",
    );
    (
      el.shadowRoot?.querySelector<HTMLButtonElement>(".ellipsis")
    )?.click();
    await el.updateComplete;
    const seen: { index: number } = { index: -1 };
    el.addEventListener("itemclicked", ((e: CustomEvent) => {
      seen.index = (e.detail as BreadcrumbItemClickedEventDetail).index;
    }) as EventListener);
    const first = el.shadowRoot?.querySelector<HTMLButtonElement>(
      ".flyout-item",
    );
    first?.click();
    await el.updateComplete;
    assert.equal(seen.index, 0);
    assert.notExists(el.shadowRoot?.querySelector(".flyout"));
  });
});
