import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

export type ZoomState = "in" | "out";

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
        touch-action: none;
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
      }
      .zoomed-in {
        view-transition-name: semantic-zoom-in;
        transform: scale(1);
        opacity: 1;
        filter: blur(0);
        z-index: 1;
      }
      .zoomed-out {
        view-transition-name: semantic-zoom-out;
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

  constructor() {
    super();
    this.zoomed = "in";
    this.transitionDuration = 400;
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

    if ("startViewTransition" in document) {
      let applied = false;
      const transition = document.startViewTransition({
        update: () => {
          applyChange();
          applied = true;
          return this.updateComplete;
        },
        types: ["semantic-zoom"],
      });
      transition.finished.catch(() => {});
      await transition.updateCallbackDone;
      if (!applied) {
        applyChange();
        await this.updateComplete;
      }
    } else {
      applyChange();
      await this.updateComplete;
    }

    this.#isTransitioning = false;
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
      this.setZoomedState("out");
      this.#isPinching = false;
    } else if (
      this.zoomed === "out" &&
      currentDistance > this.#pinchStartDistance + threshold
    ) {
      this.setZoomedState("in");
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
      this.setZoomedState("out");
    } else if (e.deltaY < 0 && this.zoomed === "out") {
      this.setZoomedState("in");
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

customElements.define("metro-semantic-zoom", MetroSemanticZoom);

declare global {
  interface HTMLElementTagNameMap {
    "metro-semantic-zoom": MetroSemanticZoom;
  }
}
