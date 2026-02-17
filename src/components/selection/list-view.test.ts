import { assert } from "chai";
import "./list-view.ts";
import { MetroListView } from "./list-view.ts";

suite("metro-list-view", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    container.style.height = "400px";
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createListView(items?: unknown[]): Promise<MetroListView> {
    container.innerHTML = "<metro-list-view></metro-list-view>";
    const el = container.querySelector("metro-list-view") as MetroListView;
    if (items) {
      el.items = items;
    }
    await el.updateComplete;
    return el;
  }

  const sampleItems = [
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
    { id: 3, name: "Cherry" },
    { id: 4, name: "Date" },
  ];

  suite("rendering", () => {
    test("is defined", async () => {
      const el = await createListView();
      assert.instanceOf(el, HTMLElement);
      assert.instanceOf(el, MetroListView);
    });

    test("renders list container with proper role", async () => {
      const el = await createListView(sampleItems);
      const listContainer = el.shadowRoot?.querySelector(".list-container");
      assert.isNotNull(listContainer, "should have list-container");
    });

    test("renders viewport element for virtualization", async () => {
      const el = await createListView(sampleItems);
      const viewport = el.shadowRoot?.querySelector(".viewport");
      assert.isNotNull(viewport, "should have viewport");
    });

    test("renders items with role=option", async () => {
      const el = await createListView(sampleItems);
      const items = el.shadowRoot?.querySelectorAll('[role="option"]');
      assert.isAtLeast(items?.length || 0, 1, "should have at least one option");
    });

    test("renders items with tabindex=0", async () => {
      const el = await createListView(sampleItems);
      const item = el.shadowRoot?.querySelector(".list-item");
      assert.equal(item?.getAttribute("tabindex"), "0");
    });

    test("renders items with data-index attribute", async () => {
      const el = await createListView(sampleItems);
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      assert.equal(items?.[0]?.getAttribute("data-index"), "0");
      assert.equal(items?.[1]?.getAttribute("data-index"), "1");
    });

    test("renders item content with displayMember property", async () => {
      const el = await createListView(sampleItems);
      el.displayMember = "name";
      await el.updateComplete;
      
      const item = el.shadowRoot?.querySelector(".list-item");
      assert.include(item?.textContent, "Apple");
    });

    test("renders empty message when no items", async () => {
      const el = await createListView([]);
      const emptyMsg = el.shadowRoot?.querySelector(".empty-message");
      assert.isNotNull(emptyMsg);
      assert.include(emptyMsg?.textContent, "No items");
    });

    test("applies itemHeight style to list items", async () => {
      const el = await createListView(sampleItems);
      el.itemHeight = 60;
      await el.updateComplete;
      
      const item = el.shadowRoot?.querySelector(".list-item") as HTMLElement;
      assert.include(item?.style.height, "60px");
    });
  });

  suite("virtualization", () => {
    test("only renders visible items for large datasets", async () => {
      const items = [];
      for (let i = 0; i < 1000; i++) {
        items.push({ id: i, name: `Item ${i}` });
      }
      const el = await createListView(items);
      
      const renderedItems = el.shadowRoot?.querySelectorAll(".list-item");
      assert.isBelow(renderedItems?.length || 0, 100, "should not render all 1000 items");
    });
  });

  suite("selection mode - none", () => {
    test("defaults to none selection mode", async () => {
      const el = await createListView(sampleItems);
      assert.equal(el.selectionMode, "none");
    });

    test("clicking item does not add selected class in none mode", async () => {
      const el = await createListView(sampleItems);
      
      const item = el.shadowRoot?.querySelector(".list-item") as HTMLElement;
      item?.click();
      await el.updateComplete;
      
      assert.isFalse(item.classList.contains("selected"));
    });
  });

  suite("single selection mode", () => {
    test("clicking item adds selected class to DOM", async () => {
      const el = await createListView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      (items?.[1] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.isFalse(items?.[0]?.classList.contains("selected"), "first should not be selected");
      assert.isTrue(items?.[1]?.classList.contains("selected"), "second should be selected");
    });

    test("clicking another item removes previous selection from DOM", async () => {
      const el = await createListView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      (items?.[0] as HTMLElement)?.click();
      await el.updateComplete;
      assert.isTrue(items?.[0]?.classList.contains("selected"));
      
      (items?.[2] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.isFalse(items?.[0]?.classList.contains("selected"), "first should be deselected");
      assert.isTrue(items?.[2]?.classList.contains("selected"), "third should be selected");
    });

    test("aria-selected updates on selection", async () => {
      const el = await createListView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      (items?.[1] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.equal(items?.[0]?.getAttribute("aria-selected"), "false");
      assert.equal(items?.[1]?.getAttribute("aria-selected"), "true");
    });

    test("getSelectedIndices returns correct array", async () => {
      const el = await createListView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      (items?.[2] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.deepEqual(el.getSelectedIndices(), [2]);
    });

    test("getSelectedItems returns correct items", async () => {
      const el = await createListView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      (items?.[1] as HTMLElement)?.click();
      await el.updateComplete;
      
      const selected = el.getSelectedItems();
      assert.equal(selected.length, 1);
      assert.deepEqual(selected[0], { id: 2, name: "Banana" });
    });
  });

  suite("multiple selection mode", () => {
    test("clicking multiple items adds selected class to each in DOM", async () => {
      const el = await createListView(sampleItems);
      el.selectionMode = "multiple";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      (items?.[0] as HTMLElement)?.click();
      await el.updateComplete;
      (items?.[2] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.isTrue(items?.[0]?.classList.contains("selected"));
      assert.isFalse(items?.[1]?.classList.contains("selected"));
      assert.isTrue(items?.[2]?.classList.contains("selected"));
      assert.deepEqual(el.getSelectedIndices(), [0, 2]);
    });

    test("clicking selected item removes it (toggle)", async () => {
      const el = await createListView(sampleItems);
      el.selectionMode = "multiple";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      (items?.[0] as HTMLElement)?.click();
      await el.updateComplete;
      assert.isTrue(items?.[0]?.classList.contains("selected"));
      
      (items?.[0] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.isFalse(items?.[0]?.classList.contains("selected"));
      assert.deepEqual(el.getSelectedIndices(), []);
    });
  });

  suite("extended selection mode", () => {
    test("first click selects item", async () => {
      const el = await createListView(sampleItems);
      el.selectionMode = "extended";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      (items?.[0] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.isTrue(items?.[0]?.classList.contains("selected"));
      assert.deepEqual(el.getSelectedIndices(), [0]);
    });

    test("clicking different items creates range selection", async () => {
      const el = await createListView(sampleItems);
      el.selectionMode = "extended";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      (items?.[0] as HTMLElement)?.click();
      await el.updateComplete;
      (items?.[2] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.isTrue(items?.[0]?.classList.contains("selected"));
      assert.isTrue(items?.[1]?.classList.contains("selected"));
      assert.isTrue(items?.[2]?.classList.contains("selected"));
      assert.deepEqual(el.getSelectedIndices(), [0, 1, 2]);
    });
  });

  suite("clearSelection method", () => {
    test("clearSelection removes all selected classes from DOM", async () => {
      const el = await createListView(sampleItems);
      el.selectionMode = "multiple";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      (items?.[0] as HTMLElement)?.click();
      await el.updateComplete;
      (items?.[1] as HTMLElement)?.click();
      await el.updateComplete;
      
      el.clearSelection();
      await el.updateComplete;
      
      items?.forEach(item => {
        assert.isFalse(item.classList.contains("selected"));
      });
      assert.deepEqual(el.getSelectedIndices(), []);
    });
  });

  suite("keyboard navigation", () => {
    test("Enter key selects item in single mode", async () => {
      const el = await createListView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      const item = el.shadowRoot?.querySelector(".list-item") as HTMLElement;
      item.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await el.updateComplete;
      
      assert.isTrue(item.classList.contains("selected"));
    });

    test("Space key selects item in single mode", async () => {
      const el = await createListView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      const item = el.shadowRoot?.querySelector(".list-item") as HTMLElement;
      item.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      await el.updateComplete;
      
      assert.isTrue(item.classList.contains("selected"));
    });

    test("ArrowDown prevents default", async () => {
      const el = await createListView(sampleItems);
      await el.updateComplete;
      
      const item = el.shadowRoot?.querySelector(".list-item") as HTMLElement;
      const event = new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true, cancelable: true });
      item.dispatchEvent(event);
      
      assert.isTrue(event.defaultPrevented);
    });

    test("ArrowUp prevents default", async () => {
      const el = await createListView(sampleItems);
      await el.updateComplete;
      
      const item = el.shadowRoot?.querySelector(".list-item") as HTMLElement;
      const event = new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true, cancelable: true });
      item.dispatchEvent(event);
      
      assert.isTrue(event.defaultPrevented);
    });
  });

  suite("events", () => {
    test("dispatches itemclick event with correct detail", async () => {
      const el = await createListView(sampleItems);
      
      let eventDetail: { item: unknown; index: number } | undefined;
      el.addEventListener("itemclick", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);
      
      const item = el.shadowRoot?.querySelector(".list-item") as HTMLElement;
      item?.click();
      
      assert.deepEqual(eventDetail?.item, { id: 1, name: "Apple" });
      assert.equal(eventDetail?.index, 0);
    });

    test("dispatches selectionchange event with correct detail", async () => {
      const el = await createListView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      let eventDetail: { selectedItems: unknown[]; selectedIndices: number[] } | undefined;
      el.addEventListener("selectionchange", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);
      
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      (items?.[1] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.deepEqual(eventDetail?.selectedIndices, [1]);
      assert.deepEqual(eventDetail?.selectedItems, [{ id: 2, name: "Banana" }]);
    });

    test("dispatches iteminvoke event on double-click", async () => {
      const el = await createListView(sampleItems);
      
      let eventDetail: { item: unknown; index: number } | undefined;
      el.addEventListener("iteminvoke", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);
      
      const item = el.shadowRoot?.querySelector(".list-item") as HTMLElement;
      item?.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
      
      assert.deepEqual(eventDetail?.item, { id: 1, name: "Apple" });
      assert.equal(eventDetail?.index, 0);
    });
  });

  suite("grouping", () => {
    test("groups items by group-key", async () => {
      const items = [
        { id: 1, name: "Apple", category: "Fruits" },
        { id: 2, name: "Banana", category: "Fruits" },
        { id: 3, name: "Carrot", category: "Vegetables" },
      ];
      const el = await createListView(items);
      el.groupKey = "category";
      await el.updateComplete;
      
      const groupHeaders = el.shadowRoot?.querySelectorAll(".group-header");
      assert.isAtLeast(groupHeaders?.length || 0, 1);
    });

    test("group header contains group key text", async () => {
      const items = [
        { id: 1, name: "Apple", category: "Fruits" },
      ];
      const el = await createListView(items);
      el.groupKey = "category";
      await el.updateComplete;
      
      const header = el.shadowRoot?.querySelector(".group-header");
      assert.include(header?.textContent, "Fruits");
    });
  });

  suite("scrollToIndex method", () => {
    test("scrollToIndex calls scrollTo on container", async () => {
      const items = [];
      for (let i = 0; i < 50; i++) {
        items.push({ id: i, name: `Item ${i}` });
      }
      const el = await createListView(items);
      el.itemHeight = 44;
      await el.updateComplete;
      
      const listContainer = el.shadowRoot?.querySelector(".list-container") as HTMLElement;
      let scrolled = false;
      listContainer.scrollTo = () => { scrolled = true; };
      
      el.scrollToIndex(20);
      
      assert.isTrue(scrolled);
    });
  });
});
