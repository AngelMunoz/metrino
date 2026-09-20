import { assert } from "chai";
import { registerMetroGrid, MetroGrid } from "./grid.ts";

suite("metro-grid", () => {
  let container: HTMLDivElement;
  registerMetroGrid();

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

  function hostRule(el: MetroGrid): CSSStyleRule | undefined {
    const sheets = el.shadowRoot?.adoptedStyleSheets ?? [];
    const sheet = sheets[sheets.length - 1];
    const rule = sheet?.cssRules[0];
    return rule instanceof CSSStyleRule ? rule : undefined;
  }

  test("applies grid templates from attributes", async () => {
    const el = await createGrid({ rows: "30px 30px", columns: "50px 50px" });
    const rule = hostRule(el);

    assert.exists(rule);
    assert.equal(rule?.style.getPropertyValue("grid-template-rows"), "30px 30px");
    assert.equal(rule?.style.getPropertyValue("grid-template-columns"), "50px 50px");
    assert.equal(getComputedStyle(el).gridTemplateRows, "30px 30px");
  });

  test("ignores injected declarations in rows", async () => {
    const el = await createGrid({
      rows: "1fr; background-image: url(https://evil.test/pixel)",
    });
    const rule = hostRule(el);

    assert.exists(rule);
    assert.equal(rule?.style.getPropertyValue("grid-template-rows"), "");
    assert.equal(rule?.style.getPropertyValue("background-image"), "");
    assert.equal(getComputedStyle(el).backgroundImage, "none");
  });

  test("ignores injected declarations in columns", async () => {
    const el = await createGrid({
      columns: "1fr; background-image: url(https://evil.test/pixel)",
    });
    const rule = hostRule(el);

    assert.exists(rule);
    assert.equal(rule?.style.getPropertyValue("grid-template-columns"), "");
    assert.equal(rule?.style.getPropertyValue("background-image"), "");
    assert.equal(getComputedStyle(el).backgroundImage, "none");
  });

  test("clears template when the value becomes invalid", async () => {
    const el = await createGrid({ rows: "30px" });
    assert.equal(hostRule(el)?.style.getPropertyValue("grid-template-rows"), "30px");

    el.rows = "30px; background-image: url(https://evil.test/pixel)";
    await el.updateComplete;

    assert.equal(hostRule(el)?.style.getPropertyValue("grid-template-rows"), "");
  });
});
