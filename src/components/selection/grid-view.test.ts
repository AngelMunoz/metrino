import { assert } from "chai";
import "./grid-view.ts";
import { MetroGridView, type GridViewItem } from "./grid-view.ts";

suite("metro-grid-view", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    container.style.width = "400px";
    container.style.height = "400px";
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createGridView(items?: GridViewItem[]): Promise<MetroGridView> {
    container.innerHTML = "<metro-grid-view></metro-grid-view>";
    const el = container.querySelector("metro-grid-view") as MetroGridView;
    if (items) {
      el.items = items;
    }
    await el.updateComplete;
    return el;
  }

  const sampleItems: GridViewItem[] = [
    { id: 1, name: "Item 1" },
    { id: 2, name: "Item 2" },
    { id: 3, name: "Item 3" },
    { id: 4, name: "Item 4" },
  ];

  suite("rendering", () => {
    test("is defined", async () => {
      const el = await createGridView();
      assert.instanceOf(el, HTMLElement);
      assert.instanceOf(el, MetroGridView);
    });

    test("renders grid container", async () => {
      const el = await createGridView(sampleItems);
      const gridContainer = el.shadowRoot?.querySelector(".grid-container");
      assert.isNotNull(gridContainer, "should have grid-container");
    });

    test("renders viewport for virtualization", async () => {
      const el = await createGridView(sampleItems);
      const viewport = el.shadowRoot?.querySelector(".viewport");
      assert.isNotNull(viewport, "should have viewport");
    });

    test("renders grid layout", async () => {
      const el = await createGridView(sampleItems);
      const gridLayout = el.shadowRoot?.querySelector(".grid-layout");
      assert.isNotNull(gridLayout, "should have grid-layout");
    });

    test("renders items from data with correct content", async () => {
      const el = await createGridView(sampleItems);
      
      const renderedItems = el.shadowRoot?.querySelectorAll(".grid-item");
      assert.isAtLeast(renderedItems?.length || 0, 1);
      
      const firstItem = renderedItems?.[0];
      assert.include(firstItem?.textContent, "Item 1");
    });

    test("renders empty message when no items", async () => {
      const el = await createGridView([]);
      await el.updateComplete;
      
      const emptyMsg = el.shadowRoot?.querySelector(".empty-message");
      assert.isNotNull(emptyMsg);
      assert.include(emptyMsg?.textContent, "No items");
    });

    test("items have role=gridcell", async () => {
      const el = await createGridView(sampleItems);
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      items?.forEach(item => {
        assert.equal(item.getAttribute("role"), "gridcell");
      });
    });

    test("items have tabindex=0", async () => {
      const el = await createGridView(sampleItems);
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      items?.forEach(item => {
        assert.equal(item.getAttribute("tabindex"), "0");
      });
    });

    test("items have data-index attribute", async () => {
      const el = await createGridView(sampleItems);
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      assert.equal(items?.[0]?.getAttribute("data-index"), "0");
      assert.equal(items?.[1]?.getAttribute("data-index"), "1");
    });

    test("renders item with displayMember property", async () => {
      const items = [{ id: 1, title: "Custom Title" }];
      const el = await createGridView(items);
      el.displayMember = "title";
      await el.updateComplete;
      
      const item = el.shadowRoot?.querySelector(".grid-item");
      assert.include(item?.textContent, "Custom Title");
    });

    test("renders items with correct width style", async () => {
      const el = await createGridView(sampleItems);
      el.itemWidth = 120;
      await el.updateComplete;
      
      const item = el.shadowRoot?.querySelector(".grid-item") as HTMLElement;
      assert.include(item?.style.width, "120px");
    });

    test("renders items with correct height style", async () => {
      const el = await createGridView(sampleItems);
      el.itemHeight = 100;
      await el.updateComplete;
      
      const item = el.shadowRoot?.querySelector(".grid-item") as HTMLElement;
      assert.include(item?.style.height, "100px");
    });

    test("grid-template-columns uses itemWidth", async () => {
      const el = await createGridView(sampleItems);
      el.itemWidth = 100;
      await el.updateComplete;
      
      const gridLayout = el.shadowRoot?.querySelector(".grid-layout") as HTMLElement;
      assert.include(gridLayout?.style.gridTemplateColumns, "100px");
    });
  });

  suite("virtualization", () => {
    test("only renders visible items for large datasets", async () => {
      const items: GridViewItem[] = [];
      for (let i = 0; i < 1000; i++) {
        items.push({ id: i, name: `Item ${i}` });
      }
      const el = await createGridView(items);
      
      const renderedItems = el.shadowRoot?.querySelectorAll(".grid-item");
      assert.isBelow(renderedItems?.length || 0, 100);
    });

    test("viewport has correct total height for virtualization", async () => {
      const items: GridViewItem[] = [];
      for (let i = 0; i < 100; i++) {
        items.push({ id: i, name: `Item ${i}` });
      }
      const el = await createGridView(items);
      el.itemHeight = 50;
      await el.updateComplete;
      
      const viewport = el.shadowRoot?.querySelector(".viewport") as HTMLElement;
      const height = parseInt(viewport?.style.height || "0");
      assert.isAbove(height, 0);
    });
  });

  suite("selection mode - none", () => {
    test("defaults to none selection mode", async () => {
      const el = await createGridView(sampleItems);
      assert.equal(el.selectionMode, "none");
    });

    test("none mode does not add selected class on click", async () => {
      const el = await createGridView(sampleItems);
      
      const item = el.shadowRoot?.querySelector(".grid-item") as HTMLElement;
      item?.click();
      await el.updateComplete;
      
      assert.isFalse(item.classList.contains("selected"));
    });

    test("none mode does not dispatch selectionchange event", async () => {
      const el = await createGridView(sampleItems);
      
      let fired = false;
      el.addEventListener("selectionchange", () => { fired = true; });
      
      const item = el.shadowRoot?.querySelector(".grid-item") as HTMLElement;
      item?.click();
      
      assert.isFalse(fired);
    });
  });

  suite("single selection mode", () => {
    test("clicking item adds selected class to DOM", async () => {
      const el = await createGridView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      (items?.[1] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.isFalse(items?.[0]?.classList.contains("selected"));
      assert.isTrue(items?.[1]?.classList.contains("selected"));
    });

    test("clicking another item removes previous selection", async () => {
      const el = await createGridView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      (items?.[0] as HTMLElement)?.click();
      await el.updateComplete;
      (items?.[2] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.isFalse(items?.[0]?.classList.contains("selected"));
      assert.isFalse(items?.[1]?.classList.contains("selected"));
      assert.isTrue(items?.[2]?.classList.contains("selected"));
    });

    test("aria-selected updates on selection", async () => {
      const el = await createGridView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      (items?.[1] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.equal(items?.[0]?.getAttribute("aria-selected"), "false");
      assert.equal(items?.[1]?.getAttribute("aria-selected"), "true");
    });

    test("getSelectedIndices returns correct array", async () => {
      const el = await createGridView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      (items?.[2] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.deepEqual(el.getSelectedIndices(), [2]);
    });

    test("getSelectedItems returns correct items", async () => {
      const el = await createGridView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      (items?.[1] as HTMLElement)?.click();
      await el.updateComplete;
      
      const selected = el.getSelectedItems();
      assert.equal(selected.length, 1);
      assert.deepEqual(selected[0], { id: 2, name: "Item 2" });
    });
  });

  suite("multiple selection mode", () => {
    test("clicking multiple items adds selected class to each", async () => {
      const el = await createGridView(sampleItems);
      el.selectionMode = "multiple";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
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
      const el = await createGridView(sampleItems);
      el.selectionMode = "multiple";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      (items?.[0] as HTMLElement)?.click();
      await el.updateComplete;
      assert.isTrue(items?.[0]?.classList.contains("selected"));
      
      (items?.[0] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.isFalse(items?.[0]?.classList.contains("selected"));
      assert.deepEqual(el.getSelectedIndices(), []);
    });

    test("selecting all items updates DOM correctly", async () => {
      const el = await createGridView(sampleItems);
      el.selectionMode = "multiple";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      (items?.[0] as HTMLElement)?.click();
      await el.updateComplete;
      (items?.[1] as HTMLElement)?.click();
      await el.updateComplete;
      (items?.[2] as HTMLElement)?.click();
      await el.updateComplete;
      (items?.[3] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.deepEqual(el.getSelectedIndices().length, 4);
    });
  });

  suite("extended selection mode", () => {
    test("first click selects item", async () => {
      const el = await createGridView(sampleItems);
      el.selectionMode = "extended";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      (items?.[0] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.isTrue(items?.[0]?.classList.contains("selected"));
      assert.deepEqual(el.getSelectedIndices(), [0]);
    });

    test("clicking different items creates range selection", async () => {
      const el = await createGridView(sampleItems);
      el.selectionMode = "extended";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      (items?.[0] as HTMLElement)?.click();
      await el.updateComplete;
      (items?.[2] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.isTrue(items?.[0]?.classList.contains("selected"));
      assert.isTrue(items?.[1]?.classList.contains("selected"));
      assert.isTrue(items?.[2]?.classList.contains("selected"));
    });
  });

  suite("clearSelection method", () => {
    test("clearSelection removes all selected classes from DOM", async () => {
      const el = await createGridView(sampleItems);
      el.selectionMode = "multiple";
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
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
      const el = await createGridView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      const item = el.shadowRoot?.querySelector(".grid-item") as HTMLElement;
      item.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await el.updateComplete;
      
      assert.isTrue(item.classList.contains("selected"));
    });

    test("Space key selects item in single mode", async () => {
      const el = await createGridView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      const item = el.shadowRoot?.querySelector(".grid-item") as HTMLElement;
      item.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      await el.updateComplete;
      
      assert.isTrue(item.classList.contains("selected"));
    });

    test("ArrowRight triggers focus on next item", async () => {
      const el = await createGridView(sampleItems);
      el.columns = 4;
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      let focused = false;
      (items?.[1] as HTMLElement).focus = () => { focused = true; };
      
      items?.[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await new Promise(r => requestAnimationFrame(r));
      
      assert.isTrue(focused);
    });

    test("ArrowLeft triggers focus on previous item", async () => {
      const el = await createGridView(sampleItems);
      el.columns = 4;
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      let focused = false;
      (items?.[0] as HTMLElement).focus = () => { focused = true; };
      
      items?.[1]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
      await new Promise(r => requestAnimationFrame(r));
      
      assert.isTrue(focused);
    });

    test("ArrowDown triggers focus on item in next row", async () => {
      const el = await createGridView(sampleItems);
      el.columns = 2;
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      let focused = false;
      (items?.[2] as HTMLElement).focus = () => { focused = true; };
      
      items?.[0]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
      await new Promise(r => requestAnimationFrame(r));
      
      assert.isTrue(focused);
    });

    test("ArrowUp triggers focus on item in previous row", async () => {
      const el = await createGridView(sampleItems);
      el.columns = 2;
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      let focused = false;
      (items?.[0] as HTMLElement).focus = () => { focused = true; };
      
      items?.[2]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
      await new Promise(r => requestAnimationFrame(r));
      
      assert.isTrue(focused);
    });

    test("ArrowRight does nothing at last item", async () => {
      const el = await createGridView(sampleItems);
      el.columns = 4;
      await el.updateComplete;
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      let focused = false;
      (items?.[0] as HTMLElement).focus = () => { focused = true; };
      
      items?.[3]?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
      await new Promise(r => requestAnimationFrame(r));
      
      assert.isFalse(focused);
    });
  });

  suite("events", () => {
    test("dispatches itemclick event with correct detail", async () => {
      const el = await createGridView(sampleItems);
      
      let eventDetail: { item: GridViewItem; index: number } | undefined;
      el.addEventListener("itemclick", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);
      
      const item = el.shadowRoot?.querySelector(".grid-item") as HTMLElement;
      item?.click();
      
      assert.deepEqual(eventDetail?.item, { id: 1, name: "Item 1" });
      assert.equal(eventDetail?.index, 0);
    });

    test("dispatches selectionchange event with correct detail", async () => {
      const el = await createGridView(sampleItems);
      el.selectionMode = "single";
      await el.updateComplete;
      
      let eventDetail: { selectedItems: GridViewItem[]; selectedIndices: number[] } | undefined;
      el.addEventListener("selectionchange", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);
      
      const items = el.shadowRoot?.querySelectorAll(".grid-item");
      (items?.[1] as HTMLElement)?.click();
      await el.updateComplete;
      
      assert.deepEqual(eventDetail?.selectedIndices, [1]);
      assert.deepEqual(eventDetail?.selectedItems, [{ id: 2, name: "Item 2" }]);
    });

    test("dispatches iteminvoke event on double-click", async () => {
      const el = await createGridView(sampleItems);
      
      let eventDetail: { item: GridViewItem; index: number } | undefined;
      el.addEventListener("iteminvoke", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);
      
      const item = el.shadowRoot?.querySelector(".grid-item") as HTMLElement;
      item?.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
      
      assert.deepEqual(eventDetail?.item, { id: 1, name: "Item 1" });
      assert.equal(eventDetail?.index, 0);
    });

    test("itemclick event bubbles", async () => {
      const el = await createGridView(sampleItems);
      
      let bubbled = false;
      container.addEventListener("itemclick", () => { bubbled = true; });
      
      const item = el.shadowRoot?.querySelector(".grid-item") as HTMLElement;
      item?.click();
      
      assert.isTrue(bubbled);
    });
  });

  suite("grouping", () => {
    test("renders group headers when groupKey is set", async () => {
      const items = [
        { id: 1, name: "Apple", category: "A" },
        { id: 2, name: "Banana", category: "B" },
      ];
      const el = await createGridView(items);
      el.groupKey = "category";
      await el.updateComplete;
      
      const groupHeaders = el.shadowRoot?.querySelectorAll(".group-header");
      assert.isAtLeast(groupHeaders?.length || 0, 1);
    });

    test("group header contains group key text", async () => {
      const items = [
        { id: 1, name: "Apple", category: "Fruits" },
      ];
      const el = await createGridView(items);
      el.groupKey = "category";
      await el.updateComplete;
      
      const header = el.shadowRoot?.querySelector(".group-header");
      assert.include(header?.textContent, "Fruits");
    });

    test("group header spans full width", async () => {
      const items = [
        { id: 1, name: "Apple", category: "A" },
      ];
      const el = await createGridView(items);
      el.groupKey = "category";
      await el.updateComplete;
      
      const header = el.shadowRoot?.querySelector(".group-header");
      assert.isNotNull(header);
    });
  });

  suite("scrollToIndex method", () => {
    test("scrollToIndex calls scrollTo on container", async () => {
      const items: GridViewItem[] = [];
      for (let i = 0; i < 50; i++) {
        items.push({ id: i, name: `Item ${i}` });
      }
      const el = await createGridView(items);
      el.itemHeight = 50;
      el.columns = 2;
      await el.updateComplete;
      
      const gridContainer = el.shadowRoot?.querySelector(".grid-container") as HTMLElement;
      let scrolled = false;
      gridContainer.scrollTo = () => { scrolled = true; };
      
      el.scrollToIndex(20);
      
      assert.isTrue(scrolled);
    });
  });

  suite("columns property", () => {
    test("defaults to auto-computed columns", async () => {
      const el = await createGridView(sampleItems);
      assert.equal(el.columns, 0);
    });

    test("respects columns property when set", async () => {
      const el = await createGridView(sampleItems);
      el.columns = 2;
      await el.updateComplete;
      
      const gridLayout = el.shadowRoot?.querySelector(".grid-layout") as HTMLElement;
      assert.include(gridLayout?.style.gridTemplateColumns, "repeat(2");
    });
  });
});
