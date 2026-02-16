import { assert } from "chai";
import "./slider.ts";
import { MetroSlider } from "./slider.ts";

suite("metro-slider", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createSlider(attrs: Record<string, string> = {}): Promise<MetroSlider> {
    const el = document.createElement("metro-slider") as MetroSlider;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders slider container", async () => {
    const el = await createSlider();
    const container = el.shadowRoot?.querySelector(".slider-container");
    assert.exists(container);
  });

  test("renders hidden range input", async () => {
    const el = await createSlider();
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.equal(input.type, "range");
  });

  test("default value is 0", async () => {
    const el = await createSlider();
    assert.equal(el.value, 0);
  });

  test("default min is 0 and max is 100", async () => {
    const el = await createSlider();
    assert.equal(el.min, 0);
    assert.equal(el.max, 100);
  });

  test("respects min and max attributes", async () => {
    const el = await createSlider({ min: "10", max: "50" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.equal(input.min, "10");
    assert.equal(input.max, "50");
  });

  test("respects step attribute", async () => {
    const el = await createSlider({ step: "5" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.equal(input.step, "5");
  });

  test("dispatches change event when value changes via input", async () => {
    const el = await createSlider({ value: "50" });
    let eventDetail: { value: number } | null = null;
    
    el.addEventListener("change", ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);
    
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    input.value = "75";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await el.updateComplete;
    
    assert.deepEqual(eventDetail, { value: 75 });
  });

  test("disabled slider has disabled input", async () => {
    const el = await createSlider({ disabled: "" });
    const input = el.shadowRoot?.querySelector("input") as HTMLInputElement;
    assert.isTrue(input.disabled);
  });

  test("integrates with form", async () => {
    const form = document.createElement("form");
    container.appendChild(form);
    
    const el = document.createElement("metro-slider") as MetroSlider;
    el.setAttribute("name", "volume");
    el.value = 75;
    form.appendChild(el);
    await el.updateComplete;
    
    const formData = new FormData(form);
    assert.equal(formData.get("volume"), "75");
    
    form.remove();
  });

  test("fill width reflects value percentage", async () => {
    const el = await createSlider({ value: "50" });
    await el.updateComplete;
    
    const fill = el.shadowRoot?.querySelector(".fill") as HTMLElement;
    assert.include(fill.style.width, "50");
  });

  test("thumb position reflects value percentage", async () => {
    const el = await createSlider({ value: "75" });
    await el.updateComplete;
    
    const thumb = el.shadowRoot?.querySelector(".thumb") as HTMLElement;
    assert.include(thumb.style.left, "75");
  });

  test("formResetCallback resets to min value", async () => {
    const el = await createSlider({ min: "10", value: "50" });
    assert.equal(el.value, 50);
    
    el.formResetCallback();
    await el.updateComplete;
    
    assert.equal(el.value, 10);
  });
});
