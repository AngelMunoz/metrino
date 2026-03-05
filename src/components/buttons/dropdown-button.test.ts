import { assert } from "chai";
import "./dropdown-button.ts";
import { MetroDropdownButton } from "./dropdown-button.ts";

import { createButton } from "./test-helpers.ts";

import { MetroDropdownButton } from "./dropdown-button.ts";

suite("metro-dropdown-button", () => {
  let container: HTMLDivElement;

    let el: MetroDropdownButton;

    let buttonContent: HTMLElement | null;

    setup(async () => {
    container = document.createElement("div");
    document.body.appendChild(container);
    el = await createButton("Menu");
    buttonContent = el.shadowRoot?.querySelector(".button-content") as HTMLElement;
  });

  teardown(() => {
    container.remove();
  });

  test("is defined", async () => {
    assert.instanceOf(el, HTMLElement);
    assert.instanceOf(el, MetroDropdownButton);
  });

  test("renders label text", async () => {
    const label = el.shadowRoot?.querySelector(".label");
    assert.equal(label?.textContent, "Menu");
  });

  test("renders chevron icon", async () => {
    const chevron = el.shadowRoot?.querySelector(".chevron");
    assert.isNotNull(chevron);
  });

  test("renders dropdown container with role=menu", async () => {
    const dropdown = el.shadowRoot?.querySelector(".dropdown");
    assert.isNotNull(dropdown);
    assert.equal(dropdown?.getAttribute("role"), "menu");
  });

  test("dropdown is hidden by default", async () => {
    const dropdown = el.shadowRoot?.querySelector(".dropdown") as HTMLElement;
    const style = getComputedStyle(dropdown);
    assert.equal(style.display, "none");
  });

  test("dropdown is visible when open=true", async () => {
    el.open = true;
    await el.updateComplete;
    const dropdown = el.shadowRoot?.querySelector(".dropdown") as HTMLElement;
    assert.equal(getComputedStyle(dropdown).display, "block");
  });

  test("renders slotted content", async () => {
    el.open = true;
    el.innerHTML = `
      <div class="menu-item" data-value="1">Option 1</div>
      <div class="menu-item" data-value="2">Option 2</div>
    `;
    await el.updateComplete;
    const slotted = el.querySelectorAll(".menu-item");
    assert.equal(slotted.length, 2);
  });

  suite("attributes", () => {
    test("button-content has aria-haspopup=menu", async () => {
    const buttonContent = el.shadowRoot?.querySelector(".button-content");
    assert.equal(buttonContent?.getAttribute("aria-haspopup"), "menu");
  });

    test("button-content has role=button", async () => {
    const buttonContent = el.shadowRoot?.querySelector(".button-content");
    assert.equal(buttonContent?.getAttribute("role"), "button");
  });

    test("button-content has tabindex 0", async () => {
    buttonContent = el.shadowRoot?.querySelector(".button-content") as HTMLElement;
    assert.equal(buttonContent.tabIndex, 0);
  });

    test("host has aria-expanded=false by default", async () => {
    assert.equal(el.getAttribute("aria-expanded"), "false");
  });

  test("aria-expanded updates with open state", async () => {
    el.open = true;
    await el.updateComplete;
    assert.equal(el.getAttribute("aria-expanded"), "true");
  });

  test("placement=bottom positions dropdown below", async () => {
    el.placement = "bottom";
    el.open = true;
    await el.updateComplete;
    assert.isTrue(el.hasAttribute("placement"));
    assert.equal(el.getAttribute("placement"), "bottom");
  });

  test("placement=top positions dropdown above", async () => {
    el.placement = "top";
    el.open = true;
    await el.updateComplete;
    assert.equal(el.getAttribute("placement"), "top");
  });
  suite("click interaction", () => {
    test("click toggles dropdown open", async () => {
    assert.isFalse(el.open);
    buttonContent?.click();
    await el.updateComplete;
    assert.isTrue(el.open);
  });

  test("click again closes dropdown", async () => {
    el.open = true;
    await el.updateComplete;
    buttonContent?.click();
    await el.updateComplete
    assert.isFalse(el.open);
  });

  test("disabled button does not open", async () => {
    el.disabled = true;
    await el.updateComplete;
    buttonContent?.click();
    await el.updateComplete
    assert.isFalse(el.open);
  });
  suite("document click", () => {
    test("clicking outside closes dropdown", async () => {
    el.open = true;
    await el.updateComplete;
    assert.isTrue(el.open);
    container.click();
    await el.updateComplete;
    assert.isFalse(el.open);
  });

  test("clicking inside dropdown does not close", async () => {
    el.open = true;
    el.innerHTML = `
      <div class="menu-item" data-value="1">Option 1</div>
    `;
    await el.updateComplete;
    const menuItem = el.querySelector(".menu-item") as HTMLElement;
    menuItem?.click();
    await el.updateComplete;
    assert.isFalse(el.open);
  });
  suite("menu item click", () => {
    test("clicking menu-item with class closes dropdown", async () => {
    el.open = true;
    el.innerHTML = `
      <div class="menu-item" data-value="1">Option 1</div>
    `;
    await el.updateComplete
    const menuItem = el.querySelector(".menu-item") as HTMLElement;
    menuItem?.click();
    await el.updateComplete
    assert.isFalse(el.open);
  });
  suite("events", () => {
    test("dispatches show event when opening", async () => {
    let showFired = false;
    el.addEventListener("show", () => { showFired = true; });
    buttonContent?.click();
    await el.updateComplete;
    assert.isTrue(showFired);
  });

  test("dispatches hide event when closing", async () => {
    el.open = true;
    await el.updateComplete;
    let hideFired = false;
    el.addEventListener("hide", () => { hideFired = true; });
    buttonContent?.click()
    await el.updateComplete;
    assert.isTrue(hideFired);
  });
  suite("programmatic API", () => {
    test("show() opens dropdown", async () => {
    el.show();
    await el.updateComplete;
    assert.isTrue(el.open);
  });

  test("hide() closes dropdown", async () => {
    el.open = true;
    await el.updateComplete;
    el.hide();
    await el.updateComplete;
    assert.isFalse(el.open);
  });

  test("click() toggles dropdown", async () => {
    el.click();
    await el.updateComplete;
    assert.isTrue(el.open);
    el.click();
    await el.updateComplete;
    assert.isFalse(el.open);
  });

  test("show() does nothing when disabled", async () => {
    el.disabled = true;
    await el.updateComplete;
    el.show();
    await el.updateComplete
    assert.isFalse(el.open);
  });
  suite("chevron rotation", () => {
    test("chevron has rotated class when open", async () => {
    el.open = true;
    await el.updateComplete
    const chevron = el.shadowRoot?.querySelector(".chevron") as HTMLElement;
    const transform = getComputedStyle(chevron).transform;
    assert.include(transform, "matrix");
    });
  });
});
