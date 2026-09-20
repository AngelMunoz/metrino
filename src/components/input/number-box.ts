import { LitElement, html, css, type PropertyValues } from "lit";
import { inputBase } from "../../styles/shared.ts";
import { numberValidation, updateFormControlState } from "../../utils/form-control.ts";

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
    required: { type: Boolean, reflect: true },
  };

  declare value: number;
  declare min: number;
  declare max: number;
  declare step: number;
  declare placeholder: string;
  declare disabled: boolean;
  declare label: string;
  declare name: string;
  declare required: boolean;

  static styles = [
    inputBase,
    css`
      .input-container {
        position: relative;
        display: flex;
        align-items: center;
      }
      input::-webkit-inner-spin-button,
      input::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type="number"] {
        -moz-appearance: textfield;
      }
      input {
        padding-right: 80px;
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
        border-left: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        cursor: pointer;
        font-size: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .spin-button:hover {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        color: var(--metro-foreground, #ffffff);
      }
      .spin-button:active {
        background: var(--metro-accent, #0078d4);
        color: #ffffff;
      }
      .spin-button.up {
        border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }
    `,
  ];

  #internals: ElementInternals;
  #input?: HTMLInputElement;

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
    this.required = false;
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
    this.#input = this.shadowRoot?.querySelector("input") ?? undefined;
    this.#updateState();
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (
      changedProperties.has("value") ||
      changedProperties.has("required") ||
      changedProperties.has("min") ||
      changedProperties.has("max") ||
      changedProperties.has("step") ||
      changedProperties.has("disabled")
    ) {
      this.#updateState();
    }
  }

  /**
   * Syncs both halves of form state — the submitted value and the
   * constraint-validation state — so neither can go stale.
   * @returns void
   */
  #updateState(): void {
    updateFormControlState(
      this.#internals,
      String(this.value),
      numberValidation({
        value: this.value,
        required: this.required && !this.disabled,
        min: this.min,
        max: this.max,
        step: this.step,
      }),
      this.#input,
    );
  }

  #handleInput(e: InputEvent): void {
    const target = e.target as HTMLInputElement;
    const newValue = parseFloat(target.value);
    if (!isNaN(newValue)) {
      this.value = this.#clamp(newValue);
      this.#updateState();
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
      this.#updateState();
      this.dispatchEvent(new CustomEvent("change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }));
    }
  }

  #increment(): void {
    this.value = this.#clamp(this.value + this.step);
    this.#updateState();
    this.dispatchEvent(new CustomEvent("change", {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  #decrement(): void {
    this.value = this.#clamp(this.value - this.step);
    this.#updateState();
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
    this.#updateState();
  }

  formStateRestoreCallback(
    state: string | File | FormData | null,
    _mode: "restore" | "autocomplete",
  ): void {
    const restored = typeof state === "string" ? parseFloat(state) : Number.NaN;
    if (!Number.isNaN(restored)) {
      this.value = this.#clamp(restored);
      this.#updateState();
    }
  }
}

export function registerMetroNumberBox(): void {
  if (!customElements.get("metro-number-box")) {
    customElements.define("metro-number-box", MetroNumberBox);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-number-box": MetroNumberBox;
  }
}
