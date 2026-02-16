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
    assert.exists(tile, "tile-container should exist");
  });

  test("default size is medium", async () => {
    const el = await createTile();
    assert.equal(el.size, "medium");
  });

  test("medium tile has correct dimensions", async () => {
    const el = await createTile();
    assert.equal(el.offsetWidth, 150, "medium tile width should be 150px");
    assert.equal(el.offsetHeight, 150, "medium tile height should be 150px");
  });

  test("small tile has correct dimensions", async () => {
    const el = await createTile({ size: "small" });
    assert.equal(el.offsetWidth, 70, "small tile width should be 70px");
    assert.equal(el.offsetHeight, 70, "small tile height should be 70px");
  });

  test("large tile has correct dimensions", async () => {
    const el = await createTile({ size: "large" });
    assert.equal(el.offsetWidth, 310, "large tile width should be 310px");
    assert.equal(el.offsetHeight, 310, "large tile height should be 310px");
  });

  test("icon is rendered when provided", async () => {
    const el = await createTile({ icon: "mail" });
    const icon = el.shadowRoot?.querySelector("metro-icon");
    assert.exists(icon, "metro-icon should be rendered");
    assert.equal(icon?.getAttribute("icon"), "mail");
  });

  test("icon size adapts to tile size", async () => {
    const el = await createTile({ size: "small", icon: "mail" });
    const icon = el.shadowRoot?.querySelector("metro-icon");
    assert.equal(icon?.getAttribute("size"), "medium", "small tile should use medium icon");

    const elLarge = await createTile({ size: "large", icon: "mail" });
    const iconLarge = elLarge.shadowRoot?.querySelector("metro-icon");
    assert.equal(iconLarge?.getAttribute("size"), "xlarge", "large tile should use xlarge icon");
  });

  test("title is rendered when provided", async () => {
    const el = await createTile({ title: "Mail" });
    const title = el.shadowRoot?.querySelector(".tile-title");
    assert.exists(title, "tile-title should exist");
    assert.equal(title?.textContent, "Mail");
  });

  test("title is hidden on small tiles", async () => {
    const el = await createTile({ size: "small", title: "Mail" });
    const title = el.shadowRoot?.querySelector(".tile-title") as HTMLElement;
    const style = getComputedStyle(title);
    assert.equal(style.display, "none", "title should be hidden on small tiles");
  });

  test("count is rendered when greater than 0", async () => {
    const el = await createTile({ count: "5" });
    const count = el.shadowRoot?.querySelector(".tile-count");
    assert.exists(count, "tile-count should exist");
    assert.equal(count?.textContent, "5");
  });

  test("count is not rendered when 0", async () => {
    const el = await createTile({ count: "0" });
    const count = el.shadowRoot?.querySelector(".tile-count");
    assert.notExists(count, "tile-count should not exist when count is 0");
  });

  test("badge is rendered when provided", async () => {
    const el = await createTile({ badge: "!" });
    const badge = el.shadowRoot?.querySelector(".tile-badge");
    assert.exists(badge, "tile-badge should exist");
    assert.equal(badge?.textContent, "!");
  });

  test("badge is not rendered when empty", async () => {
    const el = await createTile();
    const badge = el.shadowRoot?.querySelector(".tile-badge");
    assert.notExists(badge, "tile-badge should not exist when not provided");
  });

  test("badge has correct styles", async () => {
    const el = await createTile({ badge: "3" });
    const badge = el.shadowRoot?.querySelector(".tile-badge") as HTMLElement;
    const style = getComputedStyle(badge);
    assert.equal(style.position, "absolute", "badge should be absolutely positioned");
    assert.equal(style.borderRadius, "50%", "badge should be circular");
  });

  test("tile has accent background", async () => {
    const el = await createTile();
    const container = el.shadowRoot?.querySelector(".tile-container") as HTMLElement;
    const style = getComputedStyle(container);
    assert.equal(style.backgroundColor, "rgb(0, 120, 212)", "should use accent color");
  });

  test("click dispatches click event", async () => {
    const el = await createTile();
    let clicked = false;
    el.addEventListener("click", () => { clicked = true; });

    const tile = el.shadowRoot?.querySelector(".tile-container") as HTMLElement;
    tile.click();

    assert.isTrue(clicked, "click event should be dispatched");
  });

  test("tile has pointer cursor", async () => {
    const el = await createTile();
    const style = getComputedStyle(el);
    assert.equal(style.cursor, "pointer", "tile should have pointer cursor");
  });

  test("slot content is rendered", async () => {
    const el = document.createElement("metro-iconic-tile") as MetroIconicTile;
    const slotContent = document.createElement("span");
    slotContent.textContent = "Extra content";
    el.appendChild(slotContent);
    container.appendChild(el);
    await el.updateComplete;

    const slot = el.shadowRoot?.querySelector("slot");
    assert.exists(slot, "slot should exist");
  });
});
