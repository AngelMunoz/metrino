import { assert } from "chai";
import "./stack-panel.ts";
import { MetroStackPanel } from "./stack-panel.ts";

suite("metro-stack-panel", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createPanel(attrs: Record<string, string> = {}): Promise<MetroStackPanel> {
    const el = document.createElement("metro-stack-panel") as MetroStackPanel;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    for (let i = 1; i <= 3; i++) {
      const child = document.createElement("div");
      child.textContent = `Item ${i}`;
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

  test("default orientation is vertical", async () => {
    const el = await createPanel();
    assert.equal(el.orientation, "vertical");
  });

  test("orientation horizontal works", async () => {
    const el = await createPanel({ orientation: "horizontal" });
    assert.equal(el.orientation, "horizontal");
  });

  test("renders all children", async () => {
    const el = await createPanel();
    const children = el.querySelectorAll("div");
    assert.equal(children.length, 3);
  });

  test("vertical orientation has flex-direction column", async () => {
    const el = await createPanel();
    const style = getComputedStyle(el);
    assert.equal(style.flexDirection, "column");
  });

  test("horizontal orientation has flex-direction row", async () => {
    const el = await createPanel({ orientation: "horizontal" });
    const style = getComputedStyle(el);
    assert.equal(style.flexDirection, "row");
  });
});
