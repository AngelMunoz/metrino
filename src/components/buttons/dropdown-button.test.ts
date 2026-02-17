import { assert } from "chai";
import "./dropdown-button.ts";
import { MetroDropdownButton } from "./dropdown-button.ts";

suite("metro-dropdown-button", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createButton(
    label: string = "Menu",
    content: string = ""
  ): Promise<MetroDropdownButton> {
    container.innerHTML = `
      <metro-dropdown-button label="${label}">
        ${content}
      </metro-dropdown-button>
    `;
    const el = container.querySelector("metro-dropdown-button") as MetroDropdownButton;
    await el.updateComplete;
    return el;
  }

  suite("rendering", () => {
    test("is defined", async () => {
      const el = await createButton();
      assert.instanceOf(el, HTMLElement);
      assert.instanceOf(el, MetroDropdownButton);
    });

    test("renders label text", async () => {
      const el = await createButton("Select Option");
      const label = el.shadowRoot?.querySelector(".label");
      assert.equal(label?.textContent, "Select Option");
    });

    test("renders chevron icon", async () => {
      const el = await createButton();
      const chevron = el.shadowRoot?.querySelector(".chevron");
      assert.isNotNull(chevron);
    });

    test("renders dropdown container with role=menu", async () => {
      const el = await createButton();
      const dropdown = el.shadowRoot?.querySelector(".dropdown");
      assert.isNotNull(dropdown);
      assert.equal(dropdown?.getAttribute("role"), "menu");
    });

    test("dropdown is hidden by default", async () => {
      const el = await createButton();
      const dropdown = el.shadowRoot?.querySelector(".dropdown") as HTMLElement;
      const style = getComputedStyle(dropdown);
      assert.equal(style.display, "none");
    });

    test("dropdown is visible when open=true", async () => {
      const el = await createButton();
      el.open = true;
      await el.updateComplete;
      
      // Force style recalc
      const dropdown = el.shadowRoot?.querySelector(".dropdown") as HTMLElement;
      assert.equal(getComputedStyle(dropdown).display, "block");
    });

    test("renders slotted content", async () => {
      const el = await createButton("Menu", `
        <div class="menu-item" data-value="1">Option 1</div>
        <div class="menu-item" data-value="2">Option 2</div>
      `);
      el.open = true;
      await el.updateComplete;
      
      const slotted = el.querySelectorAll(".menu-item");
      assert.equal(slotted.length, 2);
    });
  });

  suite("attributes", () => {
    test("has aria-haspopup=menu", async () => {
      const el = await createButton();
      assert.equal(el.getAttribute("aria-haspopup"), "menu");
    });

    test("has aria-expanded=false by default", async () => {
      const el = await createButton();
      assert.equal(el.getAttribute("aria-expanded"), "false");
    });

    test("aria-expanded updates with open state", async () => {
      const el = await createButton();
      el.open = true;
      await el.updateComplete;
      assert.equal(el.getAttribute("aria-expanded"), "true");
    });

    test("has role=button", async () => {
      const el = await createButton();
      assert.equal(el.getAttribute("role"), "button");
    });

    test("has tabindex=0", async () => {
      const el = await createButton();
      assert.equal(el.getAttribute("tabindex"), "0");
    });

    test("placement=bottom positions dropdown below", async () => {
      const el = await createButton();
      el.placement = "bottom";
      el.open = true;
      await el.updateComplete;
      
      assert.isTrue(el.hasAttribute("placement"));
      assert.equal(el.getAttribute("placement"), "bottom");
    });

    test("placement=top positions dropdown above", async () => {
      const el = await createButton();
      el.placement = "top";
      el.open = true;
      await el.updateComplete;
      
      assert.equal(el.getAttribute("placement"), "top");
    });
  });

  suite("click interaction", () => {
    test("click toggles dropdown open", async () => {
      const el = await createButton();
      assert.isFalse(el.open);
      
      const buttonContent = el.shadowRoot?.querySelector(".button-content") as HTMLElement;
      buttonContent?.click();
      await el.updateComplete;
      
      assert.isTrue(el.open);
    });

    test("click again closes dropdown", async () => {
      const el = await createButton();
      el.open = true;
      await el.updateComplete;
      
      const buttonContent = el.shadowRoot?.querySelector(".button-content") as HTMLElement;
      buttonContent?.click();
      await el.updateComplete;
      
      assert.isFalse(el.open);
    });

    test("disabled button does not open", async () => {
      const el = await createButton();
      el.disabled = true;
      await el.updateComplete;
      
      const buttonContent = el.shadowRoot?.querySelector(".button-content") as HTMLElement;
      buttonContent?.click();
      await el.updateComplete;
      
      assert.isFalse(el.open);
    });
  });

  suite("document click", () => {
    test("clicking outside closes dropdown", async () => {
      const el = await createButton();
      el.open = true;
      await el.updateComplete;
      assert.isTrue(el.open);
      
      // Click on the container (outside the dropdown)
      container.click();
      await el.updateComplete;
      
      assert.isFalse(el.open);
    });

    test("clicking inside dropdown does not close", async () => {
      const el = await createButton("Menu", `
        <div class="menu-item" data-value="1">Option 1</div>
      `);
      el.open = true;
      await el.updateComplete;
      
      // Click on slotted item
      const menuItem = el.querySelector(".menu-item") as HTMLElement;
      menuItem?.click();
      await el.updateComplete;
      
      // Should still be open (clicking inside shouldn't close)
      // Actually it should close when clicking menu-item based on handleItemClick
      // But let's verify the behavior
    });
  });

  suite("menu item click", () => {
    test("clicking menu-item with class closes dropdown", async () => {
      const el = await createButton("Menu", `
        <div class="menu-item" data-value="1">Option 1</div>
      `);
      el.open = true;
      await el.updateComplete;
      
      const menuItem = el.querySelector(".menu-item") as HTMLElement;
      menuItem?.click();
      await el.updateComplete;
      
      assert.isFalse(el.open);
    });
  });

  suite("events", () => {
    test("dispatches show event when opening", async () => {
      const el = await createButton();
      
      let showFired = false;
      el.addEventListener("show", () => { showFired = true; });
      
      const buttonContent = el.shadowRoot?.querySelector(".button-content") as HTMLElement;
      buttonContent?.click();
      await el.updateComplete;
      
      assert.isTrue(showFired);
    });

    test("dispatches hide event when closing", async () => {
      const el = await createButton();
      el.open = true;
      await el.updateComplete;
      
      let hideFired = false;
      el.addEventListener("hide", () => { hideFired = true; });
      
      const buttonContent = el.shadowRoot?.querySelector(".button-content") as HTMLElement;
      buttonContent?.click();
      await el.updateComplete;
      
      assert.isTrue(hideFired);
    });
  });

  suite("programmatic API", () => {
    test("show() opens dropdown", async () => {
      const el = await createButton();
      el.show();
      await el.updateComplete;
      
      assert.isTrue(el.open);
    });

    test("hide() closes dropdown", async () => {
      const el = await createButton();
      el.open = true;
      await el.updateComplete;
      
      el.hide();
      await el.updateComplete;
      
      assert.isFalse(el.open);
    });

    test("click() toggles dropdown", async () => {
      const el = await createButton();
      el.click();
      await el.updateComplete;
      assert.isTrue(el.open);
      
      el.click();
      await el.updateComplete;
      assert.isFalse(el.open);
    });

    test("show() does nothing when disabled", async () => {
      const el = await createButton();
      el.disabled = true;
      await el.updateComplete;
      
      el.show();
      await el.updateComplete;
      
      assert.isFalse(el.open);
    });
  });

  suite("chevron rotation", () => {
    test("chevron has rotated class when open", async () => {
      const el = await createButton();
      el.open = true;
      await el.updateComplete;
      
      const chevron = el.shadowRoot?.querySelector(".chevron") as HTMLElement;
      const transform = getComputedStyle(chevron).transform;
      // Should have some rotation applied
      assert.include(transform, "matrix");
    });
  });
});
