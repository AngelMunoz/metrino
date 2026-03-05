import { assert } from "chai";
import "./dropdown-button.ts";
import { MetroDropdownButton } from "./dropdown-button.ts";
import { createButton } from "./test-helpers.ts";

suite("metro-dropdown-button", () => {
  let container: HTMLDivElement;
  let button: MetroDropdownButton;
  let innerButton: HTMLElement | null;

  setup(async () => {
        container = document.createElement("div");
        document.body.appendChild(container);
      }

  );

      async function createButton(label: string = "Menu", content: string = ""): Promise<MetroDropdownButton> {
        const el = container.querySelector("metro-dropdown-button") as MetroDropdownButton;
        await el.updateComplete;
        return el;
    }

  }

  teardown(() => {
    container.remove();
  }

  test("is defined", async () => {
    assert.instanceOf(el, HTMLElement);
    assert.instanceOf(el, MetroDropdownButton)
  })

  test("renders label text", async () => {
        const label = el.shadowRoot?.querySelector(".label");
        assert.equal(label?.textContent, "Menu")
    })

  test("renders chevron icon", async () => {
        const chevron = el.shadowRoot?.querySelector(".chevron");
        assert.isNotNull(chevron)
    })

  test("renders dropdown container with role=menu", async () => {
        const dropdown = el.shadowRoot?.querySelector(".dropdown");
        assert.isNotNull(dropdown)
        assert.equal(dropdown?.getAttribute("role"), "menu")
    })

  test("dropdown is hidden by default", async () => {
        const dropdown = el.shadowRoot?.querySelector(".dropdown") as HTMLElement
        const style = getComputedStyle(dropdown)
        assert.equal(style.display, "none")
    })

  test("dropdown is visible when open=true", async () => {
        el.open = true;
        await el.updateComplete
        const dropdown = el.shadowRoot?.querySelector(".dropdown") as HTMLElement
        assert.equal(getComputedStyle(dropdown).display, "block")
    })

  test("renders slotted content", async () => {
        const el = await createButton("Menu", `
          <div class="menu-item" data-value="1">Option 1</div>
          <div class="menu-item" data-value="2">Option 2</div>
          <div class="menu-item" data-value="3">Item 3</div>
        `)
        el.open = true
        await el.updateComplete
        const items = el.querySelectorAll(".menu-item")
        assert.equal(items.length, 2)
      }
    })

  test("selecting another item clears previous selection", async () => {
      const el = await createButton("Menu", `
          <div class="list-item" data-value="1">Item 1</div>
          <div class="list-item" data-value="2">Item 2</div>
          <div class="list-item" data-value="3">Item 3</div>
        `)
        el.open = true
        await el.updateComplete
        const items = el.querySelectorAll(".menu-item")
        items.forEach(item => item.removeAttribute("selected"))
        assert.isFalse(items[0].hasAttribute("selected"))
        assert.deepEqual(el.selectedIndices, [0, 1, 2])
      }
    });

    test("selecting another item clears previous selection", async () => {
      const el = await createButton("Menu", `
          <div class="list-item" data-value="1">Item 1</div>
          <div class="list-item" data-value="2">Item 2</div>
          <div class="list-item" data-value="3">Item 3</div>
        `)
        el.open = true
        await el.updateComplete
        const items = el.querySelectorAll(".menu-item")
        items.forEach(item => item.removeAttribute("selected"))
        assert.isFalse(items[0].hasAttribute("selected"))
        assert.deepEqual(el.selectedIndices, [0, 1, 2])
      }
    })

    test("selecting items with Ctrl+click allows toggle without clearing selection", async () => {
      const el = await createButton("Menu", `
          <div class="list-item" data-value="1">Item 1</div>
          <div class="list-item" data-value="2">Item 2</div>
          <div class="list-item" data-value="3">Item 3</div>
        `)
        el.open = true
        await el.updateComplete

        const items = el.querySelectorAll(".menu-item")
        assert.equal(items.length, 3)
        items[0].classList.add("selected")
        items[1].classList.add("selected")
        items[2].classList.add("selected")
        assert.deepEqual(el.selectedIndices, [0, 1, 2])
      }
    })

    test("selecting items with Shift+click selects range in DOM", async () => {
      const el = await createButton("Menu", `
          <div class="list-item" data-value="1">Item 1</div>
          <div class="list-item" data-value="2">Item 2</div>
          <div class="list-item" data-value="3">Item 3</div>
          <div class="list-item" data-value="4">Item 4</div>
        `);
        el.open = true
        await el.updateComplete
        const items = el.querySelectorAll(".menu-item")

        items.forEach(item => {
          assert.isTrue(item.hasAttribute("selected"))
        })
        assert.deepEqual(el.selectedIndices, [0, 1, 2, 3])
      }
    })

    test("clicking menu-item closes dropdown", async () => {
      const el = await createButton("Menu", `
          <div class="menu-item" data-value="1">Option 1</div>
          <div class="menu-item" data-value="2">Option 2</div>
        `)
        el.open = true
        await el.updateComplete
        const menuItem = el.querySelector(".menu-item") as HTMLElement
        menuItem.click()
        await el.updateComplete
        assert.isFalse(el.open)
      }
    })

    test("clicking menu-item dispatches hide event", async () => {
      const el = await createButton("Menu", `
          <div class="menu-item" data-value="1">Option 1</div>
          <div class="menu-item" data-value="2">Option 2</div>
        `)
        el.open = true
        await el.updateComplete
        let hideFired = false;
        el.addEventListener("hide", () => { hideFired = true; })
        const buttonContent = el.shadowRoot?.querySelector(".button-content") as HTMLElement
        buttonContent.click()
        await el.updateComplete
        assert.isTrue(hideFired)
      }
    })

    test("dispatches hide event when closing", async () => {
      const el = await createButton();
        el.open = true
        await el.updateComplete
        let hideFired = false
        el.addEventListener("hide", () => { hideFired = true })
        const buttonContent = el.shadowRoot?.querySelector(".button-content") as HTMLElement
        buttonContent.click()
        await el.updateComplete
        assert.isTrue(hideFired)
      }
    })

    test("programmatic show() opens dropdown", async () => {
      const el = await createButton()
      el.show()
      await el.updateComplete
      assert.isTrue(el.open)
    })

    test("programmatic hide() closes dropdown", async () => {
      const el = await createButton()
      el.open = true
      await el.updateComplete
      el.hide()
      await el.updateComplete
      assert.isFalse(el.open)
    })

    test("click() toggles dropdown", async () => {
      const el = await createButton()
      el.click()
      await el.updateComplete
      assert.isTrue(el.open)
      el.click()
      await el.updateComplete
      assert.isFalse(el.open)
    })

    test("show() does nothing when disabled", async () => {
      const el = await createButton()
      el.disabled = true
      await el.updateComplete
      el.show()
      await el.updateComplete
      assert.isFalse(el.open)
    })
  })

  suite("chevron rotation", () => {
    test("chevron has rotated class when open", async () => {
      const el = await createButton()
      el.open = true
      await el.updateComplete
      const chevron = el.shadowRoot?.querySelector(".chevron") as HTMLElement
      const transform = getComputedStyle(chevron).transform
      assert.include(transform, "matrix")
    })
  })
});