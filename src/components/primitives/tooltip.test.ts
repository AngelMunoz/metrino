import { assert } from "chai";
import "./tooltip.ts";
import { MetroTooltip } from "./tooltip.ts";

suite("metro-tooltip", () => {
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    container.style.padding = "100px";
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createTooltip(): Promise<{ tooltip: MetroTooltip; target: HTMLButtonElement }> {
    const target = document.createElement("button");
    target.textContent = "Hover me";
    target.style.marginTop = "100px";
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

  test("is hidden by default (display: none)", async () => {
    const { tooltip } = await createTooltip();
    const style = getComputedStyle(tooltip);
    assert.equal(style.display, "none");
  });

  test("show() makes tooltip visible", async () => {
    const { tooltip, target } = await createTooltip();
    tooltip.show(target);
    await tooltip.updateComplete;
    
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const style = getComputedStyle(tooltip);
    assert.equal(style.display, "block", "tooltip should be visible after show()");
  });

  test("show() positions tooltip relative to target", async () => {
    const { tooltip, target } = await createTooltip();
    tooltip.show(target);
    await tooltip.updateComplete;
    
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const tooltipEl = tooltip.shadowRoot?.querySelector(".tooltip") as HTMLElement;
    assert.exists(tooltipEl, ".tooltip element should exist");
    
    const tooltipStyle = getComputedStyle(tooltipEl);
    const top = parseInt(tooltipStyle.top);
    const left = parseInt(tooltipStyle.left);
    
    assert.isFalse(isNaN(top), "top should be a number");
    assert.isFalse(isNaN(left), "left should be a number");
  });

  test("top placement positions tooltip above target", async () => {
    const { tooltip, target } = await createTooltip();
    tooltip.placement = "top";
    tooltip.show(target);
    await tooltip.updateComplete;
    
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const targetRect = target.getBoundingClientRect();
    const tooltipEl = tooltip.shadowRoot?.querySelector(".tooltip") as HTMLElement;
    const tooltipRect = tooltipEl.getBoundingClientRect();
    
    assert.isBelow(tooltipRect.bottom, targetRect.top + 10, "tooltip should be above target");
  });

  test("bottom placement positions tooltip below target", async () => {
    const { tooltip, target } = await createTooltip();
    tooltip.placement = "bottom";
    tooltip.show(target);
    await tooltip.updateComplete;
    
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    const targetRect = target.getBoundingClientRect();
    const tooltipEl = tooltip.shadowRoot?.querySelector(".tooltip") as HTMLElement;
    const tooltipRect = tooltipEl.getBoundingClientRect();
    
    assert.isAbove(tooltipRect.top, targetRect.bottom - 10, "tooltip should be below target");
  });

  test("hide() hides tooltip", async () => {
    const { tooltip, target } = await createTooltip();
    tooltip.show(target);
    await tooltip.updateComplete;
    
    tooltip.hide();
    await tooltip.updateComplete;
    
    const style = getComputedStyle(tooltip);
    assert.equal(style.display, "none");
  });

  test("displays text content", async () => {
    const { tooltip } = await createTooltip();
    const el = tooltip.shadowRoot?.querySelector(".tooltip");
    assert.include(el?.textContent, "Tooltip text");
  });

  test("placement can be changed before show", async () => {
    const { tooltip, target } = await createTooltip();
    tooltip.placement = "left";
    tooltip.show(target);
    await tooltip.updateComplete;
    
    assert.equal(tooltip.placement, "left");
  });
});
