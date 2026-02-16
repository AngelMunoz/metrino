import { assert } from "chai";
import "./expander.ts";
import { MetroExpander } from "./expander.ts";

suite("metro-expander", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createExpander(attrs: Record<string, string> = {}): Promise<MetroExpander> {
    const el = document.createElement("metro-expander") as MetroExpander;
    el.textContent = "Hidden content";
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders header", async () => {
    const el = await createExpander({ title: "Click to expand" });
    const header = el.shadowRoot?.querySelector(".expander-header");
    assert.exists(header);
  });

  test("is collapsed by default", async () => {
    const el = await createExpander();
    assert.isFalse(el.expanded);
  });

  test("expanded attribute sets initial state", async () => {
    const el = await createExpander({ expanded: "" });
    assert.isTrue(el.expanded);
  });

  test("clicking header toggles expanded", async () => {
    const el = await createExpander({ title: "Test" });
    const header = el.shadowRoot?.querySelector(".expander-header") as HTMLElement;
    
    header.click();
    await el.updateComplete;
    assert.isTrue(el.expanded);
    
    header.click();
    await el.updateComplete;
    assert.isFalse(el.expanded);
  });

  test("dispatches expanded event", async () => {
    const el = await createExpander({ title: "Test" });
    let eventDetail: { expanded: boolean } | null = null;
    
    el.addEventListener("expanded", ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);
    
    const header = el.shadowRoot?.querySelector(".expander-header") as HTMLElement;
    header.click();
    await el.updateComplete;
    
    assert.deepEqual(eventDetail, { expanded: true });
  });

  test("content is hidden when collapsed", async () => {
    const el = await createExpander();
    const content = el.shadowRoot?.querySelector(".expander-content") as HTMLElement;
    const style = getComputedStyle(content);
    assert.equal(style.maxHeight, "0px");
  });

  test("content is visible when expanded", async () => {
    const el = await createExpander({ expanded: "" });
    await el.updateComplete;
    const content = el.shadowRoot?.querySelector(".expander-content") as HTMLElement;
    assert.notEqual(content.style.maxHeight, "0px");
  });
});
