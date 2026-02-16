import { assert } from "chai";
import "./text-block.ts";
import { MetroTextBlock } from "./text-block.ts";

suite("metro-text-block", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createTextBlock(attrs: Record<string, string> = {}, text = "Hello"): Promise<MetroTextBlock> {
    const el = document.createElement("metro-text-block") as MetroTextBlock;
    el.textContent = text;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  test("renders text content", async () => {
    const el = await createTextBlock({}, "Test text");
    assert.equal(el.textContent, "Test text");
  });

  test("bold attribute works", async () => {
    const el = await createTextBlock({ bold: "" });
    assert.isTrue(el.bold);
  });

  test("italic attribute works", async () => {
    const el = await createTextBlock({ italic: "" });
    assert.isTrue(el.italic);
  });

  test("underline attribute works", async () => {
    const el = await createTextBlock({ underline: "" });
    assert.isTrue(el.underline);
  });

  test("strikethrough attribute works", async () => {
    const el = await createTextBlock({ strikethrough: "" });
    assert.isTrue(el.strikethrough);
  });

  test("wrap attribute works", async () => {
    const el = await createTextBlock({ wrap: "" });
    assert.isTrue(el.wrap);
  });

  test("default values are false", async () => {
    const el = await createTextBlock();
    assert.isFalse(el.bold);
    assert.isFalse(el.italic);
    assert.isFalse(el.underline);
    assert.isFalse(el.strikethrough);
    assert.isFalse(el.wrap);
  });
});
