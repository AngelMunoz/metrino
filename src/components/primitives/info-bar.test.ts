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

  async function createInfoBar(): Promise<MetroInfoBar> {
    const el = document.createElement("metro-info-bar") as MetroInfoBar;
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
    el.textContent = "Information message";
    await el.updateComplete;
    assert.include(el.textContent, "Information message");
  });

  test("displays title when provided", async () => {
    const el = await createInfoBar();
    el.setAttribute("title", "Important");
    await el.updateComplete;
    const title = el.shadowRoot?.querySelector(".info-title");
    assert.equal(title?.textContent, "Important");
  });

  test("default severity is informational", async () => {
    const el = await createInfoBar();
    assert.equal(el.severity, "informational");
  });

  test("severity applies correct class", async () => {
    const el = await createInfoBar();
    el.setAttribute("severity", "error");
    await el.updateComplete;
    const bar = el.shadowRoot?.querySelector(".info-bar");
    assert.isTrue(bar?.classList.contains("error"));
  });

  test("closable shows close button by default", async () => {
    const el = await createInfoBar();
    const closeBtn = el.shadowRoot?.querySelector(".close-btn");
    assert.exists(closeBtn);
  });

  test("closable=false hides close button", async () => {
    const el = document.createElement("metro-info-bar") as MetroInfoBar;
    el.closable = false;
    container.appendChild(el);
    await el.updateComplete;
    const closeBtn = el.shadowRoot?.querySelector(".close-btn");
    assert.notExists(closeBtn);
  });
});
