import { LitElement, html, css, type PropertyValues } from "lit";

const baseStyles = css`
  :host {
    display: block;
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
  }
  input {
    width: 100%;
    padding: var(--metro-spacing-md, 12px);
    font-size: var(--metro-font-size-normal, 14px);
    font-family: inherit;
    background: var(--metro-highlight, rgba(255,255,255,0.1));
    border: 2px solid transparent;
    color: var(--metro-foreground, #ffffff);
    outline: none;
    transition: border-color var(--metro-transition-fast, 167ms) ease-out;
    box-sizing: border-box;
  }
  input:focus {
    border-color: var(--metro-accent, #0078d4);
  }
  input::-webkit-calendar-picker-indicator {
    filter: invert(1);
    cursor: pointer;
  }
  .label {
    display: block;
    margin-bottom: var(--metro-spacing-xs, 4px);
    font-size: var(--metro-font-size-small, 12px);
    color: var(--metro-foreground-secondary, rgba(255,255,255,0.7));
  }
`;

export class MetroTimePicker extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
    name: { type: String, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare label: string;
  declare name: string;
  declare required: boolean;
  declare disabled: boolean;

  static styles = baseStyles;

  #internals: ElementInternals;

  constructor() {
    super();
    this.value = "";
    this.label = "";
    this.name = "";
    this.required = false;
    this.disabled = false;
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : ""}
      <input
        type="time"
        .value=${this.value}
        ?required=${this.required}
        ?disabled=${this.disabled}
        @change=${this.#handleChange}
      />
    `;
  }

  firstUpdated(): void {
    this.#updateFormValue();
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("value")) {
      this.#updateFormValue();
    }
  }

  #updateFormValue(): void {
    this.#internals.setFormValue(this.value);
  }

  #handleChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    this.#updateFormValue();
    this.dispatchEvent(new CustomEvent("change", {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = "";
    this.#updateFormValue();
  }
}

customElements.define("metro-time-picker", MetroTimePicker);

declare global {
  interface HTMLElementTagNameMap {
    "metro-time-picker": MetroTimePicker;
  }
}
