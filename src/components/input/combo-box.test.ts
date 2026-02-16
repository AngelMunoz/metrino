import { assert } from "chai";
import "../input/combo-box.ts";
import { MetroComboBox } from "../input/combo-box.ts";

suite("metro-combo-box", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createCombo(attrs: Record<string, string> = {}): Promise<MetroComboBox> {
    const el = document.createElement("metro-combo-box") as MetroComboBox;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders input element", async () => {
    const el = await createCombo();
    const input = el.shadowRoot?.querySelector("input");
    assert.exists(input);
  });

  test("is closed by default", async () => {
    const el = await createCombo();
    assert.isFalse(el.open);
  });

  test("clicking opens dropdown", async () => {
    const el = await createCombo();
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    
    input.click();
    await el.updateComplete;
    
    assert.isTrue(el.open);
  });

  test("clicking outside closes dropdown", async () => {
    const el = await createCombo();
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    
    input.click();
    await el.updateComplete;
    assert.isTrue(el.open);
    
    document.body.click();
    await el.updateComplete;
    
    assert.isFalse(el.open);
  });

  test("setOptions populates dropdown", async () => {
    const el = await createCombo();
    el.setOptions(["Apple", "Banana", "Cherry"]);
    await el.updateComplete;
    
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    input.click();
    await el.updateComplete;
    
    const items = el.shadowRoot?.querySelectorAll(".dropdown-item");
    assert.equal(items?.length, 3);
  });

  test("selecting option updates value", async () => {
    const el = await createCombo();
    el.setOptions(["Apple", "Banana", "Cherry"]);
    await el.updateComplete;
    
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    input.click();
    await el.updateComplete;
    
    const items = el.shadowRoot?.querySelectorAll(".dropdown-item");
    items?.[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;
    
    assert.equal(el.value, "Banana");
  });

  test("selecting option dispatches selectionchanged event", async () => {
    const el = await createCombo();
    el.setOptions(["Apple", "Banana"]);
    await el.updateComplete;
    
    let eventDetail: { selectedValue: string; selectedIndex: number } | null = null;
    el.addEventListener("selectionchanged", ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);
    
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    input.click();
    await el.updateComplete;
    
    const items = el.shadowRoot?.querySelectorAll(".dropdown-item");
    items?.[0].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;
    
    assert.deepEqual(eventDetail, { selectedValue: "Apple", selectedIndex: 0 });
  });

  test("disabled prevents opening", async () => {
    const el = await createCombo({ disabled: "" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    
    input.click();
    await el.updateComplete;
    
    assert.isFalse(el.open);
  });

  test("Escape key closes dropdown", async () => {
    const el = await createCombo();
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    
    input.click();
    await el.updateComplete;
    assert.isTrue(el.open);
    
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await el.updateComplete;
    
    assert.isFalse(el.open);
  });

  test("integrates with form", async () => {
    const form = document.createElement("form");
    container.appendChild(form);
    
    const el = document.createElement("metro-combo-box") as MetroComboBox;
    el.setAttribute("name", "fruit");
    el.value = "Apple";
    form.appendChild(el);
    await el.updateComplete;
    
    const formData = new FormData(form);
    assert.equal(formData.get("fruit"), "Apple");
    
    form.remove();
  });
});
