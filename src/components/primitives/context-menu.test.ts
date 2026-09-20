import { assert } from "chai";
import { registerMetroContextMenu, MetroContextMenu } from "./context-menu.ts";

suite("metro-context-menu", () => {
  registerMetroContextMenu();
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  test("invalid target selector does not throw on connect", () => {
    const el = document.createElement("metro-context-menu") as MetroContextMenu;
    el.target = "[";
    container.appendChild(el);

    assert.isTrue(el.isConnected);
  });

  test("show() opens the menu", async () => {
    const el = document.createElement("metro-context-menu") as MetroContextMenu;
    container.appendChild(el);
    await el.updateComplete;

    el.show(10, 10);
    await el.updateComplete;

    assert.isTrue(el.open);
  });
});
