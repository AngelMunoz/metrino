import { LitElement, html, css } from "lit";
import { scrollbarVisible } from "../../styles/shared.ts";
import {
  createGestureState,
  updateGesture,
  resolveGesture,
  createInertiaState,
  stepInertia,
  compressBoundary,
  createSpringState,
  stepSpring,
  createAxisRailState,
  feedAxisRail,
  normalizePointerEvent,
  type GestureState,
  type InertiaState,
  type AxisRailState,
} from "../../utils/touch-physics.ts";

export type ScrollOrientation = "horizontal" | "vertical" | "both";
export type ScrollbarMode = "auto" | "visible" | "hidden";

export class MetroScrollViewer extends LitElement {
  static properties = {
    scrollOrientation: { type: String, reflect: true },
    scrollbarMode: { type: String, reflect: true },
    touchPhysics: { type: Boolean, reflect: true, attribute: "touch-physics" },
  };

  declare scrollOrientation: ScrollOrientation;
  declare scrollbarMode: ScrollbarMode;
  declare touchPhysics: boolean;

  static styles = [
    scrollbarVisible,
    css`
      :host { display: block; overflow: hidden; box-sizing: border-box; }
      .scroll-container { width: 100%; height: 100%; overflow: auto; }
      :host([scrollOrientation="horizontal"]) .scroll-container { overflow-x: auto; overflow-y: hidden; }
      :host([scrollOrientation="vertical"]) .scroll-container { overflow-x: hidden; overflow-y: auto; }
      :host([scrollOrientation="both"]) .scroll-container { overflow: auto; }

      /* Hidden mode: always hide scrollbars */
      :host([scrollbarMode="hidden"]) .scroll-container {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      :host([scrollbarMode="hidden"]) .scroll-container::-webkit-scrollbar {
        display: none;
      }

      /* Auto mode: hide scrollbars by default, show on scroll */
      :host([scrollbarMode="auto"]) .scroll-container {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      :host([scrollbarMode="auto"]) .scroll-container::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      :host([scrollbarMode="auto"]) .scroll-container::-webkit-scrollbar-track {
        background: transparent;
      }
      :host([scrollbarMode="auto"]) .scroll-container::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 3px;
        transition: background 0.3s ease;
      }
      :host([scrollbarMode="auto"]) .scroll-container.scrolling {
        scrollbar-width: thin;
      }
      :host([scrollbarMode="auto"]) .scroll-container.scrolling::-webkit-scrollbar-thumb {
        background: var(--metro-border, rgba(255, 255, 255, 0.3));
      }

      /* Touch physics mode: override for custom scroll */
      :host([touch-physics]) .scroll-container {
        overflow: hidden;
        touch-action: none;
      }
    `,
  ];

  #scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  #scrollHandler: (() => void) | null = null;

  // Touch physics state
  #gestureState: GestureState | null = null;
  #axisRail: AxisRailState = createAxisRailState();
  #animFrameId: number | null = null;
  #lastPointer = { x: 0, y: 0 };

  constructor() {
    super();
    this.scrollOrientation = "vertical";
    this.scrollbarMode = "auto";
    this.touchPhysics = false;
  }

  protected firstUpdated(): void {
    if (this.scrollbarMode === "auto") {
      this.#attachScrollListener();
    }
  }

