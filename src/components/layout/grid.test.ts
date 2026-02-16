import { assert } from "chai";
import "./grid.ts";
import { MetroGrid } from "./grid.ts";

suite("metro-grid", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createGrid(attrs: Record<string, string> = {}): Promise<MetroGrid> {
    const el = document.createElement("metro-grid") as MetroGrid;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    for (let i = 1; i <= 4; i++) {
      const child = document.createElement("div");
      child.textContent = `${i}`;
      el.appendChild(child);
    }
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders slot for children", async () => {
    const el = await createGrid();
    const slot = el.shadowRoot?.querySelector("slot");
    assert.exists(slot);
  });

  test("renders all children", async () => {
    const el = await createGrid();
    const children = el.querySelectorAll("div");
    assert.equal(children.length, 4);
  });

  test("columns attribute is stored", async () => {
    const el = await createGrid({ columns: "1fr 1fr" });
    assert.equal(el.columns, "1fr 1fr");
  });

  test("rows attribute is stored", async () => {
    const el = await createGrid({ rows: "auto auto" });
    assert.equal(el.rows, "auto auto");
  });

  test("is display grid", async () => {
    const el = await createGrid();
    const style = getComputedStyle(el);
    assert.equal(style.display, "grid");
  });
});
