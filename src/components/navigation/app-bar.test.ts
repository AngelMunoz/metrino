import { assert } from "chai";
import "./app-bar.ts";
import { MetroAppBar } from "./app-bar.ts";

suite("metro-app-bar", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createAppBar(attrs: Record<string, string> = {}): Promise<MetroAppBar> {
    const el = document.createElement("metro-app-bar") as MetroAppBar;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders app bar content", async () => {
    const el = await createAppBar();
    const content = el.shadowRoot?.querySelector(".app-bar-content");
    assert.exists(content);
  });

  test("default placement is bottom", async () => {
    const el = await createAppBar();
    assert.equal(el.placement, "bottom");
  });

  test("placement top works", async () => {
    const el = await createAppBar({ placement: "top" });
    assert.equal(el.placement, "top");
  });

  test("is not expanded by default", async () => {
    const el = await createAppBar();
    assert.isFalse(el.expanded);
  });

  test("clicking ellipsis toggles expanded", async () => {
    const el = await createAppBar();
    const ellipsis = el.shadowRoot?.querySelector(".ellipsis-btn") as HTMLElement;
    
    ellipsis.click();
    await el.updateComplete;
    assert.isTrue(el.expanded);
    
    ellipsis.click();
    await el.updateComplete;
    assert.isFalse(el.expanded);
  });

  test("dispatches menu-toggle event", async () => {
    const el = await createAppBar();
    let eventDetail: { expanded: boolean } | null = null;
    
    el.addEventListener("menu-toggle", ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);
    
    const ellipsis = el.shadowRoot?.querySelector(".ellipsis-btn") as HTMLElement;
    ellipsis.click();
    await el.updateComplete;
    
    assert.deepEqual(eventDetail, { expanded: true });
  });

  test("renders slot for buttons", async () => {
    const el = await createAppBar();
    const slot = el.shadowRoot?.querySelector("slot");
    assert.exists(slot);
  });
});
