import { assert } from "chai";
import { registerMetroTabView, MetroTabView } from "./tab-view.ts";
import { registerMetroTabViewItem } from "./tab-view-item.ts";

suite("metro-tab-view", () => {
  registerMetroTabView();
  registerMetroTabViewItem();
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  interface TabOptions {
    count?: number;
    closable?: boolean;
    showAddButton?: boolean;
    withIcon?: boolean;
  }

  async function createTabView(options: TabOptions = {}): Promise<MetroTabView> {
    const { count = 3, closable = false, showAddButton = false, withIcon = false } = options;
    const tabView = document.createElement("metro-tab-view") as MetroTabView;
    if (showAddButton) {
      tabView.setAttribute("show-add-button", "");
    }

    for (let i = 1; i <= count; i++) {
      const item = document.createElement("metro-tab-view-item");
      item.setAttribute("header", `Tab ${i}`);
      if (closable) {
        item.setAttribute("closable", "");
      }
      if (withIcon && i === 1) {
        const icon = document.createElement("span");
        icon.setAttribute("slot", "icon");
        icon.textContent = "icon-glyph";
        item.appendChild(icon);
      }
      item.append(`Content ${i}`);
      tabView.appendChild(item);
    }

    container.appendChild(tabView);
    await tabView.updateComplete;
    return tabView;
  }

  function tabs(el: MetroTabView): NodeListOf<HTMLElement> {
    return el.shadowRoot?.querySelectorAll<HTMLElement>('[role="tab"]') as NodeListOf<HTMLElement>;
  }

  function pressKey(target: HTMLElement, key: string): void {
    target.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
  }

  test("renders a tablist with one tab per item", async () => {
    const el = await createTabView();
    assert.isNotNull(el.shadowRoot?.querySelector('[role="tablist"]'));
    assert.equal(tabs(el).length, 3);
  });

  test("first tab is selected by default with roving tabindex", async () => {
    const el = await createTabView();
    assert.equal(el.selectedIndex, 0);
    const headers = tabs(el);
    assert.equal(headers[0].getAttribute("aria-selected"), "true");
    assert.equal(headers[1].getAttribute("aria-selected"), "false");
    assert.equal(headers[0].tabIndex, 0);
    assert.equal(headers[1].tabIndex, -1);
    assert.equal(headers[2].tabIndex, -1);
  });

  test("tabs reference their panels and panels reference their tabs", async () => {
    const el = await createTabView();
    const headers = tabs(el);
    const items = el.querySelectorAll("metro-tab-view-item");
    assert.equal(items.length, 3);
    items.forEach((item, index) => {
      assert.equal(item.getAttribute("role"), "tabpanel");
      const controls = headers[index].getAttribute("aria-controls");
      assert.isNotNull(controls);
      assert.equal(controls, item.id);
      assert.equal(item.getAttribute("aria-labelledby"), headers[index].id);
    });
  });

  test("clicking a tab changes selection and fires selectionchanged", async () => {
    const el = await createTabView();
    let eventDetail: { selectedIndex: number } | null = null;
    el.addEventListener("selectionchanged", ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);

    tabs(el)[2].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;

    assert.equal(el.selectedIndex, 2);
    assert.deepEqual(eventDetail, { selectedIndex: 2 });
    assert.equal(tabs(el)[2].getAttribute("aria-selected"), "true");
    assert.equal(tabs(el)[2].tabIndex, 0);
    assert.equal(tabs(el)[0].tabIndex, -1);
  });

  test("only the selected panel is active", async () => {
    const el = await createTabView();
    const items = el.querySelectorAll("metro-tab-view-item");
    assert.isTrue(items[0].hasAttribute("active"));
    assert.isFalse(items[1].hasAttribute("active"));

    tabs(el)[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;

    assert.isFalse(items[0].hasAttribute("active"));
    assert.isTrue(items[1].hasAttribute("active"));
  });

  test("ArrowRight moves forward and ArrowLeft moves back", async () => {
    const el = await createTabView();
    pressKey(tabs(el)[0], "ArrowRight");
    await el.updateComplete;
    assert.equal(el.selectedIndex, 1);

    pressKey(tabs(el)[1], "ArrowLeft");
    await el.updateComplete;
    assert.equal(el.selectedIndex, 0);
  });

  test("arrow keys clamp at the ends instead of wrapping", async () => {
    const el = await createTabView();
    pressKey(tabs(el)[0], "ArrowLeft");
    await el.updateComplete;
    assert.equal(el.selectedIndex, 0);

    tabs(el)[2].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;
    pressKey(tabs(el)[2], "ArrowRight");
    await el.updateComplete;
    assert.equal(el.selectedIndex, 2);
  });

  test("Home and End jump to the ends", async () => {
    const el = await createTabView();
    pressKey(tabs(el)[0], "End");
    await el.updateComplete;
    assert.equal(el.selectedIndex, 2);

    pressKey(tabs(el)[2], "Home");
    await el.updateComplete;
    assert.equal(el.selectedIndex, 0);
  });

  test("keyboard selection moves focus with the selection", async () => {
    const el = await createTabView();
    pressKey(tabs(el)[0], "ArrowRight");
    await el.updateComplete;
    assert.isTrue(el.shadowRoot?.activeElement === tabs(el)[1]);
  });

  test("non-closable tabs render no close button", async () => {
    const el = await createTabView();
    assert.equal(el.shadowRoot?.querySelectorAll(".tab-close").length, 0);
  });

  test("closing the selected tab fires tabclosed and selects the neighbor", async () => {
    const el = await createTabView({ closable: true });
    let closedIndex: number | null = null;
    el.addEventListener("tabclosed", ((e: CustomEvent) => {
      closedIndex = (e.detail as { index: number }).index;
    }) as EventListener);

    const closeButtons = el.shadowRoot?.querySelectorAll<HTMLElement>(".tab-close");
    assert.equal(closeButtons?.length, 3);
    closeButtons?.[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;

    assert.equal(closedIndex, 0);
    assert.equal(el.querySelectorAll("metro-tab-view-item").length, 2);
    assert.equal(el.selectedIndex, 0);
    assert.equal(tabs(el)[0].textContent?.includes("Tab 2"), true);
  });

  test("closing the last selected tab selects the previous tab", async () => {
    const el = await createTabView({ closable: true });
    tabs(el)[2].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;

    el.shadowRoot
      ?.querySelectorAll<HTMLElement>(".tab-close")[2]
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;

    assert.equal(el.querySelectorAll("metro-tab-view-item").length, 2);
    assert.equal(el.selectedIndex, 1);
  });

  test("preventing tabclosed keeps the tab", async () => {
    const el = await createTabView({ closable: true });
    el.addEventListener("tabclosed", ((e: Event) => {
      e.preventDefault();
    }) as EventListener);

    el.shadowRoot
      ?.querySelectorAll<HTMLElement>(".tab-close")[0]
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;

    assert.equal(el.querySelectorAll("metro-tab-view-item").length, 3);
    assert.equal(el.selectedIndex, 0);
  });

  test("add button is hidden by default and fires addbuttonclick", async () => {
    const el = await createTabView();
    assert.isNull(el.shadowRoot?.querySelector(".add-button"));

    const withAdd = await createTabView({ showAddButton: true });
    let clicked = false;
    withAdd.addEventListener("addbuttonclick", () => {
      clicked = true;
    });

    const addButton = withAdd.shadowRoot?.querySelector<HTMLElement>(".add-button");
    assert.isNotNull(addButton);
    addButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    assert.isTrue(clicked);
  });

  test("header text labels each tab and icon content appears in the tab", async () => {
    const el = await createTabView({ withIcon: true });
    const headers = tabs(el);
    assert.isTrue(headers[0].textContent?.includes("Tab 1"));
    assert.isTrue(headers[0].textContent?.includes("icon-glyph"));
  });
});
