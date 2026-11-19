import { LitElement, html, css } from "lit";
import { baseTypography, closeButton } from "../../styles/shared.ts";
import { focusFirstInside, rememberedFocus } from "../../utils/dialog-focus.ts";

/**
 * Teaching tip placement options relative to the target element.
 */
type TeachingTipPlacement = "top" | "bottom" | "left" | "right";

/**
 * Metro Teaching Tip Component
 *
 * A WinUI TeachingTip-behaving callout in flat Metro styling: a square,
 * accent-edged panel anchored to a target element, used for contextual
 * guidance or feature introductions.
 *
 * Features:
 * - Swivel/fade entrance (250ms Metro easing, reduced-motion safe)
 * - Four placement options: top, bottom, left, right (default bottom)
 * - Light dismiss on outside click and document-level Escape, even when
 *   focus never moved into the tip
 * - Focus moves into the tip on open and returns to the target on close
 * - Optional close button (closable, default true)
 *
 * @fires opened - Fired when the tip opens (bubbles: true, composed: true)
 * @fires closed - Fired when the tip closes (bubbles: true, composed: true)
 *
 * @cssprop --metro-background - Tip background color (default: #1f1f1f)
 * @cssprop --metro-accent - Accent edge color (default: #0078d4)
 * @cssprop --metro-transition-normal - Transition duration (default: 250ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 *
 * @slot - Default slot for tip body content
 * @slot action - Slot for the action button
 *
 * @csspart tip - The tip panel element
 * @csspart close-btn - The close button element
 */
export class MetroTeachingTip extends LitElement {
  static properties = {
    /**
     * Controls the visibility of the tip. Use show() and hide() for proper
     * event dispatching and focus handling.
     * @default false
     */
    open: { type: Boolean, reflect: true },
    /**
     * Title text displayed in the tip header.
     * @default ""
     */
    title: { type: String, reflect: true },
    /**
     * Subtitle text displayed below the title.
     * @default ""
     */
    subtitle: { type: String, reflect: true },
    /**
     * Id of the element the tip anchors to. Resolved when the tip opens;
     * show() also accepts an element or id directly.
     * @default ""
     */
    target: { type: String, reflect: true },
    /**
     * Position of the tip relative to the target element.
     * @default "bottom"
     */
    placement: { type: String, reflect: true },
    /**
     * When true, a close button is shown and light dismiss applies.
     * @default true
     */
    closable: { type: Boolean, reflect: true },
  };

  declare open: boolean;
  declare title: string;
  declare subtitle: string;
  declare target: string;
  declare placement: TeachingTipPlacement;
  declare closable: boolean;

  static styles = [
    baseTypography,
    closeButton,
    css`
      :host {
        display: none;
        position: fixed;
        z-index: 1000;
      }
      :host([open]) {
        display: block;
      }
      .tip {
        position: fixed;
        min-width: 200px;
        max-width: 320px;
        background: var(--metro-background, #1f1f1f);
        color: var(--metro-foreground, #ffffff);
        border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
        border-top: 3px solid var(--metro-accent, #0078d4);
        border-radius: 0;
        padding: var(--metro-spacing-md, 12px);
        box-sizing: border-box;
        opacity: 0;
        transform: perspective(800px) rotateX(-10deg) translateY(4px);
        transition: opacity var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)), transform var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        transform-origin: top center;
      }
      :host([open]) .tip {
        opacity: 1;
        transform: perspective(800px) rotateX(0deg) translateY(0);
      }
      :host([placement="top"]) .tip {
        transform-origin: bottom center;
      }
      :host([placement="left"]) .tip {
        transform-origin: right center;
      }
      :host([placement="right"]) .tip {
        transform-origin: left center;
      }
      .tip:focus {
        outline: none;
      }
      .tip:focus-visible {
        outline: 2px solid var(--metro-accent, #0078d4);
        outline-offset: -2px;
      }
      .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: var(--metro-spacing-sm, 8px);
      }
      .title {
        margin: 0;
        font-size: var(--metro-font-size-medium, 16px);
        font-weight: 600;
      }
      .subtitle {
        margin: var(--metro-spacing-xs, 4px) 0 0;
        font-size: var(--metro-font-size-normal, 14px);
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      }
      .body {
        margin-top: var(--metro-spacing-sm, 8px);
        font-size: var(--metro-font-size-normal, 14px);
      }
      .body:empty {
        display: none;
      }
      .action {
        margin-top: var(--metro-spacing-sm, 8px);
      }
      .action:empty {
        display: none;
      }
    `,
  ];

  #targetElement: Element | null = null;
  #previousFocus: HTMLElement | null = null;

  constructor() {
    super();
    this.open = false;
    this.title = "";
    this.subtitle = "";
    this.target = "";
    this.placement = "bottom";
    this.closable = true;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#detachDocumentListeners();
  }

