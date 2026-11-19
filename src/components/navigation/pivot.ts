import { LitElement, html, css } from "lit";
import { baseTypography, scrollbarHiddenClass } from "../../styles/shared.ts";
import {
  createGestureState,
  updateGesture,
  resolveGesture,
  type GestureState,
} from "../../utils/touch-physics.ts";

/** Drag distance (px) that pages the pivot when the pointer is released. */
const SWIPE_DISTANCE_PX = 50;

/** Pointer velocity (px/ms) that pages the pivot on a shorter drag. */
const SWIPE_VELOCITY_PX_PER_MS = 0.3;

/**
 * Upper bound (ms) for the one-step slide that carries a wrap. The slide settles
 * on `transitionend`; this only covers a row that is not rendered, and therefore
 * never reports one.
 */
const WRAP_SLIDE_GUARD_MS = 500;

/** Which end of the slide row a paging step crossed. */
type WrapDirection = "forward" | "backward";

/**
 * Metro Pivot Component
 *
 * A tab-based navigation component that allows users to switch between different
 * content sections. Features large, typography-focused headers with smooth animated
 * transitions between content panes. The Pivot is ideal for organizing related
 * content into separate views within a single screen.
 *
 * Features:
 * - Large typography-based tab headers with scaling animation
 * - Horizontal slide animation between content sections
 * - Scrollable tab list for overflow scenarios
 * - Active tab indicator (accent-colored underline)
 * - Smooth opacity and scale transitions for content
 * - ARIA tablist/tab roles with aria-selected
 * - Keyboard navigation (Arrow/Home/End) and swipe paging with circular loop
 *
 * @fires selectionchanged - Fired when the selected tab changes.
 *   Detail: { selectedIndex: number }
 *
 * @cssprop --metro-border - Border color for tab underline (default: rgba(255, 255, 255, 0.2))
 * @cssprop --metro-accent - Active tab underline color (default: #0078d4)
 * @cssprop --metro-foreground - Active tab text color (default: #ffffff)
 * @cssprop --metro-foreground-secondary - Inactive tab text color (default: rgba(255, 255, 255, 0.5))
 * @cssprop --metro-spacing-md - Medium spacing unit (default: 12px)
 * @cssprop --metro-transition-fast - Fast transition duration (default: 167ms)
 * @cssprop --metro-transition-slow - Slow transition duration for content (default: 333ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 * @cssprop --metro-font-size-xxlarge - Font size for tab headers (default: 42px)
 *
 * @slot - Default slot for metro-pivot-item children
 *
 * @csspart pivot-headers - Container for tab headers
 * @csspart pivot-content - Container for sliding content panels
 */
export class MetroPivot extends LitElement {
  static properties = {
    /**
     * Index of the currently selected pivot item (0-based).
     * Changing this updates the visible content and active tab styling.
     * @default 0
     */
    selectedIndex: { type: Number },
  };

  declare selectedIndex: number;

  static styles = [
    baseTypography,
    scrollbarHiddenClass,
    css`
      :host {
        display: block;
      }
      .pivot-headers {
        display: flex;
        gap: var(--metro-spacing-md, 12px);
        border-bottom: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
        margin-bottom: var(--metro-spacing-md, 12px);
        overflow-x: auto;
      }
      .pivot-header {
        padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
        cursor: pointer;
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
        font-size: var(--metro-font-size-xxlarge, 42px);
        font-weight: 200;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        transition:
          color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          transform var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        white-space: nowrap;
        user-select: none;
        transform: scale(0.8);
        transform-origin: left center;
      }
      .pivot-header:hover {
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      }
      .pivot-header.active {
        color: var(--metro-foreground, #ffffff);
        border-bottom-color: var(--metro-accent, #0078d4);
        transform: scale(1);
      }
      .pivot-content {
        position: relative;
        overflow: hidden;
        /* A horizontal drag pages the row, a vertical one still scrolls the page. */
        touch-action: pan-y;
      }
      .pivot-slides {
        display: flex;
        transition: transform var(--metro-transition-slow, 333ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      ::slotted(metro-pivot-item) {
        flex: 0 0 100%;
        min-width: 100%;
        opacity: 0.5;
        transform: scale(0.95);
        transition:
          opacity var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          transform var(--metro-transition-slow, 333ms)
            var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      ::slotted(metro-pivot-item[active]) {
        opacity: 1;
        transform: scale(1);
      }
    `,
  ];

