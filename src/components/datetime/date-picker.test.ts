import { assert } from "chai";
import "./date-picker.ts";
import { MetroDatePicker } from "./date-picker.ts";

suite("metro-date-picker", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createPicker(attrs: Record<string, string> = {}): Promise<MetroDatePicker> {
    const el = document.createElement("metro-date-picker") as MetroDatePicker;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders date input", async () => {
    const el = await createPicker();
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.equal(input.type, "date");
  });

  test("value attribute sets initial value", async () => {
    const el = await createPicker({ value: "2024-01-15" });
    assert.equal(el.value, "2024-01-15");
  });

  test("label is displayed when provided", async () => {
    const el = await createPicker({ label: "Birth Date" });
    const label = el.shadowRoot?.querySelector("label");
    assert.equal(label?.textContent, "Birth Date");
  });

  test("disabled attribute disables input", async () => {
    const el = await createPicker({ disabled: "" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.isTrue(input.disabled);
  });

  test("integrates with form", async () => {
    const form = document.createElement("form");
    container.appendChild(form);
    
    const el = document.createElement("metro-date-picker") as MetroDatePicker;
    el.setAttribute("name", "birthdate");
    el.value = "2024-06-15";
    form.appendChild(el);
    await el.updateComplete;
    
    const formData = new FormData(form);
    assert.equal(formData.get("birthdate"), "2024-06-15");
    
    form.remove();
  });

  test("required attribute works", async () => {
    const el = await createPicker({ required: "" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.isTrue(input.required);
  });
});
