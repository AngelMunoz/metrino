import { assert } from "chai";
import "./scroll-viewer.ts";
import { MetroScrollViewer } from "./scroll-viewer.ts";

suite("metro-scroll-viewer", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createScroll(attrs: Record<string, string> = {}): Promise<MetroScrollViewer> {
    const el = document.createElement("metro-scroll-viewer") as MetroScrollViewer;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    
    const content = document.createElement("div");
    content.style.height = "500px";
    content.textContent = "Scrollable content";
    el.appendChild(content);
    
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders scroll container", async () => {
    const el = await createScroll();
    const scrollContainer = el.shadowRoot?.querySelector(".scroll-container");
    assert.exists(scrollContainer);
  });

  test("renders slot for content", async () => {
    const el = await createScroll();
    const slot = el.shadowRoot?.querySelector("slot");
    assert.exists(slot);
  });

  test("default scroll orientation is vertical", async () => {
    const el = await createScroll();
    assert.equal(el.scrollOrientation, "vertical");
  });

  test("scroll orientation horizontal works", async () => {
    const el = await createScroll({ scrollOrientation: "horizontal" });
    assert.equal(el.scrollOrientation, "horizontal");
  });

  test("scroll orientation both works", async () => {
    const el = await createScroll({ scrollOrientation: "both" });
    assert.equal(el.scrollOrientation, "both");
  });

  test("has overflow auto for vertical", async () => {
    const el = await createScroll();
    el.style.height = "100px";
    const container = el.shadowRoot?.querySelector(".scroll-container") as HTMLElement;
    const style = getComputedStyle(container);
    assert.equal(style.overflowY, "auto");
  });
});
