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

  async function createListBox(mode = "single"): Promise<MetroListBox> {
    const el = document.createElement("metro-list-box") as MetroListBox;
    el.selectionMode = mode as "single" | "multiple" | "extended";
    
    ["Apple", "Banana", "Cherry"].forEach(fruit => {
      const item = document.createElement("div");
      item.className = "list-item";
      item.textContent = fruit;
      el.appendChild(item);
    });
    
    container.appendChild(el);
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 100));
    
    return el;
  }

  test("renders list container", async () => {
    const el = await createListBox();
    const list = el.shadowRoot?.querySelector(".list-container");
    assert.exists(list);
  });

  test("renders all list items", async () => {
    const el = await createListBox();
    const items = el.querySelectorAll(".list-item");
    assert.equal(items.length, 3);
  });

  test("clicking item selects it in single mode", async () => {
    const el = await createListBox();
    const items = el.querySelectorAll(".list-item");
    
    (items[1] as HTMLElement).click();
    await el.updateComplete;
    
    assert.isTrue(items[1].hasAttribute("selected"));
  });

  test("single mode only allows one selection", async () => {
    const el = await createListBox();
    const items = el.querySelectorAll(".list-item");
    
    (items[0] as HTMLElement).click();
    await el.updateComplete;
    (items[2] as HTMLElement).click();
    await el.updateComplete;
    
    assert.isFalse(items[0].hasAttribute("selected"));
    assert.isTrue(items[2].hasAttribute("selected"));
  });

  test("dispatches selectionchanged event", async () => {
    const el = await createListBox();
    let selectedValues: string[] | undefined;
    
    el.addEventListener("selectionchanged", ((e: CustomEvent) => {
      selectedValues = e.detail.selectedValues;
    }) as EventListener);
    
    const items = el.querySelectorAll(".list-item");
    (items[1] as HTMLElement).click();
    await el.updateComplete;
    
    assert.deepEqual(selectedValues, ["Banana"]);
  });

  test("disabled prevents selection", async () => {
    const el = document.createElement("metro-list-box") as MetroListBox;
    el.disabled = true;
    
    const item = document.createElement("div");
    item.className = "list-item";
    item.textContent = "Test";
    el.appendChild(item);
    
    container.appendChild(el);
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 100));
    
    (item as HTMLElement).click();
    await el.updateComplete;
    
    assert.isFalse(item.hasAttribute("selected"));
  });

  test("selectedIndices returns correct indices", async () => {
    const el = await createListBox();
    const items = el.querySelectorAll(".list-item");
    
    (items[0] as HTMLElement).click();
    await el.updateComplete;
    
    assert.deepEqual(el.selectedIndices, [0]);
  });
});
