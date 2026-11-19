import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";
import { createTransitionScope } from "../../utils/view-transition.ts";
import { prefersReducedMotion } from "../../utils/reduced-motion.ts";

export type ZoomState = "in" | "out";

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

  constructor() {
    super();
    this.zoomed = "in";
    this.transitionDuration = 400;
  }

  protected updated(): void {
    // The CSS fallback transition runs only where there is no View Transition to
    // animate with and the user has not asked for reduced motion.
    const instant =
      prefersReducedMotion() || "startViewTransition" in document;
    const duration = instant ? 0 : this.transitionDuration;
    this.style.setProperty("--sz-dur", `${duration}ms`);
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
