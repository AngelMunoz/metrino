import { assert } from "chai";
import "./hyperlink-button.ts";
import { MetroHyperlinkButton } from "./hyperlink-button.ts";

suite("metro-hyperlink-button", () => {
  let button: MetroHyperlinkButton;

  setup(async () => {
    button = document.createElement("metro-hyperlink-button") as MetroHyperlinkButton;
    document.body.appendChild(button);
    await button.updateComplete;
  });

  teardown(() => {
    button.remove();
  });

  test("is defined", () => {
    assert.instanceOf(button, HTMLElement);
    assert.instanceOf(button, MetroHyperlinkButton);
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

  test("href property sets role to link", async () => {
    button.href = "https://example.com";
    await button.updateComplete;
    assert.equal(button.getAttribute("role"), "link");
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
