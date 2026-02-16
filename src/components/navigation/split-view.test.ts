import { assert } from "chai";
import "./split-view.ts";
import { MetroSplitView } from "./split-view.ts";

suite("metro-split-view", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    container.style.height = "400px";
    container.style.width = "800px";
    container.style.position = "relative";
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
    pane.textContent = "Pane Content";
    el.appendChild(pane);

    const content = document.createElement("div");
    content.textContent = "Main Content";
    el.appendChild(content);

    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders split pane", async () => {
    const el = await createSplitView();
    const pane = el.shadowRoot?.querySelector(".split-pane");
    assert.exists(pane, "split-pane should exist");
  });

  test("renders content area", async () => {
    const el = await createSplitView();
    const content = el.shadowRoot?.querySelector(".content");
    assert.exists(content, "content should exist");
  });

  test("is closed by default", async () => {
    const el = await createSplitView();
    assert.isFalse(el.open, "should be closed by default");
  });

  test("open attribute opens pane", async () => {
    const el = await createSplitView({ open: "" });
    assert.isTrue(el.open, "should be open when open attribute is set");
  });

  test("default display mode is overlay", async () => {
    const el = await createSplitView();
    assert.equal(el.displayMode, "overlay");
  });

  test("display mode inline works", async () => {
    const el = await createSplitView({ "display-mode": "inline" });
    assert.equal(el.displayMode, "inline");
  });

  test("display mode compact works", async () => {
    const el = await createSplitView({ "display-mode": "compact" });
    assert.equal(el.displayMode, "compact");
  });

  test("default pane placement is left", async () => {
    const el = await createSplitView();
    assert.equal(el.panePlacement, "left");
  });

  test("pane placement right works", async () => {
    const el = await createSplitView({ "pane-placement": "right" });
    assert.equal(el.panePlacement, "right");
  });

  test("toggle method opens pane", async () => {
    const el = await createSplitView();
    let opened = false;
    el.addEventListener("paneopened", () => { opened = true; });

    el.toggle();
    await el.updateComplete;

    assert.isTrue(el.open, "should be open after toggle");
    assert.isTrue(opened, "paneopened event should be dispatched");
  });

  test("toggle method closes pane", async () => {
    const el = await createSplitView();
    el.open = true;
    await el.updateComplete;

    let closed = false;
    el.addEventListener("paneclosed", () => { closed = true; });

    el.toggle();
    await el.updateComplete;

    assert.isFalse(el.open, "should be closed after toggle");
    assert.isTrue(closed, "paneclosed event should be dispatched");
  });

  test("setting open property to true opens pane", async () => {
    const el = await createSplitView();

    el.open = true;
    await el.updateComplete;

    assert.isTrue(el.open, "should be open when property is set to true");
  });

  test("setting open property to false closes pane", async () => {
    const el = await createSplitView({ open: "" });

    el.open = false;
    await el.updateComplete;

    assert.isFalse(el.open, "should be closed when property is set to false");
  });

  test("show method opens pane", async () => {
    const el = await createSplitView();

    el.show();
    await el.updateComplete;

    assert.isTrue(el.open);
  });

  test("hide method closes pane", async () => {
    const el = await createSplitView({ open: "" });

    el.hide();
    await el.updateComplete;

    assert.isFalse(el.open);
  });

  test("pane slot is rendered", async () => {
    const el = await createSplitView();
    const paneSlot = el.shadowRoot?.querySelector('slot[name="pane"]');
    assert.exists(paneSlot, "pane slot should exist");
  });

  test("default slot is rendered", async () => {
    const el = await createSplitView();
    const defaultSlot = el.shadowRoot?.querySelector("slot:not([name])");
    assert.exists(defaultSlot, "default slot should exist");
  });

  test("compact mode shows pane at 48px even when closed", async () => {
    const el = await createSplitView({ "display-mode": "compact" });
    const pane = el.shadowRoot?.querySelector(".split-pane") as HTMLElement;
    const style = getComputedStyle(pane);
    assert.equal(style.width, "48px", "pane should be 48px in compact mode when closed");
  });

  test("compact mode expands to 320px when open", async () => {
    const el = await createSplitView({ "display-mode": "compact", open: "" });
    const pane = el.shadowRoot?.querySelector(".split-pane") as HTMLElement;
    const style = getComputedStyle(pane);
    assert.equal(style.width, "320px", "pane should be 320px in compact mode when open");
  });

  test("inline mode pane is 0 width when closed", async () => {
    const el = await createSplitView({ "display-mode": "inline" });
    const pane = el.shadowRoot?.querySelector(".split-pane") as HTMLElement;
    const style = getComputedStyle(pane);
    const width = parseFloat(style.width);
    assert.isAtMost(width, 2, "pane should be nearly 0px in inline mode when closed");
  });

  test("inline mode pane is 320px when open", async () => {
    const el = await createSplitView({ "display-mode": "inline", open: "" });
    const pane = el.shadowRoot?.querySelector(".split-pane") as HTMLElement;
    const style = getComputedStyle(pane);
    assert.equal(style.width, "320px", "pane should be 320px in inline mode when open");
  });

  test("backdrop exists for overlay mode", async () => {
    const el = await createSplitView({ open: "" });
    const backdrop = el.shadowRoot?.querySelector(".backdrop");
    assert.exists(backdrop, "backdrop should exist");
  });

  test("backdrop click closes pane in overlay mode", async () => {
    const el = await createSplitView({ open: "" });
    await el.updateComplete;

    const backdrop = el.shadowRoot?.querySelector(".backdrop") as HTMLElement;
    backdrop.click();
    await el.updateComplete;

    assert.isFalse(el.open, "pane should close when backdrop is clicked");
  });
});
