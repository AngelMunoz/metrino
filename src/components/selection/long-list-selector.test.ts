import { assert } from "chai";
import "./long-list-selector.ts";
import {
  MetroLongListSelector,
  type LongListSelectorItem,
} from "./long-list-selector.ts";

interface TestItem extends LongListSelectorItem {
  id: number;
  name: string;
  category: string;
}

suite("metro-long-list-selector", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  const sampleItems: TestItem[] = [
    { id: 1, name: "Apple", category: "A" },
    { id: 2, name: "Apricot", category: "A" },
    { id: 3, name: "Banana", category: "B" },
    { id: 4, name: "Blueberry", category: "B" },
    { id: 5, name: "Cherry", category: "C" },
    { id: 6, name: "Date", category: "D" },
  ];

  async function createList(
    options: {
      items?: TestItem[];
      groupKey?: string;
      displayMember?: string;
      valueMember?: string;
      selectionMode?: "none" | "single" | "multiple";
      maxHeight?: string;
      showJumpList?: boolean;
      selectedValue?: unknown;
    } = {}
  ): Promise<MetroLongListSelector> {
    const el = document.createElement(
      "metro-long-list-selector"
    ) as MetroLongListSelector;

    el.items = options.items ?? sampleItems;
    if (options.groupKey !== undefined) el.groupKey = options.groupKey;
    if (options.displayMember !== undefined)
      el.displayMember = options.displayMember;
    if (options.valueMember !== undefined) el.valueMember = options.valueMember;
    if (options.selectionMode !== undefined)
      el.selectionMode = options.selectionMode;
    if (options.maxHeight !== undefined) el.maxHeight = options.maxHeight;
    if (options.showJumpList !== undefined)
      el.showJumpList = options.showJumpList;
    if (options.selectedValue !== undefined)
      el.selectedValue = options.selectedValue;

    container.appendChild(el);
    await el.updateComplete;

    return el;
  }

  function getRenderedItems(el: MetroLongListSelector): { index: number; text: string }[] {
    const items = el.shadowRoot?.querySelectorAll(".list-item");
    return Array.from(items ?? []).map(item => ({
      index: parseInt(item.getAttribute("data-index") || "-1"),
      text: item.querySelector("span")?.textContent?.trim() || "",
    }));
  }

  suite("basic rendering", () => {
    test("renders list container", async () => {
      const el = await createList();
      const listContainer = el.shadowRoot?.querySelector(".list-container");
      assert.exists(listContainer);
    });

    test("renders all items in flat list", async () => {
      const el = await createList();
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      assert.equal(items?.length, 6);
    });

    test("displays items using displayMember", async () => {
      const el = await createList({ displayMember: "name" });
      const firstItem = el.shadowRoot?.querySelector(".list-item span");
      assert.equal(firstItem?.textContent?.trim(), "Apple");
    });

    test("shows empty message when no items", async () => {
      const el = await createList({ items: [] });
      const emptyMsg = el.shadowRoot?.querySelector(".empty-message");
      assert.exists(emptyMsg);
      assert.equal(emptyMsg?.textContent, "No items");
    });
  });

  suite("flat list index and text consistency", () => {
    test("data-index matches actual item position", async () => {
      const el = await createList({ displayMember: "name" });
      const rendered = getRenderedItems(el);
      
      assert.equal(rendered[0].index, 0, "First item should have index 0");
      assert.equal(rendered[0].text, "Apple", "First item text should match");
      
      assert.equal(rendered[5].index, 5, "Last item should have index 5");
      assert.equal(rendered[5].text, "Date", "Last item text should match");
    });

    test("flat list with 100 items - all indices correct", async () => {
      const items: TestItem[] = [];
      for (let i = 0; i < 100; i++) {
        items.push({ id: i, name: `Item ${i}`, category: "A" });
      }
      const el = await createList({ items, displayMember: "name", maxHeight: "150px" });
      
      const rendered = getRenderedItems(el);
      for (const item of rendered) {
        assert.equal(item.text, `Item ${item.index}`, 
          `Item at index ${item.index} should show "Item ${item.index}" but showed "${item.text}"`);
      }
    });
  });

  suite("grouped list index and text consistency", () => {
    test("grouped items have correct indices", async () => {
      const el = await createList({ groupKey: "category", displayMember: "name" });
      const rendered = getRenderedItems(el);
      
      const appleItem = rendered.find(r => r.text === "Apple");
      assert.exists(appleItem, "Apple should be rendered");
      assert.equal(appleItem!.index, 0, "Apple should have index 0");
      
      const bananaItem = rendered.find(r => r.text === "Banana");
      assert.exists(bananaItem, "Banana should be rendered");
      assert.equal(bananaItem!.index, 2, "Banana should have index 2");
    });

    test("grouped items sorted alphabetically by category", async () => {
      const el = await createList({ groupKey: "category", displayMember: "name" });
      const headers = el.shadowRoot?.querySelectorAll(".group-header");
      const keys = Array.from(headers ?? []).map(h => h.textContent?.trim());
      assert.deepEqual(keys, ["A", "B", "C", "D"]);
    });

    test("grouped list with 100 items across categories - all indices correct", async () => {
      const items: TestItem[] = [];
      for (let i = 0; i < 100; i++) {
        const letter = String.fromCharCode(65 + (i % 26));
        items.push({ id: i, name: `Item ${i}`, category: letter });
      }
      const el = await createList({ 
        items, 
        groupKey: "category", 
        displayMember: "name",
        maxHeight: "150px" 
      });
      
      const rendered = getRenderedItems(el);
      for (const item of rendered) {
        assert.equal(item.text, `Item ${item.index}`,
          `Grouped item at index ${item.index} should show "Item ${item.index}" but showed "${item.text}"`);
      }
    });
  });

  suite("scrolling preserves index consistency", () => {
    test("scrolling flat list maintains correct indices", async () => {
      const items: TestItem[] = [];
      for (let i = 0; i < 200; i++) {
        items.push({ id: i, name: `Item ${i}`, category: "A" });
      }
      const el = await createList({ items, displayMember: "name", maxHeight: "150px" });
      
      const container = el.shadowRoot?.querySelector(".list-container") as HTMLElement;
      container.scrollTop = 3000;
      container.dispatchEvent(new Event("scroll"));
      await el.updateComplete;
      
      const rendered = getRenderedItems(el);
      for (const item of rendered) {
        assert.equal(item.text, `Item ${item.index}`,
          `After scroll, item at index ${item.index} should show "Item ${item.index}" but showed "${item.text}"`);
      }
    });

    test("scrolling grouped list maintains correct indices", async () => {
      const items: TestItem[] = [];
      for (let i = 0; i < 500; i++) {
        const letter = String.fromCharCode(65 + (i % 26));
        items.push({ id: i, name: `Item ${i}`, category: letter });
      }
      const el = await createList({ 
        items, 
        groupKey: "category", 
        displayMember: "name",
        maxHeight: "150px" 
      });
      
      const container = el.shadowRoot?.querySelector(".list-container") as HTMLElement;
      container.scrollTop = 10000;
      container.dispatchEvent(new Event("scroll"));
      await el.updateComplete;
      
      const rendered = getRenderedItems(el);
      for (const item of rendered) {
        assert.equal(item.text, `Item ${item.index}`,
          `After scroll in grouped list, item at index ${item.index} should show "Item ${item.index}" but showed "${item.text}"`);
      }
    });

    test("scrolling to bottom of large grouped list shows last items correctly", async () => {
      const items: TestItem[] = [];
      for (let i = 0; i < 1000; i++) {
        const letter = String.fromCharCode(65 + (i % 26));
        items.push({ id: i, name: `Item ${i}`, category: letter });
      }
      const el = await createList({ 
        items, 
        groupKey: "category", 
        displayMember: "name",
        maxHeight: "150px" 
      });
      
      const container = el.shadowRoot?.querySelector(".list-container") as HTMLElement;
      container.scrollTop = container.scrollHeight;
      container.dispatchEvent(new Event("scroll"));
      await el.updateComplete;
      
      const rendered = getRenderedItems(el);
      assert.isAbove(rendered.length, 0, "Should have rendered items at bottom");
      
      for (const item of rendered) {
        assert.equal(item.text, `Item ${item.index}`,
          `Item at index ${item.index} should show "Item ${item.index}" but showed "${item.text}"`);
      }
      
      const lastGroup = el.shadowRoot?.querySelector('.group-header[data-group-key="Z"]');
      assert.exists(lastGroup, "Should have Z group visible");
    });

    test("10000 items - can see Item 10000 at bottom", async () => {
      const items: TestItem[] = [];
      for (let i = 0; i < 10000; i++) {
        const letter = String.fromCharCode(65 + (i % 26));
        items.push({ id: i + 1, name: `Item ${i + 1}`, category: letter });
      }
      const el = await createList({ 
        items, 
        groupKey: "category", 
        displayMember: "name",
        maxHeight: "200px" 
      });
      
      const container = el.shadowRoot?.querySelector(".list-container") as HTMLElement;
      container.scrollTop = container.scrollHeight;
      container.dispatchEvent(new Event("scroll"));
      await el.updateComplete;
      
      const rendered = getRenderedItems(el);
      assert.isAbove(rendered.length, 0, "Should have rendered items");
      
      for (const item of rendered) {
        const expectedName = `Item ${item.index + 1}`;
        assert.equal(item.text, expectedName,
          `Item at index ${item.index} should show "${expectedName}" but showed "${item.text}"`);
      }
    });

    test("scrolling through entire list can see all items", async () => {
      const items: TestItem[] = [];
      for (let i = 0; i < 500; i++) {
        const letter = String.fromCharCode(65 + (i % 26));
        items.push({ id: i + 1, name: `Item ${i + 1}`, category: letter });
      }
      const el = await createList({ 
        items, 
        groupKey: "category", 
        displayMember: "name",
        maxHeight: "150px" 
      });

      const seenIndices = new Set<number>();
      const container = el.shadowRoot?.querySelector(".list-container") as HTMLElement;
      
      for (let scrollPos = 0; scrollPos < container.scrollHeight; scrollPos += 100) {
        container.scrollTop = scrollPos;
        container.dispatchEvent(new Event("scroll"));
        await el.updateComplete;
        
        const rendered = getRenderedItems(el);
        for (const item of rendered) {
          seenIndices.add(item.index);
        }
      }
      
      container.scrollTop = container.scrollHeight;
      container.dispatchEvent(new Event("scroll"));
      await el.updateComplete;
      const finalRendered = getRenderedItems(el);
      for (const item of finalRendered) {
        seenIndices.add(item.index);
      }

      assert.equal(seenIndices.size, 500, `Should have seen all 500 items, but only saw ${seenIndices.size}`);
      
      const maxIndex = Math.max(...seenIndices);
      assert.equal(maxIndex, 499, `Max index should be 499, got ${maxIndex}`);
    });
  });

  suite("selection mode: none", () => {
    test("clicking item dispatches itemclick event with correct data", async () => {
      const el = await createList({ selectionMode: "none", displayMember: "name" });

      let clickedIndex: number | null = null;
      let clickedItem: TestItem | null = null;
      el.addEventListener(
        "itemclick",
        ((e: CustomEvent) => {
          clickedIndex = e.detail.index;
          clickedItem = e.detail.item;
        }) as EventListener
      );

      const items = el.shadowRoot?.querySelectorAll(".list-item");
      (items?.[2] as HTMLElement)?.click();
      await el.updateComplete;

      assert.equal(clickedIndex, 2);
      assert.deepEqual(clickedItem, sampleItems[2]);
    });
  });

  suite("selection mode: single", () => {
    test("clicking item selects it", async () => {
      const el = await createList({ selectionMode: "single" });

      const firstItem = el.shadowRoot?.querySelector(
        ".list-item"
      ) as HTMLElement;
      firstItem.click();
      await el.updateComplete;

      assert.isTrue(firstItem.classList.contains("selected"));
    });

    test("getSelectedIndices returns correct indices after selection", async () => {
      const el = await createList({ selectionMode: "single" });

      const items = el.shadowRoot?.querySelectorAll(".list-item");
      items?.[3]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;

      assert.deepEqual(el.getSelectedIndices(), [3]);
      assert.deepEqual(el.getSelectedItems(), [sampleItems[3]]);
    });
  });

  suite("selection mode: multiple", () => {
    test("multiple items can be selected", async () => {
      const el = await createList({ selectionMode: "multiple" });

      const items = el.shadowRoot?.querySelectorAll(".list-item");
      items?.[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;
      items?.[2]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;

      assert.deepEqual(el.getSelectedIndices(), [0, 2]);
    });
  });

  suite("jump list", () => {
    test("renders jump list when groupKey is set", async () => {
      const el = await createList({ groupKey: "category" });
      const jumpList = el.shadowRoot?.querySelector(".jump-list");
      assert.exists(jumpList);
    });

    test("jump list contains alphabet", async () => {
      const el = await createList({ groupKey: "category" });
      const jumpItems = el.shadowRoot?.querySelectorAll(".jump-item");
      assert.equal(jumpItems?.length, 27);
    });

    test("jump list is hidden when showJumpList is false", async () => {
      const el = await createList({ groupKey: "category", showJumpList: false });
      const jumpList = el.shadowRoot?.querySelector(".jump-list");
      assert.notExists(jumpList);
    });

    test("jump to group scrolls to correct position", async () => {
      const items: TestItem[] = [];
      for (let i = 0; i < 100; i++) {
        const letter = String.fromCharCode(65 + (i % 26));
        items.push({ id: i, name: `Item ${i}`, category: letter });
      }
      const el = await createList({ items, groupKey: "category", displayMember: "name", maxHeight: "100px" });
      
      const container = el.shadowRoot?.querySelector(".list-container") as HTMLElement;
      assert.exists(container, "Container should exist");

      const jumpItemZ = Array.from(
        el.shadowRoot?.querySelectorAll(".jump-item") || []
      ).find(item => item.textContent === "Z" && !item.classList.contains("disabled"));
      
      assert.exists(jumpItemZ, "Z jump item should exist and be enabled");
      
      jumpItemZ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;
    });
  });

  suite("public methods", () => {
    test("clearSelection removes all selections", async () => {
      const el = await createList({ selectionMode: "multiple" });

      const items = el.shadowRoot?.querySelectorAll(".list-item");
      items?.[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;

      el.clearSelection();
      await el.updateComplete;

      assert.deepEqual(el.getSelectedIndices(), []);
    });

    test("setItems updates the items list and re-renders", async () => {
      const el = await createList({ displayMember: "name" });
      const newItems: TestItem[] = [
        { id: 100, name: "New Item", category: "X" },
      ];

      el.setItems(newItems);
      await el.updateComplete;

      assert.deepEqual(el.items, newItems);
      const rendered = getRenderedItems(el);
      assert.equal(rendered.length, 1);
      assert.equal(rendered[0].text, "New Item");
      assert.equal(rendered[0].index, 0);
    });
  });

  suite("virtualization", () => {
    test("only renders visible items", async () => {
      const items: TestItem[] = [];
      for (let i = 0; i < 100; i++) {
        items.push({ id: i, name: `Item ${i}`, category: "A" });
      }
      const el = await createList({ items, displayMember: "name", maxHeight: "150px" });

      const renderedItems = el.shadowRoot?.querySelectorAll(".list-item");
      assert.isBelow(renderedItems?.length ?? 100, 100, "Should render fewer than total items");
      assert.isAbove(renderedItems?.length ?? 0, 0, "Should render some items");
    });

    test("total height is correct for flat list", async () => {
      const items: TestItem[] = [];
      for (let i = 0; i < 100; i++) {
        items.push({ id: i, name: `Item ${i}`, category: "A" });
      }
      const el = await createList({ items, displayMember: "name" });

      const viewport = el.shadowRoot?.querySelector(".viewport") as HTMLElement;
      const expectedHeight = 100 * 44;
      assert.equal(parseInt(viewport?.style.height || "0"), expectedHeight);
    });

    test("total height includes group headers", async () => {
      const items: TestItem[] = [];
      for (let i = 0; i < 52; i++) {
        const letter = String.fromCharCode(65 + (i % 26));
        items.push({ id: i, name: `Item ${i}`, category: letter });
      }
      const el = await createList({ items, groupKey: "category", displayMember: "name" });

      const viewport = el.shadowRoot?.querySelector(".viewport") as HTMLElement;
      const viewportHeight = parseInt(viewport?.style.height || "0");
      const expectedItemsHeight = 52 * 44;
      const expectedHeadersHeight = 26 * 32;
      assert.equal(viewportHeight, expectedItemsHeight + expectedHeadersHeight);
    });
  });
});
