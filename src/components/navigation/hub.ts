import { LitElement, html, css, nothing } from "lit";
import { baseTypography } from "../../styles/shared.ts";
import { METRO_EASING_VALUES } from "../../utils/animations.ts";
import { prefersReducedMotion } from "../../utils/reduced-motion.ts";
import { focusFirstInside } from "../../utils/dialog-focus.ts";
import { registerMetroSemanticZoom } from "../selection/semantic-zoom.ts";
import type { MetroHubSection } from "./hub-section.ts";

/** Time without scroll events before the hub treats a pan as settled. */
const SETTLE_DEBOUNCE_MS = 100;

/** Fallback duration for the opt-in smooth scroll, in milliseconds. */
const SMOOTH_SCROLL_FALLBACK_MS = 333;

/** Attribute the semantic zoom matches groups with across its two views. */
const GROUP_KEY_ATTRIBUTE = "data-group-key";

/**
 * Detail payload of the hub `selectionchanged` event. The shape matches
 * metro-pivot.
 */
export interface HubSelectionChangedEventDetail {
  selectedIndex: number;
}

/**
 * Clamps an index into `[0, count - 1]`. Returns 0 for an empty collection.
 */
export function clampIndex(index: number, count: number): number {
  if (count <= 0) {
    return 0;
  }
  return Math.min(Math.max(index, 0), count - 1);
}

/**
 * Returns the index of the target nearest to the scroll position, or -1 when
 * there are no targets. The first target wins a tie.
 */
