import { assert } from "chai";
import { registerMetroHubSection, MetroHubSection } from "./hub-section.ts";

suite("metro-hub-section", () => {
  registerMetroHubSection();
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createSection(attrs: Record<string, string> = {}): Promise<MetroHubSection> {
    const el = document.createElement("metro-hub-section") as MetroHubSection;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders content slot", async () => {
    const el = await createSection();
    assert.exists(el.shadowRoot?.querySelector("slot"));
  });

  test("header is displayed when provided", async () => {
    const el = await createSection({ header: "Section Header" });
    const header = el.shadowRoot?.querySelector(".section-header");
    assert.equal(header?.textContent, "Section Header");
  });

  test("no header when not provided", async () => {
    const el = await createSection();
    assert.notExists(el.shadowRoot?.querySelector(".section-header"));
  });

  test("section header has part attribute", async () => {
    const el = await createSection({ header: "Section Header" });
    const header = el.shadowRoot?.querySelector<HTMLElement>(".section-header");
    assert.equal(header?.getAttribute("part"), "section-header");
  });

  test("section content has part attribute", async () => {
    const el = await createSection();
    const content = el.shadowRoot?.querySelector<HTMLElement>(".section-content");
    assert.equal(content?.getAttribute("part"), "section-content");
  });

  test("section has group role", async () => {
    const el = await createSection();
    assert.equal(el.getAttribute("role"), "group");
  });

  test("header becomes the group label", async () => {
    const el = await createSection({ header: "Section Header" });
    await el.updateComplete;
    assert.equal(el.getAttribute("aria-label"), "Section Header");
  });

  test("no group label without header", async () => {
    const el = await createSection();
    await el.updateComplete;
    assert.notExists(el.getAttribute("aria-label"));
  });

  test("header keeps native heading semantics", async () => {
    const el = await createSection({ header: "Section Header" });
    const header = el.shadowRoot?.querySelector("h3");
    assert.exists(header);
    assert.notExists(header?.getAttribute("role"));
  });
});
