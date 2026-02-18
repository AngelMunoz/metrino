import { assert } from "chai";
import "./live-tile.ts";
import { MetroLiveTile } from "./live-tile.ts";

suite("metro-live-tile", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createTile(attrs: Record<string, string> = {}): Promise<MetroLiveTile> {
    const el = document.createElement("metro-live-tile") as MetroLiveTile;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders tile container", async () => {
    const el = await createTile();
    const container = el.shadowRoot?.querySelector(".live-container");
    assert.exists(container);
  });

  test("default size is medium", async () => {
    const el = await createTile();
    assert.equal(el.size, "medium");
  });

  test("size attribute works", async () => {
    const el = await createTile({ size: "wide" });
    assert.equal(el.size, "wide");
  });

  test("default interval is 0 (pseudo-random 6-10s)", async () => {
    const el = await createTile();
    assert.equal(el.interval, 0);
  });

  test("interval attribute works", async () => {
    const el = await createTile({ interval: "3000" });
    assert.equal(el.interval, 3000);
  });

  test("count attribute works", async () => {
    const el = await createTile({ count: "12" });
    assert.equal(el.count, 12);
  });

  test("badge attribute works", async () => {
    const el = await createTile({ badge: "!" });
    assert.equal(el.badge, "!");
  });

  test("setItems method exists", async () => {
    const el = await createTile();
    assert.isFunction(el.setItems);
  });

  test("setItems accepts array of items", async () => {
    const el = await createTile();
    el.setItems([
      { title: "Test", message: "Message" }
    ]);
    await el.updateComplete;
    
    const content = el.shadowRoot?.querySelector(".live-content");
    assert.exists(content);
  });
});
