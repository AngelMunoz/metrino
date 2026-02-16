import { assert } from "chai";
import "./semantic-zoom.ts";
import { MetroSemanticZoom } from "./semantic-zoom.ts";

suite("metro-semantic-zoom", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createZoom(attrs: Record<string, string> = {}): Promise<MetroSemanticZoom> {
    const el = document.createElement("metro-semantic-zoom") as MetroSemanticZoom;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    
    const zoomedIn = document.createElement("div");
    zoomedIn.setAttribute("slot", "zoomed-in");
    zoomedIn.textContent = "Zoomed In";
    el.appendChild(zoomedIn);
    
    const zoomedOut = document.createElement("div");
    zoomedOut.setAttribute("slot", "zoomed-out");
    zoomedOut.textContent = "Zoomed Out";
    el.appendChild(zoomedOut);
    
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders zoom container", async () => {
    const el = await createZoom();
    const zoomContainer = el.shadowRoot?.querySelector(".zoom-container");
    assert.exists(zoomContainer);
  });

  test("default zoomed is in", async () => {
    const el = await createZoom();
    assert.equal(el.zoomed, "in");
  });

  test("zoomed out attribute works", async () => {
    const el = await createZoom({ zoomed: "out" });
    assert.equal(el.zoomed, "out");
  });

  test("clicking toggle button toggles zoom", async () => {
    const el = await createZoom();
    const toggleBtn = el.shadowRoot?.querySelector(".zoom-hint") as HTMLElement;
    
    toggleBtn.click();
    await el.updateComplete;
    assert.equal(el.zoomed, "out");
    
    toggleBtn.click();
    await el.updateComplete;
    assert.equal(el.zoomed, "in");
  });

  test("dispatches zoomchanged event", async () => {
    const el = await createZoom();
    let eventDetail: { zoomed: string } | null = null;
    
    el.addEventListener("zoomchanged", ((e: CustomEvent) => {
      eventDetail = e.detail;
    }) as EventListener);
    
    const toggleBtn = el.shadowRoot?.querySelector(".zoom-hint") as HTMLElement;
    toggleBtn.click();
    await el.updateComplete;
    
    assert.deepEqual(eventDetail, { zoomed: "out" });
  });
});
