import { assert } from "chai";
import "./content-dialog.ts";
import { MetroContentDialog } from "./content-dialog.ts";

suite("metro-content-dialog", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createDialog(attrs: Record<string, string> = {}): Promise<MetroContentDialog> {
    const el = document.createElement("metro-content-dialog") as MetroContentDialog;
    el.textContent = "Dialog content here";
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders dialog element", async () => {
    const el = await createDialog();
    const dialog = el.shadowRoot?.querySelector(".dialog");
    assert.exists(dialog);
  });

  test("is closed by default", async () => {
    const el = await createDialog();
    assert.isFalse(el.open);
  });

  test("show() opens dialog", async () => {
    const el = await createDialog();
    await el.show();
    assert.isTrue(el.open);
  });

  test("title is displayed", async () => {
    const el = await createDialog({ title: "Dialog Title" });
    await el.show();
    
    const title = el.shadowRoot?.querySelector(".dialog-header");
    assert.equal(title?.textContent, "Dialog Title");
  });

  test("closable shows close button by default", async () => {
    const el = await createDialog();
    await el.show();
    
    const closeBtn = el.shadowRoot?.querySelector(".close-btn");
    assert.exists(closeBtn);
  });

  test("clicking close button closes dialog", async () => {
    const el = await createDialog();
    await el.show();

    assert.isTrue(el.open);

    const closeBtn = el.shadowRoot?.querySelector(".close-btn") as HTMLElement;
    closeBtn.click();
    // hide() uses startViewTransition which sets open=false in callback
    // In headless, fallback path sets open=false directly
    await new Promise<void>((resolve) => {
      const check = (): void => {
        if (!el.open) {
          void el.updateComplete.then(() => resolve());
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    });

    assert.isFalse(el.open);
  });

  test("clicking backdrop closes dialog when closable", async () => {
    const el = await createDialog();
    await el.show();

    assert.isTrue(el.open);

    const backdrop = el.shadowRoot?.querySelector(".backdrop") as HTMLElement;
    backdrop.click();
    await new Promise<void>((resolve) => {
      const check = (): void => {
        if (!el.open) {
          void el.updateComplete.then(() => resolve());
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    });

    assert.isFalse(el.open);
  });

  test("dispatches show event", async () => {
    const el = await createDialog();
    let shown = false;
    el.addEventListener("show", () => { shown = true; });
    
    await el.show();
    
    assert.isTrue(shown);
  });

  test("dispatches close event", async () => {
    const el = await createDialog();
    await el.show();

    let closed = false;
    el.addEventListener("close", () => { closed = true; });

    const closeBtn = el.shadowRoot?.querySelector(".close-btn") as HTMLElement;
    closeBtn.click();

    assert.isTrue(closed);
  });

  test("Escape key closes dialog when closable", async () => {
    const el = await createDialog();
    await el.show();

    const dialog = el.shadowRoot?.querySelector(".dialog") as HTMLElement;
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await new Promise<void>((resolve) => {
      const check = (): void => {
        if (!el.open) {
          void el.updateComplete.then(() => resolve());
        } else {
          requestAnimationFrame(check);
        }
      };
      requestAnimationFrame(check);
    });

    assert.isFalse(el.open);
  });

  test("Escape key does nothing when not closable", async () => {
    const el = document.createElement("metro-content-dialog") as MetroContentDialog;
    el.closable = false;
    el.textContent = "Dialog content";
    container.appendChild(el);
    await el.updateComplete;

    await el.show();

    const dialog = el.shadowRoot?.querySelector(".dialog") as HTMLElement;
    dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await el.updateComplete;

    assert.isTrue(el.open);
  });

  test("close button has aria-label", async () => {
    const el = await createDialog();
    await el.show();
    
    const closeBtn = el.shadowRoot?.querySelector(".close-btn");
    assert.equal(closeBtn?.getAttribute("aria-label"), "Close");
  });

  test("dialog has aria-labelledby when title provided", async () => {
    const el = await createDialog({ title: "My Title" });
    await el.show();
    
    const dialog = el.shadowRoot?.querySelector(".dialog");
    const header = el.shadowRoot?.querySelector(".dialog-header");
    
    assert.equal(dialog?.getAttribute("aria-labelledby"), "dialog-title");
    assert.equal(header?.id, "dialog-title");
  });

  test("dialog has empty aria-labelledby when no title", async () => {
    const el = await createDialog();
    await el.show();
    
    const dialog = el.shadowRoot?.querySelector(".dialog");
    assert.equal(dialog?.getAttribute("aria-labelledby"), "");
  });
});
