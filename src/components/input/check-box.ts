import { LitElement, html, css, type PropertyValues } from "lit";
import { toggleControlBase } from "../../styles/shared.ts";

/**
 * Metro Check Box Component
 *
 * A form-associated checkbox component with Metro styling. Features a custom
 * visual design with animated checkmark and accent color fill. Implements the
 * ElementInternals API for form participation.
 *
 * Features:
 * - Custom checkbox design with animated checkmark
 * - Accent color fill for checked state
 * - Form association via ElementInternals API
 * - Disabled state support
 * - Name and value attributes for form submission
 * - Custom change event with checked state
 * - ARIA checkbox role support
 * - Form reset callback support
 * - Form disabled callback support
 *
 * Use for boolean options that users can toggle on/off, such as
 * preferences, agreements, or feature selections.
 *
 * @fires change - Fired when the checked state changes (bubbles: true, composed: true)
 *   Detail: { checked: boolean }
 *
 * @cssprop --metro-accent - Checked state background and border color (default: #0078d4)
 * @cssprop --metro-foreground-secondary - Unchecked border color (default: rgba(255, 255, 255, 0.6))
 * @cssprop --metro-transition-fast - Transition duration (default: 167ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 *
 * @slot - Default slot for checkbox label text
 *
 * @csspart checkbox - The checkbox box element
 * @csspart checkmark - The checkmark element
 */
export class MetroCheckBox extends LitElement {
  static formAssociated = true;

  static properties = {
    /**
     * The checked state of the checkbox.
     * When true, the checkbox displays a checkmark and accent fill.
     * @default false
     */
    checked: { type: Boolean, reflect: true },
    /**
     * When true, the checkbox is disabled and cannot be toggled.
     * @default false
     */
    disabled: { type: Boolean, reflect: true },
    /**
     * Name attribute for form submission.
     * @default ""
     */
    name: { type: String, reflect: true },
    /**
     * Value submitted with the form when checked.
     * @default "on"
     */
    value: { type: String, reflect: true },
  };

  declare checked: boolean;
  declare disabled: boolean;
  declare name: string;
  declare value: string;

  static styles = [
    toggleControlBase,
    css`
      :host {
        padding: 7px;
        margin: -7px;
      }
      .checkbox {
        width: 20px;
        height: 20px;
        border: 2px solid var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
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
        transition: all var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
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

  /**
   * Called on first update to set initial form value.
   * @returns void
   */
  firstUpdated(): void {
    this.#updateFormValue();
  }

  /**
   * Updates form value when the checked property changes.
   * @param changedProperties - Map of changed properties
   * @returns void
   */
  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("checked")) {
      this.#updateFormValue();
    }
  }

  /**
   * Updates the internal form value based on checked state.
   * Sets value when checked, null when unchecked.
   * @returns void
   */
  #updateFormValue(): void {
    this.#internals.setFormValue(this.checked ? this.value : null);
  }

  /**
   * Toggles the checked state and dispatches change event.
   * Does nothing if the checkbox is disabled.
   * @returns void
   */
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

  /**
   * Called when the form is disabled/enabled.
   * @param disabled - Whether the form is now disabled
   * @returns void
   */
  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  /**
   * Called when the form is reset. Unchecks the checkbox.
   * @returns void
   */
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
