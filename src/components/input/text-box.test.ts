import { assert } from "chai";
import "../input/text-box.ts";
import { MetroTextBox } from "../input/text-box.ts";

suite("metro-text-box", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createTextBox(attrs: Record<string, string> = {}): Promise<MetroTextBox> {
    const el = document.createElement("metro-text-box") as MetroTextBox;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders an input element", async () => {
    const el = await createTextBox();
    const input = el.shadowRoot?.querySelector("input");
    assert.exists(input);
  });

  test("displays placeholder text", async () => {
    const el = await createTextBox({ placeholder: "Enter name" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.equal(input.placeholder, "Enter name");
  });

  test("displays label when provided", async () => {
    const el = await createTextBox({ label: "Username" });
    const label = el.shadowRoot?.querySelector("label");
    assert.exists(label);
    assert.equal(label?.textContent, "Username");
  });

  test("updates value on input", async () => {
    const el = await createTextBox();
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    
    input.value = "hello";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;
    
    assert.equal(el.value, "hello");
  });

  test("dispatches input event with detail", async () => {
    const el = await createTextBox();
    let eventDetail: { value: string } | null = null;
    
    el.addEventListener("input", ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);
    
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    input.value = "test";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    
    assert.deepEqual(eventDetail, { value: "test" });
  });

  test("dispatches change event on blur", async () => {
    const el = await createTextBox();
    let changed = false;
    
    el.addEventListener("change", () => { changed = true; });
    
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    input.value = "changed";
    input.dispatchEvent(new Event("change", { bubbles: true }));
    
    assert.isTrue(changed);
  });

  test("disabled attribute prevents input", async () => {
    const el = await createTextBox({ disabled: "" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.isTrue(input.disabled);
  });

  test("integrates with form", async () => {
    const form = document.createElement("form");
    container.appendChild(form);
    
    const el = document.createElement("metro-text-box") as MetroTextBox;
    el.setAttribute("name", "username");
    el.value = "john";
    form.appendChild(el);
    await el.updateComplete;
    
    const formData = new FormData(form);
    assert.equal(formData.get("username"), "john");
    
    form.remove();
  });

  test("required attribute is set on input", async () => {
    const el = await createTextBox({ required: "" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.isTrue(input.required);
  });

  test("disabled input has reduced opacity", async () => {
    const el = await createTextBox({ disabled: "" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    const style = getComputedStyle(input);
    assert.equal(style.opacity, "0.4");
  });
});
