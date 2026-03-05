import { LitElement, html, css, type PropertyValues } from "lit";
import { focusRing, pressState, disabledState, baseTypography, applyTiltEffect } from "../../styles/shared.ts";
import {
  updateAriaDisabled,
  handleDisabledClick,
  handleKeyboardActivation,
  addPressedState,
} from "./shared.ts";

export class MetroButton extends LitElement {
  static properties = {
    disabled: { type: Boolean, reflect: true },
    accent: { type: String, reflect: true },
  };

  declare disabled: boolean;
  declare accent: string | undefined;

  static styles = [
    focusRing,
    pressState,
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
        padding: 10px 22px;
        min-width: 120px;
        min-height: 40px;
        border: 2px solid var(--metro-foreground, #fff);
        background: transparent;
        color: var(--metro-foreground, #fff);
        cursor: pointer;
        text-align: center;
        user-select: none;
        box-sizing: border-box;
        transition:
          background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          border-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }

      .button:hover {
        background: var(--metro-foreground, #fff);
        color: var(--metro-background, #1f1f1f);
      }

      :host([accent]) .button {
        background: var(--metro-accent, #0078d4);
        border-color: var(--metro-accent, #0078d4);
        color: #fff;
      }

      :host([accent]) .button:hover {
        background: var(--metro-accent-light, #429ce3);
        border-color: var(--metro-accent-light, #429ce3);
        color: #fff;
      }

      :host([accent]) .button.pressed {
        background: var(--metro-accent-dark, #005a9e);
        border-color: var(--metro-accent-dark, #005a9e);
        color: #fff;
      }

      .button.pressed {
        background: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        border-color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        color: var(--metro-background, #1f1f1f);
      }
    `,
  ];

  #cleanupTilt?: () => void;

  constructor() {
    super();
    this.disabled = false;
  }

  render() {
    return html`<button class="button" role="button" ?disabled=${this.disabled} @click=${this.#handleClick} @keydown=${this.#handleKeydown} @mousedown=${this.#handlePointerDown} @touchstart=${this.#handlePointerDown}><slot></slot></button>`;
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
    handleDisabledClick(e, this.disabled);
  };

  #handleKeydown = (e: KeyboardEvent): void => {
    handleKeyboardActivation(e, this.disabled, () => this.click());
  };

  #handlePointerDown = (e: Event): void => {
    const target = e.currentTarget as HTMLElement;
    addPressedState(target, this.disabled);
  };
}

customElements.define("metro-button", MetroButton);

declare global {
  interface HTMLElementTagNameMap {
    "metro-button": MetroButton;
  }
}
