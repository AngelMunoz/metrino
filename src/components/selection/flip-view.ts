import { LitElement, html, css, type PropertyValues, type TemplateResult, nothing } from "lit";
import { baseTypography } from "../../styles/shared.ts";
import "../primitives/icon.ts";
import {
  createGestureState,
  updateGesture,
  resolveGesture,
  compressBoundary,
  predictInertiaDistance,
  normalizePointerEvent,
  type GestureState,
} from "../../utils/touch-physics.ts";

export class MetroFlipView extends LitElement {
  static properties = {
    index: { type: Number },
    interval: { type: Number },
    showNav: { type: Boolean, attribute: "show-nav" },
    showIndicators: { type: Boolean, attribute: "show-indicators" },
    items: { type: Array },
  };

  declare index: number;
  declare interval: number;
  declare showNav: boolean;
  declare showIndicators: boolean;
  declare items: unknown[];

  static styles = [
    baseTypography,
    css`
      :host {
        display: block;
        position: relative;
        overflow: hidden;
        touch-action: pan-y;
      }
      .flip-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .flip-track {
        display: flex;
        height: 100%;
        transition: transform var(--metro-transition-slow, 333ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        will-change: transform;
      }
      .flip-track.dragging {
        transition: none;
      }
      .flip-item {
        flex: 0 0 100%;
        min-width: 100%;
        height: 100%;
        overflow: hidden;
      }
      slot {
        display: contents;
      }
      ::slotted(*) {
        flex: 0 0 100%;
        min-width: 100%;
        height: 100%;
      }
      .nav-button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        border: none;
        color: var(--metro-foreground, #ffffff);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        z-index: 10;
      }
      :host(:hover) .nav-button,
      :host(:focus-within) .nav-button {
        opacity: 1;
      }
      .nav-button:hover {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.2));
      }
      .nav-button:active {
        background: var(--metro-accent, #0078d4);
      }
      .nav-button:disabled {
        opacity: 0.3;
        cursor: default;
      }
      .nav-button.prev {
        left: 0;
      }
      .nav-button.next {
        right: 0;
      }
      .nav-icon {
        width: 20px;
        height: 20px;
        fill: currentColor;
      }
      .indicators {
        position: absolute;
        bottom: var(--metro-spacing-md, 12px);
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: var(--metro-spacing-xs, 4px);
        z-index: 10;
      }
      .indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--metro-foreground, #ffffff);
        opacity: 0.4;
        border: none;
        padding: 0;
        cursor: pointer;
        transition: opacity var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          transform var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .indicator:hover {
        opacity: 0.7;
      }
      .indicator.active {
        opacity: 1;
        transform: scale(1.25);
      }
    `,
  ];

  #gestureState: GestureState | null = null;
  #dragOffset = 0;
  #boundaryBounce = 0;

  constructor() {
    super();
    this.index = 0;
    this.interval = 5000;
    this.showNav = true;
    this.showIndicators = true;
    this.items = [];
  }

