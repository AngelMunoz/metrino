import { LitElement, html, css, type PropertyValues } from "lit";
import { baseTypography, disabledState } from "../../styles/shared.ts";

/**
 * Metro Slider Component
 *
 * A form-associated range slider component with Metro styling. Features a custom
 * track with fill indicator and draggable thumb. Implements the ElementInternals
 * API for form participation.
 *
 * Features:
 * - Custom slider with accent-colored fill track
 * - Draggable thumb with pointer cursor
 * - Configurable min, max, and step values
 * - Form association via ElementInternals API
 * - Disabled state support
 * - Custom change event with value detail
 * - Form reset callback support
 * - Form disabled callback support
 *
 * Use for selecting numeric values within a range, such as volume control,
 * brightness adjustment, or any continuous or stepped value selection.
 *
 * @fires change - Fired when the slider value changes (bubbles: true, composed: true)
 *   Detail: { value: number }
 *
 * @cssprop --metro-accent - Fill track color (default: #0078d4)
 * @cssprop --metro-foreground-secondary - Empty track color (default: rgba(255, 255, 255, 0.4))
 * @cssprop --metro-spacing-sm - Small spacing unit (default: 8px)
 *
 * @csspart slider-container - The slider container element
 * @csspart track - The track background element
 * @csspart fill - The filled portion of the track
 * @csspart thumb - The draggable thumb element
 * @csspart input - The native range input element (hidden)
 */
export class MetroSlider extends LitElement {
  static formAssociated = true;

  static properties = {
    /**
     * The current value of the slider.
     * @default 0
     */
    value: { type: Number, reflect: true },
    /**
     * Minimum value of the slider range.
     * @default 0
     */
    min: { type: Number },
    /**
     * Maximum value of the slider range.
     * @default 100
     */
    max: { type: Number },
    /**
     * Step increment for the slider value.
     * @default 1
     */
    step: { type: Number },
    /**
     * When true, the slider is disabled and cannot be dragged.
     * @default false
     */
    disabled: { type: Boolean, reflect: true },
    /**
     * Name attribute for form submission.
     * @default ""
     */
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

  /**
   * Called on first update to set initial form value.
   * @returns void
   */
  firstUpdated(): void {
    this.#updateFormValue();
  }

  /**
   * Updates form value when the value property changes.
   * @param changedProperties - Map of changed properties
   * @returns void
   */
  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("value")) {
      this.#updateFormValue();
    }
  }

  /**
   * Updates the internal form value for form submission.
   * @returns void
   */
  #updateFormValue(): void {
    this.#internals.setFormValue(String(this.value));
  }

  /**
   * Handles input events from the native range input.
   * Updates the value and dispatches change event.
   * @param e - The input event
   * @returns void
   */
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

  /**
   * Called when the form is disabled/enabled.
   * @param disabled - Whether the form is now disabled
   * @returns void
   */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  /**
   * Called when the form is reset. Resets value to minimum.
   * @returns void
   */
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
