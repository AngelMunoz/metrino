import { LitElement, html, css } from "lit";
import { baseTypography, scrollbarHiddenClass } from "../../styles/shared.ts";
import {
  createGestureState,
  updateGesture,
  resolveGesture,
  createInertiaState,
  stepInertia,
  compressBoundary,
  createSpringState,
  stepSpring,
  normalizePointerEvent,
  type GestureState,
} from "../../utils/touch-physics.ts";

export class MetroPanorama extends LitElement {
  static properties = {
    title: { type: String },
    backgroundImage: { type: String, reflect: true, attribute: "background-image" },
  };

  declare title: string;
  declare backgroundImage: string;

  static styles = [
    baseTypography,
    scrollbarHiddenClass,
    css`
      :host {
        display: block;
        position: relative;
        overflow: hidden;
        background: var(--metro-background, #1f1f1f);
      }
      .parallax-bg {
        position: absolute;
        inset: -20%;
        background-size: cover;
        background-position: center;
        opacity: 0.15;
        pointer-events: none;
        will-change: transform;
        transition: transform 0.1s linear;
      }
      .panorama-container {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
        padding: var(--metro-spacing-lg, 16px) 0;
        position: relative;
      }
      ::slotted(metro-panorama-item) {
        scroll-snap-align: start;
        flex-shrink: 0;
        width: 85%;
        margin-right: var(--metro-spacing-lg, 16px);
      }
      .panorama-title {
        font-size: var(--metro-font-size-xxlarge, 42px);
        font-weight: 200;
        color: var(--metro-foreground, #ffffff);
        padding: var(--metro-spacing-lg, 16px);
        margin: 0;
        position: relative;
        z-index: 1;
      }
    `,
  ];

  #scrollContainer: HTMLElement | null = null;
  #gestureState: GestureState | null = null;
  #animFrameId: number | null = null;

  render() {
    return html`
      ${this.backgroundImage
        ? html`<div
            class="parallax-bg"
            style="background-image: url(${this.backgroundImage})"
          ></div>`
        : ""}
      ${this.title ? html`<h2 class="panorama-title">${this.title}</h2>` : ""}
      <div
        class="panorama-container scrollbar-hidden"
        @scroll=${this.#handleScroll}
        @pointerdown=${this.#handlePointerDown}
        @pointermove=${this.#handlePointerMove}
        @pointerup=${this.#handlePointerUp}
        @pointercancel=${this.#handlePointerUp}
      >
        <slot></slot>
      </div>
    `;
  }

  firstUpdated(): void {
    this.#scrollContainer = this.shadowRoot?.querySelector(".panorama-container") || null;
  }

  #handleScroll(): void {
    if (!this.#scrollContainer || !this.backgroundImage) return;

    const parallaxBg = this.shadowRoot?.querySelector(".parallax-bg") as HTMLElement;
    if (!parallaxBg) return;

    const scrollLeft = this.#scrollContainer.scrollLeft;
    const parallaxOffset = scrollLeft * 0.2;

    parallaxBg.style.transform = `translateX(-${parallaxOffset}px)`;
  }

  #handlePointerDown(e: PointerEvent): void {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    this.#stopAnimation();
    this.#gestureState = createGestureState(normalizePointerEvent(e));
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  #handlePointerMove(e: PointerEvent): void {
    if (!this.#gestureState || !this.#scrollContainer) return;
    const info = normalizePointerEvent(e);
    const prevX = this.#gestureState.currentX;
    this.#gestureState = updateGesture(this.#gestureState, info);

    if (this.#gestureState.resolved === "drag-x" || this.#gestureState.resolved === null) {
      const dx = info.clientX - prevX;
      const maxScroll = this.#scrollContainer.scrollWidth - this.#scrollContainer.clientWidth;
      const newScroll = this.#scrollContainer.scrollLeft - dx;

      if (newScroll < 0 || newScroll > maxScroll) {
        this.#scrollContainer.scrollLeft -= compressBoundary(dx);
      } else {
        this.#scrollContainer.scrollLeft = newScroll;
      }
    }
  }

  #handlePointerUp(_e: PointerEvent): void {
    if (!this.#gestureState || !this.#scrollContainer) return;
    const result = resolveGesture(this.#gestureState);
    this.#gestureState = null;

    if (result.type === "tap") return;

    // Apply inertia for momentum scrolling
    let inertia = createInertiaState(-result.velocityX);
    if (!inertia.moving) return;

    const container = this.#scrollContainer;
    const maxScroll = container.scrollWidth - container.clientWidth;

    const tick = () => {
      inertia = stepInertia(inertia);
      container.scrollLeft += inertia.velocity;

      // Boundary bounce
      if (container.scrollLeft <= 0 || container.scrollLeft >= maxScroll) {
        const overscroll = container.scrollLeft <= 0
          ? container.scrollLeft
          : container.scrollLeft - maxScroll;
        if (Math.abs(overscroll) > 1) {
          this.#runSpringBack(container, overscroll);
        }
        return; // Stop inertia at boundary
      }

      if (inertia.moving && this.isConnected) {
        this.#animFrameId = requestAnimationFrame(tick);
      }
    };

    this.#animFrameId = requestAnimationFrame(tick);
  }

  #runSpringBack(container: HTMLElement, overscroll: number): void {
    let spring = createSpringState(overscroll);

    const tick = () => {
      if (!this.isConnected) return;
      spring = stepSpring(spring);
      container.scrollLeft -= spring.velocity;
      if (!spring.settled && this.isConnected) {
        this.#animFrameId = requestAnimationFrame(tick);
      }
    };

    this.#animFrameId = requestAnimationFrame(tick);
  }

  #stopAnimation(): void {
    if (this.#animFrameId) {
      cancelAnimationFrame(this.#animFrameId);
      this.#animFrameId = null;
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#stopAnimation();
  }
}

customElements.define("metro-panorama", MetroPanorama);

declare global {
  interface HTMLElementTagNameMap {
    "metro-panorama": MetroPanorama;
  }
}
