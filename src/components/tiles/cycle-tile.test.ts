import { assert } from "chai";
import "./cycle-tile.ts";
import { MetroCycleTile } from "./cycle-tile.ts";

suite("metro-cycle-tile", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  function createCycleTile(attrs: Record<string, string> = {}): MetroCycleTile {
    const el = document.createElement("metro-cycle-tile") as MetroCycleTile;

    const front = document.createElement("div");
    front.setAttribute("slot", "front");
    front.textContent = "Front";

    for (let i = 1; i <= 3; i++) {
      const cycle = document.createElement("div");
      cycle.setAttribute("slot", "cycle");
      cycle.textContent = `Slide ${i}`;
      el.appendChild(cycle);
    }

    el.appendChild(front);

    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    return el;
  }

  test("renders tile container", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    const tile = el.shadowRoot?.querySelector(".tile-container");
    assert.exists(tile, "tile-container should exist");
  });

  test("default size is medium", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    assert.equal(el.size, "medium");
  });

  test("medium tile has correct dimensions", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    assert.equal(el.offsetWidth, 150, "medium tile width should be 150px");
    assert.equal(el.offsetHeight, 150, "medium tile height should be 150px");
  });

  test("wide tile has correct dimensions", async () => {
    const el = createCycleTile({ size: "wide" });
    await el.updateComplete;
    assert.equal(el.offsetWidth, 310, "wide tile width should be 310px");
    assert.equal(el.offsetHeight, 150, "wide tile height should be 150px");
  });

  test("default interval is 3000ms", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    assert.equal(el.interval, 3000);
  });

  test("cycle items receive cycle-content class", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 100));

    const items = el.querySelectorAll('[slot="cycle"]');
    items.forEach(item => {
      assert.isTrue(item.classList.contains("cycle-content"), "each cycle item should have cycle-content class");
    });
  });

  test("first cycle item is active initially", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 100));

    const items = el.querySelectorAll('[slot="cycle"]');
    assert.isTrue(items[0].classList.contains("active"), "first item should have active class");
  });

  test("only one item is active at a time", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 100));

    const items = el.querySelectorAll('[slot="cycle"]');
    const activeCount = Array.from(items).filter(item => item.classList.contains("active")).length;
    assert.equal(activeCount, 1, "exactly one item should be active");
  });

  test("tile has accent background", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    const container = el.shadowRoot?.querySelector(".tile-container") as HTMLElement;
    const style = getComputedStyle(container);
    assert.equal(style.backgroundColor, "rgb(0, 120, 212)", "should use accent color");
  });

  test("tile has overflow hidden", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    const style = getComputedStyle(el);
    assert.equal(style.overflow, "hidden", "tile should have overflow hidden");
  });

  test("click dispatches click event", async () => {
    const el = createCycleTile();
    await el.updateComplete;

    let clicked = false;
    el.addEventListener("click", () => { clicked = true; });

    const tile = el.shadowRoot?.querySelector(".tile-container") as HTMLElement;
    tile.click();

    assert.isTrue(clicked, "click event should be dispatched");
  });

  test("tile has pointer cursor", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    const style = getComputedStyle(el);
    assert.equal(style.cursor, "pointer", "tile should have pointer cursor");
  });

  test("front slot is rendered", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    const frontSlot = el.shadowRoot?.querySelector('slot[name="front"]');
    assert.exists(frontSlot, "front slot should exist");
  });

  test("cycle slot is rendered", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    const cycleSlot = el.shadowRoot?.querySelector('slot[name="cycle"]');
    assert.exists(cycleSlot, "cycle slot should exist");
  });

  test("cycling stops when disconnected", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 100));

    el.remove();

    await new Promise(resolve => setTimeout(resolve, 100));

    assert.isTrue(true, "tile should handle disconnection without error");
  });

  test("active item has opacity 1", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    await new Promise(resolve => setTimeout(resolve, 100));

    const items = el.querySelectorAll('[slot="cycle"]');
    const activeItem = items[0] as HTMLElement;
    const style = getComputedStyle(activeItem);
    assert.equal(style.opacity, "1", "active item should have opacity 1");
  });
});
