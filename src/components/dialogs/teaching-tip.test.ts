import { assert } from "chai";
import { registerMetroTeachingTip, MetroTeachingTip } from "./teaching-tip.ts";

suite("metro-teaching-tip", () => {
  registerMetroTeachingTip();
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    container.style.padding = "100px";
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createTip(): Promise<{ tip: MetroTeachingTip; trigger: HTMLButtonElement }> {
    const trigger = document.createElement("button");
    trigger.textContent = "Trigger";
    trigger.style.marginTop = "50px";
    container.appendChild(trigger);

    const tip = document.createElement("metro-teaching-tip") as MetroTeachingTip;
    tip.setAttribute("title", "New feature");
    tip.setAttribute("subtitle", "Try it out");

    const content = document.createElement("div");
    content.textContent = "Tip body here";
    tip.appendChild(content);

    container.appendChild(tip);
    await tip.updateComplete;

    return { tip, trigger };
  }

  async function nextFrames(count = 2): Promise<void> {
    for (let i = 0; i < count; i++) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }

  test("renders tip element", async () => {
    const { tip } = await createTip();
    const el = tip.shadowRoot?.querySelector(".tip");
    assert.exists(el);
  });

  test("is hidden by default (display: none)", async () => {
    const { tip } = await createTip();
    const style = getComputedStyle(tip);
    assert.equal(style.display, "none");
  });

  test("show() makes tip visible", async () => {
    const { tip, trigger } = await createTip();
    await tip.show(trigger);
    await nextFrames();

    const style = getComputedStyle(tip);
    assert.equal(style.display, "block", "tip should be visible after show()");
  });

  test("show() positions tip relative to target", async () => {
    const { tip, trigger } = await createTip();
    await tip.show(trigger);
    await nextFrames();

    const tipEl = tip.shadowRoot?.querySelector(".tip") as HTMLElement;
    assert.exists(tipEl, ".tip element should exist");

    const tipStyle = getComputedStyle(tipEl);
    const top = parseInt(tipStyle.top);
    const left = parseInt(tipStyle.left);

    assert.isFalse(isNaN(top), "top should be a number");
    assert.isFalse(isNaN(left), "left should be a number");
  });

  test("bottom placement positions tip below target", async () => {
    const { tip, trigger } = await createTip();
    tip.placement = "bottom";
    await tip.show(trigger);
    await nextFrames();

    const triggerRect = trigger.getBoundingClientRect();
    const tipEl = tip.shadowRoot?.querySelector(".tip") as HTMLElement;
    const tipRect = tipEl.getBoundingClientRect();

    assert.isAtLeast(tipRect.top, triggerRect.bottom - 5, "tip should be below or at target bottom");
  });

  test("show() resolves target id property", async () => {
    const { tip, trigger } = await createTip();
    trigger.id = "tip-anchor";
    tip.target = "tip-anchor";
    await tip.show();
    await nextFrames();

    assert.isTrue(tip.open);
    assert.equal(getComputedStyle(tip).display, "block");
    trigger.removeAttribute("id");
  });

  test("hide() hides tip", async () => {
    const { tip, trigger } = await createTip();
    await tip.show(trigger);

    await tip.hide();

    const style = getComputedStyle(tip);
    assert.equal(style.display, "none");
  });

  test("dispatches opened event", async () => {
    const { tip, trigger } = await createTip();
    let opened = false;
    tip.addEventListener("opened", () => { opened = true; });

    await tip.show(trigger);

    assert.isTrue(opened);
  });

  test("dispatches closed event", async () => {
    const { tip, trigger } = await createTip();
    await tip.show(trigger);

    let closed = false;
    tip.addEventListener("closed", () => { closed = true; });

    await tip.hide();

    assert.isTrue(closed);
  });

  test("default placement is bottom", async () => {
    const { tip } = await createTip();
    assert.equal(tip.placement, "bottom");
  });

  test("placement attribute works", async () => {
    const tip = document.createElement("metro-teaching-tip") as MetroTeachingTip;
    tip.setAttribute("placement", "top");
    container.appendChild(tip);
    await tip.updateComplete;

    assert.equal(tip.placement, "top");
  });

  test("renders close button with aria-label when closable", async () => {
    const { tip } = await createTip();
    const btn = tip.shadowRoot?.querySelector(".close-btn") as HTMLButtonElement;
    assert.exists(btn);
    assert.equal(btn.getAttribute("aria-label"), "Close");
  });

  test("closable=false hides the close button", async () => {
    const { tip } = await createTip();
    tip.closable = false;
    await tip.updateComplete;

    assert.isNull(tip.shadowRoot?.querySelector(".close-btn"));
  });

  test("close button hides the tip", async () => {
    const { tip, trigger } = await createTip();
    await tip.show(trigger);

    const btn = tip.shadowRoot?.querySelector(".close-btn") as HTMLButtonElement;
    btn.click();
    await tip.updateComplete;

    assert.isFalse(tip.open);
  });

  test("document-level Escape closes the tip without focus inside", async () => {
    const { tip, trigger } = await createTip();
    await tip.show(trigger);
    trigger.focus();
    assert.notEqual(document.activeElement, tip.shadowRoot?.querySelector(".tip"));

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await tip.updateComplete;

    assert.isFalse(tip.open);
  });

  test("outside pointer press closes the tip", async () => {
    const { tip, trigger } = await createTip();
    await tip.show(trigger);

    document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true }));
    await tip.updateComplete;

    assert.isFalse(tip.open);
  });

  test("focus moves into the tip on open and back to the target on close", async () => {
    const { tip, trigger } = await createTip();
    trigger.focus();
    await tip.show(trigger);

    const focusedInTip = document.activeElement === tip && tip.shadowRoot?.activeElement !== null;
    assert.isTrue(focusedInTip, "focus should move into the tip");

    await tip.hide();

    assert.equal(document.activeElement, trigger);
  });

  test("action slot projects content", async () => {
    const { tip, trigger } = await createTip();
    const action = document.createElement("button");
    action.setAttribute("slot", "action");
    action.textContent = "Got it";
    tip.appendChild(action);
    await tip.show(trigger);

    const slot = tip.shadowRoot?.querySelector('slot[name="action"]') as HTMLSlotElement;
    const assigned = slot.assignedNodes({ flatten: true });
    assert.isTrue(assigned.includes(action));
  });
});
