import { assert } from "chai";
import { registerMetroScrollViewer, MetroScrollViewer } from "./scroll-viewer.ts";

suite("metro-scroll-viewer", () => {
  let container: HTMLDivElement;
  registerMetroScrollViewer();

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
    const el = await createScroll({ "scroll-orientation": "horizontal" });
    assert.equal(el.scrollOrientation, "horizontal");
  });

  test("scroll orientation both works", async () => {
    const el = await createScroll({ "scroll-orientation": "both" });
    assert.equal(el.scrollOrientation, "both");
  });

  test("has overflow auto for vertical", async () => {
    const el = await createScroll();
    el.style.height = "100px";
    const container = el.shadowRoot?.querySelector(".scroll-container") as HTMLElement;
    const style = getComputedStyle(container);
    assert.equal(style.overflowY, "auto");
  });

  test("touch physics drag scrolls when gesture starts on slotted content", async () => {
    const el = await createScroll({
      "touch-physics": "",
      "scroll-orientation": "vertical",
    });
    el.style.height = "100px";
    await el.updateComplete;

    const content = el.firstElementChild as HTMLElement;
    const container = el.shadowRoot?.querySelector(".scroll-container") as HTMLElement;

    // Synthetic events have no active pointer; stub capture so the handler
    // under test does not throw. Real pointers always capture successfully.
    const original = Element.prototype.setPointerCapture;
    let captured = false;
    Element.prototype.setPointerCapture = function () {
      captured = true;
    };
    try {
      content.dispatchEvent(new PointerEvent("pointerdown", {
        bubbles: true, composed: true, pointerId: 1, pointerType: "touch",
        button: 0, buttons: 1, clientX: 50, clientY: 50,
      }));
      for (let i = 1; i <= 5; i++) {
        content.dispatchEvent(new PointerEvent("pointermove", {
          bubbles: true, composed: true, pointerId: 1, pointerType: "touch",
          buttons: 1, clientX: 50, clientY: 50 - i * 10,
        }));
      }
      content.dispatchEvent(new PointerEvent("pointerup", {
        bubbles: true, composed: true, pointerId: 1, pointerType: "touch",
      }));
    } finally {
      Element.prototype.setPointerCapture = original;
    }

    assert.isTrue(captured);
    assert.isAbove(container.scrollTop, 0);
  });
});