  render() {
    return html`
      <div
        class="tip"
        part="tip"
        role="dialog"
        tabindex="-1"
        aria-label=${this.title || "Teaching tip"}
      >
        <div class="header">
          <div>
            ${this.title ? html`<p class="title">${this.title}</p>` : ""}
            ${this.subtitle ? html`<p class="subtitle">${this.subtitle}</p>` : ""}
          </div>
          ${this.closable
            ? html`<button class="close-btn" part="close-btn" aria-label="Close" @click=${this.#handleCloseClick}>&times;</button>`
            : ""}
        </div>
        <div class="body"><slot></slot></div>
        <div class="action"><slot name="action"></slot></div>
      </div>
    `;
  }

  /**
   * Escape at the document level: the tip closes even when focus never
   * moved into it.
   */
  #handleEscapeKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      e.preventDefault();
      void this.hide();
    }
  };

  /**
   * Light dismiss: a pointer press outside the tip closes it.
   */
  #handleOutsidePointer = (e: PointerEvent): void => {
    if (!this.open || !this.closable) return;
    if (e.composedPath().includes(this)) return;
    void this.hide();
  };

  #handleCloseClick(): void {
    void this.hide();
  }

  #attachDocumentListeners(): void {
    document.addEventListener("keydown", this.#handleEscapeKey);
    document.addEventListener("pointerdown", this.#handleOutsidePointer);
  }

  #detachDocumentListeners(): void {
    document.removeEventListener("keydown", this.#handleEscapeKey);
    document.removeEventListener("pointerdown", this.#handleOutsidePointer);
  }

  /**
   * Moves focus into the tip panel, slotted content included. Slotted
   * content often holds no tab stop, so the panel itself (tabindex -1)
   * takes focus instead.
   * @returns void
   */
  #focusPanel(): void {
    const panel = this.shadowRoot?.querySelector<HTMLElement>(".tip");
    if (!panel) return;
    if (!focusFirstInside(panel)) panel.focus();
  }

  /**
   * Returns focus to the target element that the tip was shown for.
   * @returns void
   */
  #restoreFocus(): void {
    const target = this.#previousFocus;
    this.#previousFocus = null;
    if (target && target.isConnected) {
      if (!focusFirstInside(target)) (target as HTMLElement).focus?.();
    } else if (this.#targetElement instanceof HTMLElement) {
      this.#targetElement.focus?.();
    }
  }

  #resolveTarget(target?: Element | string): Element | null {
    if (target instanceof Element) return target;
    const id = typeof target === "string" ? target : this.target;
    if (!id) return null;
    return document.getElementById(id);
  }

  /**
   * Shows the tip anchored to the target element.
   * @param target - The element (or element id) to anchor to; falls back to the `target` id property
   * @returns Promise that resolves when the tip is open.
   */
  async show(target?: Element | string): Promise<void> {
    const resolved = this.#resolveTarget(target);
    if (typeof target === "string") this.target = target;
    if (!this.open) this.#previousFocus = rememberedFocus();
    this.#targetElement = resolved;
    if (this.open) {
      this.#positionTip();
      this.#focusPanel();
      return;
    }
    this.open = true;
    await this.updateComplete;
    this.#attachDocumentListeners();
    this.#positionTip();
    this.#focusPanel();
    this.dispatchEvent(new CustomEvent("opened", { bubbles: true, composed: true }));
  }

  /**
   * Hides the tip and returns focus to the target.
   * @returns Promise that resolves when the tip is closed.
   */
  async hide(): Promise<void> {
    if (!this.open) return;
    this.open = false;
    await this.updateComplete;
    this.#detachDocumentListeners();
    this.#restoreFocus();
    this.dispatchEvent(new CustomEvent("closed", { bubbles: true, composed: true }));
  }

  /**
   * Positions the tip when it opens.
   */
  protected updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("open") && this.open && !this.#targetElement && this.target) {
      this.#targetElement = document.getElementById(this.target);
    }
    if (changedProperties.has("open") && this.open) {
      requestAnimationFrame(() => this.#positionTip());
    }
  }

  #positionTip(): void {
    const tip = this.shadowRoot?.querySelector(".tip") as HTMLElement | null;
    if (!tip) return;
    const anchor = this.#targetElement;
    if (!anchor) {
      tip.style.top = "16px";
      tip.style.left = "16px";
      return;
    }
    const rect = anchor.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    const gap = 8;
    let top = 0;
    let left = 0;

    switch (this.placement) {
      case "top":
        top = rect.top - tipRect.height - gap;
        left = rect.left;
        break;
      case "bottom":
        top = rect.bottom + gap;
        left = rect.left;
        break;
      case "left":
        top = rect.top;
        left = rect.left - tipRect.width - gap;
        break;
      case "right":
        top = rect.top;
        left = rect.right + gap;
        break;
    }

    tip.style.top = `${top}px`;
    tip.style.left = `${left}px`;
  }
}

export function registerMetroTeachingTip(): void {
  if (!customElements.get("metro-teaching-tip")) {
    customElements.define("metro-teaching-tip", MetroTeachingTip);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-teaching-tip": MetroTeachingTip;
  }
}
