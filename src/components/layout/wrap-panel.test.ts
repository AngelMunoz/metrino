import { assert } from "chai";
import "./wrap-panel.ts";
import { MetroWrapPanel } from "./wrap-panel.ts";

suite("metro-wrap-panel", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createPanel(attrs: Record<string, string> = {}): Promise<MetroWrapPanel> {
    const el = document.createElement("metro-wrap-panel") as MetroWrapPanel;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    for (let i = 1; i <= 5; i++) {
      const child = document.createElement("div");
      child.textContent = `${i}`;
      el.appendChild(child);
    }
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders slot for children", async () => {
    const el = await createPanel();
    const slot = el.shadowRoot?.querySelector("slot");
    assert.exists(slot);
  });

  test("renders all children", async () => {
    const el = await createPanel();
    const children = el.querySelectorAll("div");
    assert.equal(children.length, 5);
  });

  test("default orientation is horizontal", async () => {
    const el = await createPanel();
    assert.equal(el.orientation, "horizontal");
  });

  test("orientation vertical works", async () => {
    const el = await createPanel({ orientation: "vertical" });
    assert.equal(el.orientation, "vertical");
  });

  test("is flex container", async () => {
    const el = await createPanel();
    const style = getComputedStyle(el);
    assert.equal(style.display, "flex");
  });

  test("wraps content", async () => {
    const el = await createPanel();
    const style = getComputedStyle(el);
    assert.equal(style.flexWrap, "wrap");
  });
});