export function nearestIndex(scrollLeft: number, targets: number[]): number {
  let best = -1;
  let bestDistance = Number.POSITIVE_INFINITY;
  targets.forEach((target, index) => {
    const distance = Math.abs(target - scrollLeft);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
}

/**
 * Resolves the scroll behavior for a programmatic scroll. Reduced motion
 * always downgrades to an instant scroll.
 */
export function resolveScrollBehavior(
  behavior: ScrollBehavior | undefined,
  reduceMotion: boolean,
): ScrollBehavior {
  if (reduceMotion) {
    return "auto";
  }
  return behavior ?? "auto";
}

function bezierAxis(a: number, b: number, s: number): number {
  const v = 1 - s;
  return 3 * v * v * s * a + 3 * v * s * s * b + s * s * s;
}

/**
 * The Metro easing curve (cubic-bezier(0.1, 0.9, 0.2, 1)) evaluated at a
 * linear progress `t` in [0, 1]. `values` defaults to the Metro curve and can
 * carry any cubic-bezier control points with x1 and x2 in [0, 1].
 */
export function metroEase(
  t: number,
  values: readonly number[] = METRO_EASING_VALUES,
): number {
  if (t <= 0) {
    return 0;
  }
  if (t >= 1) {
    return 1;
  }
  const [x1 = 0.1, y1 = 0.9, x2 = 0.2, y2 = 1] = values;
  // The x axis is monotonic (0 <= x1 <= x2 <= 1), so a binary search for the
  // curve parameter that produces progress t converges deterministically.
  let lo = 0;
  let hi = 1;
  let s = t;
  for (let i = 0; i < 24; i++) {
    const x = bezierAxis(x1, x2, s);
    if (Math.abs(x - t) < 1e-6) {
      break;
    }
    if (x < t) {
      lo = s;
    } else {
      hi = s;
    }
    s = (lo + hi) / 2;
  }
  return bezierAxis(y1, y2, s);
}

/**
 * Metro Hub Component
 *
 * A horizontal scrolling container that groups related sections with headers.
 * Free panning with content peek is the default and canonical behavior, as in
 * the Windows 8 / Windows Phone hub: the hub is a passive canvas of related
 * sections, and the pivot is the pager.
 *
 * Features:
 * - Optional main title displayed above the section container
 * - Horizontal scrolling for sections with hidden scrollbar
 * - Large, typography-focused section headers
 * - Content-sized sections of different widths
 * - Programmatic scroll API: `sections`, `selectedIndex`, `scrollToSection()`
 * - Smooth programmatic navigation with the Metro easing and duration
 *   tokens; instant under `prefers-reduced-motion: reduce`
 * - Opt-in `[snap]` section boundary settling (off by default)
 * - Opt-in `[zoomable]` section overview, through `metro-semantic-zoom`
 * - Keyboard focus and arrow-key scrolling on the section container
 *
 * The hub owns no selection state. `selectedIndex` reads the section whose
 * start is nearest the scroll position; the setter scrolls to that section's
 * start. This differs from metro-pivot, whose `selectedIndex` stores state:
 * the pivot event fires at once, while the hub event fires when the pan
 * settles.
 *
 * Section header clicks belong to the app: attach listeners on the light-DOM
 * `metro-hub-section` elements.
 *
 * @fires selectionchanged - Fired when the in-view section settles after a
 *   pan or a programmatic scroll, and only when the index changed.
 *   Detail: { selectedIndex: number }
 *
 * @cssprop --metro-foreground - Title text color (default: #ffffff)
 * @cssprop --metro-spacing-lg - Large spacing unit, the container gutter (default: 16px)
 * @cssprop --metro-spacing-xl - Extra large spacing unit, the section gap (default: 24px)
 * @cssprop --metro-font-size-xxlarge - Font size for the main title (default: 42px)
 * @cssprop --metro-transition-slow - Duration of the smooth scroll (default: 333ms)
 * @cssprop --metro-easing - Easing of the smooth scroll as cubic-bezier(x1, y1, x2, y2); invalid values fall back to the Metro curve (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 *
 * @slot - Default slot for metro-hub-section children
 *
 * @csspart hub-title - The main title element
 * @csspart hub-container - The horizontal scrolling container
 */
export class MetroHub extends LitElement {
  static properties = {
    /**
     * Main title displayed at the top of the hub.
     * If not provided, no title is rendered.
     * @default ""
     */
    title: { type: String },
    /**
     * Opt-in section boundary settling. When present, the container uses
     * `scroll-snap-type: x mandatory` and sections align to the container's
     * 16px gutter after a pan. Absent by default: free pan with content peek.
     */
    snap: { type: Boolean, reflect: true },
    /**
     * Section overview through `metro-semantic-zoom`: the section container is
     * placed in the zoom's zoomed-in view and one tile per section is rendered
     * in its zoomed-out view. Tapping a tile re-enters the hub at that section
     * and reports it through `selectionchanged` like any other pan. Absent by
     * default: the container is rendered on its own, as before.
     *
     * The zoom is a fixed-height region, so a zoomable hub has to be given a
     * height; without one the section container scrolls inside the zoom's
     * 200px minimum.
     */
    zoomable: { type: Boolean, reflect: true },
    /**
     * Accessible name for the section container region. Falls back to
     * `title`, then to "hub".
     */
    ariaLabel: { attribute: "aria-label" },
  };

  declare title: string;
  declare snap: boolean;
  declare zoomable: boolean;
  declare ariaLabel: string | null;

  #supportsScrollEnd = false;
  #debounceTimer: ReturnType<typeof setTimeout> | undefined;
  #animationToken = 0;
  #animating = false;
  /* Inline scroll-snap-type saved while a glide suppresses mandatory snap. */
  #restoreSnap: string | null = null;
  #lastReportedIndex = -1;
  /* Idle timer that hides the auto-hide scrollbar after the pan settles. */
  #scrollbarTimer = 0;
  /* Group keys this hub wrote on a section, so only those may be removed. */
  #mirroredKeys = new WeakMap<MetroHubSection, string>();

  static styles = [
    baseTypography,
    css`
      :host {
        display: block;
      }
      /* The zoom stacks its two views as absolutely positioned layers, so it
         contributes no height of its own: the hub feeds it the space that is
         left over from the title instead. */
      :host([zoomable]) {
        display: flex;
        flex-direction: column;
      }
      :host([zoomable]) metro-semantic-zoom {
        flex: 1 1 auto;
        min-height: 200px;
      }
      .hub-title {
        font-size: var(--metro-font-size-xxlarge, 42px);
        font-weight: 200;
        color: var(--metro-foreground, #ffffff);
        margin: 0 0 var(--metro-spacing-xl, 24px) 0;
        padding: 0 var(--metro-spacing-lg, 16px);
      }
      .hub-container {
        display: flex;
        gap: var(--metro-spacing-xl, 24px);
        padding: 0 var(--metro-spacing-lg, 16px);
        overflow-x: auto;
        /* The hub pans on one axis only. Saying so keeps the scroll container
           single-axis and lets the zoom align a group on that axis. */
        overflow-y: hidden;
        overscroll-behavior-x: contain;
        /* Metro auto-hide scrollbar, the policy metro-scroll-viewer uses: gone at
           rest, present while panning or pointed at, so the pan is discoverable. */
        scrollbar-width: none;
      }
      .hub-container::-webkit-scrollbar {
        height: 4px;
      }
      .hub-container::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 2px;
      }
      .hub-container.scrolling,
      .hub-container.pointed,
      .hub-container:hover,
      .hub-container:focus-within {
        scrollbar-width: thin;
      }
      .hub-container.scrolling::-webkit-scrollbar-thumb,
      .hub-container.pointed::-webkit-scrollbar-thumb,
      .hub-container:hover::-webkit-scrollbar-thumb,
      .hub-container:focus-within::-webkit-scrollbar-thumb {
        background: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      }
      .hub-container:focus-visible {
        outline: 2px solid var(--metro-accent, #0078d4);
        outline-offset: -2px;
      }
      .hub-overview {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: var(--metro-spacing-md, 12px);
        padding: var(--metro-spacing-xl, 24px);
        box-sizing: border-box;
        height: 100%;
        overflow: auto;
      }
      .hub-overview button {
        display: flex;
        align-items: flex-end;
        min-height: 120px;
        padding: var(--metro-spacing-md, 12px);
        box-sizing: border-box;
        border: 2px solid var(--metro-accent, #0078d4);
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        color: var(--metro-foreground, #ffffff);
        font-family: inherit;
        font-size: var(--metro-font-size-large, 20px);
        font-weight: 200;
        text-align: start;
        cursor: pointer;
        transition: background-color var(--metro-transition-fast, 167ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .hub-overview button:hover {
        background: var(--metro-accent, #0078d4);
      }
      ::slotted(metro-hub-section) {
        flex: 0 0 auto;
        min-width: 250px;
        /* Inert unless the container has scroll-snap-type (the [snap]
           attribute). "start" resolves to the inline-start edge in a
           horizontal scroller; "inline-start" is not a valid
           scroll-snap-align keyword. It lives on the bare ::slotted() form
           because :host([snap]) ::slotted() does not match in engines. */
        scroll-snap-align: start;
      }
      :host([snap]) .hub-container {
        scroll-snap-type: x mandatory;
        scroll-padding-inline: var(--metro-spacing-lg, 16px);
      }
    `,
  ];

  /**
   * The slotted `metro-hub-section` elements in document order.
   */
  get sections(): MetroHubSection[] {
    return Array.from(this.querySelectorAll("metro-hub-section"));
  }

  /**
   * Zero-based index of the section currently in view: the section whose
   * start position is nearest to the scroll position. Returns -1 when there
   * are no sections.
   *
   * The setter scrolls that section's start to the container's padding line.
   * It is a scroll, not a state commit: reading it back measures the scroll
   * position.
   */
  get selectedIndex(): number {
    const container = this.#container();
    return nearestIndex(container?.scrollLeft ?? 0, this.#targets());
  }

  set selectedIndex(index: number) {
    this.scrollToSection(index);
  }

  render() {
    const title = this.title
      ? html`<h2 class="hub-title" part="hub-title">${this.title}</h2>`
      : nothing;
    const container = html`
      <div
        class="hub-container"
        part="hub-container"
        role="region"
        tabindex="0"
        slot=${this.zoomable ? "zoomed-in" : nothing}
        aria-label=${this.ariaLabel ?? this.title ?? "hub"}
        @scroll=${this.#handleScroll}
        @scrollend=${this.#handleScrollEnd}
        @click=${this.#handleContainerClick}
        @pointerenter=${this.#handlePointerEnter}
        @pointerleave=${this.#handlePointerLeave}
        @keydown=${this.#handleKeyDown}
        @pointerdown=${this.#cancelSmoothScroll}
        @wheel=${this.#cancelSmoothScroll}
      >
        <slot @slotchange=${this.#handleSectionsChange}></slot>
      </div>
    `;

    if (!this.zoomable) {
      return html`${title}${container}`;
    }

    return html`
      ${title}
      <metro-semantic-zoom>
        ${container}
        <div slot="zoomed-out" class="hub-overview">
          ${this.sections.map(
            (section, index) => html`<button
              type="button"
              data-group-key=${this.#groupKey(section, index)}
            >
              ${section.header || this.#groupKey(section, index)}
            </button>`
          )}
        </div>
      </metro-semantic-zoom>
    `;
  }

  updated(): void {
    this.#syncGroupKeys();
  }

  /**
   * The key that names a section in both views of the zoom.
   * @param section - The section to name
   * @param index - Its position in the hub
   * @returns string
   */
  #groupKey(section: MetroHubSection, index: number): string {
    return section.header || `section-${index}`;
  }

  /**
   * Publishes the sections as the zoom's groups. The keyed element has to be
   * the section itself: it is what the zoomed-in view scrolls to, and what the
   * overview's tiles point at. Keys this hub wrote are the only ones it takes
   * back off, so an app's own `data-group-key` values stay untouched.
   * @returns void
   */
  #syncGroupKeys(): void {
    this.sections.forEach((section, index) => {
      const key = this.#groupKey(section, index);
      const current = section.getAttribute(GROUP_KEY_ATTRIBUTE);
      if (this.zoomable) {
        if (current !== key) {
          section.setAttribute(GROUP_KEY_ATTRIBUTE, key);
        }
        this.#mirroredKeys.set(section, key);
      } else if (this.#mirroredKeys.get(section) === current) {
        section.removeAttribute(GROUP_KEY_ATTRIBUTE);
        this.#mirroredKeys.delete(section);
      }
    });
  }

  /**
   * Keeps the overview and the group keys in step with the sections.
   * @returns void
   */
  #handleSectionsChange(): void {
    this.requestUpdate();
  }

  /**
   * Scrolls a section's inline start to the container's padding line.
   *
   * The index is clamped into range. `behavior` defaults to "smooth", which
   * animates with the Metro easing and duration tokens; "auto" scrolls
   * instantly. Under `prefers-reduced-motion: reduce` every scroll is
   * instant, whatever the caller passed.
   *
   * @param index - Zero-based index of the target section
   * @param behavior - Scroll behavior; "smooth" by default, "auto" for instant
   */
  scrollToSection(index: number, behavior: ScrollBehavior = "smooth"): void {
    const container = this.#container();
    if (container === null) {
      return;
    }
    const targets = this.#targets();
    if (targets.length === 0) {
      return;
    }
    const target = targets[clampIndex(index, targets.length)];
    if (target === undefined) {
      return;
    }
    const resolved = resolveScrollBehavior(behavior, prefersReducedMotion());
    if (resolved === "smooth") {
      this.#animateScrollTo(container, target);
    } else {
      // Cancel after the jump so a settle-on-cancel reads the final position.
      container.scrollTo({ left: target, behavior: "auto" });
      this.#cancelSmoothScroll();
    }
  }

  firstUpdated(): void {
    const container = this.#container();
    if (container !== null) {
      this.#supportsScrollEnd = "onscrollend" in container;
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#cancelSmoothScroll();
    clearTimeout(this.#debounceTimer);
    clearTimeout(this.#scrollbarTimer);
  }

  /**
   * The scroll offset that puts section i's inline start on the padding line.
   *
   * The offset is measured between the same edge of two sections, so it does
   * not depend on the current scroll position and needs no padding term: in
   * LTR the value is positive; in RTL it is negative, matching the spec's
   * negative RTL `scrollLeft`. The edge follows the direction — in RTL the
   * inline start is the right edge, and left-edge differences would
   * accumulate the wrong section widths.
   */
  #targets(): number[] {
    const container = this.#container();
    if (container === null) {
      return [];
    }
    const sections = this.sections;
    const first = sections[0];
    if (first === undefined) {
      return [];
    }
    const rtl = getComputedStyle(container).direction === "rtl";
    const firstRect = first.getBoundingClientRect();
    const base = rtl ? firstRect.right : firstRect.left;
    return sections.map((section) => {
      const rect = section.getBoundingClientRect();
      return (rtl ? rect.right : rect.left) - base;
    });
  }

  #container(): HTMLElement | null {
    return this.renderRoot?.querySelector<HTMLElement>(".hub-container") ?? null;
  }

  #smoothDuration(): number {
    const raw = getComputedStyle(this).getPropertyValue("--metro-transition-slow");
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : SMOOTH_SCROLL_FALLBACK_MS;
  }

  /** The easing control points from --metro-easing, or the Metro curve. */
  #easingValues(): readonly number[] {
    const raw = getComputedStyle(this).getPropertyValue("--metro-easing").trim();
    const match = /^cubic-bezier\(\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*,\s*(\S+)\s*\)$/.exec(raw);
    if (match === null) {
      return METRO_EASING_VALUES;
    }
    const values = match.slice(1).map(Number);
    const [x1 = 0, , x2 = 0] = values;
    if (
      values.length !== 4 ||
      values.some((value) => !Number.isFinite(value)) ||
      x1 < 0 ||
      x1 > 1 ||
      x2 < 0 ||
      x2 > 1
    ) {
      // x1 and x2 must stay in [0, 1] for the x axis to be monotonic.
      return METRO_EASING_VALUES;
    }
    return values;
  }

  #animateScrollTo(container: HTMLElement, target: number): void {
    this.#cancelSmoothScroll();
    const start = container.scrollLeft;
    const delta = target - start;
    if (delta === 0) {
      return;
    }
    const token = ++this.#animationToken;
    this.#animating = true;
    const easing = this.#easingValues();
    // Mandatory snap re-snaps every scripted write, which yanks the glide to
    // the boundary and turns it into a jump. Suppress snap for the glide:
    // the final frame lands exactly on the boundary (the snap position), so
    // restoring it never shifts the content.
    this.#restoreSnap = container.style.scrollSnapType;
    container.style.scrollSnapType = "none";
    const duration = this.#smoothDuration();
    const startTime = performance.now();
    const step = (now: number) => {
      if (token !== this.#animationToken) {
        return;
      }
      const progress = Math.min((now - startTime) / duration, 1);
      container.scrollLeft = start + delta * metroEase(progress, easing);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        this.#animating = false;
        container.style.scrollSnapType = this.#restoreSnap ?? "";
        this.#restoreSnap = null;
        // Scrollend is not dependable for scripted per-frame writes; the
        // animation owns its settle. A later native scrollend dedupes.
        this.#settle();
      }
    };
    requestAnimationFrame(step);
  }

  #cancelSmoothScroll(): void {
    const wasAnimating = this.#animating;
    this.#animationToken++;
    this.#animating = false;
    if (this.#restoreSnap !== null) {
      const container = this.#container();
      if (container !== null) {
        container.style.scrollSnapType = this.#restoreSnap;
      }
      this.#restoreSnap = null;
    }
    if (wasAnimating) {
      // An interrupted glide may never produce a scrollend; report the frozen
      // position so the last event stays in sync with the view.
      this.#settle();
    }
  }

  #handleScroll(): void {
    this.#showScrollbar();
    if (this.#supportsScrollEnd) {
      return;
    }
    clearTimeout(this.#debounceTimer);
    this.#debounceTimer = setTimeout(() => this.#settle(), SETTLE_DEBOUNCE_MS);
  }

  #handleScrollEnd(): void {
    this.#settle();
  }

  /**
   * Reveals the auto-hide scrollbar for the pan and hides it 1.5 s after the
   * last scroll event, the idle window metro-scroll-viewer uses.
   * @returns void
   */
  #showScrollbar(): void {
    const container = this.#container();
    if (container === null) return;
    container.classList.add("scrolling");
    clearTimeout(this.#scrollbarTimer);
    this.#scrollbarTimer = window.setTimeout(() => {
      container.classList.remove("scrolling");
    }, 1500);
  }

  /* Firefox does not propagate :hover from slotted content into the shadow
     container, so pointing is tracked with enter/leave instead of CSS alone. */
  #handlePointerEnter = (): void => {
    this.#container()?.classList.add("pointed");
  };

  #handlePointerLeave = (): void => {
    this.#container()?.classList.remove("pointed");
  };

  /**
   * A click on a section header brings that section to the gutter and moves
   * focus into it, the Windows 8.1 hub's clickable-header behaviour. The header
   * lives in the section's shadow root, so the path — not the retargeted
   * target — names it.
   * @param event - The click inside the section container
   * @returns void
   */
  #handleContainerClick = (event: MouseEvent): void => {
    const header = event
      .composedPath()
      .find(
        (node): node is HTMLElement =>
          node instanceof HTMLElement && node.classList.contains("section-header")
      );
    if (!header) return;
    const root = header.getRootNode();
    const section = root instanceof ShadowRoot ? root.host : null;
    if (!(section instanceof HTMLElement)) return;
    const index = this.sections.indexOf(section as MetroHubSection);
    if (index < 0) return;

    this.scrollToSection(index);
    if (!focusFirstInside(section)) {
      if (!section.hasAttribute("tabindex")) section.setAttribute("tabindex", "-1");
      section.focus({ preventScroll: true });
    }
  };

  #handleKeyDown(event: KeyboardEvent): void {
    const container = this.#container();
    // Only the container's own keys step sections. Keys from slotted content
    // (inputs, list views) retarget to the host and belong to that content.
    if (container === null || event.target !== container) {
      return;
    }
    if (!this.snap) {
      return;
    }
    const count = this.sections.length;
    if (count === 0) {
      return;
    }
    const rtl = getComputedStyle(container).direction === "rtl";
    const forwardKey = rtl ? "ArrowLeft" : "ArrowRight";
    const backKey = rtl ? "ArrowRight" : "ArrowLeft";
    const current = clampIndex(this.selectedIndex, count);
    let target: number;
    if (event.key === forwardKey) {
      target = current + 1;
    } else if (event.key === backKey) {
      target = current - 1;
    } else if (event.key === "Home") {
      target = 0;
    } else if (event.key === "End") {
      target = count - 1;
    } else {
      return;
    }
    event.preventDefault();
    this.scrollToSection(target);
  }

  #settle(): void {
    // Browsers emit scrollend between the per-frame writes of a scripted
    // animation; only the settle after the animation ends may report.
    if (this.#animating) {
      return;
    }
    const index = this.selectedIndex;
    if (index === this.#lastReportedIndex) {
      return;
    }
    this.#lastReportedIndex = index;
    this.dispatchEvent(
      new CustomEvent<HubSelectionChangedEventDetail>("selectionchanged", {
        detail: { selectedIndex: index },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

export function registerMetroHub(): void {
  registerMetroSemanticZoom();
  if (!customElements.get("metro-hub")) {
    customElements.define("metro-hub", MetroHub);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-hub": MetroHub;
  }
}
