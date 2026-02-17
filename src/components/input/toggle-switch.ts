import { LitElement, html, css, type PropertyValues } from "lit";
import { toggleControlBase } from "../../styles/shared.ts";

export class MetroToggleSwitch extends LitElement {
  static formAssociated = true;

  static properties = {
    on: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
  };

  declare on: boolean;
  declare disabled: boolean;
  declare name: string;
  declare value: string;

  static styles = [
    toggleControlBase,
    css`
      .switch {
        width: 44px;
        height: 22px;
        background: transparent;
        border: 2px solid var(--metro-foreground, #ffffff);
        border-radius: 0;
        position: relative;
        transition:
          background-color var(--metro-transition-fast, 167ms) ease-out,
          border-color var(--metro-transition-fast, 167ms) ease-out;
      }
      .switch.checked {
        background: var(--metro-accent, #0078d4);
        border-color: var(--metro-accent, #0078d4);
      }
      .thumb {
        width: 14px;
        height: 14px;
        background: var(--metro-foreground, #ffffff);
        border-radius: 0;
        position: absolute;
        top: 2px;
        left: 2px;
        transition:
          transform var(--metro-transition-fast, 167ms) ease-out,
          background-color var(--metro-transition-fast, 167ms) ease-out;
      }
      .switch.checked .thumb {
        transform: translateX(22px);
        background: #ffffff;
      }
    `,
  ];

  #internals: ElementInternals;

  constructor() {
    super();
    this.on = false;
    this.disabled = false;
    this.name = "";
    this.value = "on";
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      <div
        class="switch ${this.on ? "checked" : ""}"
        role="switch"
        aria-checked="${this.on}"
        @click=${this.#toggle}
      >
        <div class="thumb"></div>
      </div>
      <slot></slot>
    `;
  }

  firstUpdated(): void {
    this.#updateFormValue();
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("on")) {
      this.#updateFormValue();
    }
  }

  #updateFormValue(): void {
    this.#internals.setFormValue(this.on ? this.value : null);
  }

  #toggle(): void {
    if (this.disabled) return;
    this.on = !this.on;
    this.#updateFormValue();
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { on: this.on },
        bubbles: true,
        composed: true,
      }),
    );
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.on = false;
    this.#updateFormValue();
  }
}

customElements.define("metro-toggle-switch", MetroToggleSwitch);

declare global {
  interface HTMLElementTagNameMap {
    "metro-toggle-switch": MetroToggleSwitch;
  }
}
