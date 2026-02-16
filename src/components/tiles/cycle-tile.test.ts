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
    assert.exists(tile);
  });

  test("default size is medium", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    assert.equal(el.size, "medium");
  });

  test("default interval is 3000ms", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    assert.equal(el.interval, 3000);
  });

  test("first cycle item is active initially", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const items = el.querySelectorAll('[slot="cycle"]');
    assert.isTrue(items[0].classList.contains("active"));
  });

  test("click dispatches click event", async () => {
    const el = createCycleTile();
    await el.updateComplete;
    
    let clicked = false;
    el.addEventListener("click", () => { clicked = true; });
    
    const tile = el.shadowRoot?.querySelector(".tile-container") as HTMLElement;
    tile.click();
    
    assert.isTrue(clicked);
  });

  test("size attribute works", async () => {
    const el = createCycleTile({ size: "wide" });
    await el.updateComplete;
    assert.equal(el.size, "wide");
  });
});
