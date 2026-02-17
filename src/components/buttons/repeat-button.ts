import { LitElement, html, css, type PropertyValues } from "lit";
import { focusRing, pressState, disabledState, baseTypography } from "../../styles/shared.ts";
import {
  updateAriaDisabled,
  setupButtonRole,
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
        transition: background-color var(--metro-transition-fast, 167ms) ease-out;
      }

      :host(:hover) {
        background: var(--metro-foreground, #fff);
        color: var(--metro-background, #1f1f1f);
      }

      :host([accent]) {
        background: var(--metro-accent, #0078d4);
        color: #fff;
      }

      :host([accent]:hover) {
        background: var(--metro-accent-light, #429ce3);
        color: #fff;
      }

      :host([accent].pressed) {
        background: var(--metro-accent-dark, #005a9e);
        color: #fff;
      }

      :host(.pressed) {
        background: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
        color: var(--metro-background, #1f1f1f);
      }
    `,
  ];

  #repeatState: RepeatState = { timer: null, interval: null };

  constructor() {
    super();
    this.disabled = false;
    this.delay = 500;
    this.interval = 100;
  }

  render() {
    return html`<slot></slot>`;
  }

  connectedCallback(): void {
    super.connectedCallback();
    setupButtonRole(this, this.disabled);
    this.addEventListener("click", this.#handleClick);
    this.addEventListener("keydown", this.#handleKeydown);
    this.addEventListener("mousedown", this.#handlePointerDown);
    this.addEventListener("touchstart", this.#handlePointerDown);
    this.addEventListener("mouseup", this.#handlePointerUp);
    this.addEventListener("mouseleave", this.#handlePointerUp);
    this.addEventListener("touchend", this.#handlePointerUp);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    stopRepeat(this.#repeatState);
    this.removeEventListener("click", this.#handleClick);
    this.removeEventListener("keydown", this.#handleKeydown);
    this.removeEventListener("mousedown", this.#handlePointerDown);
    this.removeEventListener("touchstart", this.#handlePointerDown);
    this.removeEventListener("mouseup", this.#handlePointerUp);
    this.removeEventListener("mouseleave", this.#handlePointerUp);
    this.removeEventListener("touchend", this.#handlePointerUp);
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
    addPressedState(this, this.disabled);
    if (e.type === "mousedown" || e.type === "touchstart") {
      startRepeat(this.#repeatState, this.delay, this.interval, () => this.click());
    }
  };

  #handlePointerUp = (): void => {
    stopRepeat(this.#repeatState);
    this.classList.remove("pressed");
  };
}

customElements.define("metro-repeat-button", MetroRepeatButton);

declare global {
  interface HTMLElementTagNameMap {
    "metro-repeat-button": MetroRepeatButton;
  }
}
