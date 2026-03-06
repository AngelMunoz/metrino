import { LitElement, html, css, type PropertyValues } from "lit";
import { inputBase } from "../../styles/shared.ts";
import "../primitives/icon.ts";

/**
 * Metro Password Box Component
 *
 * A form-associated password input with a reveal button to toggle between
 * masked and plain text display. Implements the ElementInternals API for
 * form participation.
 *
 * Features:
 * - Password masking with toggle button to reveal text
 * - Metro icon integration for eye/eye-off icons
 * - Form association via ElementInternals API
 * - Optional label support
 * - Placeholder support (defaults to "Password")
 * - Disabled state support
 * - Required validation support
 * - Custom input and change events
 * - Form reset and disabled callbacks
 *
 * Use for password entry fields where users may want to verify their input
 * by temporarily revealing the text.
 *
 * @fires input - Fired when the input value changes (bubbles: true, composed: true)
 *   Detail: { value: string }
 * @fires change - Fired when the input loses focus and value changed (bubbles: true, composed: true)
 *   Detail: { value: string }
 *
 * @cssprop --metro-foreground - Input text color
 * @cssprop --metro-foreground-secondary - Placeholder and icon color
 * @cssprop --metro-background - Input background color
 * @cssprop --metro-accent - Focus border color
 * @cssprop --metro-border - Input border color
 * @cssprop --metro-spacing-xs - Extra small spacing
 * @cssprop --metro-spacing-sm - Small spacing
 * @cssprop --metro-transition-fast - Transition duration
 * @cssprop --metro-easing - Easing curve
 *
 * @csspart input - The password input element
 * @csspart label - The label element
 * @csspart reveal-btn - The reveal toggle button
 * @csspart input-wrapper - The input wrapper containing input and button
 */
export class MetroPasswordBox extends LitElement {
  static formAssociated = true;

  static properties = {
    /**
     * The current value of the password input.
     * @default ""
     */
    value: { type: String, reflect: true },
    /**
     * Placeholder text displayed when the input is empty.
     * @default "Password"
     */
    placeholder: { type: String, reflect: true },
    /**
     * When true, the input is disabled and cannot be interacted with.
     * @default false
     */
    disabled: { type: Boolean, reflect: true },
    /**
     * Label text displayed above the input field.
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
    /**
     * Internal state tracking whether the password is revealed.
     * Toggles input type between "password" and "text".
     * @default false
     */
    revealed: { type: Boolean, state: true },
  };

  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare label: string;
  declare name: string;
  declare required: boolean;
  declare revealed: boolean;

  static styles = [
    inputBase,
    css`
      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;
      }
      input::-ms-reveal,
      input::-ms-clear {
        display: none;
      }
      input::-webkit-credentials-auto-fill-button {
        visibility: hidden;
        pointer-events: none;
        position: absolute;
        right: 0;
      }
      input {
        padding-right: 44px;
      }
      .reveal-btn {
        position: absolute;
        right: var(--metro-spacing-sm, 8px);
        background: none;
        border: none;
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        cursor: pointer;
        padding: var(--metro-spacing-xs, 4px);
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .reveal-btn:hover {
        color: var(--metro-foreground, #ffffff);
      }
      .reveal-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
    `,
  ];

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
   * Toggles the password reveal state between masked and plain text.
   * @returns void
   */
  #toggleReveal(): void {
    this.revealed = !this.revealed;
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
   * Called when the form is reset. Clears the value to empty string.
   * @returns void
   */
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
