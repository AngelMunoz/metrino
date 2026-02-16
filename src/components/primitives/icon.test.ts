import { assert } from "chai";
import "./icon.ts";
import { MetroIcon } from "./icon.ts";

suite("metro-icon", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createIcon(icon: string, size?: string): Promise<MetroIcon> {
    const el = document.createElement("metro-icon") as MetroIcon;
    el.setAttribute("icon", icon);
    if (size) el.setAttribute("size", size);
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders svg element", async () => {
    const el = await createIcon("home");
    const svg = el.shadowRoot?.querySelector("svg");
    assert.exists(svg);
  });

  test("renders path for known icon", async () => {
    const el = await createIcon("home");
    const path = el.shadowRoot?.querySelector("svg path");
    assert.exists(path);
    assert.exists(path?.getAttribute("d"));
  });

  test("default size is normal", async () => {
    const el = await createIcon("home");
    assert.equal(el.size, "normal");
  });

  test("size attribute changes size", async () => {
    const el = await createIcon("home", "large");
    assert.equal(el.size, "large");
  });

  test("all size variants work", async () => {
    const sizes = ["small", "normal", "medium", "large", "xlarge"];
    for (const size of sizes) {
      const el = await createIcon("star", size);
      assert.equal(el.size, size);
    }
  });

  test("unknown icon renders empty svg", async () => {
    const el = await createIcon("nonexistent");
    const path = el.shadowRoot?.querySelector("svg path");
    assert.equal(path?.getAttribute("d"), null);
  });

  test("icon attribute is reflected", async () => {
    const el = await createIcon("settings");
    assert.equal(el.getAttribute("icon"), "settings");
  });
});
