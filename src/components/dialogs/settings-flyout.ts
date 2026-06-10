import { LitElement, html, css } from "lit";
import { baseTypography, closeButton } from "../../styles/shared.ts";
import type { PropertyValueMap } from "lit";
import "../primitives/icon.ts";

/**
 * Settings flyout width options.
 */
type SettingsFlyoutWidth = "narrow" | "wide";

/**
 * Metro Settings Flyout Component
 *
 * A specialized flyout panel designed for application settings. Slides in
 * from the right side of the screen with a backdrop overlay. Features focus
 * management, keyboard support (Escape to close), and restore focus on close.
 *
 * Features:
 * - Slides in from right side of viewport via View Transitions
 * - Two width options: narrow (346px) and wide (646px)
 * - Backdrop overlay with click-to-close
 * - Title header with close button
 * - Focus management (traps focus, restores on close)
 * - Keyboard support (Escape key closes)
 *
 * Use for application settings, preferences, or any side panel that
 * requires user attention and should be dismissible.
 *
 * @fires open - Fired when the flyout opens (bubbles: true, composed: true)
 * @fires close - Fired when the flyout closes (bubbles: true, composed: true)
 *
 * @cssprop --metro-background - Flyout background color (default: #1f1f1f)
 * @cssprop --metro-foreground - Title text color (default: #ffffff)
 * @cssprop --metro-foreground-secondary - Close button color (default: rgba(255, 255, 255, 0.6))
 * @cssprop --metro-border - Border color for header separator (default: rgba(255, 255, 255, 0.1))
 * @cssprop --metro-spacing-lg - Large spacing unit (default: 16px)
 * @cssprop --metro-spacing-xl - Extra large spacing unit (default: 24px)
 * @cssprop --metro-transition-slow - Transition duration (default: 333ms)
 * @cssprop --metro-transition-fast - Fast transition for close button (default: 167ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 * @cssprop --metro-font-size-title - Title font size (default: 24px)
 *
 * @slot - Default slot for settings content
 *
 * @csspart flyout-backdrop - The backdrop overlay element
 * @csspart flyout-panel - The slide-in panel container
 * @csspart flyout-header - The header section with title and close button
 * @csspart flyout-title - The title element
 * @csspart flyout-content - The scrollable content area
 * @csspart close-btn - The close button element
 */
export class MetroSettingsFlyout extends LitElement {
  static properties = {
    /**
     * Title text displayed in the flyout header.
     * @default ""
     */
    title: { type: String, reflect: true },
    /**
     * Controls the visibility of the flyout. When true, the panel slides in
     * from the right and the backdrop appears.
     * @default false
     */
    open: { type: Boolean, reflect: true },
    /**
     * Width variant of the flyout.
     * - "narrow": 346px width (default)
     * - "wide": 646px width
     * @default "narrow"
     */
    width: { type: String, reflect: true },
  };

  declare title: string;
  declare open: boolean;
  declare width: SettingsFlyoutWidth;

  static styles = [
    baseTypography,
    closeButton,
    css`
      :host {
        display: block;
      }
      :host(:active-view-transition) {
        view-transition-name: none;
      }
      .flyout-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        opacity: 0;
        visibility: hidden;
        transition: opacity var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          visibility var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        z-index: 1000;
        view-transition-name: settings-flyout-backdrop;
      }
      :host([open]) .flyout-backdrop {
        opacity: 1;
        visibility: visible;
      }
      .flyout-panel {
        position: fixed;
        top: 0;
        right: 0;
        height: 100vh;
        width: 346px;
        background: var(--metro-background, #1f1f1f);
        transform: translateX(100%);
        transition: transform var(--metro-transition-slow, 333ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        z-index: 1001;
        display: flex;
        flex-direction: column;
        view-transition-name: settings-flyout-panel;
      }
      :host([open]) .flyout-panel {
        transform: translateX(0);
      }
      :host([width="wide"]) .flyout-panel {
        width: 646px;
      }
      .flyout-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--metro-spacing-lg, 16px) var(--metro-spacing-xl, 24px);
        border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.1));
        flex-shrink: 0;
      }
      .flyout-title {
        font-size: var(--metro-font-size-title, 24px);
        font-weight: 300;
        color: var(--metro-foreground, #ffffff);
        margin: 0;
      }
      .flyout-content {
        flex: 1;
        overflow-y: auto;
        padding: var(--metro-spacing-xl, 24px);
      }
      .close-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: transparent;
        border: none;
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        cursor: pointer;
        transition: color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .close-btn:hover {
        color: var(--metro-foreground, #ffffff);
      }
    `,
  ];

