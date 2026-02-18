import { LitElement, html, css, type PropertyValues } from "lit";
import { focusRing, disabledState, baseTypography, applyTiltEffect } from "../../styles/shared.ts";
import {
  updateAriaDisabled,
  handleDisabledClick,
  handleKeyboardActivation,
  addPressedState,
} from "./shared.ts";

function navigate(el: MetroHyperlinkButton): void {
  if (!el.href) return;
  if (el.target === "_blank") {
    window.open(el.href, "_blank", "noopener,noreferrer");
  } else {
    window.location.href = el.href;
  }
}

export class MetroHyperlinkButton extends LitElement {
  static properties = {
    disabled: { type: Boolean, reflect: true },
    href: { type: String },
    target: { type: String },
  };

  declare disabled: boolean;
  declare href: string | undefined;
  declare target: string | undefined;

  static styles = [
    focusRing,
    disabledState,
    baseTypography,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: var(--metro-font-size-normal, 14px);
        font-weight: 400;
        letter-spacing: 0.02em;
        padding: 12px 24px;
        min-width: 120px;
        min-height: 40px;
        border: none;
        background: transparent;
        color: var(--metro-accent, #0078d4);
        cursor: pointer;
        text-align: center;
        text-decoration: none;
        user-select: none;
        box-sizing: border-box;
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }

      :host(:hover) {
        text-decoration: underline;
      }

      :host(.pressed) {
        opacity: 0.7;
      }
    `,
  ];

  #cleanupTilt?: () => void;

  constructor() {
    super();
    this.disabled = false;
  }

  render() {
    return html`<slot></slot>`;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.#setupRole();
    this.#cleanupTilt = applyTiltEffect(this);
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("keydown", this.#handleKeydown);
    this.addEventListener("mousedown", this.#handlePointerDown);
    this.addEventListener("touchstart", this.#handlePointerDown);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#cleanupTilt?.();
    this.removeEventListener("click", this.#handleClick);
    this.removeEventListener("keydown", this.#handleKeydown);
    this.removeEventListener("mousedown", this.#handlePointerDown);
    this.removeEventListener("touchstart", this.#handlePointerDown);
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("disabled")) {
      updateAriaDisabled(this, this.disabled);
    }
    if (changedProperties.has("href")) {
      this.#setupRole();
    }
  }

  #setupRole(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", this.href ? "link" : "button");
    } else {
      this.setAttribute("role", this.href ? "link" : "button");
    }
    if (!this.disabled && !this.hasAttribute("tabindex")) {
      this.setAttribute("tabindex", "0");
    }
  }

  #handleClick = (e: Event): void => {
    if (!handleDisabledClick(e, this.disabled)) return;
    if (this.href) {
      e.preventDefault();
      navigate(this);
    }
  };

  #handleKeydown = (e: KeyboardEvent): void => {
    handleKeyboardActivation(e, this.disabled, () => {
      if (this.href) {
        navigate(this);
      } else {
        this.click();
      }
    });
  };

  #handlePointerDown = (): void => {
    addPressedState(this, this.disabled);
  };
}

customElements.define("metro-hyperlink-button", MetroHyperlinkButton);

declare global {
  interface HTMLElementTagNameMap {
    "metro-hyperlink-button": MetroHyperlinkButton;
  }
}
