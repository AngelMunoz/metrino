import { assert } from "chai";
import "./time-picker.ts";
import { MetroTimePicker } from "./time-picker.ts";

suite("metro-time-picker", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createPicker(attrs: Record<string, string> = {}): Promise<MetroTimePicker> {
    const el = document.createElement("metro-time-picker") as MetroTimePicker;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders time input", async () => {
    const el = await createPicker();
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.equal(input.type, "time");
  });

  test("value attribute sets initial value", async () => {
    const el = await createPicker({ value: "14:30" });
    assert.equal(el.value, "14:30");
  });

  test("label is displayed when provided", async () => {
    const el = await createPicker({ label: "Start Time" });
    const label = el.shadowRoot?.querySelector("label");
    assert.equal(label?.textContent, "Start Time");
  });

  test("disabled attribute disables input", async () => {
    const el = await createPicker({ disabled: "" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.isTrue(input.disabled);
  });

  test("integrates with form", async () => {
    const form = document.createElement("form");
    container.appendChild(form);
    
    const el = document.createElement("metro-time-picker") as MetroTimePicker;
    el.setAttribute("name", "starttime");
    el.value = "09:00";
    form.appendChild(el);
    await el.updateComplete;
    
    const formData = new FormData(form);
    assert.equal(formData.get("starttime"), "09:00");
    
    form.remove();
  });
});