  render() {
    const itemCount = this.#getItemCount();
    const translateX = -(this.index * 100);
    const dragOffset = this.#dragOffset;

    return html`
      <div
        class="flip-container"
        @pointerdown=${this.#handlePointerDown}
        @pointermove=${this.#handlePointerMove}
        @pointerup=${this.#handlePointerUp}
        @pointercancel=${this.#handlePointerUp}
        @touchstart=${this.#handleTouchStart}
        @touchmove=${this.#handleTouchMove}
        @touchend=${this.#handleTouchEnd}
      >
        <div
          class="flip-track ${this.#gestureState ? "dragging" : ""}"
          style="transform: translateX(calc(${translateX}% + ${dragOffset}%))"
        >
          ${this.#renderItems()}
        </div>
        ${this.showNav && itemCount > 1
          ? html`
              <button
                class="nav-button prev"
                aria-label="Previous"
                ?disabled=${this.index === 0}
                @click=${this.#goPrev}
              >
                <metro-icon icon="back"></metro-icon>
              </button>
              <button
                class="nav-button next"
                aria-label="Next"
                ?disabled=${this.index >= itemCount - 1}
                @click=${this.#goNext}
              >
                <metro-icon icon="forward"></metro-icon>
              </button>
            `
          : nothing}
        ${this.showIndicators && itemCount > 1
          ? html`
              <div class="indicators" role="tablist">
                ${Array.from({ length: itemCount }, (_, i) => {
                  const isActive = i === this.index;
                  return html`
                    <button
                      class="indicator ${isActive ? "active" : ""}"
                      role="tab"
                      aria-selected="${isActive}"
                      aria-label="Go to item ${i + 1}"
                      @click=${() => this.#goToIndex(i)}
                    ></button>
                  `;
                })}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  #getItemCount(): number {
    if (this.items.length > 0) {
      return this.items.length;
    }
    return this.children.length;
  }

  #renderItems(): TemplateResult {
    if (this.items.length > 0) {
      return html`
        ${this.items.map(
          (item, i) => html`
            <div class="flip-item" role="tabpanel" aria-hidden=${i !== this.index} @click=${() => this.#handleItemClick(i)}>
              ${this.#renderItemContent(item)}
            </div>
          `
        )}
      `;
    }
    return html`<slot></slot>`;
  }

  #renderItemContent(item: unknown): TemplateResult | typeof nothing {
    if (typeof item === "object" && item !== null && "content" in item) {
      return html`${(item as { content: TemplateResult }).content}`;
    }
    return nothing;
  }

  #handlePointerDown(e: PointerEvent): void {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const info = normalizePointerEvent(e);
    this.#gestureState = createGestureState(info);
    this.#dragOffset = 0;
    this.#boundaryBounce = 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  #handlePointerMove(e: PointerEvent): void {
    if (!this.#gestureState) return;
    const info = normalizePointerEvent(e);
    this.#gestureState = updateGesture(this.#gestureState, info);

    if (this.#gestureState.resolved === "drag-x" || this.#gestureState.resolved === null) {
      const dx = info.clientX - this.#gestureState.startX;
      const itemCount = this.#getItemCount();
      const atStart = this.index === 0 && dx > 0;
      const atEnd = this.index >= itemCount - 1 && dx < 0;

      if (atStart || atEnd) {
        // Boundary resistance — rubber-band effect
        this.#boundaryBounce = compressBoundary(dx);
        this.#dragOffset = (this.#boundaryBounce / this.clientWidth) * 100;
      } else {
        this.#dragOffset = (dx / this.clientWidth) * 100;
      }
      this.requestUpdate();
    }
  }

  #handlePointerUp(_e: PointerEvent): void {
    this.#finishGesture();
  }

  // Touch event fallback for environments without PointerEvent
  #handleTouchStart(e: TouchEvent): void {
    // Skip if pointer events already handled this
    if (this.#gestureState) return;
    const info = normalizePointerEvent(e);
    this.#gestureState = createGestureState(info);
    this.#dragOffset = 0;
    this.#boundaryBounce = 0;
  }

  #handleTouchMove(e: TouchEvent): void {
    if (!this.#gestureState) return;
    const info = normalizePointerEvent(e);
    this.#gestureState = updateGesture(this.#gestureState, info);

    if (this.#gestureState.resolved === "drag-x" || this.#gestureState.resolved === null) {
      e.preventDefault();
      const dx = info.clientX - this.#gestureState.startX;
      const itemCount = this.#getItemCount();
      const atStart = this.index === 0 && dx > 0;
      const atEnd = this.index >= itemCount - 1 && dx < 0;

      if (atStart || atEnd) {
        this.#boundaryBounce = compressBoundary(dx);
        this.#dragOffset = (this.#boundaryBounce / this.clientWidth) * 100;
      } else {
        this.#dragOffset = (dx / this.clientWidth) * 100;
      }
      this.requestUpdate();
    }
  }

  #handleTouchEnd(_e: TouchEvent): void {
    this.#finishGesture();
  }

  #finishGesture(): void {
    if (!this.#gestureState) return;

    const result = resolveGesture(this.#gestureState);
    const itemCount = this.#getItemCount();

    if (result.type === "tap") {
      // Let click events handle taps
    } else if (result.type === "drag-x" || result.type === null) {
      // Calculate target from velocity + distance
      const velocityPx = result.velocityX;
      const predictedPx = predictInertiaDistance(velocityPx);
      const totalDx = result.dx + predictedPx;
      const threshold = this.clientWidth * 0.15;

      if (totalDx < -threshold && this.index < itemCount - 1) {
        this.#goNext();
      } else if (totalDx > threshold && this.index > 0) {
        this.#goPrev();
      }
    }

    this.#gestureState = null;
    this.#dragOffset = 0;
    this.#boundaryBounce = 0;
    this.requestUpdate();
  }

  #handleItemClick(index: number): void {
    this.dispatchEvent(
      new CustomEvent("itemclick", {
        detail: { item: this.items[index], index },
        bubbles: true,
        composed: true,
      })
    );
  }

  #goPrev(): void {
    if (this.index > 0) {
      this.#goToIndex(this.index - 1);
    }
  }

  #goNext(): void {
    const itemCount = this.#getItemCount();
    if (this.index < itemCount - 1) {
      this.#goToIndex(this.index + 1);
    }
  }

  #goToIndex(index: number): void {
    const itemCount = this.#getItemCount();
    const newIndex = Math.max(0, Math.min(index, itemCount - 1));
    
    if (newIndex !== this.index) {
      this.index = newIndex;
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: { index: this.index },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("index")) {
      const itemCount = this.#getItemCount();
      if (itemCount > 0) {
        this.index = Math.max(0, Math.min(this.index, itemCount - 1));
      }
    }
  }

  protected firstUpdated(): void {
  }

  protected updated(_changedProperties: PropertyValues<this>): void {
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
  }

  goTo(index: number): void {
    this.#goToIndex(index);
  }

  next(): void {
    this.#goNext();
  }

  prev(): void {
    this.#goPrev();
  }
}

customElements.define("metro-flip-view", MetroFlipView);

declare global {
  interface HTMLElementTagNameMap {
    "metro-flip-view": MetroFlipView;
  }
}
