import { assert } from "chai";
import "./pivot.ts";
import "./pivot-item.ts";
import { MetroPivot } from "./pivot.ts";

suite("metro-pivot", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createPivot(): Promise<MetroPivot> {
    const pivot = document.createElement("metro-pivot") as MetroPivot;
    
    for (let i = 1; i <= 3; i++) {
      const item = document.createElement("metro-pivot-item");
      item.setAttribute("header", `Tab ${i}`);
      item.textContent = `Content ${i}`;
      pivot.appendChild(item);
    }
    
    container.appendChild(pivot);
    await pivot.updateComplete;
    return pivot;
  }

  test("renders pivot headers", async () => {
    const el = await createPivot();
    const headers = el.shadowRoot?.querySelectorAll(".pivot-header");
    assert.equal(headers?.length, 3);
  });

  test("first item is selected by default", async () => {
    const el = await createPivot();
    assert.equal(el.selectedIndex, 0);
  });

  test("clicking header changes selection", async () => {
    const el = await createPivot();
    const headers = el.shadowRoot?.querySelectorAll(".pivot-header");
    
    headers?.[2].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;
    
    assert.equal(el.selectedIndex, 2);
  });

  test("clicking header dispatches selectionchanged event", async () => {
    const el = await createPivot();
    let eventDetail: { selectedIndex: number } | null = null;
    
    el.addEventListener("selectionchanged", ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);
    
    const headers = el.shadowRoot?.querySelectorAll(".pivot-header");
    headers?.[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;
    
    assert.deepEqual(eventDetail, { selectedIndex: 1 });
  });

  test("active header has active class", async () => {
    const el = await createPivot();
    const headers = el.shadowRoot?.querySelectorAll(".pivot-header");
    
    assert.isTrue(headers?.[0].classList.contains("active"));
    assert.isFalse(headers?.[1].classList.contains("active"));
  });

  test("selected item has active attribute", async () => {
    const el = await createPivot();
    const items = el.querySelectorAll("metro-pivot-item");
    
    assert.isTrue(items[0].hasAttribute("active"));
    
    const headers = el.shadowRoot?.querySelectorAll(".pivot-header");
    headers?.[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    await el.updateComplete;
    
    assert.isFalse(items[0].hasAttribute("active"));
    assert.isTrue(items[1].hasAttribute("active"));
  });
});
