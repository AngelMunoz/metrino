import { assert } from "chai";
import "./flip-tile.ts";
import { MetroFlipTile } from "./flip-tile.ts";

suite("metro-flip-tile", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createTile(attrs: Record<string, string> = {}): Promise<MetroFlipTile> {
    const el = document.createElement("metro-flip-tile") as MetroFlipTile;
    
    const front = document.createElement("div");
    front.setAttribute("slot", "front");
    front.textContent = "Front";
    
    const back = document.createElement("div");
    back.setAttribute("slot", "back");
    back.textContent = "Back";
    
    el.appendChild(front);
    el.appendChild(back);
    
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders tile container", async () => {
    const el = await createTile();
    const tile = el.shadowRoot?.querySelector(".tile-container");
    assert.exists(tile);
  });

  test("default size is medium", async () => {
    const el = await createTile();
    assert.equal(el.size, "medium");
  });

  test("size attribute changes size", async () => {
    const el = await createTile({ size: "wide" });
    assert.equal(el.size, "wide");
  });

  test("is not flipped by default", async () => {
    const el = await createTile();
    assert.isFalse(el.flipped);
  });

  test("clicking toggles flipped state", async () => {
    const el = await createTile();
    const tile = el.shadowRoot?.querySelector(".tile-container") as HTMLElement;
    
    tile.click();
    await el.updateComplete;
    assert.isTrue(el.flipped);
    
    tile.click();
    await el.updateComplete;
    assert.isFalse(el.flipped);
  });

  test("flipped attribute sets initial state", async () => {
    const el = await createTile({ flipped: "" });
    assert.isTrue(el.flipped);
  });

  test("dispatches flipped event", async () => {
    const el = await createTile();
    let eventDetail: { flipped: boolean } | null = null;
    
    el.addEventListener("flipped", ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);
    
    const tile = el.shadowRoot?.querySelector(".tile-container") as HTMLElement;
    tile.click();
    await el.updateComplete;
    
    assert.deepEqual(eventDetail, { flipped: true });
  });

  test("small size has correct dimensions", async () => {
    const el = await createTile({ size: "small" });
    assert.equal(el.offsetWidth, 70);
    assert.equal(el.offsetHeight, 70);
  });

  test("large size has correct dimensions", async () => {
    const el = await createTile({ size: "large" });
    await el.updateComplete;
    assert.equal(el.offsetWidth, 310);
    assert.equal(el.offsetHeight, 310);
  });
});
