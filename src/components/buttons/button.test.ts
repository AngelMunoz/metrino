import { assert } from "chai";
import "./button.ts";
import { MetroButton } from "./button.ts";

suite("metro-button", () => {
  let button: MetroButton;

  setup(async () => {
    button = document.createElement("metro-button") as MetroButton;
    document.body.appendChild(button);
    await button.updateComplete;
  });

  teardown(() => {
    button.remove();
  });

  test("is defined", () => {
    assert.instanceOf(button, HTMLElement);
    assert.instanceOf(button, MetroButton);
  });

  test("has default role of button", () => {
    assert.equal(button.getAttribute("role"), "button");
  });

  test("has default tabindex of 0", () => {
    assert.equal(button.getAttribute("tabindex"), "0");
  });

  test("disabled property sets attribute", async () => {
    button.disabled = true;
    await button.updateComplete;
    assert.isTrue(button.hasAttribute("disabled"));
    assert.equal(button.getAttribute("aria-disabled"), "true");
    assert.equal(button.getAttribute("tabindex"), "-1");
  });

  test("disabled property removes attribute when false", async () => {
    button.disabled = true;
    await button.updateComplete;
    button.disabled = false;
    await button.updateComplete;
    assert.isFalse(button.hasAttribute("disabled"));
    assert.isFalse(button.hasAttribute("aria-disabled"));
    assert.equal(button.getAttribute("tabindex"), "0");
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
    button.click();
    assert.isFalse(clicked);
  });

  test("Space key triggers click", () => {
    let clicked = false;
    button.addEventListener("click", () => { clicked = true; });
    const event = new KeyboardEvent("keydown", { key: " " });
    button.dispatchEvent(event);
    assert.isTrue(clicked);
  });

  test("Enter key triggers click", () => {
    let clicked = false;
    button.addEventListener("click", () => { clicked = true; });
    const event = new KeyboardEvent("keydown", { key: "Enter" });
    button.dispatchEvent(event);
    assert.isTrue(clicked);
  });
});
