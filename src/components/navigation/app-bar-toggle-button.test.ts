import { assert } from "chai";
import "./app-bar-toggle-button.ts";
import { MetroAppBarToggleButton } from "./app-bar-toggle-button.ts";

suite("metro-app-bar-toggle-button", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createButton(html: string): Promise<MetroAppBarToggleButton> {
    container.innerHTML = html;
    const el = container.querySelector("metro-app-bar-toggle-button") as MetroAppBarToggleButton;
    await el.updateComplete;
    return el;
  }

  suite("rendering", () => {
    test("is defined", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      assert.instanceOf(el, HTMLElement);
      assert.instanceOf(el, MetroAppBarToggleButton);
    });

    test("renders icon circle container", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle");
      assert.isNotNull(iconCircle);
    });

    test("icon circle has role=checkbox", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle");
      assert.equal(iconCircle?.getAttribute("role"), "checkbox");
    });

    test("icon circle has tabindex=0", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle");
      assert.equal(iconCircle?.getAttribute("tabindex"), "0");
    });

    test("renders icon when icon property is set", async () => {
      const el = await createButton(`<metro-app-bar-toggle-button icon="home"></metro-app-bar-toggle-button>`);
      const icon = el.shadowRoot?.querySelector("metro-icon");
      assert.isNotNull(icon);
      assert.include(icon?.getAttribute("icon"), "home");
    });

    test("renders slot when no icon property", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      const slot = el.shadowRoot?.querySelector("slot");
      assert.isNotNull(slot);
    });

    test("renders label when provided", async () => {
      const el = await createButton(`<metro-app-bar-toggle-button label="Home"></metro-app-bar-toggle-button>`);
      const label = el.shadowRoot?.querySelector(".label");
      assert.isNotNull(label);
      assert.include(label?.textContent, "Home");
    });

    test("does not render label element when not provided", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      const label = el.shadowRoot?.querySelector(".label");
      assert.isNull(label);
    });

    test("icon reflects to attribute", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      el.icon = "settings";
      await el.updateComplete;
      
      assert.equal(el.getAttribute("icon"), "settings");
    });

    test("label reflects to attribute", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      el.label = "Settings";
      await el.updateComplete;
      
      assert.equal(el.getAttribute("label"), "Settings");
    });
  });

  suite("checked state", () => {
    test("defaults to unchecked", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      assert.isFalse(el.checked);
    });

    test("can be set via attribute", async () => {
      const el = await createButton(`<metro-app-bar-toggle-button checked></metro-app-bar-toggle-button>`);
      assert.isTrue(el.checked);
    });

    test("checked reflects to attribute", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      el.checked = true;
      await el.updateComplete;
      
      assert.isTrue(el.hasAttribute("checked"));
    });

    test("aria-checked is false when unchecked", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle");
      assert.equal(iconCircle?.getAttribute("aria-checked"), "false");
    });

    test("aria-checked is true when checked", async () => {
      const el = await createButton(`<metro-app-bar-toggle-button checked></metro-app-bar-toggle-button>`);
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle");
      assert.equal(iconCircle?.getAttribute("aria-checked"), "true");
    });

    test("aria-checked updates on toggle", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      
      iconCircle?.click();
      await el.updateComplete;
      
      assert.equal(iconCircle.getAttribute("aria-checked"), "true");
    });

    test("host has checked attribute when checked", async () => {
      const el = await createButton(`<metro-app-bar-toggle-button checked></metro-app-bar-toggle-button>`);
      assert.isTrue(el.hasAttribute("checked"));
    });
  });

  suite("disabled state", () => {
    test("defaults to enabled", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      assert.isFalse(el.disabled);
    });

    test("can be set via attribute", async () => {
      const el = await createButton(`<metro-app-bar-toggle-button disabled></metro-app-bar-toggle-button>`);
      assert.isTrue(el.disabled);
    });

    test("disabled reflects to attribute", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      el.disabled = true;
      await el.updateComplete;
      
      assert.isTrue(el.hasAttribute("disabled"));
    });

    test("aria-disabled is true when disabled", async () => {
      const el = await createButton(`<metro-app-bar-toggle-button disabled></metro-app-bar-toggle-button>`);
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle");
      assert.equal(iconCircle?.getAttribute("aria-disabled"), "true");
    });

    test("aria-disabled is false when not disabled", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle");
      assert.equal(iconCircle?.getAttribute("aria-disabled"), "false");
    });

    test("disabled button does not toggle on click", async () => {
      const el = await createButton(`<metro-app-bar-toggle-button disabled></metro-app-bar-toggle-button>`);
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      
      iconCircle?.click();
      await el.updateComplete;
      
      assert.isFalse(el.checked);
    });

    test("disabled button does not fire change event", async () => {
      const el = await createButton(`<metro-app-bar-toggle-button disabled></metro-app-bar-toggle-button>`);
      
      let changeFired = false;
      el.addEventListener("change", () => { changeFired = true; });
      
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      iconCircle?.click();
      
      assert.isFalse(changeFired);
    });
  });

  suite("click interaction", () => {
    test("click toggles checked state", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      
      iconCircle?.click();
      await el.updateComplete;
      
      assert.isTrue(el.checked);
    });

    test("click again untoggles checked state", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      
      iconCircle?.click();
      await el.updateComplete;
      assert.isTrue(el.checked);
      
      iconCircle?.click();
      await el.updateComplete;
      assert.isFalse(el.checked);
    });
  });

  suite("keyboard interaction", () => {
    test("Enter key toggles checked state", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      
      iconCircle.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await el.updateComplete;
      
      assert.isTrue(el.checked);
    });

    test("Space key toggles checked state", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      
      iconCircle.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      await el.updateComplete;
      
      assert.isTrue(el.checked);
    });

    test("Enter key does not toggle when disabled", async () => {
      const el = await createButton(`<metro-app-bar-toggle-button disabled></metro-app-bar-toggle-button>`);
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      
      iconCircle.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      await el.updateComplete;
      
      assert.isFalse(el.checked);
    });

    test("Space key does not toggle when disabled", async () => {
      const el = await createButton(`<metro-app-bar-toggle-button disabled></metro-app-bar-toggle-button>`);
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      
      iconCircle.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      await el.updateComplete;
      
      assert.isFalse(el.checked);
    });

    test("other keys do not toggle", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      
      iconCircle.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
      await el.updateComplete;
      
      assert.isFalse(el.checked);
    });
  });

  suite("events", () => {
    test("dispatches change event on click with correct detail", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      
      let eventDetail: { checked: boolean } | undefined;
      el.addEventListener("change", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);
      
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      iconCircle?.click();
      
      assert.isDefined(eventDetail);
      assert.isTrue(eventDetail?.checked);
    });

    test("dispatches change event with checked=false when untoggling", async () => {
      const el = await createButton(`<metro-app-bar-toggle-button checked></metro-app-bar-toggle-button>`);
      
      let eventDetail: { checked: boolean } | undefined;
      el.addEventListener("change", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);
      
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      iconCircle?.click();
      
      assert.isDefined(eventDetail);
      assert.isFalse(eventDetail?.checked);
    });

    test("dispatches change event on Enter key with correct detail", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      
      let eventDetail: { checked: boolean } | undefined;
      el.addEventListener("change", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);
      
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      iconCircle.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      
      assert.isDefined(eventDetail);
      assert.isTrue(eventDetail?.checked);
    });

    test("dispatches change event on Space key with correct detail", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      
      let eventDetail: { checked: boolean } | undefined;
      el.addEventListener("change", ((e: CustomEvent) => {
        eventDetail = e.detail;
      }) as EventListener);
      
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      iconCircle.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
      
      assert.isDefined(eventDetail);
      assert.isTrue(eventDetail?.checked);
    });

    test("change event bubbles", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      
      let bubbled = false;
      container.addEventListener("change", () => { bubbled = true; });
      
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      iconCircle?.click();
      
      assert.isTrue(bubbled);
    });

    test("change event is composed (crosses shadow DOM)", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      
      let composed = false;
      document.addEventListener("change", () => { composed = true; });
      
      const iconCircle = el.shadowRoot?.querySelector(".icon-circle") as HTMLElement;
      iconCircle?.click();
      
      assert.isTrue(composed);
      document.removeEventListener("change", () => {});
    });
  });

  suite("menu-item mode", () => {
    test("defaults to non-menu-item mode", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      assert.isFalse(el.menuItem);
    });

    test("can be set via attribute", async () => {
      const el = await createButton(`<metro-app-bar-toggle-button menu-item></metro-app-bar-toggle-button>`);
      assert.isTrue(el.menuItem);
    });

    test("menuItem reflects to attribute", async () => {
      const el = await createButton("<metro-app-bar-toggle-button></metro-app-bar-toggle-button>");
      el.menuItem = true;
      await el.updateComplete;
      
      assert.isTrue(el.hasAttribute("menu-item"));
    });

    test("menu-item mode has menu-item attribute on host", async () => {
      const el = await createButton(`<metro-app-bar-toggle-button menu-item label="Test"></metro-app-bar-toggle-button>`);
      assert.isTrue(el.hasAttribute("menu-item"));
    });
  });
});
