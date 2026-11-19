import { LitElement, html, css, type PropertyValues } from "lit";
import { baseTypography } from "../../styles/shared.ts";
import { createTransitionScope } from "../../utils/view-transition.ts";
import { prefersReducedMotion } from "../../utils/reduced-motion.ts";

export type ZoomState = "in" | "out";

/** Names of the two slots, which are not the same strings as the states. */
type ZoomSlot = "zoomed-in" | "zoomed-out";

/** How far above the top of the view a group header may sit and still be current. */
const GROUP_ALIGN_TOLERANCE_PX = 4;

/**
 * The ::view-transition rules of one semantic zoom instance, keyed to its
 * scoped part names. Both layers are always rendered, so a static name would
 * stay reserved while the component is idle and repeated by a second instance
 * on the same page.
 *
 * Built per transition, because `transitionDuration` can change at any time.
 */
function semanticZoomTransitionRules(
  names: Record<string, string>,
  duration: number
): string {
  return `
html:active-view-transition-type(semantic-zoom)::view-transition-old(${names.out}) {
  animation-name: metro-semantic-zoom-out;
  animation-duration: ${duration}ms;
  animation-timing-function: var(--metro-easing);
}
html:active-view-transition-type(semantic-zoom)::view-transition-new(${names.in}) {
  animation-name: metro-semantic-zoom-in;
  animation-duration: ${duration}ms;
  animation-timing-function: var(--metro-easing);
}
`;
}

/**
 * Windows Phone semantic zoom: a detailed view and an overview of the same
 * content, switched by pinch, Ctrl+Scroll, or the hint button.
 *
 * ## Group contract
 *
 * Content goes in the `zoomed-in` and `zoomed-out` slots. Whatever element
 * starts a group carries `data-group-key`, in both views, with the same key in
 * each one, so the overview is a map of the list rather than a second dataset:
 *
 * ```html
 * <metro-semantic-zoom>
 *   <div slot="zoomed-in" class="groups">
 *     <h3 data-group-key="A">A</h3>
 *     …rows of group A…
 *   </div>
 *   <div slot="zoomed-out" class="tiles">
 *     <button data-group-key="A">A (12)</button>
 *   </div>
 * </metro-semantic-zoom>
 * ```
 *
 * With that in place:
 *
 * - `scrollToGroup(key)` zooms in when the overview is up, then aligns that
 *   group with the top of the element that scrolls it.
 * - Tapping a `[data-group-key]` element of the overview re-enters the list at
 *   that group.
 * - `currentGroup` reports the group at the top of the scrolled list, and
 *   `groupchanged` fires when it changes: bubbles and composed,
 *   `detail: { key: string | null }`.
 *
 * Keys are matched against the elements assigned to the slot, so a group header
 * inside a slotted component counts as well as a direct child.
 *
 * A group is measured where it draws, so the keyed element has to sit in the
 * normal flow of the list: a header pinned by `position: sticky` always reads
 * as already aligned, and scrolling back to it then does nothing.
 */
export class MetroSemanticZoom extends LitElement {
  static properties = {
    zoomed: { type: String, reflect: true },
    transitionDuration: { type: Number, attribute: "transition-duration" },
  };

  declare zoomed: ZoomState;
  declare transitionDuration: number;

