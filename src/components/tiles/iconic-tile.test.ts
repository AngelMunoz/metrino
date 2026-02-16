import { assert } from "chai";
import "./iconic-tile.ts";
import { MetroIconicTile } from "./iconic-tile.ts";

suite("metro-iconic-tile", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createTile(attrs: Record<string, string> = {}): Promise<MetroIconicTile> {
    const el = document.createElement("metro-iconic-tile") as MetroIconicTile;
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

  test("size small works", async () => {
    const el = await createTile({ size: "small" });
    assert.equal(el.size, "small");
  });

  test("size large works", async () => {
    const el = await createTile({ size: "large" });
    assert.equal(el.size, "large");
  });

  test("icon attribute is stored", async () => {
    const el = await createTile({ icon: "mail" });
    assert.equal(el.icon, "mail");
  });

  test("title attribute is stored", async () => {
    const el = await createTile({ title: "Mail" });
    assert.equal(el.title, "Mail");
  });

  test("count attribute is stored", async () => {
    const el = await createTile({ count: "5" });
    assert.equal(el.count, 5);
  });

  test("click dispatches click event", async () => {
    const el = await createTile();
    let clicked = false;
    el.addEventListener("click", () => { clicked = true; });
    
    const tile = el.shadowRoot?.querySelector(".tile-container") as HTMLElement;
    tile.click();
    
    assert.isTrue(clicked);
  });
});
