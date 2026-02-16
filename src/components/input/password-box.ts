import { LitElement, html, css, type PropertyValues } from "lit";
import "../primitives/icon.ts";

const baseStyles = css`
  :host {
    display: block;
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
  }
  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }
  input {
    width: 100%;
    padding: var(--metro-spacing-md, 12px);
    padding-right: 44px;
    font-size: var(--metro-font-size-normal, 14px);
    font-family: inherit;
    background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
    border: 2px solid transparent;
    color: var(--metro-foreground, #ffffff);
    outline: none;
    transition: border-color var(--metro-transition-fast, 167ms) ease-out;
    box-sizing: border-box;
  }
  input:focus {
    border-color: var(--metro-accent, #0078d4);
  }
  input::placeholder {
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
  }
  input:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .label {
    display: block;
    margin-bottom: var(--metro-spacing-xs, 4px);
    font-size: var(--metro-font-size-small, 12px);
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
  }
  .reveal-btn {
    position: absolute;
    right: var(--metro-spacing-sm, 8px);
    background: none;
    border: none;
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    padding: var(--metro-spacing-xs, 4px);
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color var(--metro-transition-fast, 167ms) ease-out;
  }
  .reveal-btn:hover {
    color: var(--metro-foreground, #ffffff);
  }
  .reveal-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export class MetroPasswordBox extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: String, reflect: true },
    placeholder: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    label: { type: String, reflect: true },
    name: { type: String, reflect: true },
    required: { type: Boolean, reflect: true },
    revealed: { type: Boolean, state: true },
  };

  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare label: string;
  declare name: string;
  declare required: boolean;
  declare revealed: boolean;

  static styles = baseStyles;

  #internals: ElementInternals;

  constructor() {
    super();
    this.value = "";
    this.placeholder = "Password";
    this.disabled = false;
    this.label = "";
    this.name = "";
    this.required = false;
    this.revealed = false;
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : ""}
      <div class="input-wrapper">
        <input
          type=${this.revealed ? "text" : "password"}
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          ?required=${this.required}
          @input=${this.#handleInput}
          @change=${this.#handleChange}
        />
        <button
          class="reveal-btn"
          type="button"
          ?disabled=${this.disabled}
          @click=${this.#toggleReveal}
          aria-label=${this.revealed ? "Hide password" : "Show password"}
        >
          <metro-icon
            icon=${this.revealed ? "eye-off" : "eye"}
            size="normal"
          ></metro-icon>
        </button>
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
    this.#internals.setFormValue(this.value);
  }

  #handleInput(e: InputEvent): void {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    this.#updateFormValue();
    this.dispatchEvent(
      new CustomEvent("input", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #handleChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    this.#updateFormValue();
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #toggleReveal(): void {
    this.revealed = !this.revealed;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = "";
    this.#updateFormValue();
  }
}

customElements.define("metro-password-box", MetroPasswordBox);

declare global {
  interface HTMLElementTagNameMap {
    "metro-password-box": MetroPasswordBox;
  }
}
