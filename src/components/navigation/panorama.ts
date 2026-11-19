import { LitElement, html, css, type PropertyValues } from "lit";
import { baseTypography, scrollbarHiddenClass } from "../../styles/shared.ts";
import { prefersReducedMotion } from "../../utils/reduced-motion.ts";
import {
  createGestureState,
  updateGesture,
  resolveGesture,
  createInertiaState,
  stepInertia,
  compressBoundary,
  createSpringState,
  stepSpring,
  frameDeltaMs,
  normalizePointerEvent,
  type GestureState,
} from "../../utils/touch-physics.ts";

const SAFE_BACKGROUND_SCHEMES = new Set(["http:", "https:"]);

/**
 * Marks a light-DOM copy of a panorama item that only exists to bridge the
 * circular seam. Its value names the side it sits on.
 */
const CLONE_ATTRIBUTE = "data-panorama-clone";

/** Selector for the real (non-clone) items, in document order. */
const REAL_ITEMS = `metro-panorama-item:not([${CLONE_ATTRIBUTE}])`;

/**
 * Where the circular seam of one item sits. Everything is measured against the
 * container's scroll content edge, the same basis `scrollLeft` uses.
 */
interface WrapGeometry {
  /** `scrollLeft` that puts the first real item at the seam line. */
  firstReal: number;
  /** `scrollLeft` that puts the first copy of that item at the same line. */
  seam: number;
  /** Distance between an item and its copy: one full turn of the cycle. */
  period: number;
}

/**
 * Builds a quoted CSS url() for a background image, or null when the value is
 * empty or uses a scheme other than http(s) or data:image.
 * @param value - The background image URL
 * @returns string | null
 */
function safeBackgroundStyle(value: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, document.baseURI);
    if (
      !SAFE_BACKGROUND_SCHEMES.has(url.protocol) &&
      !url.href.toLowerCase().startsWith("data:image/")
    ) {
      return null;
    }
    const escaped = url.href.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `url("${escaped}")`;
  } catch {
    return null;
  }
}

/**
 * Metro Panorama Component
 *
 * A full-screen, horizontally scrolling view with parallax background effect.
 * The Panorama is inspired by the Windows Phone Panorama control, providing
 * an immersive browsing experience with smooth touch-based scrolling and
 * momentum-based physics.
 *
 * Features:
 * - Full-width horizontal scrolling with momentum/inertia
 * - Parallax background image effect
 * - Touch and pointer gesture support with physics-based scrolling
 * - Spring-back boundary animation when scrolling past edges
 * - Snap points for each panorama item
 * - Smooth scroll behavior with optional scroll-snap
 * - Opt-in circular scrolling through the `wrap` attribute
 *
 * The Panorama is ideal for showcasing featured content, image galleries,
 * or any full-screen horizontally-navigable content.
 *
 * @cssprop --metro-background - Background color (default: #1f1f1f)
 * @cssprop --metro-foreground - Title text color (default: #ffffff)
 * @cssprop --metro-spacing-lg - Large spacing unit (default: 16px)
 * @cssprop --metro-font-size-xxlarge - Font size for title (default: 42px)
 *
 * @slot - Default slot for metro-panorama-item children
 *
 * @csspart panorama-container - The scrollable container with items
 * @csspart parallax-bg - The parallax background element
 * @csspart panorama-title - The title element
 */
export class MetroPanorama extends LitElement {
  static properties = {
    /**
     * Optional title displayed at the top of the panorama.
     * @default ""
     */
    title: { type: String },
    /**
     * URL of the background image for the parallax effect.
     * The image is displayed at 15% opacity and moves at 20% of scroll speed.
     * Only relative URLs, http(s) URLs and data:image URLs are applied;
     * other schemes are ignored.
     * @default ""
     */
    backgroundImage: { type: String, reflect: true, attribute: "background-image" },
    /**
     * Circular scrolling. When present, the item after the last one is the
     * first item and the item before the first one is the last: a fling that
     * runs off either end continues at the other without a visible cut.
     * Absent by default: the ends are bounds and spring back.
     */
    wrap: { type: Boolean, reflect: true },
  };

