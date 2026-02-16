import { assert } from "chai";
import "./message-dialog.ts";
import { MetroMessageDialog } from "./message-dialog.ts";

suite("metro-message-dialog", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createDialog(attrs: Record<string, string> = {}): Promise<MetroMessageDialog> {
    const el = document.createElement("metro-message-dialog") as MetroMessageDialog;
    el.textContent = "Message content";
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders dialog", async () => {
    const el = await createDialog();
    const dialog = el.shadowRoot?.querySelector(".dialog");
    assert.exists(dialog);
  });

  test("is closed by default", async () => {
    const el = await createDialog();
    assert.isFalse(el.open);
  });

  test("open attribute displays dialog", async () => {
    const el = await createDialog({ open: "" });
    assert.isTrue(el.open);
  });

  test("title is displayed when dialog is open", async () => {
    const el = await createDialog({ title: "Alert" });
    el.show();
    await el.updateComplete;
    
    const title = el.shadowRoot?.querySelector(".dialog-header");
    assert.equal(title?.textContent, "Alert");
  });

  test("show() opens dialog", async () => {
    const el = await createDialog();
    el.show();
    await el.updateComplete;
    assert.isTrue(el.open);
  });

  test("clicking backdrop closes dialog", async () => {
    const el = await createDialog();
    el.show();
    await el.updateComplete;
    
    const backdrop = el.shadowRoot?.querySelector(".backdrop") as HTMLElement;
    backdrop.click();
    await el.updateComplete;
    
    assert.isFalse(el.open);
  });

  test("has dialog role", async () => {
    const el = await createDialog();
    const dialog = el.shadowRoot?.querySelector('[role="dialog"]');
    assert.exists(dialog);
  });
});
