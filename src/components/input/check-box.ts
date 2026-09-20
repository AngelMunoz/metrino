import { LitElement, html, css, type PropertyValues } from "lit";
import { toggleControlBase } from "../../styles/shared.ts";
import { checkedValidation, updateFormControlState } from "../../utils/form-control.ts";

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
    /**
     * When true, the checkbox must be checked for the owner form to
     * validate and submit.
     * @default false
     */
    required: { type: Boolean, reflect: true },
  };

  declare checked: boolean;
  declare disabled: boolean;
  declare name: string;
  declare value: string;
  declare required: boolean;

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
      .checkbox:hover {
        border-color: var(--metro-foreground, #ffffff);
      }
      .checkbox:active {
        background: var(--metro-highlight-active, rgba(255, 255, 255, 0.08));
      }
      .checkbox:focus-visible {
        outline: 2px solid var(--metro-accent, #0078d4);
        outline-offset: 2px;
      }
    `,
  ];

  #internals: ElementInternals;
  #box?: HTMLDivElement;

  constructor() {
    super();
    this.checked = false;
    this.disabled = false;
    this.name = "";
    this.value = "on";
    this.required = false;
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      <div
        class="checkbox ${this.checked ? "checked" : ""}"
        role="checkbox"
        aria-checked="${this.checked}"
        tabindex="${this.disabled ? -1 : 0}"
        @click=${this.#toggle}
        @keydown=${this.#handleKeydown}
      >
        <span class="checkmark">&#x2713;</span>
      </div>
      <slot></slot>
    `;
  }

  /**
   * Called on first update to cache the box element and set initial form state.
   * @returns void
   */
  firstUpdated(): void {
    this.#box = this.shadowRoot?.querySelector(".checkbox") ?? undefined;
    this.#updateState();
  }

  /**
   * Updates form state when a validation-relevant property changes.
   * @param changedProperties - Map of changed properties
   * @returns void
   */
  updated(changedProperties: PropertyValues<this>): void {
    if (
      changedProperties.has("checked") ||
      changedProperties.has("required") ||
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
      this.checked ? this.value : null,
      checkedValidation(this.checked, this.required && !this.disabled),
      this.#box,
    );
  }

  /**
   * Toggles the checked state and dispatches change event.
   * Does nothing if the checkbox is disabled.
   * @returns void
   */
  #toggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.#updateState();
    this.dispatchEvent(new CustomEvent("change", {
      detail: { checked: this.checked },
      bubbles: true,
      composed: true,
    }));
  }

  #handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.#toggle();
    }
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
    this.#updateState();
  }

  /**
   * Called when form state is restored (e.g., session history restore).
   * Re-checks the checkbox when the restored state matches its value.
   * @param state - The restored state value
   * @param _mode - The restoration mode
   * @returns void
   */
  formStateRestoreCallback(
    state: string | File | FormData | null,
    _mode: "restore" | "autocomplete",
  ): void {
    if (typeof state === "string" && state === this.value) {
      this.checked = true;
      this.#updateState();
    }
  }
}

export function registerMetroCheckBox(): void {
  if (!customElements.get("metro-check-box")) {
    customElements.define("metro-check-box", MetroCheckBox);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-check-box": MetroCheckBox;
  }
}