  /** Gesture of the pointer held down on the content, or null when there is none. */
  #gesture: GestureState | null = null;

  /** Horizontal drag (px) applied to the slide row on top of its resting position. */
  #dragPx = 0;

  /** True once the gesture resolved to a horizontal drag. */
  #dragging = false;

  /**
   * Cleanup of the wrap slide that is running, or null. It also gates
   * `updated()`: the transform of the row belongs to the slide while it runs.
   */
  #wrapSlide: (() => void) | null = null;

  constructor() {
    super();
    this.selectedIndex = 0;
  }

  render() {
    const items = this.#items();

    return html`
      <div
        class="pivot-headers scrollbar-hidden"
        role="tablist"
        @keydown=${this.#handleKeyDown}
      >
        ${items.map((item, index) => {
          const header = item.getAttribute("header") || `Item ${index + 1}`;
          const isActive = index === this.selectedIndex;
          return html`
            <div
              class="pivot-header ${isActive ? "active" : ""}"
              role="tab"
              aria-selected="${isActive}"
              tabindex="${isActive ? 0 : -1}"
              @click=${() => this.#selectItem(index)}
            >
              ${header}
            </div>
          `;
        })}
      </div>
      <div
        class="pivot-content"
        role="tabpanel"
        @pointerdown=${this.#handlePointerDown}
        @pointermove=${this.#handlePointerMove}
        @pointerup=${this.#handlePointerUp}
        @pointercancel=${this.#handlePointerCancel}
      >
        <div class="pivot-slides">
          <slot></slot>
        </div>
      </div>
    `;
  }

  /**
   * Initializes the first pivot item as active on first render.
   * @returns void
   */
  firstUpdated() {
    const items = Array.from(this.querySelectorAll("metro-pivot-item"));
    items.forEach((item, i) => {
      item.toggleAttribute("active", i === this.selectedIndex);
    });
  }

  /**
   * Places the slide row on the selected item after a render.
   * @returns void
   */
  updated(): void {
    if (this.#wrapSlide === null) {
      this.#applyRestTransform();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#finishWrapSlide();
  }

  #items(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>("metro-pivot-item"));
  }

  #slides(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(".pivot-slides");
  }

