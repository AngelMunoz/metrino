import { assert } from "chai";
import "./list-box.ts";
import { MetroListBox } from "./list-box.ts";

suite("metro-list-box", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createListBoxFromHTML(html: string): Promise<MetroListBox> {
    container.innerHTML = html;
    const el = container.querySelector("metro-list-box") as MetroListBox;
    await el.updateComplete;
    return el;
  }

  suite("rendering", () => {
    test("renders list container with role=listbox", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box>
          <div class="list-item">Item 1</div>
        </metro-list-box>
      `);
      const listbox = el.shadowRoot?.querySelector('[role="listbox"]');
      assert.exists(listbox, "should have role=listbox");
    });

    test("renders all slotted list items", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box>
          <div class="list-item">Apple</div>
          <div class="list-item">Banana</div>
          <div class="list-item">Cherry</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      assert.equal(items.length, 3, "should have 3 items");
    });
  });

  suite("selection-mode attribute", () => {
    test("defaults to single mode when attribute not specified", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box>
          <div class="list-item">Item</div>
        </metro-list-box>
      `);
      assert.equal(el.selectionMode, "single");
    });

    test("respects selection-mode='single' attribute", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="single">
          <div class="list-item">A</div>
          <div class="list-item">B</div>
        </metro-list-box>
      `);
      assert.equal(el.getAttribute("selection-mode"), "single");
      assert.equal(el.selectionMode, "single");
    });

    test("respects selection-mode='multiple' attribute", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="multiple">
          <div class="list-item">A</div>
          <div class="list-item">B</div>
        </metro-list-box>
      `);
      assert.equal(el.getAttribute("selection-mode"), "multiple");
      assert.equal(el.selectionMode, "multiple");
    });

    test("respects selection-mode='extended' attribute", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="extended">
          <div class="list-item">A</div>
        </metro-list-box>
      `);
      assert.equal(el.getAttribute("selection-mode"), "extended");
      assert.equal(el.selectionMode, "extended");
    });
  });

  suite("single selection mode", () => {
    test("clicking item adds selected attribute to DOM", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="single">
          <div class="list-item">Apple</div>
          <div class="list-item">Banana</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      
      (items[1] as HTMLElement).click();
      await el.updateComplete;
      
      assert.isFalse(items[0].hasAttribute("selected"), "first should not be selected");
      assert.isTrue(items[1].hasAttribute("selected"), "second should be selected");
    });

    test("selecting another item removes previous selection from DOM", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="single">
          <div class="list-item">Apple</div>
          <div class="list-item">Banana</div>
          <div class="list-item">Cherry</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      
      (items[0] as HTMLElement).click();
      await el.updateComplete;
      assert.isTrue(items[0].hasAttribute("selected"));
      
      (items[2] as HTMLElement).click();
      await el.updateComplete;
      
      assert.isFalse(items[0].hasAttribute("selected"), "first should be deselected");
      assert.isFalse(items[1].hasAttribute("selected"), "second should not be selected");
      assert.isTrue(items[2].hasAttribute("selected"), "third should be selected");
    });

    test("selectedIndices returns correct array after selection", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="single">
          <div class="list-item">A</div>
          <div class="list-item">B</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      
      (items[1] as HTMLElement).click();
      await el.updateComplete;
      
      assert.deepEqual(el.selectedIndices, [1]);
    });
  });

  suite("multiple selection mode", () => {
    test("clicking multiple items adds selected attribute to each in DOM", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="multiple">
          <div class="list-item">Red</div>
          <div class="list-item">Green</div>
          <div class="list-item">Blue</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      
      (items[0] as HTMLElement).click();
      await el.updateComplete;
      (items[2] as HTMLElement).click();
      await el.updateComplete;
      
      assert.isTrue(items[0].hasAttribute("selected"), "Red should be selected");
      assert.isFalse(items[1].hasAttribute("selected"), "Green should not be selected");
      assert.isTrue(items[2].hasAttribute("selected"), "Blue should be selected");
      assert.deepEqual(el.selectedIndices, [0, 2]);
    });

    test("clicking selected item removes selected attribute from DOM (toggle)", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="multiple">
          <div class="list-item">Red</div>
          <div class="list-item">Green</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      
      (items[0] as HTMLElement).click();
      await el.updateComplete;
      assert.isTrue(items[0].hasAttribute("selected"), "should be selected after first click");
      
      (items[0] as HTMLElement).click();
      await el.updateComplete;
      
      assert.isFalse(items[0].hasAttribute("selected"), "should be deselected after second click");
      assert.deepEqual(el.selectedIndices, []);
    });

    test("selecting all items updates DOM correctly", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="multiple">
          <div class="list-item">A</div>
          <div class="list-item">B</div>
          <div class="list-item">C</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      
      (items[0] as HTMLElement).click();
      await el.updateComplete;
      (items[1] as HTMLElement).click();
      await el.updateComplete;
      (items[2] as HTMLElement).click();
      await el.updateComplete;
      
      assert.isTrue(items[0].hasAttribute("selected"));
      assert.isTrue(items[1].hasAttribute("selected"));
      assert.isTrue(items[2].hasAttribute("selected"));
      assert.deepEqual(el.selectedIndices, [0, 1, 2]);
    });
  });

  suite("extended selection mode", () => {
    test("plain click clears previous and selects new item", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="extended">
          <div class="list-item">A</div>
          <div class="list-item">B</div>
          <div class="list-item">C</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      
      (items[0] as HTMLElement).click();
      await el.updateComplete;
      (items[2] as HTMLElement).click();
      await el.updateComplete;
      
      assert.isFalse(items[0].hasAttribute("selected"), "A should be deselected");
      assert.isFalse(items[1].hasAttribute("selected"), "B should not be selected");
      assert.isTrue(items[2].hasAttribute("selected"), "C should be selected");
      assert.deepEqual(el.selectedIndices, [2]);
    });

    test("Ctrl+click toggles items without clearing selection", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="extended">
          <div class="list-item">A</div>
          <div class="list-item">B</div>
          <div class="list-item">C</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      
      (items[0] as HTMLElement).click();
      await el.updateComplete;
      
      items[2].dispatchEvent(new MouseEvent("click", { bubbles: true, ctrlKey: true }));
      await el.updateComplete;
      
      assert.isTrue(items[0].hasAttribute("selected"), "A should remain selected");
      assert.isTrue(items[2].hasAttribute("selected"), "C should be selected with Ctrl+click");
      assert.deepEqual(el.selectedIndices, [0, 2]);
    });

    test("Shift+click selects range in DOM", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="extended">
          <div class="list-item">A</div>
          <div class="list-item">B</div>
          <div class="list-item">C</div>
          <div class="list-item">D</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      
      (items[1] as HTMLElement).click();
      await el.updateComplete;
      
      items[3].dispatchEvent(new MouseEvent("click", { bubbles: true, shiftKey: true }));
      await el.updateComplete;
      
      assert.isFalse(items[0].hasAttribute("selected"), "A should not be selected");
      assert.isTrue(items[1].hasAttribute("selected"), "B should be selected");
      assert.isTrue(items[2].hasAttribute("selected"), "C should be selected");
      assert.isTrue(items[3].hasAttribute("selected"), "D should be selected");
      assert.deepEqual(el.selectedIndices, [1, 2, 3]);
    });
  });

  suite("selectionchanged event", () => {
    test("dispatches with selected values in detail", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="multiple">
          <div class="list-item">Apple</div>
          <div class="list-item">Banana</div>
        </metro-list-box>
      `);
      let eventDetail: { selectedIndices: number[]; selectedValues: string[] } | undefined;
      
      el.addEventListener("selectionchanged", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);
      
      const items = el.querySelectorAll(".list-item");
      (items[0] as HTMLElement).click();
      await el.updateComplete;
      (items[1] as HTMLElement).click();
      await el.updateComplete;
      
      assert.deepEqual(eventDetail?.selectedIndices, [0, 1]);
      assert.deepEqual(eventDetail?.selectedValues, ["Apple", "Banana"]);
    });
  });

  suite("disabled state", () => {
    test("disabled attribute prevents selection", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box disabled>
          <div class="list-item">Item</div>
        </metro-list-box>
      `);
      const item = el.querySelector(".list-item") as HTMLElement;
      
      item.click();
      await el.updateComplete;
      
      assert.isFalse(item.hasAttribute("selected"));
    });
  });

  suite("selectAll and clearSelection methods", () => {
    test("selectAll() adds selected attribute to all items in multiple mode", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="multiple">
          <div class="list-item">A</div>
          <div class="list-item">B</div>
          <div class="list-item">C</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      
      el.selectAll();
      await el.updateComplete;
      
      items.forEach(item => {
        assert.isTrue(item.hasAttribute("selected"));
      });
      assert.deepEqual(el.selectedIndices, [0, 1, 2]);
    });

    test("selectAll() does nothing in single mode", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="single">
          <div class="list-item">A</div>
          <div class="list-item">B</div>
        </metro-list-box>
      `);
      
      el.selectAll();
      await el.updateComplete;
      
      assert.deepEqual(el.selectedIndices, []);
    });

    test("clearSelection() removes selected attribute from all items in DOM", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="multiple">
          <div class="list-item">A</div>
          <div class="list-item">B</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      
      (items[0] as HTMLElement).click();
      await el.updateComplete;
      (items[1] as HTMLElement).click();
      await el.updateComplete;
      
      el.clearSelection();
      await el.updateComplete;
      
      items.forEach(item => {
        assert.isFalse(item.hasAttribute("selected"));
      });
      assert.deepEqual(el.selectedIndices, []);
    });
  });

  suite("form integration", () => {
    test("value property returns array of selected values", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="multiple" name="colors">
          <div class="list-item" data-value="red">Red</div>
          <div class="list-item" data-value="green">Green</div>
          <div class="list-item" data-value="blue">Blue</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      
      (items[0] as HTMLElement).click();
      await el.updateComplete;
      (items[2] as HTMLElement).click();
      await el.updateComplete;
      
      assert.deepEqual(el.value, ["red", "blue"]);
    });

    test("value uses textContent when data-value not present", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="single" name="fruit">
          <div class="list-item">Apple</div>
          <div class="list-item">Banana</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      
      (items[1] as HTMLElement).click();
      await el.updateComplete;
      
      assert.deepEqual(el.value, ["Banana"]);
    });

    test("value returns empty array when nothing selected", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="multiple" name="items">
          <div class="list-item">A</div>
          <div class="list-item">B</div>
        </metro-list-box>
      `);
      
      assert.deepEqual(el.value, []);
    });

    test("name attribute is reflected to property", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box name="test-list">
          <div class="list-item">Item</div>
        </metro-list-box>
      `);
      
      assert.equal(el.name, "test-list");
      assert.equal(el.getAttribute("name"), "test-list");
    });

    test("formResetCallback clears selection", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="multiple">
          <div class="list-item">A</div>
          <div class="list-item">B</div>
        </metro-list-box>
      `);
      const items = el.querySelectorAll(".list-item");
      
      (items[0] as HTMLElement).click();
      await el.updateComplete;
      
      el.formResetCallback();
      await el.updateComplete;
      
      assert.deepEqual(el.selectedIndices, []);
      assert.deepEqual(el.value, []);
      assert.isFalse(items[0].hasAttribute("selected"));
    });
  });

  suite("ARIA attributes", () => {
    test("aria-multiselectable is not present in single mode", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="single">
          <div class="list-item">Item</div>
        </metro-list-box>
      `);
      const listbox = el.shadowRoot?.querySelector('[role="listbox"]');
      
      assert.isFalse(listbox?.hasAttribute("aria-multiselectable"));
    });

    test("aria-multiselectable is present in multiple mode", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="multiple">
          <div class="list-item">Item</div>
        </metro-list-box>
      `);
      const listbox = el.shadowRoot?.querySelector('[role="listbox"]');
      
      assert.isTrue(listbox?.hasAttribute("aria-multiselectable"));
    });

    test("aria-multiselectable is present in extended mode", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box selection-mode="extended">
          <div class="list-item">Item</div>
        </metro-list-box>
      `);
      const listbox = el.shadowRoot?.querySelector('[role="listbox"]');
      
      assert.isTrue(listbox?.hasAttribute("aria-multiselectable"));
    });

    test("aria-disabled is present when disabled", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box disabled>
          <div class="list-item">Item</div>
        </metro-list-box>
      `);
      const listbox = el.shadowRoot?.querySelector('[role="listbox"]');
      
      assert.isTrue(listbox?.hasAttribute("aria-disabled"));
    });

    test("aria-disabled is not present when not disabled", async () => {
      const el = await createListBoxFromHTML(`
        <metro-list-box>
          <div class="list-item">Item</div>
        </metro-list-box>
      `);
      const listbox = el.shadowRoot?.querySelector('[role="listbox"]');
      
      assert.isFalse(listbox?.hasAttribute("aria-disabled"));
    });
  });
});
