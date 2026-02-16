import { assert } from "chai";
import "./toggle-switch.ts";
import { MetroToggleSwitch } from "./toggle-switch.ts";

suite("metro-toggle-switch", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createToggle(attrs: Record<string, string> = {}): Promise<MetroToggleSwitch> {
    const el = document.createElement("metro-toggle-switch") as MetroToggleSwitch;
    el.textContent = "Enable feature";
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders switch element", async () => {
    const el = await createToggle();
    const switchEl = el.shadowRoot?.querySelector(".switch");
    assert.exists(switchEl);
  });

  test("is off by default", async () => {
    const el = await createToggle();
    assert.isFalse(el.on);
  });

  test("clicking switch toggles on state", async () => {
    const el = await createToggle();
    const switchEl = el.shadowRoot?.querySelector(".switch") as HTMLElement;
    
    switchEl.click();
    await el.updateComplete;
    assert.isTrue(el.on);
    
    switchEl.click();
    await el.updateComplete;
    assert.isFalse(el.on);
  });

  test("dispatches change event with on state", async () => {
    const el = await createToggle();
    let eventDetail: { on: boolean } | null = null;
    
    el.addEventListener("change", ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);
    
    const switchEl = el.shadowRoot?.querySelector(".switch") as HTMLElement;
    switchEl.click();
    await el.updateComplete;
    
    assert.deepEqual(eventDetail, { on: true });
  });

  test("disabled toggle cannot be toggled", async () => {
    const el = await createToggle({ disabled: "" });
    const switchEl = el.shadowRoot?.querySelector(".switch") as HTMLElement;
    
    switchEl.click();
    await el.updateComplete;
    
    assert.isFalse(el.on);
  });

  test("on attribute sets initial state", async () => {
    const el = await createToggle({ on: "" });
    assert.isTrue(el.on);
  });

  test("integrates with form when on", async () => {
    const form = document.createElement("form");
    container.appendChild(form);
    
    const el = document.createElement("metro-toggle-switch") as MetroToggleSwitch;
    el.setAttribute("name", "notifications");
    el.setAttribute("value", "enabled");
    form.appendChild(el);
    await el.updateComplete;
    
    // Toggle on
    const switchEl = el.shadowRoot?.querySelector(".switch") as HTMLElement;
    switchEl.click();
    await el.updateComplete;
    
    const formData = new FormData(form);
    assert.equal(formData.get("notifications"), "enabled");
    
    form.remove();
  });

  test("off toggle submits null to form", async () => {
    const form = document.createElement("form");
    container.appendChild(form);
    
    const el = document.createElement("metro-toggle-switch") as MetroToggleSwitch;
    el.setAttribute("name", "notifications");
    form.appendChild(el);
    await el.updateComplete;
    
    const formData = new FormData(form);
    assert.isNull(formData.get("notifications"));
    
    form.remove();
  });

  test("has correct ARIA attributes", async () => {
    const el = await createToggle();
    const switchEl = el.shadowRoot?.querySelector(".switch");
    
    assert.equal(switchEl?.getAttribute("role"), "switch");
    assert.equal(switchEl?.getAttribute("aria-checked"), "false");
    
    const switchEl2 = el.shadowRoot?.querySelector(".switch") as HTMLElement;
    switchEl2.click();
    await el.updateComplete;
    
    assert.equal(switchEl?.getAttribute("aria-checked"), "true");
  });

  test("formResetCallback resets to off", async () => {
    const el = await createToggle({ on: "" });
    assert.isTrue(el.on);
    
    el.formResetCallback();
    await el.updateComplete;
    
    assert.isFalse(el.on);
  });
});
