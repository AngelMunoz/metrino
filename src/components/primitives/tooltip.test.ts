import { assert } from "chai";
import "./tooltip.ts";
import { MetroTooltip } from "./tooltip.ts";

suite("metro-tooltip", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createTooltip(): Promise<{ tooltip: MetroTooltip; target: HTMLButtonElement }> {
    const target = document.createElement("button");
    target.textContent = "Hover me";
    container.appendChild(target);
    
    const tooltip = document.createElement("metro-tooltip") as MetroTooltip;
    tooltip.setAttribute("text", "Tooltip text");
    container.appendChild(tooltip);
    await tooltip.updateComplete;
    
    return { tooltip, target };
  }

  test("renders tooltip element", async () => {
    const { tooltip } = await createTooltip();
    const el = tooltip.shadowRoot?.querySelector(".tooltip");
    assert.exists(el);
  });

  test("is hidden by default", async () => {
    const { tooltip } = await createTooltip();
    assert.isFalse(tooltip.open);
  });

  test("show() displays tooltip", async () => {
    const { tooltip, target } = await createTooltip();
    tooltip.show(target);
    await tooltip.updateComplete;
    assert.isTrue(tooltip.open);
  });

  test("hide() hides tooltip", async () => {
    const { tooltip, target } = await createTooltip();
    tooltip.show(target);
    await tooltip.updateComplete;
    
    tooltip.hide();
    await tooltip.updateComplete;
    
    assert.isFalse(tooltip.open);
  });

  test("displays text content", async () => {
    const { tooltip } = await createTooltip();
    const el = tooltip.shadowRoot?.querySelector(".tooltip");
    assert.include(el?.textContent, "Tooltip text");
  });

  test("default placement is top", async () => {
    const { tooltip } = await createTooltip();
    assert.equal(tooltip.placement, "top");
  });

  test("placement attribute works", async () => {
    const tooltip = document.createElement("metro-tooltip") as MetroTooltip;
    tooltip.setAttribute("placement", "bottom");
    container.appendChild(tooltip);
    await tooltip.updateComplete;
    
    assert.equal(tooltip.placement, "bottom");
  });

  test("showDelayed shows after delay", async () => {
    const { tooltip, target } = await createTooltip();
    
    tooltip.showDelayed(target, 50);
    assert.isFalse(tooltip.open);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    assert.isTrue(tooltip.open);
  });

  test("hideImmediate cancels delayed show", async () => {
    const { tooltip, target } = await createTooltip();
    
    tooltip.showDelayed(target, 100);
    tooltip.hideImmediate();
    
    await new Promise(resolve => setTimeout(resolve, 150));
    assert.isFalse(tooltip.open);
  });
});
