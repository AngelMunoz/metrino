import { assert } from "chai";
import "./hyperlink-button.ts";
import { MetroHyperlinkButton } from "./hyperlink-button.ts";

suite("metro-hyperlink-button", () => {
  let button: MetroHyperlinkButton;
  let innerButton: HTMLElement | null;

  setup(async () => {
    button = document.createElement("metro-hyperlink-button") as MetroHyperlinkButton;
    document.body.appendChild(button);
    await button.updateComplete;
    innerButton = button.shadowRoot?.querySelector(".button") ?? null;
  });

  teardown(() => {
    button.remove();
  });

  test("is defined", () => {
    assert.instanceOf(button, HTMLElement);
    assert.instanceOf(button, MetroHyperlinkButton);
  });

  test("inner element has role of button by default", () => {
    assert.equal(innerButton?.getAttribute("role"), "button");
  });

  test("inner element has tabindex 0 by default", () => {
    assert.equal((innerButton as HTMLAnchorElement)?.tabIndex, 0);
  });

  test("inner element has tabindex -1 when disabled", async () => {
    button.disabled = true;
    await button.updateComplete;
    assert.equal((innerButton as HTMLAnchorElement)?.tabIndex, -1);
  });

  test("inner element has tabindex 0 when not disabled", async () => {
    button.disabled = true;
    await button.updateComplete;
    button.disabled = false;
    await button.updateComplete;
    assert.equal((innerButton as HTMLAnchorElement)?.tabIndex, 0);
  });

  test("href property sets role to link", async () => {
    button.href = "https://example.com";
    await button.updateComplete;
    assert.equal(innerButton?.getAttribute("role"), "link");
  });

  test("has default tabindex of 0", () => {
    assert.equal(innerButton?.getAttribute("tabindex"), "0");
  });

  test("disabled property sets attribute", async () => {
    button.disabled = true;
    await button.updateComplete;
    assert.isTrue(button.hasAttribute("disabled"));
    assert.equal(button.getAttribute("aria-disabled"), "true");
    assert.equal(innerButton?.getAttribute("tabindex"), "-1");
  });

  test("href property sets role to link", async () => {
    button.href = "https://example.com";
    await button.updateComplete;
    assert.equal(innerButton?.getAttribute("role"), "link");
  });

  test("target property is stored", async () => {
    button.target = "_blank";
    await button.updateComplete;
    assert.equal(button.target, "_blank");
  });

  test("click is prevented when disabled", async () => {
    let clicked = false;
    button.addEventListener("click", () => { clicked = true; });
    button.disabled = true;
    await button.updateComplete;
    innerButton?.click();
    assert.isFalse(clicked);
  });

  test("Space key triggers click", () => {
    let clicked = false;
    button.addEventListener("click", () => { clicked = true; });
    const event = new KeyboardEvent("keydown", { key: " ", bubbles: true });
    innerButton?.dispatchEvent(event);
    assert.isTrue(clicked);
  });

  test("Enter key triggers click", () => {
    let clicked = false;
    button.addEventListener("click", () => { clicked = true; });
    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true });
    innerButton?.dispatchEvent(event);
    assert.isTrue(clicked);
  });
});
