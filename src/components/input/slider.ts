import { LitElement, html, css, type PropertyValues } from "lit";
import { baseTypography, disabledState } from "../../styles/shared.ts";

export class MetroSlider extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: Number, reflect: true },
    min: { type: Number },
    max: { type: Number },
    step: { type: Number },
    disabled: { type: Boolean, reflect: true },
    name: { type: String, reflect: true },
  };

  declare value: number;
  declare min: number;
  declare max: number;
  declare step: number;
  declare disabled: boolean;
  declare name: string;

  static styles = [
    baseTypography,
    disabledState,
    css`
      :host {
        display: block;
        padding: var(--metro-spacing-sm, 8px) 0;
      }
      .slider-container {
        position: relative;
        height: 24px;
        display: flex;
        align-items: center;
      }
      .track {
        width: 100%;
        height: 4px;
        background: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.4));
        position: relative;
      }
      .fill {
        height: 100%;
        background: var(--metro-accent, #0078d4);
        position: absolute;
        left: 0;
        top: 0;
      }
      .thumb {
        width: 16px;
        height: 16px;
        background: #ffffff;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        cursor: pointer;
      }
      input[type="range"] {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
      }
    `,
  ];

  #internals: ElementInternals;

  constructor() {
    super();
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.step = 1;
    this.disabled = false;
    this.name = "";
    this.#internals = this.attachInternals();
  }

  render() {
    const percent = ((this.value - this.min) / (this.max - this.min)) * 100;
    return html`
      <div class="slider-container">
        <div class="track">
          <div class="fill" style="width: ${percent}%"></div>
        </div>
        <div class="thumb" style="left: ${percent}%"></div>
        <input
          type="range"
          .value=${String(this.value)}
          .min=${String(this.min)}
          .max=${String(this.max)}
          .step=${String(this.step)}
          ?disabled=${this.disabled}
          @input=${this.#handleInput}
        />
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
    this.value = parseFloat(target.value);
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
    this.value = this.min;
    this.#updateFormValue();
  }
}

customElements.define("metro-slider", MetroSlider);

declare global {
  interface HTMLElementTagNameMap {
    "metro-slider": MetroSlider;
  }
}