  #previousFocus: Element | null = null;

  constructor() {
    super();
    this.title = "";
    this.open = false;
    this.width = "narrow";
  }

  /**
   * Handles open/close state changes to manage focus and keyboard listeners.
   */
  protected updated(changedProperties: PropertyValueMap<this>): void {
    if (changedProperties.has("open")) {
      if (this.open) {
        this.#onOpen();
      } else {
        this.#onClose();
      }
    }
  }

  render() {
    return html`
      <div class="flyout-backdrop" @click=${this.#handleBackdropClick}></div>
      <div class="flyout-panel" role="dialog" aria-modal="true" aria-labelledby="flyout-title">
        <div class="flyout-header">
          <h2 class="flyout-title" id="flyout-title">${this.title}</h2>
          <button class="close-btn" @click=${this.#handleClose} aria-label="Close">
            <metro-icon icon="close" size="normal"></metro-icon>
          </button>
        </div>
        <div class="flyout-content">
          <slot></slot>
        </div>
      </div>
    `;
  }

  #onOpen(): void {
    this.#previousFocus = document.activeElement as Element;
    this.dispatchEvent(
      new CustomEvent("open", {
        bubbles: true,
        composed: true,
      }),
    );
    requestAnimationFrame(() => {
      const closeBtn = this.shadowRoot?.querySelector(".close-btn") as HTMLElement;
      closeBtn?.focus();
    });
    document.addEventListener("keydown", this.#handleEscapeKey);
  }

  #onClose(): void {
    document.removeEventListener("keydown", this.#handleEscapeKey);
    this.dispatchEvent(
      new CustomEvent("close", {
        bubbles: true,
        composed: true,
      }),
    );
    if (this.#previousFocus && "focus" in this.#previousFocus) {
      (this.#previousFocus as HTMLElement).focus();
    }
  }

  #handleBackdropClick(): void {
    void this.hide();
  }

  #handleClose(): void {
    void this.hide();
  }

  #handleEscapeKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      void this.hide();
    }
  };

  /**
   * Applies a property change via View Transitions with headless fallback.
   */
  async #applyChange(setter: () => void): Promise<void> {
    if ("startViewTransition" in document) {
      let applied = false;
      try {
        const transition = document.startViewTransition({
          update: () => {
            setter();
            applied = true;
            return this.updateComplete;
          },
          types: ["settings-flyout"],
        });
        try {
          await transition.updateCallbackDone;
        } catch {
          // updateCallbackDone rejected — transition was skipped
        }
        try {
          await transition.finished;
        } catch {
          // finished rejected — transition was skipped
        }
      } catch {
        // startViewTransition threw synchronously
      }
      if (!applied) {
        setter();
        await this.updateComplete;
      }
    } else {
      setter();
      await this.updateComplete;
    }
  }

  /**
   * Opens the flyout with slide-in animation via View Transitions.
   * @returns Promise that resolves when the flyout is fully open.
   */
  async show(): Promise<void> {
    if (this.open) return;
    await this.#applyChange(() => { this.open = true; });
  }

  /**
   * Closes the flyout with slide-out animation via View Transitions.
   * @returns Promise that resolves when the flyout is fully closed.
   */
  async hide(): Promise<void> {
    if (!this.open) return;
    await this.#applyChange(() => { this.open = false; });
  }
}

customElements.define("metro-settings-flyout", MetroSettingsFlyout);

declare global {
  interface HTMLElementTagNameMap {
    "metro-settings-flyout": MetroSettingsFlyout;
  }
}
