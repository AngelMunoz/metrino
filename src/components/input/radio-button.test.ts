import { assert } from "chai";
import { registerMetroRadioButton, MetroRadioButton } from "./radio-button.ts";

suite("metro-radio-button", () => {
  let container: HTMLDivElement;
  registerMetroRadioButton();

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

  test("radios inside a shadow root are mutually exclusive", async () => {
    const host = document.createElement("div");
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <metro-radio-button name="shadow-group" value="a">A</metro-radio-button>
      <metro-radio-button name="shadow-group" value="b">B</metro-radio-button>
      <metro-radio-button name="shadow-group" value="c">C</metro-radio-button>
    `;
    container.appendChild(host);

    const radios = Array.from(
      shadow.querySelectorAll<MetroRadioButton>("metro-radio-button"),
    );
    assert.equal(radios.length, 3);
    for (const radio of radios) {
      await radio.updateComplete;
    }

    for (const radio of radios) {
      const target = radio.shadowRoot?.querySelector(".radio") as HTMLElement;
      target.click();
    }
    for (const radio of radios) {
      await radio.updateComplete;
    }

    assert.isFalse(radios[0].checked);
    assert.isFalse(radios[1].checked);
    assert.isTrue(radios[2].checked);

    host.remove();
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

  test("only the selected radio contributes to form data", async () => {
    const form = document.createElement("form");
    container.appendChild(form);

    const radio1 = document.createElement("metro-radio-button") as MetroRadioButton;
    radio1.setAttribute("name", "choice2");
    radio1.setAttribute("value", "option1");

    const radio2 = document.createElement("metro-radio-button") as MetroRadioButton;
    radio2.setAttribute("name", "choice2");
    radio2.setAttribute("value", "option2");

    form.appendChild(radio1);
    form.appendChild(radio2);
    await radio1.updateComplete;
    await radio2.updateComplete;

    const radio1El = radio1.shadowRoot?.querySelector(".radio") as HTMLElement;
    const radio2El = radio2.shadowRoot?.querySelector(".radio") as HTMLElement;

    radio1El.click();
    await radio1.updateComplete;
    assert.equal(new FormData(form).get("choice2"), "option1");

    radio2El.click();
    await radio2.updateComplete;
    const entries = new FormData(form).getAll("choice2");
    assert.equal(entries.length, 1);
    assert.equal(entries[0], "option2");

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

  test("formStateRestoreCallback re-checks matching value", async () => {
    const el = await createRadio({ name: "restore", value: "opt2" });
    el.formStateRestoreCallback("opt2", "restore");
    await el.updateComplete;
    assert.isTrue(el.checked);

    const other = await createRadio({ name: "restore", value: "opt3" });
    other.formStateRestoreCallback("opt2", "restore");
    await other.updateComplete;
    assert.isFalse(other.checked);
  });

  test("radio is focusable via tabindex", async () => {
    const el = await createRadio();
    const radio = el.shadowRoot?.querySelector(".radio");
    assert.equal(radio?.getAttribute("tabindex"), "0");
  });

  test("radio has tabindex -1 when disabled", async () => {
    const el = await createRadio({ disabled: "" });
    const radio = el.shadowRoot?.querySelector(".radio");
    assert.equal(radio?.getAttribute("tabindex"), "-1");
  });

  test("Enter key selects radio", async () => {
    const el = await createRadio({ name: "test", value: "opt" });
    const radio = el.shadowRoot?.querySelector(".radio") as HTMLElement;
    radio.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await el.updateComplete;
    assert.isTrue(el.checked);
  });

  test("Space key selects radio", async () => {
    const el = await createRadio({ name: "test", value: "opt" });
    const radio = el.shadowRoot?.querySelector(".radio") as HTMLElement;
    radio.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await el.updateComplete;
    assert.isTrue(el.checked);
  });

  test("disabled radio ignores Enter key", async () => {
    const el = await createRadio({ disabled: "", name: "test" });
    const radio = el.shadowRoot?.querySelector(".radio") as HTMLElement;
    radio.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await el.updateComplete;
    assert.isFalse(el.checked);
  });

  test("disabled radio ignores Space key", async () => {
    const el = await createRadio({ disabled: "", name: "test" });
    const radio = el.shadowRoot?.querySelector(".radio") as HTMLElement;
    radio.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    await el.updateComplete;
    assert.isFalse(el.checked);
  });
});