  declare title: string;
  declare backgroundImage: string;
  declare wrap: boolean;

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
      }
      .panorama-container {
        display: flex;
        overflow-x: auto;
        overflow-y: hidden;
        scroll-snap-type: x mandatory;
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
  /**
   * Holds the inline `scroll-snap-type` saved while a scripted animation owns
   * the scroll position, or null while the browser owns it.
   */
  #savedSnapType: string | null = null;
  /** Set from the frame a wrap jump was written until the next frame begins. */
  #wrapJumpPending = false;
  /** Frame that clears {@link #wrapJumpPending}, or 0 when none is queued. */
  #wrapJumpFrame = 0;
  /** The real items the clones were built from, so `slotchange` can ignore itself. */
  #clonedFrom: HTMLElement[] = [];

  constructor() {
    super();
    this.wrap = false;
  }

  render() {
    return html`
      ${safeBackgroundStyle(this.backgroundImage)
        ? html`<div class="parallax-bg"></div>`
        : ""}
      ${this.title ? html`<h2 class="panorama-title">${this.title}</h2>` : ""}
      <div
        class="panorama-container scrollbar-hidden"
        role="region"
        aria-label="Panorama"
        aria-roledescription="panorama"
        @scroll=${this.#handleScroll}
        @pointerdown=${this.#handlePointerDown}
        @pointermove=${this.#handlePointerMove}
        @pointerup=${this.#handlePointerUp}
        @pointercancel=${this.#handlePointerUp}
      >
        <slot @slotchange=${this.#handleSlotChange}></slot>
      </div>
    `;
  }

  /**
   * Called when the component is first updated.
   * Stores a reference to the scroll container element.
   * @returns void
   */
  firstUpdated(): void {
    this.#scrollContainer = this.shadowRoot?.querySelector(".panorama-container") || null;
  }

  protected updated(changed: PropertyValues<this>): void {
    const parallaxBg = this.shadowRoot?.querySelector<HTMLElement>(".parallax-bg");
    if (parallaxBg) {
      parallaxBg.style.backgroundImage = safeBackgroundStyle(this.backgroundImage) ?? "";
    }
    if (changed.has("wrap")) {
      this.#applyWrap();
    }
  }

  /**
   * Handles scroll events: keeps the wrap seam normalized and moves the
   * parallax background.
   * @returns void
   */
  #handleScroll(): void {
    // A wrap jump is itself a scripted scroll write, so the scroll event it
    // produces must not normalize the position a second time.
    if (!this.#wrapJumpPending) {
      this.#normalizeWrap();
    }
    this.#updateParallax();
  }

  /**
   * Moves the parallax background to the logical scroll position, so the
   * image stays continuous across the wrap seam.
   * @returns void
   */
  #updateParallax(): void {
    if (!this.#scrollContainer || !this.backgroundImage) return;

    const parallaxBg = this.shadowRoot?.querySelector(".parallax-bg") as HTMLElement;
    if (!parallaxBg) return;

    const geometry = this.#wrapGeometry();
    const scrollLeft = this.#scrollContainer.scrollLeft;
    const logical =
      geometry === null
        ? scrollLeft
        : ((scrollLeft - geometry.firstReal) % geometry.period + geometry.period) %
          geometry.period;

    parallaxBg.style.transform = `translateX(-${logical * 0.2}px)`;
  }

  /**
   * Handles pointer down events to begin gesture tracking.
   * Only responds to left mouse button or touch pointers.
   * @param e - The pointer event
   * @returns void
   */
  #handlePointerDown(e: PointerEvent): void {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    this.#stopAnimation();
    this.#gestureState = createGestureState(normalizePointerEvent(e));
    // The drag writes `scrollLeft` on every move exactly like the inertia loop
    // does, so it owns the snap points from pointer down too: with
    // `x mandatory` live the browser re-snaps each write back to the nearest
    // boundary and the content never follows the pointer.
    this.#suppressSnap();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  /**
   * Handles pointer move events for gesture-based scrolling.
   * Updates scroll position based on drag delta with boundary compression.
   * @param e - The pointer event
   * @returns void
   */
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
      // The drag owns the position, so the seam has to be normalized here and
      // not only on the scroll event the write produces one frame later.
      this.#normalizeWrap();
    }
  }

  /**
   * Handles pointer up events to end gestures and apply inertia.
   * Calculates velocity and applies momentum-based scrolling.
   * @param _e - The pointer event (unused but required for signature)
   * @returns void
   */
  #handlePointerUp(_e: PointerEvent): void {
    if (!this.#gestureState || !this.#scrollContainer) return;
    const result = resolveGesture(this.#gestureState);
    this.#gestureState = null;

    if (result.type === "tap") {
      this.#releaseSnap();
      return;
    }

    // Reduced motion skips the momentum instead of running it faster: the
    // container lands on the nearest item boundary in one step, with no glide
    // and no spring. That landing is exactly what `#releaseSnap` performs when
    // it hands the snap points back, so the release path runs through it.
    if (prefersReducedMotion()) {
      this.#releaseSnap();
      return;
    }

    // Apply inertia for momentum scrolling
    let inertia = createInertiaState(-result.velocityX);
    if (!inertia.moving) {
      this.#releaseSnap();
      return;
    }

    const container = this.#scrollContainer;
    const maxScroll = container.scrollWidth - container.clientWidth;
    this.#suppressSnap();
    let lastFrame: number | null = null;

    const tick = (timestamp: number) => {
      const dt = frameDeltaMs(lastFrame, timestamp);
      lastFrame = timestamp;
      inertia = stepInertia(inertia, dt);
      container.scrollLeft += inertia.velocity * dt;
      this.#normalizeWrap();

      // Boundary bounce
      if (container.scrollLeft <= 0 || container.scrollLeft >= maxScroll) {
        const overscroll = container.scrollLeft <= 0
          ? container.scrollLeft
          : container.scrollLeft - maxScroll;
        if (Math.abs(overscroll) > 1) {
          this.#runSpringBack(container, overscroll);
        } else {
          this.#releaseSnap();
        }
        return; // Stop inertia at boundary
      }

      if (inertia.moving && this.isConnected) {
        this.#animFrameId = requestAnimationFrame(tick);
      } else {
        this.#releaseSnap();
      }
    };

    this.#animFrameId = requestAnimationFrame(tick);
  }

  /**
   * Runs a spring-back animation when scrolling past the container boundaries.
   * Animates the container back to the valid scroll range with spring physics.
   * @param container - The scroll container element
   * @param overscroll - The amount scrolled past the boundary (negative for left, positive for right)
   * @returns void
   */
  #runSpringBack(container: HTMLElement, overscroll: number): void {
    let spring = createSpringState(overscroll);
    this.#suppressSnap();
    let lastFrame: number | null = null;

    const tick = (timestamp: number) => {
      if (!this.isConnected) return;
      const dt = frameDeltaMs(lastFrame, timestamp);
      lastFrame = timestamp;
      spring = stepSpring(spring, dt);
      container.scrollLeft -= spring.velocity * dt;
      this.#normalizeWrap();
      if (!spring.settled && this.isConnected) {
        this.#animFrameId = requestAnimationFrame(tick);
      } else {
        this.#releaseSnap();
      }
    };

    this.#animFrameId = requestAnimationFrame(tick);
  }

  /**
   * Takes the snap points away from the browser for the length of a scripted
   * animation. Mandatory snap re-snaps every `scrollLeft` the script writes,
   * which drags each frame back to the nearest boundary and turns the glide
   * into a stutter. Native scrolling keeps its snap points.
   * @returns void
   */
  #suppressSnap(): void {
    const container = this.#scrollContainer;
    if (!container || this.#savedSnapType !== null) return;
    this.#savedSnapType = container.style.scrollSnapType;
    container.style.scrollSnapType = "none";
  }

  /**
   * Hands the snap points back to the browser. A scripted glide stops wherever
   * its velocity ran out, so land on the nearest item start first: restoring
   * `x mandatory` on an off-boundary position would jump the content again.
   * @returns void
   */
  #releaseSnap(): void {
    const container = this.#scrollContainer;
    if (container && this.#savedSnapType !== null) {
      container.scrollLeft = this.#nearestSnapPoint(container);
      container.style.scrollSnapType = this.#savedSnapType;
      // The nearest real item start can sit on the far side of the seam after
      // a wrap, and the snap areas include the clones: normalize maps whatever
      // landed there onto its real twin, at identical pixels.
      this.#normalizeWrap();
    }
    this.#savedSnapType = null;
  }

  /**
   * The scroll position that puts each item's start edge on the scrollport,
   * pulled into the range the container can actually scroll to. The seam
   * clones are not snap points: they only stand in for a real item while the
   * position is mid-cycle.
   * @param container - The scroll container element
   * @returns number[]
   */
  #snapPoints(container: HTMLElement): number[] {
    const padding = parseFloat(getComputedStyle(container).paddingLeft) || 0;
    const maxScroll = container.scrollWidth - container.clientWidth;
    return Array.from(
      this.querySelectorAll<HTMLElement>(REAL_ITEMS)
    ).map((item) =>
      Math.min(Math.max(item.offsetLeft - padding, 0), maxScroll)
    );
  }

  /**
   * @param container - The scroll container element
   * @returns the snap point nearest the current scroll position
   */
  #nearestSnapPoint(container: HTMLElement): number {
    const points = this.#snapPoints(container);
    if (points.length === 0) return container.scrollLeft;

    const scrollLeft = container.scrollLeft;
    return points.reduce((nearest, point) =>
      Math.abs(point - scrollLeft) < Math.abs(nearest - scrollLeft)
        ? point
        : nearest
    );
  }

  /**
   * The items the reader authored, in document order: the children that are
   * not seam copies.
   * @returns HTMLElement[]
   */
  #realItems(): HTMLElement[] {
    return Array.from(this.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement &&
        child.tagName === "METRO-PANORAMA-ITEM" &&
        !child.hasAttribute(CLONE_ATTRIBUTE),
    );
  }

  /**
   * Rebuilds the seam copies. One copy per end is only enough when an item is
   * narrower than half the scrollport: an item is 85% wide, so the copy of the
   * first item has to sit far enough past the last one that the container can
   * actually scroll to it. Each side therefore carries as many copies as cover
   * one scrollport, taken from the ends of the cycle in cycle order, which
   * keeps the whole strip periodic.
   * @returns void
   */
  #syncClones(): void {
    const real = this.#realItems();
    this.#clonedFrom = real;

    for (const child of Array.from(this.children)) {
      if (child instanceof HTMLElement && child.hasAttribute(CLONE_ATTRIBUTE)) {
        child.remove();
      }
    }

    const container = this.#scrollContainer;
    if (!this.wrap || !container || real.length < 2) return;

    const step = real[1].offsetLeft - real[0].offsetLeft;
    if (step <= 0 || container.clientWidth <= 0) return;

    const copies = Math.min(
      real.length,
      Math.max(1, Math.ceil(container.clientWidth / step))
    );
    const first = real[0];
    for (let i = real.length - copies; i < real.length; i++) {
      this.insertBefore(this.#seamCopy(real[i], "start"), first);
    }
    for (let i = 0; i < copies; i++) {
      this.appendChild(this.#seamCopy(real[i], "end"));
    }
  }

  /**
   * A decorative copy of one item, marked with the side of the seam it bridges.
   * @param item - The real item to copy
   * @param side - `"start"` before the first item, `"end"` after the last
   * @returns HTMLElement
   */
  #seamCopy(item: HTMLElement, side: "start" | "end"): HTMLElement {
    const clone = item.cloneNode(true) as HTMLElement;
    clone.removeAttribute("id");
    for (const descendant of Array.from(clone.querySelectorAll("[id]"))) {
      descendant.removeAttribute("id");
    }
    if ("inert" in clone) {
      (clone as unknown as { inert: boolean }).inert = true;
    }
    for (const focusable of Array.from(
      clone.querySelectorAll<HTMLElement>(
        "a[href],button,input,select,textarea,[tabindex]"
      )
    )) {
      focusable.setAttribute("tabindex", "-1");
    }
    if (clone.hasAttribute("tabindex")) {
      clone.setAttribute("tabindex", "-1");
    }
    clone.setAttribute(CLONE_ATTRIBUTE, side);
    clone.setAttribute("aria-hidden", "true");
    return clone;
  }

  /**
   * The seam positions of the current cycle, or null while wrap is off, the
   * copies are missing, or there is nothing to wrap.
   * @returns WrapGeometry | null
   */
  #wrapGeometry(): WrapGeometry | null {
    const container = this.#scrollContainer;
    if (!container || !this.wrap) return null;

    const first = this.querySelector<HTMLElement>(REAL_ITEMS);
    const seamItem = this.querySelector<HTMLElement>(
      `metro-panorama-item[${CLONE_ATTRIBUTE}="end"]`
    );
    if (!first || !seamItem) return null;

    const padding = parseFloat(getComputedStyle(container).paddingLeft) || 0;
    const firstReal = first.offsetLeft - padding;
    const seam = seamItem.offsetLeft - padding;
    const period = seam - firstReal;

    return period > 0 ? { firstReal, seam, period } : null;
  }

  /**
   * Brings a scroll position that ran past either seam back onto the matching
   * spot one cycle away. The two positions draw the same pixels, so the jump
   * reads as the scroll continuing instead of the content being moved.
   * @returns void
   */
  #normalizeWrap(): void {
    const container = this.#scrollContainer;
    if (!container) return;

    const geometry = this.#wrapGeometry();
    if (geometry === null) return;

    const scrollLeft = container.scrollLeft;
    let next: number | null = null;
    if (scrollLeft >= geometry.seam) {
      next = scrollLeft - geometry.period;
    } else if (scrollLeft < geometry.firstReal - 1) {
      next = scrollLeft + geometry.period;
    }
    if (next === null) return;

    this.#wrapJumpPending = true;
    if (this.#wrapJumpFrame === 0) {
      this.#wrapJumpFrame = requestAnimationFrame(() => {
        this.#wrapJumpFrame = 0;
        this.#wrapJumpPending = false;
      });
    }
    container.scrollLeft = next;
  }

  /**
   * Applies a `wrap` change: rebuilds the copies and takes up the position the
   * cycle starts from, so turning wrap on does not rest on the first item's
   * copy.
   * @returns void
   */
  #applyWrap(): void {
    this.#syncClones();

    const container = this.#scrollContainer;
    const geometry = this.#wrapGeometry();
    // The write is what moves the parallax as well: it produces the scroll
    // event that `#handleScroll` reads, so nothing needs refreshing by hand.
    if (container && geometry) {
      container.scrollLeft = geometry.firstReal;
    }
  }

  /**
   * Rebuilds the seam when the authored items change. The copies are slotted
   * too, so this also fires for the rebuild itself: the guard against the items
   * the copies were made from keeps that pass a no-op.
   * @returns void
   */
  #handleSlotChange(): void {
    const real = this.#realItems();
    if (
      real.length === this.#clonedFrom.length &&
      real.every((item, index) => item === this.#clonedFrom[index])
    ) {
      return;
    }
    this.#syncClones();
    // Normalizing writes the position when the cycle moved, and that write is
    // what re-reads the parallax through the scroll event it produces.
    this.#normalizeWrap();
  }

  /**
   * Stops any running animation frame for inertia or spring-back.
   * @returns void
   */
  #stopAnimation(): void {
    if (this.#animFrameId) {
      cancelAnimationFrame(this.#animFrameId);
      this.#animFrameId = null;
    }
    this.#releaseSnap();
  }

  /**
   * Cleans up animation when the component is disconnected.
   * @returns void
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#stopAnimation();
  }
}

export function registerMetroPanorama(): void {
  if (!customElements.get("metro-panorama")) {
    customElements.define("metro-panorama", MetroPanorama);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-panorama": MetroPanorama;
  }
}
