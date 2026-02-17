import { LitElement, html, css, type PropertyValues } from "lit";
import { toggleControlBase } from "../../styles/shared.ts";

export class MetroCheckBox extends LitElement {
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
      .checkbox {
        width: 20px;
        height: 20px;
        border: 2px solid var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--metro-transition-fast, 167ms) ease-out;
      }
      .checkbox.checked {
        background: var(--metro-accent, #0078d4);
        border-color: var(--metro-accent, #0078d4);
      }
      .checkmark {
        width: 12px;
        height: 12px;
        color: #ffffff;
        opacity: 0;
        transform: scale(0);
        transition: all var(--metro-transition-fast, 167ms) ease-out;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .checkbox.checked .checkmark {
        opacity: 1;
        transform: scale(1);
      }
    `,
  ];

  #internals: ElementInternals;

  constructor() {
    super();
    this.checked = false;
    this.disabled = false;
    this.name = "";
    this.value = "on";
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      <div
        class="checkbox ${this.checked ? "checked" : ""}"
        role="checkbox"
        aria-checked="${this.checked}"
        @click=${this.#toggle}
      >
        <span class="checkmark">&#x2713;</span>
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

  #toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.#updateFormValue();
    this.dispatchEvent(new CustomEvent("change", {
      detail: { checked: this.checked },
      bubbles: true,
      composed: true,
    }));
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.checked = false;
    this.#updateFormValue();
  }
}

customElements.define("metro-check-box", MetroCheckBox);

declare global {
  interface HTMLElementTagNameMap {
    "metro-check-box": MetroCheckBox;
  }
}
