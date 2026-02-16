import { assert } from "chai";
import "./radio-button.ts";
import { MetroRadioButton } from "./radio-button.ts";

suite("metro-radio-button", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createRadio(attrs: Record<string, string> = {}): Promise<MetroRadioButton> {
    const el = document.createElement("metro-radio-button") as MetroRadioButton;
    el.textContent = "Option";
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders radio div", async () => {
    const el = await createRadio();
    const radio = el.shadowRoot?.querySelector(".radio");
    assert.exists(radio);
  });

  test("is unchecked by default", async () => {
    const el = await createRadio();
    assert.isFalse(el.checked);
  });

  test("clicking radio selects it", async () => {
    const el = await createRadio({ name: "test", value: "opt" });
    const radio = el.shadowRoot?.querySelector(".radio") as HTMLElement;
    
    radio.click();
    await el.updateComplete;
    assert.isTrue(el.checked);
  });

  test("radios with same name are mutually exclusive", async () => {
    const radio1 = await createRadio({ name: "group1", value: "a" });
    const radio2 = await createRadio({ name: "group1", value: "b" });
    
    const radio1El = radio1.shadowRoot?.querySelector(".radio") as HTMLElement;
    const radio2El = radio2.shadowRoot?.querySelector(".radio") as HTMLElement;
    
    radio1El.click();
    await radio1.updateComplete;
    
    assert.isTrue(radio1.checked);
    assert.isFalse(radio2.checked);
    
    radio2El.click();
    await radio2.updateComplete;
    
    assert.isFalse(radio1.checked);
    assert.isTrue(radio2.checked);
  });

  test("checked state applies checked class", async () => {
    const el = await createRadio({ name: "test", value: "opt" });
    const radio = el.shadowRoot?.querySelector(".radio") as HTMLElement;
    
    radio.click();
    await el.updateComplete;
    
    assert.isTrue(radio.classList.contains("checked"));
  });

  test("dispatches change event when selected", async () => {
    const el = await createRadio({ name: "test", value: "opt1" });
    let changed = false;
    
    el.addEventListener("change", () => { changed = true; });
    
    const radio = el.shadowRoot?.querySelector(".radio") as HTMLElement;
    radio.click();
    await el.updateComplete;
    
    assert.isTrue(changed);
  });

  test("disabled radio cannot be selected", async () => {
    const el = await createRadio({ disabled: "", name: "test" });
    const radio = el.shadowRoot?.querySelector(".radio") as HTMLElement;
    
    radio.click();
    await el.updateComplete;
    
    assert.isFalse(el.checked);
  });

  test("integrates with form", async () => {
    const form = document.createElement("form");
    container.appendChild(form);
    
    const radio1 = document.createElement("metro-radio-button") as MetroRadioButton;
    radio1.setAttribute("name", "choice");
    radio1.setAttribute("value", "option1");
    radio1.textContent = "Option 1";
    
    const radio2 = document.createElement("metro-radio-button") as MetroRadioButton;
    radio2.setAttribute("name", "choice");
    radio2.setAttribute("value", "option2");
    radio2.textContent = "Option 2";
    
    form.appendChild(radio1);
    form.appendChild(radio2);
    await radio1.updateComplete;
    await radio2.updateComplete;
    
    const radio2El = radio2.shadowRoot?.querySelector(".radio") as HTMLElement;
    radio2El.click();
    await radio2.updateComplete;
    
    const formData = new FormData(form);
    assert.equal(formData.get("choice"), "option2");
    
    form.remove();
  });

  test("checked attribute sets initial state", async () => {
    const el = await createRadio({ checked: "", name: "test" });
    assert.isTrue(el.checked);
  });

  test("has proper ARIA role", async () => {
    const el = await createRadio();
    const radio = el.shadowRoot?.querySelector(".radio");
    assert.equal(radio?.getAttribute("role"), "radio");
    assert.equal(radio?.getAttribute("aria-checked"), "false");
  });

  test("ARIA checked updates with state", async () => {
    const el = await createRadio({ name: "test", value: "opt" });
    const radio = el.shadowRoot?.querySelector(".radio") as HTMLElement;
    
    radio.click();
    await el.updateComplete;
    
    assert.equal(radio.getAttribute("aria-checked"), "true");
  });

  test("formResetCallback resets to unchecked", async () => {
    const el = await createRadio();
    const radio = el.shadowRoot?.querySelector(".radio") as HTMLElement;
    
    radio.click();
    await el.updateComplete;
    assert.isTrue(el.checked);
    
    el.formResetCallback();
    await el.updateComplete;
    
    assert.isFalse(el.checked);
  });
});
