import { LitElement, html, css, type PropertyValues } from "lit";
import { focusRing, pressState, disabledState, baseTypography, applyTiltEffect } from "../../styles/shared.ts";
import {
  updateAriaDisabled,
  handleDisabledClick,
  handleKeyboardActivation,
  addPressedState,
  type RepeatState,
  startRepeat,
  stopRepeat,
} from "./shared.ts";

export class MetroRepeatButton extends LitElement {
  static properties = {
    disabled: { type: Boolean, reflect: true },
    accent: { type: String, reflect: true },
    delay: { type: Number },
    interval: { type: Number },
  };

  declare disabled: boolean;
  declare accent: string | undefined;
  declare delay: number;
  declare interval: number;

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
        padding: 12px 24px;
        min-width: 120px;
        min-height: 40px;
        border: none;
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        color: var(--metro-foreground, #fff);
        cursor: pointer;
        text-align: center;
        user-select: none;
        box-sizing: border-box;
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }

      .button:hover {
        background: var(--metro-foreground, #fff);
        color: var(--metro-background, #1f1f1f);
      }

      :host([accent]) .button {
        background: var(--metro-accent, #0078d4);
        color: #fff;
      }

      :host([accent]) .button:hover {
        background: var(--metro-accent-light, #429ce3);
        color: #fff;
      }

      :host([accent]) .button.pressed {
        background: var(--metro-accent-dark, #005a9e);
        color: #fff;
      }

      .button.pressed {
        background: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        color: var(--metro-background, #1f1f1f);
      }
    `,
  ];

  #repeatState: RepeatState = { timer: null, interval: null };
  #cleanupTilt?: () => void;

  constructor() {
    super();
    this.disabled = false;
    this.delay = 500;
    this.interval = 100;
  }

  render() {
    return html`<button class="button" ?disabled=${this.disabled} @click=${this.#handleClick} @keydown=${this.#handleKeydown} @mousedown=${this.#handlePointerDown} @touchstart=${this.#handlePointerDown} @mouseup=${this.#handlePointerUp} @mouseleave=${this.#handlePointerUp} @touchend=${this.#handlePointerUp}><slot></slot></button>`;
  }

  protected firstUpdated(): void {
    this.#cleanupTilt = applyTiltEffect(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    stopRepeat(this.#repeatState);
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
    if (this.disabled) return;
    const target = e.currentTarget as HTMLElement;
    addPressedState(target, this.disabled);
    if (e.type === "mousedown" || e.type === "touchstart") {
      startRepeat(this.#repeatState, this.delay, this.interval, () => this.click());
    }
  };

  #handlePointerUp = (e: Event): void => {
    stopRepeat(this.#repeatState);
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("pressed");
  };
}

customElements.define("metro-repeat-button", MetroRepeatButton);

declare global {
  interface HTMLElementTagNameMap {
    "metro-repeat-button": MetroRepeatButton;
  }
}
