import { assert } from "chai";
import "./split-view.ts";
import { MetroSplitView } from "./split-view.ts";

suite("metro-split-view", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createSplitView(attrs: Record<string, string> = {}): Promise<MetroSplitView> {
    const el = document.createElement("metro-split-view") as MetroSplitView;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    
    const pane = document.createElement("nav");
    pane.setAttribute("slot", "pane");
    pane.textContent = "Pane";
    el.appendChild(pane);
    
    const content = document.createElement("div");
    content.textContent = "Content";
    el.appendChild(content);
    
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders split pane", async () => {
    const el = await createSplitView();
    const pane = el.shadowRoot?.querySelector(".split-pane");
    assert.exists(pane);
  });

  test("is closed by default", async () => {
    const el = await createSplitView();
    assert.isFalse(el.open);
  });

  test("open attribute works", async () => {
    const el = await createSplitView({ open: "" });
    assert.isTrue(el.open);
  });

  test("default display mode is overlay", async () => {
    const el = await createSplitView();
    assert.equal(el.displayMode, "overlay");
  });

  test("display mode compact works", async () => {
    const el = await createSplitView({ displayMode: "compact" });
    assert.equal(el.displayMode, "compact");
  });

  test("default pane placement is left", async () => {
    const el = await createSplitView();
    assert.equal(el.panePlacement, "left");
  });

  test("pane placement right works", async () => {
    const el = await createSplitView({ panePlacement: "right" });
    assert.equal(el.panePlacement, "right");
  });

  test("toggle method opens pane", async () => {
    const el = await createSplitView();
    let opened = false;
    el.addEventListener("paneopened", () => { opened = true; });
    
    el.toggle();
    await el.updateComplete;
    
    assert.isTrue(el.open);
    assert.isTrue(opened);
  });

  test("toggle method closes pane", async () => {
    const el = await createSplitView();
    el.open = true;
    await el.updateComplete;
    
    let closed = false;
    el.addEventListener("paneclosed", () => { closed = true; });
    
    el.toggle();
    await el.updateComplete;
    
    assert.isFalse(el.open);
    assert.isTrue(closed);
  });
});
