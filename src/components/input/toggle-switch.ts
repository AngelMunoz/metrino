import { LitElement, html, css, type PropertyValues } from "lit";
import { toggleControlBase } from "../../styles/shared.ts";

/**
 * Metro Toggle Switch Component
 *
 * A form-associated toggle switch component with Metro styling. Features a sliding
 * thumb animation and accent color fill. Implements the ElementInternals API for
 * form participation. Similar in function to a checkbox but with a switch metaphor.
 *
 * Features:
 * - Custom switch design with sliding thumb animation
 * - Accent color fill for "on" state
 * - Form association via ElementInternals API
 * - Disabled state support
 * - Name and value attributes for form submission
 * - Custom change event with on state
 * - ARIA switch role support
 * - Form reset callback support
 * - Form disabled callback support
 *
 * Use for binary on/off settings where the switch metaphor is more appropriate
 * than a checkbox, such as enabling/disabling features or toggling modes.
 *
 * @fires change - Fired when the on state changes (bubbles: true, composed: true)
 *   Detail: { on: boolean }
 *
 * @cssprop --metro-accent - "On" state background and border color (default: #0078d4)
 * @cssprop --metro-foreground - Thumb color and border (default: #ffffff)
 * @cssprop --metro-transition-fast - Transition duration (default: 167ms)
 * @cssprop --metro-easing - Easing curve for color transitions (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 *
 * @slot - Default slot for switch label text
 *
 * @csspart switch - The switch track element
 * @csspart thumb - The sliding thumb element
 */
export class MetroToggleSwitch extends LitElement {
  static formAssociated = true;

  static properties = {
    /**
     * The on/off state of the switch.
     * When true, the switch is in the "on" position with accent color.
     * @default false
     */
    on: { type: Boolean, reflect: true },
    /**
     * When true, the switch is disabled and cannot be toggled.
     * @default false
     */
    disabled: { type: Boolean, reflect: true },
    /**
     * Name attribute for form submission.
     * @default ""
     */
    name: { type: String, reflect: true },
    /**
     * Value submitted with the form when on.
     * @default "on"
     */
    value: { type: String, reflect: true },
  };

  declare on: boolean;
  declare disabled: boolean;
  declare name: string;
  declare value: string;

  static styles = [
    toggleControlBase,
    css`
      :host {
        padding: 6px;
        margin: -6px;
      }
      .switch {
        width: 44px;
        height: 22px;
        background: transparent;
        border: 2px solid var(--metro-foreground, #ffffff);
        border-radius: 0;
        position: relative;
        transition:
          background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          border-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .switch.checked {
        background: var(--metro-accent, #0078d4);
        border-color: var(--metro-accent, #0078d4);
      }
      .thumb {
        width: 14px;
        height: 14px;
        background: var(--metro-foreground, #ffffff);
        border-radius: 0;
        position: absolute;
        top: 2px;
        left: 2px;
        transition:
          transform var(--metro-transition-fast, 167ms) cubic-bezier(0.34, 1.56, 0.64, 1),
          background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .switch.checked .thumb {
        transform: translateX(22px);
        background: #ffffff;
      }
    `,
  ];

  #internals: ElementInternals;

  constructor() {
    super();
    this.on = false;
    this.disabled = false;
    this.name = "";
    this.value = "on";
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      <div
        class="switch ${this.on ? "checked" : ""}"
        role="switch"
        aria-checked="${this.on}"
        @click=${this.#toggle}
      >
        <div class="thumb"></div>
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
   * Updates form value when the on property changes.
   * @param changedProperties - Map of changed properties
   * @returns void
   */
  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("on")) {
      this.#updateFormValue();
    }
  }

  /**
   * Updates the internal form value based on on state.
   * Sets value when on, null when off.
   * @returns void
   */
  #updateFormValue(): void {
    this.#internals.setFormValue(this.on ? this.value : null);
  }

  /**
   * Toggles the on state and dispatches change event.
   * Does nothing if the switch is disabled.
   * @returns void
   */
  #toggle(): void {
    if (this.disabled) return;
    this.on = !this.on;
    this.#updateFormValue();
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { on: this.on },
        bubbles: true,
        composed: true,
      }),
    );
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
   * Called when the form is reset. Turns the switch off.
   * @returns void
   */
  formResetCallback(): void {
    this.on = false;
    this.#updateFormValue();
  }
}

customElements.define("metro-toggle-switch", MetroToggleSwitch);

declare global {
  interface HTMLElementTagNameMap {
    "metro-toggle-switch": MetroToggleSwitch;
  }
}
