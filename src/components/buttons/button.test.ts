import { assert } from "chai";
import "./button.ts";
import { MetroButton } from "./button.ts";

suite("metro-button", () => {
  let button: MetroButton;
  let innerButton: HTMLButtonElement | null;

  setup(async () => {
    button = document.createElement("metro-button") as MetroButton;
    document.body.appendChild(button);
    await button.updateComplete;
    innerButton = button.shadowRoot?.querySelector("button") ?? null;
  });

  teardown(() => {
    button.remove();
  });

  test("is defined", () => {
    assert.instanceOf(button, HTMLElement);
    assert.instanceOf(button, MetroButton);
  });

  test("inner button has role of button", () => {
    assert.equal(innerButton?.getAttribute("role"), "button");
  });

  test("inner button has tabindex of 0 by default", () => {
    assert.equal(innerButton?.tabIndex, 0);
  });

  test("inner button has tabindex -1 when disabled", async () => {
    button.disabled = true;
    await button.updateComplete;
    assert.equal(innerButton?.tabIndex, -1);
  });

  test("inner button has tabindex 0 when not disabled", async () => {
    button.disabled = true;
    await button.updateComplete;
    button.disabled = false;
    await button.updateComplete;
    assert.equal(innerButton?.tabIndex, 0);
  });

  test("disabled property sets attribute", async () => {
    button.disabled = true;
    await button.updateComplete;
    assert.isTrue(button.hasAttribute("disabled"));
    assert.equal(button.getAttribute("aria-disabled"), "true");
    assert.equal(innerButton?.getAttribute("tabindex"), "-1");
  });

  test("disabled property removes attribute when false", async () => {
    button.disabled = true;
    await button.updateComplete;
    button.disabled = false;
    await button.updateComplete;
    assert.isFalse(button.hasAttribute("disabled"));
    assert.isFalse(button.hasAttribute("aria-disabled"));
    assert.equal(innerButton?.getAttribute("tabindex"), "0");
  });

  test("accent property sets attribute", async () => {
    button.accent = "#ff0000";
    await button.updateComplete;
    assert.equal(button.getAttribute("accent"), "#ff0000");
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
