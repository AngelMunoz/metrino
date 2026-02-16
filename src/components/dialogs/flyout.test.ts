import { assert } from "chai";
import "./flyout.ts";
import { MetroFlyout } from "./flyout.ts";

suite("metro-flyout", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    container.style.padding = "100px";
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createFlyout(): Promise<{ flyout: MetroFlyout; trigger: HTMLButtonElement }> {
    const trigger = document.createElement("button");
    trigger.textContent = "Trigger";
    trigger.style.marginTop = "50px";
    container.appendChild(trigger);
    
    const flyout = document.createElement("metro-flyout") as MetroFlyout;
    
    const content = document.createElement("div");
    content.textContent = "Flyout content here";
    flyout.appendChild(content);
    
    container.appendChild(flyout);
    await flyout.updateComplete;
    
    return { flyout, trigger };
  }

  test("renders flyout element", async () => {
    const { flyout } = await createFlyout();
    const el = flyout.shadowRoot?.querySelector(".flyout");
    assert.exists(el);
  });

  test("is hidden by default (display: none)", async () => {
    const { flyout } = await createFlyout();
    const style = getComputedStyle(flyout);
    assert.equal(style.display, "none");
  });

  test("show() makes flyout visible", async () => {
    const { flyout, trigger } = await createFlyout();
    flyout.show(trigger);
    await flyout.updateComplete;
    
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const style = getComputedStyle(flyout);
    assert.equal(style.display, "block", "flyout should be visible after show()");
  });

  test("show() positions flyout relative to target", async () => {
    const { flyout, trigger } = await createFlyout();
    flyout.show(trigger);
    await flyout.updateComplete;
    
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const flyoutEl = flyout.shadowRoot?.querySelector(".flyout") as HTMLElement;
    assert.exists(flyoutEl, ".flyout element should exist");
    
    const flyoutStyle = getComputedStyle(flyoutEl);
    const top = parseInt(flyoutStyle.top);
    const left = parseInt(flyoutStyle.left);
    
    assert.isFalse(isNaN(top), "top should be a number");
    assert.isFalse(isNaN(left), "left should be a number");
  });

  test("bottom placement positions flyout below target", async () => {
    const { flyout, trigger } = await createFlyout();
    flyout.placement = "bottom";
    flyout.show(trigger);
    await flyout.updateComplete;
    
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const triggerRect = trigger.getBoundingClientRect();
    const flyoutEl = flyout.shadowRoot?.querySelector(".flyout") as HTMLElement;
    const flyoutRect = flyoutEl.getBoundingClientRect();
    
    assert.isAtLeast(flyoutRect.top, triggerRect.bottom - 5, "flyout should be below or at target bottom");
  });

  test("hide() hides flyout", async () => {
    const { flyout, trigger } = await createFlyout();
    flyout.show(trigger);
    await flyout.updateComplete;
    
    flyout.hide();
    await flyout.updateComplete;
    
    const style = getComputedStyle(flyout);
    assert.equal(style.display, "none");
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
    
    flyout.hide();
    await flyout.updateComplete;
    
    assert.isTrue(closed);
  });
});
