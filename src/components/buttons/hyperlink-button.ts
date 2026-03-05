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
        display: inline-block;
      }

      .button {
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

      .button:hover {
        text-decoration: underline;
      }

      .button.pressed {
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
    return html`<a class="button" role=${this.href ? "link" : "button"} href=${this.href || ""} target=${this.target || ""} ?aria-disabled=${this.disabled} tabindex=${this.disabled ? -1 : 0} @click=${this.#handleClick} @keydown=${this.#handleKeydown} @mousedown=${this.#handlePointerDown} @touchstart=${this.#handlePointerDown}><slot></slot></a>`;
  }

  protected firstUpdated(): void {
    this.#cleanupTilt = applyTiltEffect(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#cleanupTilt?.();
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("disabled")) {
      updateAriaDisabled(this, this.disabled);
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

  #handlePointerDown = (e: Event): void => {
    const target = e.currentTarget as HTMLElement;
    addPressedState(target, this.disabled);
  };
}

customElements.define("metro-hyperlink-button", MetroHyperlinkButton);

declare global {
  interface HTMLElementTagNameMap {
    "metro-hyperlink-button": MetroHyperlinkButton;
  }
}
