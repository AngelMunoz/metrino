import { LitElement, html, type PropertyValues } from "lit";
import { inputBase } from "../../styles/shared.ts";

/**
 * Metro Text Box Component
 *
 * A form-associated text input component with optional label support.
 * Implements the ElementInternals API for form participation, allowing
 * seamless integration with HTML forms.
 *
 * Features:
 * - Form association via ElementInternals API
 * - Optional label that appears above the input
 * - Placeholder support
 * - Required validation support
 * - Disabled state support
 * - Custom input and change events with value detail
 * - Form reset callback support
 * - Form disabled callback support
 *
 * Use for standard text input fields in forms or standalone text entry.
 *
 * @fires input - Fired when the input value changes (bubbles: true, composed: true)
 *   Detail: { value: string }
 * @fires change - Fired when the input loses focus and value changed (bubbles: true, composed: true)
 *   Detail: { value: string }
 *
 * @cssprop --metro-foreground - Input text color
 * @cssprop --metro-foreground-secondary - Placeholder and label text color
 * @cssprop --metro-background - Input background color
 * @cssprop --metro-accent - Focus border and label color
 * @cssprop --metro-border - Input border color
 * @cssprop --metro-spacing-sm - Small spacing unit
 * @cssprop --metro-spacing-md - Medium spacing unit
 * @cssprop --metro-transition-fast - Transition duration
 * @cssprop --metro-easing - Easing curve for transitions
 * @cssprop --metro-font-size-normal - Input font size
 * @cssprop --metro-font-size-small - Label font size
 *
 * @csspart input - The text input element
 * @csspart label - The label element
 */
export class MetroTextBox extends LitElement {
  static formAssociated = true;

  static properties = {
    /**
     * The current value of the text input.
     * Updated on both input and change events.
     * @default ""
     */
    value: { type: String, reflect: true },
    /**
     * Placeholder text displayed when the input is empty.
     * @default ""
     */
    placeholder: { type: String, reflect: true },
    /**
     * When true, the input is disabled and cannot be interacted with.
     * @default false
     */
    disabled: { type: Boolean, reflect: true },
    /**
     * Label text displayed above the input field.
     * If not provided, no label is shown.
     * @default ""
     */
    label: { type: String, reflect: true },
    /**
     * Name attribute for form submission.
     * @default ""
     */
    name: { type: String, reflect: true },
    /**
     * When true, the input is required for form submission.
     * @default false
     */
    required: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare label: string;
  declare name: string;
  declare required: boolean;

  static styles = inputBase;

  #internals: ElementInternals;

  constructor() {
    super();
    this.value = "";
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
      <input
        type="text"
        .value=${this.value}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        ?required=${this.required}
        @input=${this.#handleInput}
        @change=${this.#handleChange}
      />
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
    this.#internals.setFormValue(this.value);
  }

  /**
   * Handles input events, updating the value and dispatching custom input event.
   * @param e - The input event
   * @returns void
   */
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

  /**
   * Handles change events, updating the value and dispatching custom change event.
   * @param e - The change event
   * @returns void
   */
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

  /**
   * Called when the form is reset. Clears the value.
   * @returns void
   */
  formAssociatedCallback(_form: HTMLFormElement): void {}

  /**
   * Called when the form is disabled/enabled.
   * @param disabled - Whether the form is now disabled
   * @returns void
   */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  /**
   * Called when the form is reset. Clears the value to empty string.
   * @returns void
   */
  formResetCallback(): void {
    this.value = "";
    this.#updateFormValue();
  }

  /**
   * Called when form state is restored (e.g., from browser autocomplete).
   * @param state - The restored state value
   * @param _mode - The restoration mode
   * @returns void
   */
  formStateRestoreCallback(
    state: string | File | FormData | null,
    _mode: "restore" | "autocomplete",
  ): void {
    if (typeof state === "string") {
      this.value = state;
      this.#updateFormValue();
    }
  }
}

customElements.define("metro-text-box", MetroTextBox);

declare global {
  interface HTMLElementTagNameMap {
    "metro-text-box": MetroTextBox;
  }
}
