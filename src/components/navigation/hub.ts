import { LitElement, html, css } from "lit";
import { baseTypography, scrollbarHiddenClass } from "../../styles/shared.ts";
import { METRO_EASING_VALUES } from "../../utils/animations.ts";
import type { MetroHubSection } from "./hub-section.ts";

/** Time without scroll events before the hub treats a pan as settled. */
const SETTLE_DEBOUNCE_MS = 100;

/** Fallback duration for the opt-in smooth scroll, in milliseconds. */
const SMOOTH_SCROLL_FALLBACK_MS = 333;

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
 * linear progress `t` in [0, 1].
 */
export function metroEase(t: number): number {
  if (t <= 0) {
    return 0;
  }
  if (t >= 1) {
    return 1;
  }
  const [x1, y1, x2, y2] = METRO_EASING_VALUES;
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
 * - Opt-in `[snap]` section boundary settling (off by default)
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
 * @cssprop --metro-transition-slow - Duration of the opt-in smooth scroll (default: 333ms)
 * @cssprop --metro-easing - Easing curve of the opt-in smooth scroll (default: cubic-bezier(0.1, 0.9, 0.2, 1))
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
     * Accessible name for the section container region. Falls back to
     * `title`, then to "hub".
     */
    ariaLabel: { attribute: "aria-label" },
  };

  declare title: string;
  declare snap: boolean;
  declare ariaLabel: string | null;

  #supportsScrollEnd = false;
  #debounceTimer: ReturnType<typeof setTimeout> | undefined;
  #animationToken = 0;
  #lastReportedIndex = -1;

  static styles = [
    baseTypography,
    scrollbarHiddenClass,
    css`
      :host {
        display: block;
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
        overscroll-behavior-x: contain;
      }
      .hub-container:focus-visible {
        outline: 2px solid var(--metro-accent, #0078d4);
        outline-offset: -2px;
      }
      ::slotted(metro-hub-section) {
        flex: 0 0 auto;
        min-width: 250px;
      }
      :host([snap]) .hub-container {
        scroll-snap-type: x mandatory;
        scroll-padding-inline: var(--metro-spacing-lg, 16px);
      }
      :host([snap]) ::slotted(metro-hub-section) {
        scroll-snap-align: inline-start;
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
    this.scrollToSection(index, "auto");
  }

  render() {
    return html`
      ${this.title ? html`<h2 class="hub-title" part="hub-title">${this.title}</h2>` : ""}
      <div
        class="hub-container scrollbar-hidden"
        part="hub-container"
        role="region"
        tabindex="0"
        aria-label=${this.ariaLabel ?? this.title ?? "hub"}
        @scroll=${this.#handleScroll}
        @scrollend=${this.#handleScrollEnd}
        @keydown=${this.#handleKeyDown}
        @pointerdown=${this.#cancelSmoothScroll}
        @wheel=${this.#cancelSmoothScroll}
      >
        <slot></slot>
      </div>
    `;
  }

  /**
   * Scrolls a section's start to the container's padding line.
   *
   * The index is clamped into range. `behavior` defaults to "auto" (instant);
   * "smooth" animates with the Metro easing and duration tokens, and any
   * value is downgraded to "auto" under `prefers-reduced-motion: reduce`.
   *
   * @param index - Zero-based index of the target section
   * @param behavior - Scroll behavior; "auto" by default
   */
  scrollToSection(index: number, behavior: ScrollBehavior = "auto"): void {
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
    const resolved = resolveScrollBehavior(behavior, this.#prefersReducedMotion());
    if (resolved === "smooth") {
      this.#animateScrollTo(container, target);
    } else {
      this.#cancelSmoothScroll();
      container.scrollTo({ left: target, behavior: "auto" });
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
  }

  /**
   * The scroll offset that puts section i's start on the padding line.
   *
   * Both section rects move with the content, so
   * `rect_i.left - rect_0.left` does not depend on the current scroll
   * position, needs no padding term, and is direction-agnostic: in RTL the
   * value is negative, matching the spec's negative RTL `scrollLeft`.
   */
  #targets(): number[] {
    const sections = this.sections;
    const first = sections[0];
    if (first === undefined) {
      return [];
    }
    const base = first.getBoundingClientRect().left;
    return sections.map((section) => section.getBoundingClientRect().left - base);
  }

  #container(): HTMLElement | null {
    return this.renderRoot?.querySelector<HTMLElement>(".hub-container") ?? null;
  }

  #prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  #smoothDuration(): number {
    const raw = getComputedStyle(this).getPropertyValue("--metro-transition-slow");
    const parsed = Number.parseFloat(raw);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : SMOOTH_SCROLL_FALLBACK_MS;
  }

  #animateScrollTo(container: HTMLElement, target: number): void {
    this.#cancelSmoothScroll();
    const start = container.scrollLeft;
    const delta = target - start;
    if (delta === 0) {
      return;
    }
    const token = ++this.#animationToken;
    const duration = this.#smoothDuration();
    const startTime = performance.now();
    const step = (now: number) => {
      if (token !== this.#animationToken) {
        return;
      }
      const progress = Math.min((now - startTime) / duration, 1);
      container.scrollLeft = start + delta * metroEase(progress);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  #cancelSmoothScroll(): void {
    this.#animationToken++;
  }

  #handleScroll(): void {
    if (this.#supportsScrollEnd) {
      return;
    }
    clearTimeout(this.#debounceTimer);
    this.#debounceTimer = setTimeout(() => this.#settle(), SETTLE_DEBOUNCE_MS);
  }

  #handleScrollEnd(): void {
    this.#settle();
  }

  #handleKeyDown(event: KeyboardEvent): void {
    if (!this.snap) {
      return;
    }
    const container = this.#container();
    if (container === null) {
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
    this.scrollToSection(target, "auto");
  }

  #settle(): void {
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
  if (!customElements.get("metro-hub")) {
    customElements.define("metro-hub", MetroHub);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-hub": MetroHub;
  }
}
