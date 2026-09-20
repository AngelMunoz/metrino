import { assert } from "chai";
import {
  registerMetroHub,
  MetroHub,
  clampIndex,
  nearestIndex,
  resolveScrollBehavior,
  metroEase,
  type HubSelectionChangedEventDetail,
} from "./hub.ts";
import { registerMetroHubSection, MetroHubSection } from "./hub-section.ts";

suite("metro-hub", () => {
  registerMetroHub();
  registerMetroHubSection();
  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createHub(attrs: Record<string, string> = {}): Promise<MetroHub> {
    const el = document.createElement("metro-hub") as MetroHub;
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    el.style.width = "400px";
    container.appendChild(el);
    await el.updateComplete;
    return el;
  }

  /** Mixed widths, sized so every section start is reachable from a 400px hub. */
  async function addSections(el: MetroHub): Promise<MetroHubSection[]> {
    const widths = [300, 360, 420, 400];
    const sections = widths.map((width) => {
      const section = document.createElement("metro-hub-section") as MetroHubSection;
      section.style.width = `${width}px`;
      el.appendChild(section);
      return section;
    });
    await el.updateComplete;
    return sections;
  }

  function getContainer(el: MetroHub): HTMLElement {
    const inner = el.shadowRoot?.querySelector<HTMLElement>(".hub-container");
    assert.exists(inner);
    return inner as HTMLElement;
  }

  /** Scroll offsets that put each section's start on the container padding line. */
  function sectionTargets(el: MetroHub): number[] {
    const sections = el.sections;
    const first = sections[0];
    assert.exists(first);
    const base = (first as MetroHubSection).getBoundingClientRect().left;
    return sections.map((section) => section.getBoundingClientRect().left - base);
  }

  function assertClose(actual: number, expected: number, delta = 1): void {
    assert.isAtMost(Math.abs(actual - expected), delta, `${actual} ≈ ${expected}`);
  }

  function settle(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 200));
  }

  test("renders hub container", async () => {
    const el = await createHub();
    assert.exists(el.shadowRoot?.querySelector(".hub-container"));
  });

  test("renders slot for sections", async () => {
    const el = await createHub();
    const slot = el.shadowRoot?.querySelector("slot");
    assert.exists(slot);
  });

  test("title is displayed when provided", async () => {
    const el = await createHub({ title: "Hub Title" });
    const title = el.shadowRoot?.querySelector(".hub-title");
    assert.equal(title?.textContent, "Hub Title");
  });

  test("no title when not provided", async () => {
    const el = await createHub();
    const title = el.shadowRoot?.querySelector(".hub-title");
    assert.notExists(title);
  });

  test("hub title has part attribute", async () => {
    const el = await createHub({ title: "Hub Title" });
    const title = el.shadowRoot?.querySelector<HTMLElement>(".hub-title");
    assert.equal(title?.getAttribute("part"), "hub-title");
  });

  test("hub container has part attribute", async () => {
    const el = await createHub();
    assert.equal(getContainer(el).getAttribute("part"), "hub-container");
  });

  test("sections returns slotted sections in document order", async () => {
    const el = await createHub();
    const sections = await addSections(el);
    assert.deepEqual(el.sections, sections);
  });

  test("sections ignores foreign children", async () => {
    const el = await createHub();
    await addSections(el);
    const foreign = document.createElement("div");
    el.appendChild(foreign);
    await el.updateComplete;
    assert.lengthOf(el.sections, 4);
  });

  test("clampIndex clamps into range and handles empty", () => {
    assert.equal(clampIndex(2, 4), 2);
    assert.equal(clampIndex(-1, 4), 0);
    assert.equal(clampIndex(9, 4), 3);
    assert.equal(clampIndex(0, 0), 0);
  });

  test("nearestIndex finds the nearest target", () => {
    assert.equal(nearestIndex(0, []), -1);
    assert.equal(nearestIndex(10, [0, 100, 200]), 0);
    assert.equal(nearestIndex(95, [0, 100, 200]), 1);
    assert.equal(nearestIndex(-100, [0, 100, 200]), 0);
  });

  test("selectedIndex is 0 at scroll origin", async () => {
    const el = await createHub();
    await addSections(el);
    assert.equal(el.selectedIndex, 0);
  });

  test("selectedIndex is -1 without sections", async () => {
    const el = await createHub();
    assert.equal(el.selectedIndex, -1);
  });

  test("selectedIndex returns nearest section with mixed widths", async () => {
    const el = await createHub();
    await addSections(el);
    const targets = sectionTargets(el);
    const hubContainer = getContainer(el);

    hubContainer.scrollLeft = targets[2];
    assert.equal(el.selectedIndex, 2);

    hubContainer.scrollLeft = targets[1] + 80;
    assert.equal(el.selectedIndex, 1);

    hubContainer.scrollLeft = targets[2] + 40;
    assert.equal(el.selectedIndex, 2);
  });

  test("setting selectedIndex scrolls to the section", async () => {
    const el = await createHub();
    await addSections(el);
    const targets = sectionTargets(el);

    el.selectedIndex = 2;
    await settle();
    assertClose(getContainer(el).scrollLeft, targets[2]);
  });

  test("setting selectedIndex out of range clamps", async () => {
    const el = await createHub();
    await addSections(el);
    const targets = sectionTargets(el);

    el.selectedIndex = 99;
    await settle();
    assertClose(getContainer(el).scrollLeft, targets[3]);

    el.selectedIndex = -5;
    await settle();
    assertClose(getContainer(el).scrollLeft, targets[0]);
  });

  test("selectionchanged detail matches pivot shape", async () => {
    const el = await createHub();
    await addSections(el);
    const events: HubSelectionChangedEventDetail[] = [];
    el.addEventListener("selectionchanged", (e) => {
      events.push((e as CustomEvent<HubSelectionChangedEventDetail>).detail);
    });

    el.selectedIndex = 1;
    await settle();

    assert.lengthOf(events, 1);
    assert.property(events[0], "selectedIndex");
    assert.equal(events[0]?.selectedIndex, 1);
  });

  test("selectionchanged fires once per settle for a coalesced pan", async () => {
    const el = await createHub();
    await addSections(el);
    const targets = sectionTargets(el);
    const events: number[] = [];
    el.addEventListener("selectionchanged", (e) => {
      events.push((e as CustomEvent<HubSelectionChangedEventDetail>).detail.selectedIndex);
    });

    const hubContainer = getContainer(el);
    hubContainer.scrollLeft = targets[1];
    hubContainer.scrollLeft = targets[2];
    hubContainer.scrollLeft = targets[3];
    await settle();

    assert.lengthOf(events, 1);
    assert.equal(events[0], 3);
  });

  test("selectionchanged does not fire when the index does not change", async () => {
    const el = await createHub();
    await addSections(el);
    const targets = sectionTargets(el);
    let count = 0;
    el.addEventListener("selectionchanged", () => {
      count++;
    });

    const hubContainer = getContainer(el);
    hubContainer.scrollLeft = targets[2];
    await settle();
    assert.equal(count, 1);

    hubContainer.scrollLeft = targets[2] + 20;
    await settle();
    assert.equal(count, 1);
  });

  test("resolveScrollBehavior downgrades under reduced motion", () => {
    assert.equal(resolveScrollBehavior("smooth", true), "auto");
    assert.equal(resolveScrollBehavior("auto", true), "auto");
    assert.equal(resolveScrollBehavior("smooth", false), "smooth");
    assert.equal(resolveScrollBehavior(undefined, false), "auto");
  });

  test("metroEase endpoints and monotonicity", () => {
    assert.equal(metroEase(0), 0);
    assert.equal(metroEase(1), 1);
    assert.equal(metroEase(-1), 0);
    assert.equal(metroEase(2), 1);
    let previous = 0;
    for (let t = 0; t <= 1.0001; t += 0.05) {
      const value = metroEase(t);
      assert.isAtLeast(value, previous - 1e-9);
      assert.isAtMost(value, 1);
      previous = value;
    }
  });

  test("scrollToSection lands on the padding line", async () => {
    const el = await createHub();
    await addSections(el);
    const targets = sectionTargets(el);

    el.scrollToSection(2);
    await settle();
    assertClose(getContainer(el).scrollLeft, targets[2]);
  });

  test("scrollToSection out of range clamps", async () => {
    const el = await createHub();
    await addSections(el);
    const targets = sectionTargets(el);

    el.scrollToSection(-3);
    await settle();
    assertClose(getContainer(el).scrollLeft, targets[0]);
  });

  test("scrollToSection smooth settles on the target", async () => {
    const el = await createHub();
    await addSections(el);
    const targets = sectionTargets(el);

    el.scrollToSection(2, "smooth");
    await new Promise((resolve) => setTimeout(resolve, 600));
    assertClose(getContainer(el).scrollLeft, targets[2]);
  });

  test("scrollToSection lands identically under dir rtl", async () => {
    const el = await createHub({ dir: "rtl" });
    await addSections(el);
    const targets = sectionTargets(el);
    assert.isBelow(targets[2], 0);

    el.scrollToSection(2);
    await settle();
    assertClose(getContainer(el).scrollLeft, targets[2]);
    assert.equal(el.selectedIndex, 2);
  });

  test("container has no snap by default", async () => {
    const el = await createHub();
    const style = getComputedStyle(getContainer(el));
    assert.equal(style.scrollSnapType, "none");
    assert.equal(style.overscrollBehaviorX, "contain");
  });

  test("snap attribute enables mandatory snapping", async () => {
    const el = await createHub({ snap: "" });
    const style = getComputedStyle(getContainer(el));
    assert.include(style.scrollSnapType, "mandatory");
  });

  test("snap keeps the settle line aligned to the gutter", async () => {
    const el = await createHub({ snap: "" });
    await addSections(el);
    const targets = sectionTargets(el);
    const hubContainer = getContainer(el);

    // Re-snapping after a pan is the browser's job for real user gestures;
    // Chromium and Firefox never re-snap script-initiated scrolls, so this
    // asserts the part the library owns: the snap CSS is mandatory and the
    // programmatic settle position coincides with the snap line (a section
    // start aligned to the 16px gutter).
    assert.include(getComputedStyle(hubContainer).scrollSnapType, "mandatory");

    el.scrollToSection(2);
    await settle();
    assertClose(getContainer(el).scrollLeft, targets[2]);

    const containerRect = hubContainer.getBoundingClientRect();
    const sectionRect = el.sections[2]?.getBoundingClientRect();
    assert.exists(sectionRect);
    const gutter = Number.parseFloat(getComputedStyle(hubContainer).paddingInlineStart);
    // Settled: the section start sits exactly on the container's content-box
    // line, the same line every snap position targets.
    assertClose((sectionRect as DOMRect).left - (containerRect.left + gutter), 0);
  });

  test("container is a labelled focusable region", async () => {
    const el = await createHub({ title: "Hub Title" });
    const hubContainer = getContainer(el);
    assert.equal(hubContainer.getAttribute("role"), "region");
    assert.equal(hubContainer.getAttribute("tabindex"), "0");
    assert.equal(hubContainer.getAttribute("aria-label"), "Hub Title");
  });

  test("region label falls back to hub without title", async () => {
    const el = await createHub();
    assert.equal(getContainer(el).getAttribute("aria-label"), "hub");
  });

  test("host aria-label wins over title", async () => {
    const el = await createHub({ title: "Hub Title", "aria-label": "Week view" });
    assert.equal(getContainer(el).getAttribute("aria-label"), "Week view");
  });

  test("container has focus-visible outline rule", async () => {
    const el = await createHub();
    const shadowRoot = el.shadowRoot;
    assert.exists(shadowRoot);
    const sheets = [
      ...Array.from(shadowRoot!.adoptedStyleSheets ?? []),
      ...Array.from(shadowRoot!.styleSheets ?? []),
    ];
    const found = sheets.some((sheet) =>
      Array.from(sheet.cssRules).some((rule) => rule.cssText.includes("focus-visible")),
    );
    assert.isTrue(found);
  });

  test("arrow key steps one section with snap", async () => {
    const el = await createHub({ snap: "" });
    await addSections(el);
    const targets = sectionTargets(el);
    const hubContainer = getContainer(el);

    const event = new KeyboardEvent("keydown", { key: "ArrowRight", cancelable: true });
    hubContainer.dispatchEvent(event);
    assert.isTrue(event.defaultPrevented);
    await settle();
    assertClose(getContainer(el).scrollLeft, targets[1]);
  });

  test("home and end jump to first and last", async () => {
    const el = await createHub({ snap: "" });
    await addSections(el);
    const targets = sectionTargets(el);
    const hubContainer = getContainer(el);

    hubContainer.dispatchEvent(new KeyboardEvent("keydown", { key: "End", cancelable: true }));
    await settle();
    assertClose(getContainer(el).scrollLeft, targets[3]);

    hubContainer.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", cancelable: true }));
    await settle();
    assertClose(getContainer(el).scrollLeft, targets[0]);
  });

  test("arrow keys follow direction under dir rtl", async () => {
    const el = await createHub({ snap: "", dir: "rtl" });
    await addSections(el);
    const targets = sectionTargets(el);
    const hubContainer = getContainer(el);

    hubContainer.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", cancelable: true }));
    await settle();
    assertClose(getContainer(el).scrollLeft, targets[1]);
  });

  test("arrow keys do nothing without snap", async () => {
    const el = await createHub();
    await addSections(el);
    const hubContainer = getContainer(el);

    const event = new KeyboardEvent("keydown", { key: "ArrowRight", cancelable: true });
    hubContainer.dispatchEvent(event);
    await settle();
    assert.isFalse(event.defaultPrevented);
    assert.equal(getContainer(el).scrollLeft, 0);
  });
});