  protected updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("scrollbarMode")) {
      this.#detachScrollListener();
      if (this.scrollbarMode === "auto") {
        this.#attachScrollListener();
      }
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#detachScrollListener();
    this.#stopAnimation();
    if (this.#scrollTimeout) {
      clearTimeout(this.#scrollTimeout);
      this.#scrollTimeout = null;
    }
  }

  // ─── Auto-hide scrollbar ────────────────────────────────────────────

  #attachScrollListener(): void {
    const container = this.shadowRoot?.querySelector(".scroll-container");
    if (!container) return;

    this.#scrollHandler = () => {
      container.classList.add("scrolling");
      if (this.#scrollTimeout) clearTimeout(this.#scrollTimeout);
      this.#scrollTimeout = setTimeout(() => {
        container.classList.remove("scrolling");
      }, 1500);
    };

    container.addEventListener("scroll", this.#scrollHandler, { passive: true });
  }

  #detachScrollListener(): void {
    if (this.#scrollHandler) {
      const container = this.shadowRoot?.querySelector(".scroll-container");
      container?.removeEventListener("scroll", this.#scrollHandler);
      this.#scrollHandler = null;
    }
    if (this.#scrollTimeout) {
      clearTimeout(this.#scrollTimeout);
      this.#scrollTimeout = null;
    }
  }

  // ─── Touch physics ──────────────────────────────────────────────────

  #handlePointerDown(e: PointerEvent): void {
    if (!this.touchPhysics) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    this.#stopAnimation();
    const info = normalizePointerEvent(e);
    this.#gestureState = createGestureState(info);
    this.#axisRail = createAxisRailState();
    this.#lastPointer = { x: info.clientX, y: info.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  #handlePointerMove(e: PointerEvent): void {
    if (!this.touchPhysics || !this.#gestureState) return;

    const info = normalizePointerEvent(e);
    this.#gestureState = updateGesture(this.#gestureState, info);

    const rawDx = info.clientX - this.#lastPointer.x;
    const rawDy = info.clientY - this.#lastPointer.y;
    this.#lastPointer = { x: info.clientX, y: info.clientY };

    const { movement, state: nextRailState } = feedAxisRail(this.#axisRail, rawDx, rawDy);
    this.#axisRail = nextRailState;

    const container = this.shadowRoot?.querySelector(".scroll-container") as HTMLElement;
    if (!container) return;

    const maxScrollX = container.scrollWidth - container.clientWidth;
    const maxScrollY = container.scrollHeight - container.clientHeight;
    const canScrollX = this.scrollOrientation !== "vertical";
    const canScrollY = this.scrollOrientation !== "horizontal";

    let scrollX = container.scrollLeft;
    let scrollY = container.scrollTop;

    if (canScrollX) {
      const newX = scrollX - movement.x;
      if (newX < 0 || newX > maxScrollX) {
        scrollX -= compressBoundary(movement.x);
      } else {
        scrollX = newX;
      }
    }

    if (canScrollY) {
      const newY = scrollY - movement.y;
      if (newY < 0 || newY > maxScrollY) {
        scrollY -= compressBoundary(movement.y);
      } else {
        scrollY = newY;
      }
    }

    container.scrollLeft = scrollX;
    container.scrollTop = scrollY;
  }

  #handlePointerUp(_e: PointerEvent): void {
    if (!this.touchPhysics || !this.#gestureState) return;

    const result = resolveGesture(this.#gestureState);
    this.#gestureState = null;

    if (result.type === "tap") return;

    const container = this.shadowRoot?.querySelector(".scroll-container") as HTMLElement;
    if (!container) return;

    // Start inertia animation
    const canScrollX = this.scrollOrientation !== "vertical";
    const canScrollY = this.scrollOrientation !== "horizontal";

    const inertiaX = canScrollX ? createInertiaState(-result.velocityX) : null;
    const inertiaY = canScrollY ? createInertiaState(-result.velocityY) : null;

    if ((!inertiaX || !inertiaX.moving) && (!inertiaY || !inertiaY.moving)) return;

    this.#runInertiaAnimation(container, inertiaX, inertiaY);
  }

  #runInertiaAnimation(
    container: HTMLElement,
    inertiaX: InertiaState | null,
    inertiaY: InertiaState | null
  ): void {
    const maxScrollX = container.scrollWidth - container.clientWidth;
    const maxScrollY = container.scrollHeight - container.clientHeight;

    const tick = () => {
      let moving = false;

      if (inertiaX && inertiaX.moving) {
        inertiaX = stepInertia(inertiaX);
        container.scrollLeft += inertiaX.velocity;

        // Boundary check
        if (container.scrollLeft <= 0 || container.scrollLeft >= maxScrollX) {
          inertiaX = createInertiaState(0, inertiaX.position);
          // Spring back
          const overscroll = container.scrollLeft <= 0
            ? container.scrollLeft
            : container.scrollLeft - maxScrollX;
          if (Math.abs(overscroll) > 1) {
            this.#runSpringBack(container, "x", overscroll);
          }
        }
        moving = moving || inertiaX.moving;
      }

      if (inertiaY && inertiaY.moving) {
        inertiaY = stepInertia(inertiaY);
        container.scrollTop += inertiaY.velocity;

        if (container.scrollTop <= 0 || container.scrollTop >= maxScrollY) {
          inertiaY = createInertiaState(0, inertiaY.position);
          const overscroll = container.scrollTop <= 0
            ? container.scrollTop
            : container.scrollTop - maxScrollY;
          if (Math.abs(overscroll) > 1) {
            this.#runSpringBack(container, "y", overscroll);
          }
        }
        moving = moving || inertiaY.moving;
      }

      if (moving && this.isConnected) {
        this.#animFrameId = requestAnimationFrame(tick);
      }
    };

    this.#animFrameId = requestAnimationFrame(tick);
  }

  #runSpringBack(container: HTMLElement, axis: "x" | "y", overscroll: number): void {
    let spring = createSpringState(overscroll);

    const tick = () => {
      if (!this.isConnected) return;
      spring = stepSpring(spring);

      if (axis === "x") {
        container.scrollLeft -= spring.velocity;
      } else {
        container.scrollTop -= spring.velocity;
      }

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

  render() {
    return html`
      <div
        class="scroll-container"
        @pointerdown=${this.#handlePointerDown}
        @pointermove=${this.#handlePointerMove}
        @pointerup=${this.#handlePointerUp}
        @pointercancel=${this.#handlePointerUp}
      >
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("metro-scroll-viewer", MetroScrollViewer);

declare global {
  interface HTMLElementTagNameMap {
    "metro-scroll-viewer": MetroScrollViewer;
  }
}
