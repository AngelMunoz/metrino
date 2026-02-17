import { LitElement, html, css, type PropertyValues } from "lit";
import { toggleControlBase } from "../../styles/shared.ts";

export class MetroRadioButton extends LitElement {
  static formAssociated = true;

  static properties = {
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
  };

  declare checked: boolean;
  declare disabled: boolean;
  declare name: string;
  declare value: string;

  static styles = [
    toggleControlBase,
    css`
      .radio {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--metro-transition-fast, 167ms) ease-out;
      }
      .radio.checked {
        border-color: var(--metro-accent, #0078d4);
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--metro-accent, #0078d4);
        opacity: 0;
        transition: opacity var(--metro-transition-fast, 167ms) ease-out;
      }
      .radio.checked .dot {
        opacity: 1;
      }
    `,
  ];

  #internals: ElementInternals;

  constructor() {
    super();
    this.checked = false;
    this.disabled = false;
    this.name = "";
    this.value = "";
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      <div
        class="radio ${this.checked ? "checked" : ""}"
        role="radio"
        aria-checked="${this.checked}"
        @click=${this.#select}
      >
        <div class="dot"></div>
      </div>
      <slot></slot>
    `;
  }

  firstUpdated(): void {
    this.#updateFormValue();
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("checked")) {
      this.#updateFormValue();
    }
  }

  #updateFormValue(): void {
    this.#internals.setFormValue(this.checked ? this.value : null);
  }

  #select(): void {
    if (this.disabled || this.checked) return;
    this.checked = true;
    this.#updateFormValue();
    this.dispatchEvent(new CustomEvent("change", {
      detail: { checked: this.checked, value: this.value },
      bubbles: true,
      composed: true,
    }));
    
    // Uncheck other radio buttons in the same group
    if (this.name) {
      document.querySelectorAll(`metro-radio-button[name="${this.name}"]`).forEach(rb => {
        if (rb !== this && rb instanceof MetroRadioButton) {
          rb.checked = false;
        }
      });
    }
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.checked = false;
    this.#updateFormValue();
  }
}

customElements.define("metro-radio-button", MetroRadioButton);

declare global {
  interface HTMLElementTagNameMap {
    "metro-radio-button": MetroRadioButton;
  }
}
