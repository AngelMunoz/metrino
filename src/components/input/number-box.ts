import { LitElement, html, css, type PropertyValues } from "lit";

const baseStyles = css`
  :host {
    display: block;
    font-family: var(--metro-font-family, system-ui, -apple-system, sans-serif);
  }
  .input-container {
    position: relative;
    display: flex;
    align-items: center;
  }
  input {
    width: 100%;
    padding: var(--metro-spacing-md, 12px);
    padding-right: 80px;
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
  input:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .spin-buttons {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
  }
  .spin-button {
    flex: 1;
    width: 32px;
    background: transparent;
    border: none;
    border-left: 1px solid var(--metro-border, rgba(255,255,255,0.2));
    color: var(--metro-foreground-secondary, rgba(255,255,255,0.7));
    cursor: pointer;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--metro-transition-fast, 167ms) ease-out;
  }
  .spin-button:hover {
    background: var(--metro-highlight, rgba(255,255,255,0.1));
    color: var(--metro-foreground, #ffffff);
  }
  .spin-button:active {
    background: var(--metro-accent, #0078d4);
    color: #ffffff;
  }
  .spin-button.up {
    border-bottom: 1px solid var(--metro-border, rgba(255,255,255,0.2));
  }
  .label {
    display: block;
    margin-bottom: var(--metro-spacing-xs, 4px);
    font-size: var(--metro-font-size-small, 12px);
    color: var(--metro-foreground-secondary, rgba(255,255,255,0.7));
  }
`;

export class MetroNumberBox extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: Number, reflect: true },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    placeholder: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    label: { type: String, reflect: true },
    name: { type: String, reflect: true },
  };

  declare value: number;
  declare min: number;
  declare max: number;
  declare step: number;
  declare placeholder: string;
  declare disabled: boolean;
  declare label: string;
  declare name: string;

  static styles = baseStyles;

  #internals: ElementInternals;

  constructor() {
    super();
    this.value = 0;
    this.min = Number.MIN_SAFE_INTEGER;
    this.max = Number.MAX_SAFE_INTEGER;
    this.step = 1;
    this.placeholder = "";
    this.disabled = false;
    this.label = "";
    this.name = "";
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : ""}
      <div class="input-container">
        <input
          type="number"
          .value=${String(this.value)}
          .min=${String(this.min)}
          .max=${String(this.max)}
          .step=${String(this.step)}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          @input=${this.#handleInput}
          @change=${this.#handleChange}
        />
        <div class="spin-buttons">
          <button class="spin-button up" @click=${this.#increment} ?disabled=${this.disabled}>&#x25B2;</button>
          <button class="spin-button down" @click=${this.#decrement} ?disabled=${this.disabled}>&#x25BC;</button>
        </div>
      </div>
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
    this.#internals.setFormValue(String(this.value));
  }

  #handleInput(e: InputEvent): void {
    const target = e.target as HTMLInputElement;
    const newValue = parseFloat(target.value);
    if (!isNaN(newValue)) {
      this.value = this.#clamp(newValue);
      this.#updateFormValue();
      this.dispatchEvent(new CustomEvent("input", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }));
    }
  }

  #handleChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    const newValue = parseFloat(target.value);
    if (!isNaN(newValue)) {
      this.value = this.#clamp(newValue);
      this.#updateFormValue();
      this.dispatchEvent(new CustomEvent("change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }));
    }
  }

  #increment(): void {
    this.value = this.#clamp(this.value + this.step);
    this.#updateFormValue();
    this.dispatchEvent(new CustomEvent("change", {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  #decrement(): void {
    this.value = this.#clamp(this.value - this.step);
    this.#updateFormValue();
    this.dispatchEvent(new CustomEvent("change", {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  #clamp(value: number): number {
    return Math.min(Math.max(value, this.min), this.max);
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = 0;
    this.#updateFormValue();
  }
}

customElements.define("metro-number-box", MetroNumberBox);

declare global {
  interface HTMLElementTagNameMap {
    "metro-number-box": MetroNumberBox;
  }
}
