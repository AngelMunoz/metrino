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
    await new Promise((r) => setTimeout(r, 50));

    return el;
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

    test("displays items as string when no displayMember", async () => {
      const stringItems = ["One", "Two", "Three"];
      const el = await createList({ items: stringItems as unknown as TestItem[] });
      const items = el.shadowRoot?.querySelectorAll(".list-item span");
      assert.equal(items?.[0]?.textContent?.trim(), "One");
      assert.equal(items?.[1]?.textContent?.trim(), "Two");
      assert.equal(items?.[2]?.textContent?.trim(), "Three");
    });

    test("applies custom max-height", async () => {
      const el = await createList({ maxHeight: "200px" });
      const listContainer = el.shadowRoot?.querySelector(
        ".list-container"
      ) as HTMLElement;
      assert.equal(listContainer?.style.maxHeight, "200px");
    });

    test("shows empty message when no items", async () => {
      const el = await createList({ items: [] });
      const emptyMsg = el.shadowRoot?.querySelector(".empty-message");
      assert.exists(emptyMsg);
      assert.equal(emptyMsg?.textContent, "No items");
    });

    test("sets default properties correctly", async () => {
      const el = await createList();
      assert.deepEqual(el.items, sampleItems);
      assert.equal(el.groupKey, "");
      assert.equal(el.displayMember, "");
      assert.equal(el.valueMember, "");
      assert.equal(el.selectionMode, "none");
      assert.equal(el.maxHeight, "300px");
      assert.isTrue(el.showJumpList);
    });
  });

  suite("grouped rendering", () => {
    test("renders group headers when groupKey is set", async () => {
      const el = await createList({ groupKey: "category" });
      const headers = el.shadowRoot?.querySelectorAll(".group-header");
      assert.equal(headers?.length, 4);
    });

    test("groups are sorted alphabetically by key", async () => {
      const el = await createList({ groupKey: "category" });
      const headers = el.shadowRoot?.querySelectorAll(".group-header");
      const keys = Array.from(headers ?? []).map((h) => h.textContent?.trim());
      assert.deepEqual(keys, ["A", "B", "C", "D"]);
    });

    test("items are rendered under correct group headers", async () => {
      const el = await createList({ groupKey: "category", displayMember: "name" });
      const groupA = el.shadowRoot?.querySelector(
        '[data-group-key="A"]'
      )?.nextElementSibling;
      assert.equal(groupA?.querySelector("span")?.textContent?.trim(), "Apple");
    });

    test("group headers are sticky positioned", async () => {
      const el = await createList({ groupKey: "category" });
      const header = el.shadowRoot?.querySelector(
        ".group-header"
      ) as HTMLElement;
      assert.equal(getComputedStyle(header).position, "sticky");
    });

    test("renders items without grouping when groupKey is empty", async () => {
      const el = await createList({ groupKey: "" });
      const headers = el.shadowRoot?.querySelectorAll(".group-header");
      assert.equal(headers?.length, 0);
    });

    test("handles null/undefined group values", async () => {
      const itemsWithNull: TestItem[] = [
        { id: 1, name: "Test1", category: null as unknown as string },
        { id: 2, name: "Test2", category: undefined as unknown as string },
        { id: 3, name: "Test3", category: "A" },
      ];
      const el = await createList({ items: itemsWithNull, groupKey: "category" });
      const headers = el.shadowRoot?.querySelectorAll(".group-header");
      assert.isAtLeast(headers?.length ?? 0, 2);
    });
  });

  suite("selection mode: none", () => {
    test("clicking item dispatches itemclick event", async () => {
      const el = await createList({ selectionMode: "none" });

      let clickedItem: TestItem | null = null;
      let clickedIndex: number | null = null;
      el.addEventListener(
        "itemclick",
        ((e: CustomEvent) => {
          clickedItem = e.detail.item;
          clickedIndex = e.detail.index;
        }) as EventListener
      );

      const firstItem = el.shadowRoot?.querySelector(
        ".list-item"
      ) as HTMLElement;
      firstItem.click();
      await el.updateComplete;

      assert.deepEqual(clickedItem, sampleItems[0]);
      assert.equal(clickedIndex, 0);
    });

    test("clicking does not select item in none mode", async () => {
      const el = await createList({ selectionMode: "none" });

      const firstItem = el.shadowRoot?.querySelector(
        ".list-item"
      ) as HTMLElement;
      firstItem.click();
      await el.updateComplete;

      assert.isFalse(firstItem.classList.contains("selected"));
      assert.deepEqual(el.getSelectedIndices(), []);
    });

    test("does not dispatch selectionchange in none mode", async () => {
      const el = await createList({ selectionMode: "none" });

      let selectionChanged = false;
      el.addEventListener("selectionchange", () => {
        selectionChanged = true;
      });

      const firstItem = el.shadowRoot?.querySelector(
        ".list-item"
      ) as HTMLElement;
      firstItem.click();
      await el.updateComplete;

      assert.isFalse(selectionChanged);
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

    test("only one item can be selected at a time", async () => {
      const el = await createList({ selectionMode: "single" });

      const items = el.shadowRoot?.querySelectorAll(".list-item");
      items?.[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;
      items?.[2]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;

      assert.isFalse(items?.[0]?.classList.contains("selected"));
      assert.isTrue(items?.[2]?.classList.contains("selected"));
    });

    test("selectedValue is updated when item is selected", async () => {
      const el = await createList({
        selectionMode: "single",
        valueMember: "id",
      });

      const firstItem = el.shadowRoot?.querySelector(
        ".list-item"
      ) as HTMLElement;
      firstItem.click();
      await el.updateComplete;

      assert.equal(el.selectedValue, 1);
    });

    test("dispatches selectionchange event with correct details", async () => {
      const el = await createList({ selectionMode: "single" });

      let detail: {
        selectedItems: TestItem[];
        selectedIndices: number[];
        selectedValue: unknown;
      } | null = null;
      el.addEventListener(
        "selectionchange",
        ((e: CustomEvent) => {
          detail = e.detail;
        }) as EventListener
      );

      const firstItem = el.shadowRoot?.querySelector(
        ".list-item"
      ) as HTMLElement;
      firstItem.click();
      await el.updateComplete;

      assert.deepEqual(detail!.selectedItems, [sampleItems[0]]);
      assert.deepEqual(detail!.selectedIndices, [0]);
    });

    test("syncs selection from selectedValue property", async () => {
      const el = await createList({
        selectionMode: "single",
        valueMember: "id",
        selectedValue: 3,
      });
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 50));

      const selectedItems = el.shadowRoot?.querySelectorAll(".list-item.selected");
      assert.equal(selectedItems?.length, 1, "Should have exactly 1 selected item");
      assert.deepEqual(el.getSelectedItems(), [sampleItems[2]]);
    });
  });

  suite("selection mode: multiple", () => {
    test("clicking item toggles selection", async () => {
      const el = await createList({ selectionMode: "multiple" });

      const items = el.shadowRoot?.querySelectorAll(".list-item");
      items?.[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;
      items?.[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;

      assert.isTrue(items?.[0]?.classList.contains("selected"));
      assert.isTrue(items?.[1]?.classList.contains("selected"));
    });

    test("clicking selected item deselects it", async () => {
      const el = await createList({ selectionMode: "multiple" });

      const items = el.shadowRoot?.querySelectorAll(".list-item");
      items?.[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;
      items?.[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;

      assert.isFalse(items?.[0]?.classList.contains("selected"));
    });

    test("multiple items can be selected simultaneously", async () => {
      const el = await createList({ selectionMode: "multiple" });

      const items = el.shadowRoot?.querySelectorAll(".list-item");
      [0, 2, 4].forEach((i) => {
        items?.[i]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      await el.updateComplete;

      assert.deepEqual(el.getSelectedIndices(), [0, 2, 4]);
    });

    test("getSelectedItems returns all selected items", async () => {
      const el = await createList({ selectionMode: "multiple" });

      const items = el.shadowRoot?.querySelectorAll(".list-item");
      items?.[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;
      items?.[2]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;

      const selected = el.getSelectedItems();
      assert.deepEqual(selected, [sampleItems[0], sampleItems[2]]);
    });
  });

  suite("keyboard navigation", () => {
    test("Enter key selects item in single mode", async () => {
      const el = await createList({ selectionMode: "single" });

      const firstItem = el.shadowRoot?.querySelector(
        ".list-item"
      ) as HTMLElement;
      firstItem.focus();
      firstItem.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
      );
      await el.updateComplete;

      assert.isTrue(firstItem.classList.contains("selected"));
    });

    test("Space key selects item in single mode", async () => {
      const el = await createList({ selectionMode: "single" });

      const firstItem = el.shadowRoot?.querySelector(
        ".list-item"
      ) as HTMLElement;
      firstItem.dispatchEvent(
        new KeyboardEvent("keydown", { key: " ", bubbles: true })
      );
      await el.updateComplete;

      assert.isTrue(firstItem.classList.contains("selected"));
    });

    test("Space key toggles selection in multiple mode", async () => {
      const el = await createList({ selectionMode: "multiple" });

      const firstItem = el.shadowRoot?.querySelector(
        ".list-item"
      ) as HTMLElement;
      firstItem.dispatchEvent(
        new KeyboardEvent("keydown", { key: " ", bubbles: true })
      );
      await el.updateComplete;
      assert.isTrue(firstItem.classList.contains("selected"));

      firstItem.dispatchEvent(
        new KeyboardEvent("keydown", { key: " ", bubbles: true })
      );
      await el.updateComplete;
      assert.isFalse(firstItem.classList.contains("selected"));
    });

    test("ArrowDown moves focus to next item", async () => {
      const el = await createList();
      const items = el.shadowRoot?.querySelectorAll(".list-item");

      items?.[0]?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
      );
      await el.updateComplete;

      const focused = el.shadowRoot?.activeElement;
      assert.equal(focused, items?.[1]);
    });

    test("ArrowUp moves focus to previous item", async () => {
      const el = await createList();
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      (items?.[2] as HTMLElement)?.focus();

      items?.[2]?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true })
      );
      await el.updateComplete;

      const focused = el.shadowRoot?.activeElement;
      assert.equal(focused, items?.[1]);
    });

    test("ArrowDown does not go past last item", async () => {
      const el = await createList();
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      const lastIndex = (items?.length ?? 1) - 1;
      (items?.[lastIndex] as HTMLElement)?.focus();

      items?.[lastIndex]?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })
      );
      await el.updateComplete;

      const focused = el.shadowRoot?.activeElement;
      assert.equal(focused, items?.[lastIndex]);
    });

    test("ArrowUp does not go before first item", async () => {
      const el = await createList();
      const items = el.shadowRoot?.querySelectorAll(".list-item");

      items?.[0]?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true })
      );
      await el.updateComplete;

      const focused = el.shadowRoot?.activeElement;
      assert.equal(focused, items?.[0]);
    });

    test("items have tabindex for keyboard focus", async () => {
      const el = await createList();
      const firstItem = el.shadowRoot?.querySelector(
        ".list-item"
      ) as HTMLElement;
      assert.equal(firstItem.getAttribute("tabindex"), "0");
    });

    test("items have correct ARIA attributes", async () => {
      const el = await createList({ selectionMode: "single" });
      const firstItem = el.shadowRoot?.querySelector(".list-item");

      assert.equal(firstItem?.getAttribute("role"), "option");
      assert.equal(firstItem?.getAttribute("aria-selected"), "false");

      firstItem?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;

      assert.equal(firstItem?.getAttribute("aria-selected"), "true");
    });
  });

  suite("jump list", () => {
    test("renders jump list when groupKey is set", async () => {
      const el = await createList({ groupKey: "category" });
      const jumpList = el.shadowRoot?.querySelector(".jump-list");
      assert.exists(jumpList);
    });

    test("jump list contains all letters of alphabet plus #", async () => {
      const el = await createList({ groupKey: "category" });
      const jumpItems = el.shadowRoot?.querySelectorAll(".jump-item");
      assert.equal(jumpItems?.length, 27);
    });

    test("available group letters are enabled", async () => {
      const el = await createList({ groupKey: "category" });
      const jumpItems = el.shadowRoot?.querySelectorAll(".jump-item");

      const enabledLetters = ["A", "B", "C", "D"];
      enabledLetters.forEach((letter) => {
        const item = Array.from(jumpItems ?? []).find(
          (i) => i.textContent === letter
        );
        assert.isFalse(item?.classList.contains("disabled"));
      });
    });

    test("unavailable group letters are disabled", async () => {
      const el = await createList({ groupKey: "category" });
      const jumpItems = el.shadowRoot?.querySelectorAll(".jump-item");

      const disabledLetters = ["E", "F", "Z", "#"];
      disabledLetters.forEach((letter) => {
        const item = Array.from(jumpItems ?? []).find(
          (i) => i.textContent === letter
        );
        assert.isTrue(item?.classList.contains("disabled"));
      });
    });

    test("jump list is hidden when showJumpList is false", async () => {
      const el = await createList({ groupKey: "category", showJumpList: false });
      const jumpList = el.shadowRoot?.querySelector(".jump-list");
      assert.notExists(jumpList);
    });

    test("jump list is hidden when no groupKey", async () => {
      const el = await createList({ groupKey: "" });
      const jumpList = el.shadowRoot?.querySelector(".jump-list");
      assert.notExists(jumpList);
    });

    test("clicking enabled jump item scrolls to group", async () => {
      const el = await createList({ groupKey: "category", maxHeight: "100px" });
      const jumpItems = el.shadowRoot?.querySelectorAll(".jump-item");

      const itemC = Array.from(jumpItems ?? []).find(
        (i) => i.textContent === "C"
      );
      itemC?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await new Promise((r) => setTimeout(r, 100));

      const groupHeader = el.shadowRoot?.querySelector('[data-group-key="C"]');
      assert.exists(groupHeader);
    });

    test("clicking disabled jump item does nothing", async () => {
      const el = await createList({ groupKey: "category" });
      const jumpItems = el.shadowRoot?.querySelectorAll(".jump-item");

      const itemZ = Array.from(jumpItems ?? []).find(
        (i) => i.textContent === "Z"
      );
      assert.isTrue(itemZ?.classList.contains("disabled"));

      itemZ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;

      assert.isTrue(itemZ?.classList.contains("disabled"));
    });

    test("jump list is positioned on right side", async () => {
      const el = await createList({ groupKey: "category" });
      const jumpList = el.shadowRoot?.querySelector(
        ".jump-list"
      ) as HTMLElement;
      const style = getComputedStyle(jumpList);
      assert.equal(style.position, "absolute");
      assert.equal(style.right, "0px");
    });
  });

  suite("public methods", () => {
    test("getSelectedItems returns empty array when nothing selected", async () => {
      const el = await createList({ selectionMode: "single" });
      assert.deepEqual(el.getSelectedItems(), []);
    });

    test("getSelectedIndices returns empty array when nothing selected", async () => {
      const el = await createList({ selectionMode: "single" });
      assert.deepEqual(el.getSelectedIndices(), []);
    });

    test("clearSelection removes all selections", async () => {
      const el = await createList({ selectionMode: "multiple" });

      const items = el.shadowRoot?.querySelectorAll(".list-item");
      items?.[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      items?.[1]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;

      el.clearSelection();
      await el.updateComplete;

      assert.deepEqual(el.getSelectedIndices(), []);
      assert.equal(el.selectedValue, null);
    });

    test("setItems updates the items list", async () => {
      const el = await createList();
      const newItems: TestItem[] = [
        { id: 100, name: "New Item", category: "X" },
      ];

      el.setItems(newItems);
      await el.updateComplete;

      assert.deepEqual(el.items, newItems);
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      assert.equal(items?.length, 1);
    });

    test("changing items clears selection", async () => {
      const el = await createList({ selectionMode: "single" });

      const firstItem = el.shadowRoot?.querySelector(
        ".list-item"
      ) as HTMLElement;
      firstItem.click();
      await el.updateComplete;
      assert.deepEqual(el.getSelectedIndices(), [0]);

      el.items = [{ id: 100, name: "New", category: "X" }];
      await el.updateComplete;

      assert.deepEqual(el.getSelectedIndices(), []);
    });
  });

  suite("CSS classes and styling", () => {
    test("list-item has correct base classes", async () => {
      const el = await createList();
      const firstItem = el.shadowRoot?.querySelector(".list-item");

      assert.isTrue(firstItem?.classList.contains("list-item"));
    });

    test("selected class is applied correctly", async () => {
      const el = await createList({ selectionMode: "single" });

      const items = el.shadowRoot?.querySelectorAll(".list-item");
      items?.[0]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await el.updateComplete;

      assert.isTrue(items?.[0]?.classList.contains("selected"));
      assert.isFalse(items?.[1]?.classList.contains("selected"));
    });

    test("list-item has transition for smooth hover effects", async () => {
      const el = await createList();
      const firstItem = el.shadowRoot?.querySelector(
        ".list-item"
      ) as HTMLElement;
      const transition = getComputedStyle(firstItem).transition;
      assert.include(transition, "background-color");
    });

    test("group-header has uppercase text transform", async () => {
      const el = await createList({ groupKey: "category" });
      const header = el.shadowRoot?.querySelector(
        ".group-header"
      ) as HTMLElement;
      assert.equal(getComputedStyle(header).textTransform, "uppercase");
    });

    test("list-container has overflow-y auto", async () => {
      const el = await createList();
      const container = el.shadowRoot?.querySelector(
        ".list-container"
      ) as HTMLElement;
      assert.equal(getComputedStyle(container).overflowY, "auto");
    });

    test("empty-message has correct styling", async () => {
      const el = await createList({ items: [] });
      const emptyMsg = el.shadowRoot?.querySelector(
        ".empty-message"
      ) as HTMLElement;
      const style = getComputedStyle(emptyMsg);
      assert.equal(style.textAlign, "center");
    });
  });

  suite("edge cases", () => {
    test("handles empty items array", async () => {
      const el = await createList({ items: [] });
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      assert.equal(items?.length, 0);
      assert.exists(el.shadowRoot?.querySelector(".empty-message"));
    });

    test("handles single item", async () => {
      const singleItem: TestItem[] = [{ id: 1, name: "Only", category: "O" }];
      const el = await createList({ items: singleItem });
      const items = el.shadowRoot?.querySelectorAll(".list-item");
      assert.equal(items?.length, 1);
    });

    test("handles very long display text", async () => {
      const longItems: TestItem[] = [
        {
          id: 1,
          name: "This is a very long name that should still display correctly",
          category: "T",
        },
      ];
      const el = await createList({ items: longItems, displayMember: "name" });
      const span = el.shadowRoot?.querySelector(".list-item span");
      assert.exists(span);
    });

    test("handles special characters in group key", async () => {
      const specialItems: TestItem[] = [
        { id: 1, name: "Test1", category: "A-B" },
        { id: 2, name: "Test2", category: "C_D" },
      ];
      const el = await createList({ items: specialItems, groupKey: "category" });
      const headers = el.shadowRoot?.querySelectorAll(".group-header");
      assert.equal(headers?.length, 2);
    });

    test("handles numeric group keys", async () => {
      const numericItems = [
        { id: 1, name: "Test1", category: 1 },
        { id: 2, name: "Test2", category: 2 },
      ];
      const el = await createList({
        items: numericItems as unknown as TestItem[],
        groupKey: "category",
      });
      const headers = el.shadowRoot?.querySelectorAll(".group-header");
      assert.equal(headers?.length, 2);
    });

    test("rapid consecutive clicks", async () => {
      const el = await createList({ selectionMode: "multiple" });
      const items = el.shadowRoot?.querySelectorAll(".list-item");

      for (let i = 0; i < 6; i++) {
        items?.[i]?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
      await el.updateComplete;

      assert.equal(el.getSelectedIndices().length, 6);
    });
  });
});