  static styles = [
    baseTypography,
    css`
      :host {
        display: block;
        position: relative;
        overflow: hidden;
        touch-action: pan-x pan-y;
        min-height: 200px;
        height: 100%;
        background: var(--metro-background, transparent);
      }
      .zoom-container {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: inherit;
      }
      .zoomed-in,
      .zoomed-out {
        position: absolute;
        inset: 0;
        background: var(--metro-background, transparent);
        overflow: auto;
        /* Fallback for engines without View Transitions: the state change is a
           CSS transition of the same three properties the snapshots animate.
           --sz-dur is 0ms wherever startViewTransition exists, so a View
           Transition never stacks its own animation on top of this one, and 0ms
           under prefers-reduced-motion, where the change is applied directly. */
        transition:
          transform var(--sz-dur, 0ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          opacity var(--sz-dur, 0ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          filter var(--sz-dur, 0ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .zoomed-in {
        transform: scale(1);
        opacity: 1;
        filter: blur(0);
        z-index: 1;
      }
      .zoomed-out {
        transform: scale(0.5);
        opacity: 0;
        filter: blur(4px);
        pointer-events: none;
        z-index: 0;
      }
      :host([zoomed="out"]) .zoomed-in {
        transform: scale(2);
        opacity: 0;
        filter: blur(4px);
        pointer-events: none;
      }
      :host([zoomed="out"]) .zoomed-out {
        transform: scale(1);
        opacity: 1;
        filter: blur(0);
        pointer-events: auto;
        z-index: 1;
      }
      .zoom-hint {
        position: absolute;
        bottom: var(--metro-spacing-md, 12px);
        right: var(--metro-spacing-md, 12px);
        background: var(--metro-accent, #0078d4);
        color: #ffffff;
        padding: var(--metro-spacing-xs, 4px) var(--metro-spacing-sm, 8px);
        font-size: var(--metro-font-size-small, 12px);
        cursor: pointer;
        border: none;
        z-index: 10;
      }
    `,
  ];

  #pinchStartDistance = 0;
  #isPinching = false;
  #isTransitioning = false;
  #transition = createTransitionScope("semantic-zoom", ["in", "out"]);
  #currentGroup: string | null = null;
  #groupReadFrame = 0;

  constructor() {
    super();
    this.zoomed = "in";
    this.transitionDuration = 400;
  }

