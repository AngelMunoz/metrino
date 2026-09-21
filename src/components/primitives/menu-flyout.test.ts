import { assert } from "chai";
import { registerMetroMenuFlyout, MetroMenuFlyout } from "./menu-flyout.ts";

// Regression suite for the backdrop hit-testing bug: the fixed backdrop used
// to paint over the in-flow menu, so items were unclickable and show()
// positioning was inert on the static container. The container is now
// absolutely positioned in the host and show() writes host-relative
// coordinates.
// The flyout is imperative-only (Metro popup menu pattern): show()/hide()
// drive it, the open attribute does not control it, and `open` is read-only
// state.

const ANIMATION_SETTLE_MS = 350; // menuEnter runs 250ms; live transforms skew rects and hit-testing

function must<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error("expected element to exist");
  }
  return value;
}

suite("metro-menu-flyout", () => {
  registerMetroMenuFlyout();

  let container: HTMLDivElement;
  let trigger: HTMLButtonElement;
  let flyout: MetroMenuFlyout;
  let item: HTMLDivElement;
  let itemClicks: number;
  let closeEvents: number;

  setup(async () => {
    document.body.style.margin = "0";
    container = document.createElement("div");
    document.body.appendChild(container);

    trigger = document.createElement("button");
    trigger.textContent = "Target";
    container.appendChild(trigger);

    itemClicks = 0;
    closeEvents = 0;
    flyout = document.createElement("metro-menu-flyout") as MetroMenuFlyout;
    flyout.addEventListener("close", () => {
      closeEvents += 1;
    });
    item = document.createElement("div");
    item.className = "menu-item";
    item.textContent = "Item A";
    item.addEventListener("click", () => {
      itemClicks += 1;
    });
    flyout.appendChild(item);
    container.appendChild(flyout);
    await flyout.updateComplete;
  });

  teardown(() => {
    container.remove();
    document.body.style.margin = "";
  });

  async function openFlyout(): Promise<void> {
    flyout.show(trigger);
    await flyout.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, ANIMATION_SETTLE_MS));
  }

  function menuBox(): HTMLElement {
    return must(flyout.shadowRoot?.querySelector<HTMLElement>(".menu-flyout"));
  }

  function backdropBox(): HTMLElement {
    return must(flyout.shadowRoot?.querySelector<HTMLElement>(".backdrop"));
  }

  // Browsers route real pointer events (and :hover) through hit-testing, and
  // elementFromPoint is that same hit-testing API: whoever it reports here is
  // who a real click at those coordinates would target.
  function hitTestItemCenter(): Element | null {
    const rect = item.getBoundingClientRect();
    return (
      flyout.shadowRoot?.elementFromPoint(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
      ) ?? null
    );
  }

  function click(hit: Element): void {
    hit.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
  }

  test("backdrop is fixed over the viewport while the menu paints above it", async () => {
    await openFlyout();
    const backdropStyle = getComputedStyle(backdropBox());
    assert.equal(backdropStyle.position, "fixed");
    assert.equal(backdropStyle.top, "0px");
    assert.equal(backdropStyle.left, "0px");
    assert.equal(getComputedStyle(menuBox()).position, "absolute");
    const hostStyle = getComputedStyle(flyout);
    assert.equal(hostStyle.position, "fixed");
    assert.equal(hostStyle.zIndex, "1000");
  });

  test("hit-testing over an item no longer resolves to the backdrop", async () => {
    await openFlyout();
    const hit = hitTestItemCenter();
    assert.exists(hit);
    // Chrome reports the slotted item itself; Firefox retargets the hit to
    // the slot inside the shadow tree. Either way the menu content — not the
    // backdrop — is on top, which is what this regression pins.
    assert.notEqual(hit, backdropBox());
  });

  test("clicking an item runs its handler and keeps the menu open", async () => {
    await openFlyout();
    click(item);
    assert.equal(itemClicks, 1);
    assert.equal(closeEvents, 0);
    assert.isTrue(flyout.open);
  });

  test("clicking the backdrop away from the menu closes it and dispatches close", async () => {
    await openFlyout();
    const away = flyout.shadowRoot?.elementFromPoint(window.innerWidth - 5, 5);
    assert.equal(away, backdropBox());
    click(must(away));
    assert.equal(closeEvents, 1);
    assert.isFalse(flyout.open);
    await flyout.updateComplete;
    assert.notExists(flyout.shadowRoot?.querySelector(".backdrop"));
  });

  test("show(target) anchors the menu below the target", async () => {
    await openFlyout();
    const menuRect = menuBox().getBoundingClientRect();
    const triggerRect = trigger.getBoundingClientRect();
    assert.closeTo(menuRect.left, triggerRect.left, 1);
    assert.closeTo(menuRect.top, triggerRect.bottom, 1);
  });

  test("show(x, y) places the menu at the given viewport coordinates", async () => {
    flyout.show(trigger, 200, 150);
    await flyout.updateComplete;
    await new Promise((resolve) => setTimeout(resolve, ANIMATION_SETTLE_MS));
    const menuRect = menuBox().getBoundingClientRect();
    assert.closeTo(menuRect.left, 200, 1);
    assert.closeTo(menuRect.top, 150, 1);
  });

  test("the open attribute does not control the flyout (imperative API only)", async () => {
    flyout.setAttribute("open", "");
    await flyout.updateComplete;
    assert.isFalse(flyout.open);
    assert.notExists(flyout.shadowRoot?.querySelector(".backdrop"));
  });

  test("open is read-only state", () => {
    assert.throws(() => {
      (flyout as unknown as { open: boolean }).open = true;
    });
  });

  test("hide() on an already closed flyout is a no-op", () => {
    flyout.hide();
    assert.equal(closeEvents, 0);
    assert.isFalse(flyout.open);
  });

  test("hide() closes the flyout and dispatches close", async () => {
    await openFlyout();
    flyout.hide();
    assert.isFalse(flyout.open);
    assert.equal(closeEvents, 1);
    await flyout.updateComplete;
    assert.notExists(flyout.shadowRoot?.querySelector(".backdrop"));
  });
});
