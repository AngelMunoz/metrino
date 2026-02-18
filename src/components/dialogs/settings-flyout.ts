import { LitElement, html, css } from "lit";
import { baseTypography, closeButton } from "../../styles/shared.ts";
import type { PropertyValueMap } from "lit";
import "../primitives/icon.ts";

type SettingsFlyoutWidth = "narrow" | "wide";

export class MetroSettingsFlyout extends LitElement {
  static properties = {
    title: { type: String, reflect: true },
    open: { type: Boolean, reflect: true },
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
      .flyout-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        opacity: 0;
        visibility: hidden;
        transition: opacity var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          visibility var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        z-index: 1000;
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
    this.hide();
  }

  #handleClose(): void {
    this.hide();
  }

  #handleEscapeKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") {
      this.hide();
    }
  };

  show(): void {
    this.open = true;
  }

  hide(): void {
    this.open = false;
  }
}

customElements.define("metro-settings-flyout", MetroSettingsFlyout);

declare global {
  interface HTMLElementTagNameMap {
    "metro-settings-flyout": MetroSettingsFlyout;
  }
}
