import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

export class MetroSemanticZoom extends LitElement {
  static properties = {
    zoomed: { type: String, reflect: true },
  };

  declare zoomed: "in" | "out";

  static styles = [
    baseTypography,
    css`
      :host {
        display: block;
        position: relative;
        overflow: hidden;
        touch-action: none;
      }
      .zoom-container {
        width: 100%;
        height: 100%;
        position: relative;
      }
      .zoomed-in,
      .zoomed-out {
        position: absolute;
        width: 100%;
        height: 100%;
        transition:
          transform var(--metro-transition-slow, 333ms)
            var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          opacity var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .zoomed-in {
        transform: scale(1);
        opacity: 1;
      }
      .zoomed-out {
        transform: scale(0.5);
        opacity: 0;
        pointer-events: none;
      }
      :host([zoomed="out"]) .zoomed-in {
        transform: scale(2);
        opacity: 0;
        pointer-events: none;
      }
      :host([zoomed="out"]) .zoomed-out {
        transform: scale(1);
        opacity: 1;
        pointer-events: auto;
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
        font-family: inherit;
      }
    `,
  ];

  #pinchStartDistance = 0;
  #isPinching = false;

  constructor() {
    super();
    this.zoomed = "in";
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
    this.zoomed = this.zoomed === "in" ? "out" : "in";
    this.dispatchEvent(
      new CustomEvent("zoomchanged", {
        detail: { zoomed: this.zoomed },
        bubbles: true,
      }),
    );
  }

  #handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 2) {
      this.#isPinching = true;
      this.#pinchStartDistance = this.#getPinchDistance(e);
    }
  }

  #handleTouchMove(e: TouchEvent): void {
    if (!this.#isPinching || e.touches.length !== 2) return;

    const currentDistance = this.#getPinchDistance(e);
    const threshold = 50;

    if (this.zoomed === "in" && currentDistance < this.#pinchStartDistance - threshold) {
      this.zoomed = "out";
      this.#isPinching = false;
      this.dispatchEvent(
        new CustomEvent("zoomchanged", {
          detail: { zoomed: this.zoomed },
          bubbles: true,
        }),
      );
    } else if (this.zoomed === "out" && currentDistance > this.#pinchStartDistance + threshold) {
      this.zoomed = "in";
      this.#isPinching = false;
      this.dispatchEvent(
        new CustomEvent("zoomchanged", {
          detail: { zoomed: this.zoomed },
          bubbles: true,
        }),
      );
    }
  }

  #handleTouchEnd(): void {
    this.#isPinching = false;
  }

  #handleWheel(e: WheelEvent): void {
    if (!e.ctrlKey) return;

    e.preventDefault();

    if (e.deltaY > 0 && this.zoomed === "in") {
      this.zoomed = "out";
      this.dispatchEvent(
        new CustomEvent("zoomchanged", {
          detail: { zoomed: this.zoomed },
          bubbles: true,
        }),
      );
    } else if (e.deltaY < 0 && this.zoomed === "out") {
      this.zoomed = "in";
      this.dispatchEvent(
        new CustomEvent("zoomchanged", {
          detail: { zoomed: this.zoomed },
          bubbles: true,
        }),
      );
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
