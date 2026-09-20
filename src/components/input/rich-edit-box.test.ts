import { assert } from "chai";
import { registerMetroRichEditBox, MetroRichEditBox } from "./rich-edit-box.ts";

suite("metro-rich-edit-box", () => {
  registerMetroRichEditBox();
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  const stripImages = (html: string): string => html.replace(/<img[^>]*>/gi, "");

  async function createBox(value = ""): Promise<MetroRichEditBox> {
    const el = document.createElement("metro-rich-edit-box") as MetroRichEditBox;
    el.value = value;
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders value into the editor", async () => {
    const el = await createBox("<b>Bold</b>");

    assert.exists(el.shadowRoot?.querySelector(".editor b"));
  });

  test("sanitizes programmatic values by default", async () => {
    const el = await createBox(
      '<img src=x onerror="window.__xss = true"><b>ok</b>',
    );

    assert.notExists(el.shadowRoot?.querySelector(".editor img"));
    assert.exists(el.shadowRoot?.querySelector(".editor b"));
  });

  test("sanitizes pasted HTML", async () => {
    const el = await createBox();
    const editor = el.shadowRoot?.querySelector(".editor");
    const event = new Event("paste", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "clipboardData", {
      value: {
        getData: (type: string) =>
          type === "text/html"
            ? '<img src=x onerror="window.__xss = true"><b>ok</b>'
            : "ok",
      },
    });

    editor?.dispatchEvent(event);

    assert.notExists(el.shadowRoot?.querySelector(".editor img"));
    assert.exists(el.shadowRoot?.querySelector(".editor b"));
    assert.include(el.value, "<b>ok</b>");
  });

  test("applies the sanitize hook on first render", async () => {
    const el = document.createElement("metro-rich-edit-box") as MetroRichEditBox;
    el.sanitize = stripImages;
    el.value = '<img src=x onerror="window.__xss = true">';
    container.appendChild(el);
    await el.updateComplete;

    assert.notExists(el.shadowRoot?.querySelector(".editor img"));
  });

  test("applies the sanitize hook to values assigned later", async () => {
    const el = await createBox();
    el.sanitize = stripImages;
    el.value = '<img src=x onerror="window.__xss = true">';
    await el.updateComplete;

    assert.notExists(el.shadowRoot?.querySelector(".editor img"));
  });
});
