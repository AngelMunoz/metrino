import { assert } from "chai";
import { registerMetroBorder, MetroBorder } from "./border.ts";

suite("metro-border", () => {
  registerMetroBorder();
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createBorder(attrs: Record<string, string> = {}): Promise<MetroBorder> {
    const el = document.createElement("metro-border") as MetroBorder;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  function borderContainer(el: MetroBorder): HTMLElement | null {
    return el.shadowRoot?.querySelector<HTMLElement>(".border-container") ?? null;
  }

  test("applies border, radius, background and padding styles", async () => {
    const el = await createBorder({
      "border-thickness": "4",
      "border-color": "rgb(255, 0, 0)",
      background: "rgb(0, 128, 0)",
      "corner-radius": "8",
      padding: "10",
    });
    const style = borderContainer(el)?.style;

    assert.equal(style?.borderTopWidth, "4px");
    assert.equal(style?.borderColor, "rgb(255, 0, 0)");
    assert.equal(style?.borderStyle, "solid");
    assert.equal(style?.borderRadius, "8px");
    assert.equal(style?.background, "rgb(0, 128, 0)");
    assert.equal(style?.paddingTop, "10px");
  });

  test("clears border-color when the value becomes invalid", async () => {
    const el = await createBorder({ "border-color": "red" });
    assert.equal(borderContainer(el)?.style.borderColor, "red");

    el.borderColor = "red; background-image: url(https://evil.test/pixel)";
    await el.updateComplete;

    assert.equal(borderContainer(el)?.style.borderColor, "");
  });

  test("ignores injected declarations in border-color", async () => {
    const el = await createBorder({
      "border-color": "red; background-image: url(https://evil.test/pixel)",
    });
    const element = borderContainer(el);

    assert.equal(element?.style.borderColor, "");
    assert.equal(element?.style.backgroundImage, "");
  });

  test("ignores injected declarations in background", async () => {
    const el = await createBorder({
      background: "red; background-image: url(https://evil.test/pixel)",
    });
    const element = borderContainer(el);

    assert.equal(element?.style.background, "");
    assert.equal(element?.style.backgroundImage, "");
  });
});
