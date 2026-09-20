import { LitElement, html, css, type PropertyValues } from "lit";
import { focusRing, pressState, disabledState, baseTypography, applyTiltEffect } from "../../styles/shared.ts";
import {
  updateAriaDisabled,
  handleDisabledClick,
  handleKeyboardActivation,
  addPressedState,
} from "./shared.ts";

/**
 * Metro Button Component
 *
 * A standard push button implementing the Metro design language with distinctive
 * visual feedback and interactions. Features include:
 * - Color inversion on hover (foreground becomes background)
 * - Accent color variant for primary actions
 * - Tilt animation effect on pointer interaction
 * - Keyboard navigation support (Enter/Space activation)
 * - Full ARIA accessibility support
 *
 * Use this component for standard button actions in forms, toolbars, or any
 * interactive UI element that triggers an action when clicked.
 *
 * The button is form-associated: inside a `<form>` it follows native button
 * semantics. The `type` property controls behavior (`submit` by default,
 * `reset` clears the owner form, `button` performs no form action). The form
 * owner is submitted via `requestSubmit()` so constraint validation runs;
 * note that `formaction`/`formmethod` submitter overrides are not supported.
 *
 * @fires click - Fired when the button is clicked or activated via keyboard (Enter/Space)
 *
 * @cssprop --metro-foreground - Text and border color of the button in normal state (default: #fff)
 * @cssprop --metro-foreground-secondary - Pressed state background color (default: rgba(255, 255, 255, 0.6))
 * @cssprop --metro-background - Background color applied on hover (default: #1f1f1f)
 * @cssprop --metro-accent - Accent color for primary button variant (default: #0078d4)
 * @cssprop --metro-accent-light - Lighter accent for accent hover state (default: #429ce3)
 * @cssprop --metro-accent-dark - Darker accent for accent pressed state (default: #005a9e)
 * @cssprop --metro-transition-fast - Transition duration for state changes (default: 167ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 * @cssprop --metro-font-size-normal - Font size for button text (default: 14px)
 *
 * @slot - Default slot for button content (text, icons, or other elements)
 *
 * @csspart button - The main button element that receives hover/press states
 */
export class MetroButton extends LitElement {
  static formAssociated = true;

  static VALID_TYPES = new Set(["button", "submit", "reset"]);

  static properties = {
    /**
     * When true, the button is disabled and cannot be interacted with.
     * Disabled buttons have reduced opacity, no pointer events, and
     * are removed from the tab navigation order.
     * @default false
     */
    disabled: { type: Boolean, reflect: true },
    /**
     * Sets the button to use accent color styling. When present, the button
     * uses the Metro accent color (blue by default) for the background.
     * Use this for primary actions to make them visually prominent.
     * @default undefined
     */
    accent: { type: String, reflect: true },
    /**
     * Form behavior, following native button semantics: `submit` submits the
     * owner form, `reset` resets it, `button` performs no form action.
     * @default "submit"
     */
    type: { type: String, reflect: true },
  };

  declare disabled: boolean;
  declare accent: string | undefined;
  declare type: "button" | "submit" | "reset";

  static styles = [
    focusRing,
    pressState,
    disabledState,
    baseTypography,
    css`
      :host {
        display: inline-block;
      }

      .button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: var(--metro-font-size-normal, 14px);
        font-weight: 400;
        letter-spacing: 0.02em;
        padding: 10px 22px;
        min-width: 120px;
        min-height: 40px;
        border: 2px solid var(--metro-foreground, #fff);
        background: transparent;
        color: var(--metro-foreground, #fff);
        cursor: pointer;
        text-align: center;
        user-select: none;
        box-sizing: border-box;
        transition:
          background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          border-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }

      .button:hover {
        background: var(--metro-foreground, #fff);
        color: var(--metro-background, #1f1f1f);
      }

      :host([accent]) .button {
        background: var(--metro-accent, #0078d4);
        border-color: var(--metro-accent, #0078d4);
        color: #fff;
      }

      :host([accent]) .button:hover {
        background: var(--metro-accent-light, #429ce3);
        border-color: var(--metro-accent-light, #429ce3);
        color: #fff;
      }

      :host([accent]) .button.pressed {
        background: var(--metro-accent-dark, #005a9e);
        border-color: var(--metro-accent-dark, #005a9e);
        color: #fff;
      }

      .button.pressed {
        background: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        border-color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        color: var(--metro-background, #1f1f1f);
      }
    `,
  ];

  #cleanupTilt?: () => void;

  #internals: ElementInternals;

  constructor() {
    super();
    this.disabled = false;
    this.type = "submit";
    this.#internals = this.attachInternals();
  }

  attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null,
  ): void {
    if (name === "type" && value !== null && !MetroButton.VALID_TYPES.has(value)) {
      throw new TypeError(
        `Invalid type "${value}". Expected: button, submit, reset`,
      );
    }
    super.attributeChangedCallback(name, old, value);
  }

  render() {
    return html`<button class="button" role="button" tabindex=${this.disabled ? -1 : 0} ?disabled=${this.disabled} @click=${this.#handleClick} @keydown=${this.#handleKeydown} @mousedown=${this.#handlePointerDown} @touchstart=${this.#handlePointerDown}><slot></slot></button>`;
  }

  protected firstUpdated(): void {
    this.#cleanupTilt = applyTiltEffect(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#cleanupTilt?.();
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("disabled")) {
      updateAriaDisabled(this, this.disabled);
    }
  }

  /**
   * Handles click events on the button, preventing interaction when disabled
   * and performing the form action for the current type when owned by a form.
   * @param e - The click event
   * @returns void
   */
  #handleClick = (e: Event): void => {
    if (!handleDisabledClick(e, this.disabled)) return;
    this.#submitOrResetForm();
  };

  /**
   * Handles keyboard activation (Enter/Space keys) to trigger button action.
   * @param e - The keyboard event
   * @returns void
   */
  #handleKeydown = (e: KeyboardEvent): void => {
    handleKeyboardActivation(e, this.disabled, () => {
      this.#submitOrResetForm();
      this.click();
    });
  };

  /**
   * Submits or resets the owner form according to the type property.
   * A no-op when the button is not owned by a form or type is "button".
   * @returns void
   */
  #submitOrResetForm(): void {
    const form = this.#internals.form;
    if (!form) return;
    if (this.type === "submit") {
      form.requestSubmit();
    } else if (this.type === "reset") {
      form.reset();
    }
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  /**
   * Applies pressed state styling when the button is pressed via mouse or touch.
   * @param e - The pointer event
   * @returns void
   */
  #handlePointerDown = (e: Event): void => {
    const target = e.currentTarget as HTMLElement;
    addPressedState(target, this.disabled);
  };
}

export function registerMetroButton(): void {
  if (!customElements.get("metro-button")) {
    customElements.define("metro-button", MetroButton);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-button": MetroButton;
  }
}
