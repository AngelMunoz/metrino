import { assert } from "chai";
import {
  registerMetroRichTextBlock,
  MetroRichTextBlock,
} from "./rich-text-block.ts";

suite("metro-rich-text-block", () => {
  registerMetroRichTextBlock();
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createBlock(
    content = "",
    sanitize?: (html: string) => string,
  ): Promise<MetroRichTextBlock> {
    const el = document.createElement("metro-rich-text-block") as MetroRichTextBlock;
    if (sanitize) el.sanitize = sanitize;
    el.content = content;
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders trusted content as HTML", async () => {
    const el = await createBlock("<b>Bold</b>");

    assert.exists(el.shadowRoot?.querySelector(".content b"));
  });

  test("sanitizes content by default", async () => {
    const el = await createBlock(
      '<b>ok</b><img src=x onerror="window.__xss = true"><script>window.__xss = true</script>',
    );

    assert.exists(el.shadowRoot?.querySelector(".content b"));
    assert.notExists(el.shadowRoot?.querySelector(".content img"));
    assert.notExists(el.shadowRoot?.querySelector(".content script"));
  });

  test("drops executable link schemes by default", async () => {
    const el = await createBlock('<a href="javascript:alert(1)">link</a>');

    const link = el.shadowRoot?.querySelector(".content a");
    assert.exists(link);
    assert.notExists(link?.getAttribute("href"));
  });

  test("applies the sanitize hook before rendering", async () => {
    const el = await createBlock(
      '<b>ok</b><script>window.__xss = true</script>',
      (html) => html.replace(/<script[\s\S]*?<\/script>/gi, ""),
    );

    assert.exists(el.shadowRoot?.querySelector(".content b"));
    assert.notExists(el.shadowRoot?.querySelector("script"));
  });

  test("projects slotted content when content is empty", async () => {
    const el = document.createElement("metro-rich-text-block") as MetroRichTextBlock;
    const child = document.createElement("span");
    child.textContent = "slotted";
    el.appendChild(child);
    container.appendChild(el);
    await el.updateComplete;

    const slot = el.shadowRoot?.querySelector("slot");
    assert.isNotNull(slot);
    assert.lengthOf(slot?.assignedElements() ?? [], 1);
  });
});