  #headers(): HTMLElement[] {
    return Array.from(
      this.renderRoot.querySelectorAll<HTMLElement>(".pivot-header")
    );
  }

  /**
   * The transform that puts the panel at slide position `position` on the
   * viewport, moved by the live drag offset. Positions outside the real range are
   * where the row sits mid-wrap.
   * @param position - Index of the panel to bring onto the viewport
   * @returns the transform value for the slide row
   */
  #transformFor(position: number): string {
    const percent = -position * 100;
    if (this.#dragPx === 0) {
      return `translateX(${percent}%)`;
    }
    const drag = Math.abs(Math.round(this.#dragPx));
    return `translateX(calc(${percent}% ${this.#dragPx < 0 ? "-" : "+"} ${drag}px))`;
  }

  /**
   * Writes the resting transform of the selected item onto the slide row.
   * @returns void
   */
  #applyRestTransform(): void {
    const slides = this.#slides();
    if (slides === null) return;
    slides.style.transform = this.#transformFor(this.selectedIndex);
  }

  /**
   * Returns the row to its resting position, transitioning from wherever a drag
   * left it. The reflow between the two writes is what makes the browser treat the
   * dragged position as the start of the transition instead of its own value.
   * @returns void
   */
  #animateToRest(): void {
    const slides = this.#slides();
    this.#dragPx = 0;
    if (slides === null) return;
    slides.style.transition = "";
    void slides.offsetWidth;
    slides.style.transform = this.#transformFor(this.selectedIndex);
  }

  /**
   * Ends the wrap slide that is running, if any, at once.
   * @returns void
   */
  #finishWrapSlide(): void {
    this.#wrapSlide?.();
  }

  /**
   * Selects a pivot item by index and updates the view. The index wraps around the
   * ends of the row, so a step past the last item lands on the first one.
   * Dispatches a selectionchanged event with the new index.
   * @param index - The index of the item to select, taken modulo the item count
   * @param wrap - Set when the step crossed an end of the row, so the slide can
   *   carry it in one viewport instead of running the whole track back
   * @returns void
   */
  #selectItem(index: number, wrap: WrapDirection | null = null): void {
    const items = this.#items();
    const count = items.length;
    if (count === 0) return;

    const target = ((index % count) + count) % count;
    if (target === this.selectedIndex) {
      if (this.#dragPx !== 0) this.#animateToRest();
      return;
    }

    this.#finishWrapSlide();
    items.forEach((item, i) => {
      item.toggleAttribute("active", i === target);
    });
    this.selectedIndex = target;

    if (wrap === null) {
      this.#animateToRest();
    } else {
      this.#startWrapSlide(items, target, wrap);
    }

    this.dispatchEvent(
      new CustomEvent("selectionchanged", {
        detail: { selectedIndex: target },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Slides a wrap over one viewport, the way a normal page turn moves.
   *
   * The track holds exactly `count` panels, so the panel that has to arrive from
   * beyond an end is simply not there: `translateX(-count * 100%)` shows the blank
   * past the last item. Instead the incoming panel is reordered next to the
   * outgoing one, which puts both on positions inside a track that is one panel
   * longer. The row is jumped to the start position with no transition, slides one
   * viewport, and the order is dropped as soon as it lands, so the same panel is
   * on screen across the seam.
   * @param items - The pivot items in their real order
   * @param target - Index of the panel that is arriving
   * @param wrap - Which end of the row the step crossed
   * @returns void
   */
  #startWrapSlide(
    items: HTMLElement[],
    target: number,
    wrap: WrapDirection
  ): void {
    const slides = this.#slides();
    const incoming = items[target];
    const count = items.length;
    this.#dragPx = 0;
    if (slides === null || incoming === undefined) {
      this.#applyRestTransform();
      return;
    }

    // Forward: the incoming panel joins the end of the track, which puts the
    // outgoing panel one place before it. Backward is the same seam at the other
    // end of the track.
    const incomingOrder = wrap === "forward" ? count : -1;
    const startPosition = wrap === "forward" ? count - 2 : 1;
    const endPosition = wrap === "forward" ? count - 1 : 0;

    incoming.style.order = String(incomingOrder);
    slides.style.transition = "none";
    slides.style.transform = this.#transformFor(startPosition);
    void slides.offsetWidth;
    slides.style.transition = "";
    slides.style.transform = this.#transformFor(endPosition);

    let settled = false;
    const settle = (): void => {
      if (settled) return;
      settled = true;
      slides.removeEventListener("transitionend", onTransitionEnd);
      window.clearTimeout(guard);
      incoming.style.order = "";
      this.#wrapSlide = null;
      slides.style.transition = "none";
      slides.style.transform = this.#transformFor(this.selectedIndex);
      void slides.offsetWidth;
      slides.style.transition = "";
    };
    const onTransitionEnd = (event: TransitionEvent): void => {
      if (event.target === slides && event.propertyName === "transform") {
        settle();
      }
    };
    const guard = window.setTimeout(settle, WRAP_SLIDE_GUARD_MS);

    slides.addEventListener("transitionend", onTransitionEnd);
    this.#wrapSlide = settle;
  }

  /**
   * Handles a key on the tab list. The arrows page with a circular loop, Home and
   * End go to the ends of the row, and focus follows the selection.
   * @param event - The keyboard event
   * @returns void
   */
  #handleKeyDown = (event: KeyboardEvent): void => {
    const headers = this.#headers();
    const count = headers.length;
    if (count === 0) return;

    // The headers run in the inline direction, so in RTL the forward key is the
    // left arrow — the reading metro-hub already uses.
    const rtl = getComputedStyle(this).direction === "rtl";
    const forwardKey = rtl ? "ArrowLeft" : "ArrowRight";
    const backKey = rtl ? "ArrowRight" : "ArrowLeft";

    const current = Math.min(Math.max(this.selectedIndex, 0), count - 1);
    let step: number;
    let wrap: WrapDirection | null = null;
    if (event.key === forwardKey) {
      step = 1;
      wrap = current === count - 1 ? "forward" : null;
    } else if (event.key === backKey) {
      step = -1;
      wrap = current === 0 ? "backward" : null;
    } else if (event.key === "Home") {
      step = -current;
    } else if (event.key === "End") {
      step = count - 1 - current;
    } else {
      return;
    }

    event.preventDefault();
    const target = (((current + step) % count) + count) % count;
    if (target === current) return;

    this.#selectItem(target, wrap);
    headers[target]?.focus();
  };

  /**
   * Starts tracking a pointer that went down on the content area.
   * @param event - The pointer event
   * @returns void
   */
  #handlePointerDown = (event: PointerEvent): void => {
    if (this.#gesture !== null) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    this.#gesture = createGestureState({
      clientX: event.clientX,
      clientY: event.clientY,
    });
  };

  /**
   * Follows the pointer once the gesture resolves to a horizontal drag, moving the
   * slide row under it. A vertical or still-ambiguous gesture is left to the page.
   * @param event - The pointer event
   * @returns void
   */
  #handlePointerMove = (event: PointerEvent): void => {
    if (this.#gesture === null) return;
    this.#gesture = updateGesture(this.#gesture, {
      clientX: event.clientX,
      clientY: event.clientY,
    });

    if (!this.#dragging) {
      if (this.#gesture.resolved !== "drag-x") return;
      this.#dragging = true;
      this.#finishWrapSlide();
      const slides = this.#slides();
      if (slides === null) return;
      slides.style.transition = "none";
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    }

    this.#dragPx = this.#gesture.currentX - this.#gesture.startX;
    const slides = this.#slides();
    if (slides !== null) {
      slides.style.transform = this.#transformFor(this.selectedIndex);
    }
  };

  /**
   * Pages the pivot on release when the drag travelled far enough or fast enough,
   * and returns the row to its current section otherwise.
   * @returns void
   */
  #handlePointerUp = (): void => {
    const gesture = this.#gesture;
    this.#gesture = null;
    const dragging = this.#dragging;
    this.#dragging = false;
    if (gesture === null || !dragging) return;

    const result = resolveGesture(gesture);
    const travelled =
      Math.abs(result.dx) > SWIPE_DISTANCE_PX ||
      Math.abs(result.velocityX) > SWIPE_VELOCITY_PX_PER_MS;
    if (!travelled) {
      this.#animateToRest();
      return;
    }

    // A drag towards smaller coordinates pages forward: the row moves left, so the
    // next panel comes in from the right.
    const sign =
      result.dx !== 0 ? Math.sign(result.dx) : Math.sign(result.velocityX);
    const step = -sign;
    const count = this.#items().length;
    const current = this.selectedIndex;
    const target = (((current + step) % count) + count) % count;
    if (target === current) {
      this.#animateToRest();
      return;
    }

    let wrap: WrapDirection | null = null;
    if (step === 1 && current === count - 1) wrap = "forward";
    if (step === -1 && current === 0) wrap = "backward";
    this.#selectItem(target, wrap);
  };

  /**
   * Drops a drag the platform took over, leaving the current section in place.
   * @returns void
   */
  #handlePointerCancel = (): void => {
    this.#gesture = null;
    const dragging = this.#dragging;
    this.#dragging = false;
    if (dragging) {
      this.#animateToRest();
    }
  };
}

export function registerMetroPivot(): void {
  if (!customElements.get("metro-pivot")) {
    customElements.define("metro-pivot", MetroPivot);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-pivot": MetroPivot;
  }
}
