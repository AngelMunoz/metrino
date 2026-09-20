import { assert } from "chai";
import { registerMetroButton, MetroButton } from "./button.ts";
import { registerMetroTextBox, MetroTextBox } from "../input/text-box.ts";

suite("metro-button", () => {
  registerMetroButton();
  registerMetroTextBox();
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

  test("default type is submit", () => {
    assert.equal(button.type, "submit");
  });

  test("clicking submits the owner form", async () => {
    const form = document.createElement("form");
    const input = document.createElement("metro-text-box") as MetroTextBox;
    input.setAttribute("name", "field");
    form.appendChild(input);
    const submitButton = document.createElement("metro-button") as MetroButton;
    form.appendChild(submitButton);
    document.body.appendChild(form);

    await input.updateComplete;
    await submitButton.updateComplete;

    let submitted = false;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitted = true;
    });

    const inner = submitButton.shadowRoot?.querySelector("button") as HTMLElement;
    assert.exists(inner);
    inner.click();
    assert.isTrue(submitted);

    form.remove();
  });

  test("keyboard activation submits the owner form", async () => {
    const form = document.createElement("form");
    const submitButton = document.createElement("metro-button") as MetroButton;
    form.appendChild(submitButton);
    document.body.appendChild(form);
    await submitButton.updateComplete;

    let submitted = false;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitted = true;
    });

    const inner = submitButton.shadowRoot?.querySelector("button") as HTMLElement;
    inner.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    assert.isTrue(submitted);

    form.remove();
  });

  test("type button does not submit the owner form", async () => {
    const form = document.createElement("form");
    const plainButton = document.createElement("metro-button") as MetroButton;
    plainButton.setAttribute("type", "button");
    form.appendChild(plainButton);
    document.body.appendChild(form);
    await plainButton.updateComplete;

    let submitted = false;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitted = true;
    });

    const inner = plainButton.shadowRoot?.querySelector("button") as HTMLElement;
    inner.click();
    assert.isFalse(submitted);

    form.remove();
  });

  test("disabled button does not submit the owner form", async () => {
    const form = document.createElement("form");
    const submitButton = document.createElement("metro-button") as MetroButton;
    submitButton.disabled = true;
    form.appendChild(submitButton);
    document.body.appendChild(form);
    await submitButton.updateComplete;

    let submitted = false;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitted = true;
    });

    const inner = submitButton.shadowRoot?.querySelector("button") as HTMLElement;
    inner.click();
    assert.isFalse(submitted);

    form.remove();
  });

  test("clicking a reset button resets the owner form", async () => {
    const form = document.createElement("form");
    const input = document.createElement("metro-text-box") as MetroTextBox;
    input.setAttribute("name", "field");
    form.appendChild(input);
    const resetButton = document.createElement("metro-button") as MetroButton;
    resetButton.setAttribute("type", "reset");
    form.appendChild(resetButton);
    document.body.appendChild(form);

    await input.updateComplete;
    await resetButton.updateComplete;

    input.value = "typed";
    await input.updateComplete;
    assert.equal(input.value, "typed");

    const inner = resetButton.shadowRoot?.querySelector("button") as HTMLElement;
    inner.click();
    await input.updateComplete;
    assert.equal(input.value, "");

    form.remove();
  });
});
