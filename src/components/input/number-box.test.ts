import { assert } from "chai";
import "../input/number-box.ts";
import { MetroNumberBox } from "../input/number-box.ts";

suite("metro-number-box", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createNumberBox(attrs: Record<string, string> = {}): Promise<MetroNumberBox> {
    const el = document.createElement("metro-number-box") as MetroNumberBox;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders number input", async () => {
    const el = await createNumberBox();
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.equal(input.type, "number");
  });

  test("default value is 0", async () => {
    const el = await createNumberBox();
    assert.equal(el.value, 0);
  });

  test("value attribute works", async () => {
    const el = await createNumberBox({ value: "42" });
    assert.equal(el.value, 42);
  });

  test("min attribute works", async () => {
    const el = await createNumberBox({ min: "10" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.equal(input.min, "10");
  });

  test("max attribute works", async () => {
    const el = await createNumberBox({ max: "100" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.equal(input.max, "100");
  });

  test("step attribute works", async () => {
    const el = await createNumberBox({ step: "5" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.equal(input.step, "5");
  });

  test("disabled attribute disables input", async () => {
    const el = await createNumberBox({ disabled: "" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.isTrue(input.disabled);
  });

  test("label is displayed", async () => {
    const el = await createNumberBox({ label: "Quantity" });
    const label = el.shadowRoot?.querySelector("label");
    assert.equal(label?.textContent, "Quantity");
  });

  test("integrates with form", async () => {
    const form = document.createElement("form");
    container.appendChild(form);
    
    const el = document.createElement("metro-number-box") as MetroNumberBox;
    el.setAttribute("name", "quantity");
    el.value = 25;
    form.appendChild(el);
    await el.updateComplete;
    
    const formData = new FormData(form);
    assert.equal(formData.get("quantity"), "25");
    
    form.remove();
  });
});
