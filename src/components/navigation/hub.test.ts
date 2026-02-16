import { assert } from "chai";
import "./hub.ts";
import { MetroHub } from "./hub.ts";

suite("metro-hub", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createHub(attrs: Record<string, string> = {}): Promise<MetroHub> {
    const el = document.createElement("metro-hub") as MetroHub;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders hub container", async () => {
    const el = await createHub();
    const hubContainer = el.shadowRoot?.querySelector(".hub-container");
    assert.exists(hubContainer);
  });

  test("renders slot for sections", async () => {
    const el = await createHub();
    const slot = el.shadowRoot?.querySelector("slot");
    assert.exists(slot);
  });

  test("title is displayed when provided", async () => {
    const el = await createHub({ title: "Hub Title" });
    const title = el.shadowRoot?.querySelector(".hub-title");
    assert.equal(title?.textContent, "Hub Title");
  });

  test("no title when not provided", async () => {
    const el = await createHub();
    const title = el.shadowRoot?.querySelector(".hub-title");
    assert.notExists(title);
  });
});
