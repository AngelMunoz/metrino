import { assert } from "chai";
import "./app-bar-button.ts";
import { MetroAppBarButton } from "./app-bar-button.ts";

suite("metro-app-bar-button", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createButton(attrs: Record<string, string> = {}): Promise<MetroAppBarButton> {
    const el = document.createElement("metro-app-bar-button") as MetroAppBarButton;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders icon circle", async () => {
    const el = await createButton({ icon: "home" });
    const circle = el.shadowRoot?.querySelector(".icon-circle");
    assert.exists(circle);
  });

  test("renders label when provided", async () => {
    const el = await createButton({ icon: "home", label: "Home" });
    const label = el.shadowRoot?.querySelector(".label");
    assert.exists(label);
    assert.equal(label?.textContent, "Home");
  });

  test("no label when not provided", async () => {
    const el = await createButton({ icon: "home" });
    const label = el.shadowRoot?.querySelector(".label");
    assert.notExists(label);
  });

  test("icon attribute is reflected", async () => {
    const el = await createButton({ icon: "settings" });
    assert.equal(el.icon, "settings");
  });

  test("label attribute is reflected", async () => {
    const el = await createButton({ label: "Test" });
    assert.equal(el.label, "Test");
  });

  test("click dispatches click event", async () => {
    const el = await createButton({ icon: "home" });
    let clicked = false;
    el.addEventListener("click", () => { clicked = true; });
    
    el.click();
    assert.isTrue(clicked);
  });
});