  protected firstUpdated(): void {
    // A scroll event neither bubbles nor is composed, so one capture listener can
    // only see scrollers in its own tree scope: the layer holds the shadow
    // scrollers, the host holds the content slotted into it. Both are needed,
    // otherwise a group is only reported by half of the possible layouts.
    this.shadowRoot
      ?.querySelector<HTMLElement>(".zoomed-in")
      ?.addEventListener("scroll", this.#handleScroll, {
        capture: true,
        passive: true,
      });
    this.addEventListener("scroll", this.#handleScroll, {
      capture: true,
      passive: true,
    });

    this.shadowRoot
      ?.querySelector<HTMLElement>(".zoomed-out")
      ?.addEventListener("click", this.#handleOverviewClick);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    // The pending read belongs to a frame of a list that is no longer on screen.
    cancelAnimationFrame(this.#groupReadFrame);
    this.#groupReadFrame = 0;
  }

  protected updated(changed: PropertyValues<this>): void {
    // The CSS fallback transition runs only where there is no View Transition to
    // animate with and the user has not asked for reduced motion.
    const instant =
      prefersReducedMotion() || "startViewTransition" in document;
    const duration = instant ? 0 : this.transitionDuration;
    this.style.setProperty("--sz-dur", `${duration}ms`);

    // Zooming in without scrolling still moves the reading of the current group
    // from the hidden overview to the list.
    if (changed.has("zoomed")) this.#scheduleGroupRead();
  }

  /** The group whose header is at the top of the scrolled list, if it has one. */
  get currentGroup(): string | null {
    return this.#currentGroup;
  }

  /**
   * Shows one group at the top of the zoomed-in list, zooming in first when the
   * overview is up.
   * @param key - The `data-group-key` value of the group to enter
   */
  async scrollToGroup(key: string): Promise<void> {
    if (this.zoomed === "out") {
      await this.setZoomedState("in");
    }
    await this.updateComplete;

    const layer = this.shadowRoot?.querySelector<HTMLElement>(".zoomed-in");
    const group = this.#findGroup(key, "zoomed-in");
    if (!layer || !group) return;

    const scroller = this.#scrollerFor(group, layer);
    const offset =
      group.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
    scroller.scrollTo({
      top: scroller.scrollTop + offset,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    this.#scheduleGroupRead();
  }

  /** The `[data-group-key]` elements assigned to one slot, in document order. */
  #assignedGroups(slotName: ZoomSlot): HTMLElement[] {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>(
      `slot[name="${slotName}"]`
    );
    const groups: HTMLElement[] = [];

    for (const assigned of slot?.assignedElements() ?? []) {
      if (!(assigned instanceof HTMLElement)) continue;
      if (assigned.hasAttribute("data-group-key")) groups.push(assigned);
      groups.push(
        ...Array.from(
          assigned.querySelectorAll<HTMLElement>("[data-group-key]")
        )
      );
    }

    return groups;
  }

  #findGroup(key: string, slotName: ZoomSlot): HTMLElement | null {
    const selector = `[data-group-key="${CSS.escape(key)}"]`;
    return (
      this.#assignedGroups(slotName).find((group) => group.matches(selector)) ??
      null
    );
  }

  /**
   * The element that actually scrolls a group: its nearest scrollable ancestor
   * within the zoom, or the zoomed-in layer when the content overflows that
   * layer directly.
   */
  #scrollerFor(group: HTMLElement, layer: HTMLElement): HTMLElement {
    for (
      let ancestor = group.parentElement;
      ancestor && ancestor !== this;
      ancestor = ancestor.parentElement
    ) {
      const overflow = getComputedStyle(ancestor).overflowY;
      if (overflow === "auto" || overflow === "scroll") return ancestor;
    }
    return layer;
  }

  #handleScroll = (): void => {
    this.#scheduleGroupRead();
  };

  #handleOverviewClick = (event: Event): void => {
    // Slotted content is retargeted at the shadow boundary, so the layer only
    // ever sees the slot as the target: the tapped element comes from the path.
    const tapped = event
      .composedPath()
      .find((node): node is HTMLElement => node instanceof HTMLElement);
    const tile = tapped?.closest<HTMLElement>("[data-group-key]");
    if (!tile) return;

    const key = tile.getAttribute("data-group-key");
    if (key === null) return;
    if (!this.#assignedGroups("zoomed-out").includes(tile)) return;

    void this.scrollToGroup(key);
  };

  #scheduleGroupRead(): void {
    // One measurement pass per frame: a fling delivers a scroll event every
    // frame and each pass walks the whole group list.
    if (this.#groupReadFrame !== 0) return;
    this.#groupReadFrame = requestAnimationFrame(() => {
      this.#groupReadFrame = 0;
      this.#readCurrentGroup();
    });
  }

  #readCurrentGroup(): void {
    const layer = this.shadowRoot?.querySelector<HTMLElement>(".zoomed-in");
    if (!layer) return;

    let key: string | null = null;
    let highest = Number.NEGATIVE_INFINITY;
    let leading: string | null = null;

    for (const group of this.#assignedGroups("zoomed-in")) {
      const groupKey = group.getAttribute("data-group-key");
      if (groupKey === null) continue;
      leading ??= groupKey;

      const scroller = this.#scrollerFor(group, layer);
      const offset =
        group.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
      // The current group is the last one that crossed the top line, so of those
      // at or above it the one nearest the line wins.
      if (offset <= GROUP_ALIGN_TOLERANCE_PX && offset > highest) {
        highest = offset;
        key = groupKey;
      }
    }

    key ??= leading;
    if (key === this.#currentGroup) return;

    this.#currentGroup = key;
    this.dispatchEvent(
      new CustomEvent("groupchanged", {
        detail: { key },
        bubbles: true,
        composed: true,
      })
    );
  }

  setZoomedState(state: ZoomState): Promise<void> {
    if (this.#isTransitioning || this.zoomed === state) {
      return Promise.resolve();
    }

    return this.#performTransition(state);
  }

  async #performTransition(targetState: ZoomState): Promise<void> {
    this.#isTransitioning = true;
    const previousState = this.zoomed;

    const applyChange = (): void => {
      this.zoomed = targetState;
      this.dispatchEvent(
        new CustomEvent("zoomchanged", {
          detail: { zoomed: this.zoomed, previous: previousState },
          bubbles: true,
        }),
      );
    };

    await this.updateComplete;

    if (!prefersReducedMotion() && "startViewTransition" in document) {
      let applied = false;
      this.#transition.attach(
        this.#transitionTargets(),
        semanticZoomTransitionRules(
          this.#transition.names,
          this.transitionDuration
        )
      );
      const transition = document.startViewTransition({
        update: () => {
          applyChange();
          applied = true;
          return this.updateComplete;
        },
        types: ["semantic-zoom"],
      });
      try {
        await transition.updateCallbackDone;
      } catch {
        // updateCallbackDone rejected — transition was skipped
      }
      if (!applied) {
        applyChange();
        await this.updateComplete;
      }
      try {
        await transition.finished;
      } catch {
        // finished rejected — transition was skipped
      }
    } else {
      applyChange();
      await this.updateComplete;
    }

    this.#transition.detach(this.#transitionTargets());
    this.#isTransitioning = false;
  }

  #transitionTargets(): Record<string, HTMLElement | null> {
    const root = this.shadowRoot;
    return {
      in: root?.querySelector<HTMLElement>(".zoomed-in") ?? null,
      out: root?.querySelector<HTMLElement>(".zoomed-out") ?? null,
    };
  }

  render() {
    return html`
      <div
        class="zoom-container"
        @touchstart=${this.#handleTouchStart}
        @touchmove=${this.#handleTouchMove}
        @touchend=${this.#handleTouchEnd}
        @wheel=${this.#handleWheel}
      >
        <div class="zoomed-in">
          <slot name="zoomed-in"></slot>
        </div>
        <div class="zoomed-out">
          <slot name="zoomed-out"></slot>
        </div>
      </div>
      <button class="zoom-hint" @click=${this.#toggleZoom}>
        ${this.zoomed === "in" ? "Zoom Out" : "Zoom In"}
      </button>
    `;
  }

  #toggleZoom(): void {
    const targetState: ZoomState = this.zoomed === "in" ? "out" : "in";
    void this.setZoomedState(targetState);
  }

  #handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 2) {
      this.#isPinching = true;
      this.#pinchStartDistance = this.#getPinchDistance(e);
    }
  }

  #handleTouchMove(e: TouchEvent): void {
    if (!this.#isPinching || e.touches.length !== 2 || this.#isTransitioning)
      return;

    const currentDistance = this.#getPinchDistance(e);
    const threshold = 50;

    if (
      this.zoomed === "in" &&
      currentDistance < this.#pinchStartDistance - threshold
    ) {
      void this.setZoomedState("out");
      this.#isPinching = false;
    } else if (
      this.zoomed === "out" &&
      currentDistance > this.#pinchStartDistance + threshold
    ) {
      void this.setZoomedState("in");
      this.#isPinching = false;
    }
  }

  #handleTouchEnd(): void {
    this.#isPinching = false;
  }

  #handleWheel(e: WheelEvent): void {
    if (!e.ctrlKey || this.#isTransitioning) return;

    e.preventDefault();

    if (e.deltaY > 0 && this.zoomed === "in") {
      void this.setZoomedState("out");
    } else if (e.deltaY < 0 && this.zoomed === "out") {
      void this.setZoomedState("in");
    }
  }

  #getPinchDistance(e: TouchEvent): number {
    const touch1 = e.touches[0];
    const touch2 = e.touches[1];
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

export function registerMetroSemanticZoom(): void {
  if (!customElements.get("metro-semantic-zoom")) {
    customElements.define("metro-semantic-zoom", MetroSemanticZoom);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-semantic-zoom": MetroSemanticZoom;
  }
}
