import { assert } from "chai";
import { registerMetroToast, MetroToast, ToastHost } from "./toast.ts";

suite("metro-toast", () => {
  registerMetroToast();
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createToast(): Promise<MetroToast> {
    const el = document.createElement("metro-toast") as MetroToast;
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders toast container", async () => {
    const el = await createToast();
    assert.exists(el.shadowRoot);
  });

  test("show() creates a toast", async () => {
    const el = await createToast();
    const id = el.show({ message: "Test message" });
    
    assert.isString(id);
    
    const toast = el.shadowRoot?.querySelector(".toast");
    assert.exists(toast);
  });

  test("show() with title displays title", async () => {
    const el = await createToast();
    el.show({ title: "Notification", message: "Test" });
    
    const title = el.shadowRoot?.querySelector(".toast-title");
    assert.equal(title?.textContent, "Notification");
  });

  test("show() displays message", async () => {
    const el = await createToast();
    el.show({ message: "Test message" });
    
    const message = el.shadowRoot?.querySelector(".toast-message");
    assert.equal(message?.textContent, "Test message");
  });

  test("severity applies correct class", async () => {
    const el = await createToast();
    el.show({ message: "Error", severity: "error" });
    
    const toast = el.shadowRoot?.querySelector(".toast");
    assert.isTrue(toast?.classList.contains("error"));
  });

  test("hide() removes toast", async () => {
    const el = await createToast();
    const id = el.show({ message: "Test" });
    
    el.hide(id);
    await new Promise(resolve => setTimeout(resolve, 350));
    
    const toast = el.shadowRoot?.querySelector(`#${id}`);
    assert.notExists(toast);
  });

  test("toast auto-hides after duration", async () => {
    const el = await createToast();
    el.show({ message: "Test", duration: 100 });
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const toasts = el.shadowRoot?.querySelectorAll(".toast");
    assert.equal(toasts?.length || 0, 0);
  });

  test("clearAll removes all toasts", async () => {
    const el = await createToast();
    el.show({ message: "One", duration: 0 });
    el.show({ message: "Two", duration: 0 });
    el.show({ message: "Three", duration: 0 });
    
    await el.updateComplete;
    
    el.clearAll();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const toasts = el.shadowRoot?.querySelectorAll(".toast");
    assert.equal(toasts?.length || 0, 0);
  });

  test("ToastHost show() lazily creates and attaches the host", async () => {
    const host = new ToastHost();
    const id = host.show({ message: "Host toast" });
    assert.isString(id);

    const el = document.querySelector("metro-toast") as MetroToast;
    assert.exists(el);
    const toast = el.shadowRoot?.querySelector(`#${id}`);
    assert.exists(toast);

    host.dispose();
  });

  test("ToastHost hide() dismisses a toast by id", async () => {
    const host = new ToastHost();
    const id = host.show({ message: "Host toast", duration: 0 });
    host.hide(id);

    await new Promise(resolve => setTimeout(resolve, 200));

    const el = document.querySelector("metro-toast") as MetroToast;
    assert.notExists(el.shadowRoot?.querySelector(`#${id}`));

    host.dispose();
  });

  test("ToastHost dispose() removes the host and recreates it on next show", async () => {
    const host = new ToastHost();
    host.show({ message: "Bye", duration: 0 });
    host.dispose();
    assert.notExists(document.querySelector("metro-toast"));

    host.show({ message: "Back again" });
    assert.exists(document.querySelector("metro-toast"));

    host.dispose();
  });
});
