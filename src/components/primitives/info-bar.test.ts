import { assert } from "chai";
import "./info-bar.ts";
import { MetroInfoBar } from "./info-bar.ts";

suite("metro-info-bar", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createInfoBar(attrs: Record<string, string> = {}): Promise<MetroInfoBar> {
    const el = document.createElement("metro-info-bar") as MetroInfoBar;
    el.textContent = "Information message";
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders info bar", async () => {
    const el = await createInfoBar();
    const bar = el.shadowRoot?.querySelector(".info-bar");
    assert.exists(bar);
  });

  test("displays slotted content", async () => {
    const el = await createInfoBar();
    const message = el.shadowRoot?.querySelector(".info-message");
    assert.include(message?.textContent, "Information message");
  });

  test("displays title when provided", async () => {
    const el = await createInfoBar({ title: "Important" });
    const title = el.shadowRoot?.querySelector(".info-title");
    assert.equal(title?.textContent, "Important");
  });

  test("default severity is informational", async () => {
    const el = await createInfoBar();
    assert.equal(el.severity, "informational");
  });

  test("severity applies correct class", async () => {
    const el = await createInfoBar({ severity: "error" });
    const bar = el.shadowRoot?.querySelector(".info-bar");
    assert.isTrue(bar?.classList.contains("error"));
  });

  test("closable shows close button by default", async () => {
    const el = await createInfoBar();
    const closeBtn = el.shadowRoot?.querySelector(".info-close");
    assert.exists(closeBtn);
  });

  test("closable='false' hides close button", async () => {
    const el = await createInfoBar({ closable: "false" });
    await el.updateComplete;
    const closeBtn = el.shadowRoot?.querySelector(".info-close");
    assert.notExists(closeBtn);
  });

  test("clicking close removes info bar", async () => {
    const el = await createInfoBar();
    const closeBtn = el.shadowRoot?.querySelector(".info-close") as HTMLElement;
    
    closeBtn.click();
    await el.updateComplete;
    
    assert.notExists(container.querySelector("metro-info-bar"));
  });

  test("has correct ARIA role", async () => {
    const el = await createInfoBar();
    const bar = el.shadowRoot?.querySelector(".info-bar");
    assert.equal(bar?.getAttribute("role"), "alert");
  });

  test("dispatches close event", async () => {
    const el = await createInfoBar();
    let closed = false;
    el.addEventListener("close", () => { closed = true; });
    
    const closeBtn = el.shadowRoot?.querySelector(".info-close") as HTMLElement;
    closeBtn.click();
    
    assert.isTrue(closed);
  });
});
