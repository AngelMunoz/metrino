import { assert } from "chai";
import "./flyout.ts";
import { MetroFlyout } from "./flyout.ts";

suite("metro-flyout", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createFlyout(): Promise<{ flyout: MetroFlyout; trigger: HTMLButtonElement }> {
    const trigger = document.createElement("button");
    trigger.textContent = "Trigger";
    container.appendChild(trigger);
    
    const flyout = document.createElement("metro-flyout") as MetroFlyout;
    flyout.textContent = "Flyout content";
    container.appendChild(flyout);
    await flyout.updateComplete;
    
    return { flyout, trigger };
  }

  test("renders flyout element", async () => {
    const { flyout } = await createFlyout();
    const el = flyout.shadowRoot?.querySelector(".flyout");
    assert.exists(el);
  });

  test("is closed by default", async () => {
    const { flyout } = await createFlyout();
    assert.isFalse(flyout.open);
  });

  test("show() opens flyout", async () => {
    const { flyout, trigger } = await createFlyout();
    flyout.show(trigger);
    await flyout.updateComplete;
    assert.isTrue(flyout.open);
  });

  test("hide() closes flyout", async () => {
    const { flyout, trigger } = await createFlyout();
    flyout.show(trigger);
    await flyout.updateComplete;
    
    flyout.hide();
    await flyout.updateComplete;
    
    assert.isFalse(flyout.open);
  });

  test("clicking backdrop closes flyout", async () => {
    const { flyout, trigger } = await createFlyout();
    flyout.show(trigger);
    await flyout.updateComplete;
    
    const backdrop = flyout.shadowRoot?.querySelector(".backdrop") as HTMLElement;
    backdrop.click();
    await flyout.updateComplete;
    
    assert.isFalse(flyout.open);
  });

  test("default placement is bottom", async () => {
    const { flyout } = await createFlyout();
    assert.equal(flyout.placement, "bottom");
  });

  test("placement attribute works", async () => {
    const flyout = document.createElement("metro-flyout") as MetroFlyout;
    flyout.setAttribute("placement", "top");
    container.appendChild(flyout);
    await flyout.updateComplete;
    
    assert.equal(flyout.placement, "top");
  });

  test("dispatches show event", async () => {
    const { flyout, trigger } = await createFlyout();
    let shown = false;
    flyout.addEventListener("show", () => { shown = true; });
    
    flyout.show(trigger);
    await flyout.updateComplete;
    
    assert.isTrue(shown);
  });

  test("dispatches close event", async () => {
    const { flyout, trigger } = await createFlyout();
    flyout.show(trigger);
    await flyout.updateComplete;
    
    let closed = false;
    flyout.addEventListener("close", () => { closed = true; });
    
    const backdrop = flyout.shadowRoot?.querySelector(".backdrop") as HTMLElement;
    backdrop.click();
    await flyout.updateComplete;
    
    assert.isTrue(closed);
  });
});
