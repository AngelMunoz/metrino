import { assert } from "chai";
import "./check-box.ts";
import { MetroCheckBox } from "./check-box.ts";

suite("metro-check-box", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createCheckBox(attrs: Record<string, string> = {}): Promise<MetroCheckBox> {
    const el = document.createElement("metro-check-box") as MetroCheckBox;
    el.textContent = "Accept terms";
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders checkbox div", async () => {
    const el = await createCheckBox();
    const checkbox = el.shadowRoot?.querySelector(".checkbox");
    assert.exists(checkbox);
  });

  test("is unchecked by default", async () => {
    const el = await createCheckBox();
    assert.isFalse(el.checked);
  });

  test("clicking checkbox toggles checked state", async () => {
    const el = await createCheckBox();
    const checkbox = el.shadowRoot?.querySelector(".checkbox") as HTMLElement;
    
    checkbox.click();
    await el.updateComplete;
    assert.isTrue(el.checked);
    
    checkbox.click();
    await el.updateComplete;
    assert.isFalse(el.checked);
  });

  test("checked state applies checked class", async () => {
    const el = await createCheckBox();
    const checkbox = el.shadowRoot?.querySelector(".checkbox") as HTMLElement;
    
    checkbox.click();
    await el.updateComplete;
    
    assert.isTrue(checkbox.classList.contains("checked"));
  });

  test("dispatches change event with checked value", async () => {
    const el = await createCheckBox();
    let eventDetail: { checked: boolean } | null = null;
    
    el.addEventListener("change", ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);
    
    const checkbox = el.shadowRoot?.querySelector(".checkbox") as HTMLElement;
    checkbox.click();
    await el.updateComplete;
    
    assert.deepEqual(eventDetail, { checked: true });
  });

  test("disabled checkbox cannot be toggled", async () => {
    const el = await createCheckBox({ disabled: "" });
    const checkbox = el.shadowRoot?.querySelector(".checkbox") as HTMLElement;
    
    checkbox.click();
    await el.updateComplete;
    
    assert.isFalse(el.checked);
  });

  test("integrates with form when checked", async () => {
    const form = document.createElement("form");
    container.appendChild(form);
    
    const el = document.createElement("metro-check-box") as MetroCheckBox;
    el.setAttribute("name", "terms");
    el.setAttribute("value", "accepted");
    form.appendChild(el);
    await el.updateComplete;
    
    const checkbox = el.shadowRoot?.querySelector(".checkbox") as HTMLElement;
    checkbox.click();
    await el.updateComplete;
    
    const formData = new FormData(form);
    assert.equal(formData.get("terms"), "accepted");
    
    form.remove();
  });

  test("unchecked checkbox submits nothing to form", async () => {
    const form = document.createElement("form");
    container.appendChild(form);
    
    const el = document.createElement("metro-check-box") as MetroCheckBox;
    el.setAttribute("name", "terms");
    form.appendChild(el);
    await el.updateComplete;
    
    const formData = new FormData(form);
    assert.isNull(formData.get("terms"));
    
    form.remove();
  });

  test("checked attribute sets initial state", async () => {
    const el = await createCheckBox({ checked: "" });
    assert.isTrue(el.checked);
  });

  test("has proper ARIA role", async () => {
    const el = await createCheckBox();
    const checkbox = el.shadowRoot?.querySelector(".checkbox");
    assert.equal(checkbox?.getAttribute("role"), "checkbox");
    assert.equal(checkbox?.getAttribute("aria-checked"), "false");
  });

  test("ARIA checked updates with state", async () => {
    const el = await createCheckBox();
    const checkbox = el.shadowRoot?.querySelector(".checkbox") as HTMLElement;
    
    checkbox.click();
    await el.updateComplete;
    
    assert.equal(checkbox.getAttribute("aria-checked"), "true");
  });

  test("formResetCallback resets to unchecked", async () => {
    const el = await createCheckBox();
    const checkbox = el.shadowRoot?.querySelector(".checkbox") as HTMLElement;
    
    checkbox.click();
    await el.updateComplete;
    assert.isTrue(el.checked);
    
    el.formResetCallback();
    await el.updateComplete;
    
    assert.isFalse(el.checked);
  });
});
