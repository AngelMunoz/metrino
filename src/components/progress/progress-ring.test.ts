import { assert } from "chai";
import "./progress-ring.ts";
import { MetroProgressRing } from "./progress-ring.ts";

suite("metro-progress-ring", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createRing(attrs: Record<string, string> = {}): Promise<MetroProgressRing> {
    const el = document.createElement("metro-progress-ring") as MetroProgressRing;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders progress ring", async () => {
    const el = await createRing();
    const ring = el.shadowRoot?.querySelector(".progress-ring");
    assert.exists(ring);
  });

  test("renders 5 ring dots", async () => {
    const el = await createRing();
    const dots = el.shadowRoot?.querySelectorAll(".ring-dot");
    assert.equal(dots?.length, 5);
  });

  test("default size is normal", async () => {
    const el = await createRing();
    assert.equal(el.size, "normal");
  });

  test("small size attribute works", async () => {
    const el = await createRing({ size: "small" });
    assert.equal(el.size, "small");
  });

  test("large size attribute works", async () => {
    const el = await createRing({ size: "large" });
    assert.equal(el.size, "large");
  });

  test("ring container has correct class", async () => {
    const el = await createRing();
    const ringContainer = el.shadowRoot?.querySelector(".ring-container");
    assert.exists(ringContainer);
  });
});
