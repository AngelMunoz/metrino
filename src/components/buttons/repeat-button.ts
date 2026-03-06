import { LitElement, html, css, type PropertyValues } from "lit";
import { focusRing, pressState, disabledState, baseTypography, applyTiltEffect } from "../../styles/shared.ts";
import {
  updateAriaDisabled,
  handleDisabledClick,
  handleKeyboardActivation,
  addPressedState,
  type RepeatState,
  startRepeat,
  stopRepeat,
} from "./shared.ts";

/**
 * Metro Repeat Button Component
 *
 * A specialized button that repeatedly fires click events while being held down.
 * Ideal for increment/decrement controls, volume adjustment, or any action that
 * should repeat when the user holds the button.
 *
 * Features:
 * - Configurable initial delay before repeat starts (default: 500ms)
 * - Configurable repeat interval between clicks (default: 100ms)
 * - Color inversion on hover
 * - Accent color variant for primary actions
 * - Tilt animation effect on pointer interaction
 * - Keyboard activation support
 * - Automatically stops repeating when released or on pointer leave
 *
 * Use for media controls (volume, seek), numeric inputs (spinner buttons),
 * or any action that benefits from rapid repetition.
 *
 * @fires click - Fired initially on press and repeatedly during hold
 *
 * @cssprop --metro-highlight - Background color in normal state (default: rgba(255, 255, 255, 0.1))
 * @cssprop --metro-foreground - Text color in normal state (default: #fff)
 * @cssprop --metro-background - Background color applied on hover (default: #1f1f1f)
 * @cssprop --metro-accent - Accent color for primary button variant (default: #0078d4)
 * @cssprop --metro-accent-light - Lighter accent for accent hover state (default: #429ce3)
 * @cssprop --metro-accent-dark - Darker accent for accent pressed state (default: #005a9e)
 * @cssprop --metro-foreground-secondary - Pressed state background color (default: rgba(255, 255, 255, 0.6))
 * @cssprop --metro-transition-fast - Transition duration for state changes (default: 167ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 * @cssprop --metro-font-size-normal - Font size for button text (default: 14px)
 *
 * @slot - Default slot for button content (text, icons, or other elements)
 *
 * @csspart button - The main button element that receives hover/press states
 */
export class MetroRepeatButton extends LitElement {
  static properties = {
    /**
     * When true, the button is disabled and cannot be interacted with.
     * Disabled buttons have reduced opacity and no pointer events.
     * @default false
     */
    disabled: { type: Boolean, reflect: true },
    /**
     * Sets the button to use accent color styling for primary actions.
     * Uses the Metro accent color (blue by default) for the background.
     * @default undefined
     */
    accent: { type: String, reflect: true },
    /**
     * Delay in milliseconds before repeat mode starts after initial press.
     * Lower values make the button repeat sooner. Only applies to pointer (mouse/touch) events.
     * @default 500
     */
    delay: { type: Number },
    /**
     * Interval in milliseconds between repeated click events during hold.
     * Lower values make the button repeat faster.
     * @default 100
     */
    interval: { type: Number },
  };

  declare disabled: boolean;
  declare accent: string | undefined;
  declare delay: number;
  declare interval: number;

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
        padding: 12px 24px;
        min-width: 120px;
        min-height: 40px;
        border: none;
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        color: var(--metro-foreground, #fff);
        cursor: pointer;
        text-align: center;
        user-select: none;
        box-sizing: border-box;
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }

      .button:hover {
        background: var(--metro-foreground, #fff);
        color: var(--metro-background, #1f1f1f);
      }

      :host([accent]) .button {
        background: var(--metro-accent, #0078d4);
        color: #fff;
      }

      :host([accent]) .button:hover {
        background: var(--metro-accent-light, #429ce3);
        color: #fff;
      }

      :host([accent]) .button.pressed {
        background: var(--metro-accent-dark, #005a9e);
        color: #fff;
      }

      .button.pressed {
        background: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        color: var(--metro-background, #1f1f1f);
      }
    `,
  ];

  #repeatState: RepeatState = { timer: null, interval: null };
  #cleanupTilt?: () => void;

  constructor() {
    super();
    this.disabled = false;
    this.delay = 500;
    this.interval = 100;
  }

  render() {
    return html`<button class="button" ?disabled=${this.disabled} @click=${this.#handleClick} @keydown=${this.#handleKeydown} @mousedown=${this.#handlePointerDown} @touchstart=${this.#handlePointerDown} @mouseup=${this.#handlePointerUp} @mouseleave=${this.#handlePointerUp} @touchend=${this.#handlePointerUp}><slot></slot></button>`;
  }

  protected firstUpdated(): void {
    this.#cleanupTilt = applyTiltEffect(this);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    stopRepeat(this.#repeatState);
    this.#cleanupTilt?.();
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("disabled")) {
      updateAriaDisabled(this, this.disabled);
    }
  }

  /**
   * Handles click events on the button, preventing interaction when disabled.
   * @param e - The click event
   * @returns void
   */
  #handleClick = (e: Event): void => {
    handleDisabledClick(e, this.disabled);
  };

  /**
   * Handles keyboard activation (Enter/Space keys) to trigger button action.
   * Note: Keyboard activation does not trigger repeat mode.
   * @param e - The keyboard event
   * @returns void
   */
  #handleKeydown = (e: KeyboardEvent): void => {
    handleKeyboardActivation(e, this.disabled, () => this.click());
  };

  /**
   * Handles pointer down events to start the repeat timer and apply pressed state.
   * The button will begin repeating click events after the delay period.
   * @param e - The pointer event
   * @returns void
   */
  #handlePointerDown = (e: Event): void => {
    if (this.disabled) return;
    const target = e.currentTarget as HTMLElement;
    addPressedState(target, this.disabled);
    if (e.type === "mousedown" || e.type === "touchstart") {
      startRepeat(this.#repeatState, this.delay, this.interval, () => this.click());
    }
  };

  /**
   * Handles pointer up events to stop the repeat timer and remove pressed state.
   * Called on mouseup, touchend, and mouseleave to ensure repeat always stops.
   * @param e - The pointer event
   * @returns void
   */
  #handlePointerUp = (e: Event): void => {
    stopRepeat(this.#repeatState);
    const target = e.currentTarget as HTMLElement;
    target.classList.remove("pressed");
  };
}

customElements.define("metro-repeat-button", MetroRepeatButton);

declare global {
  interface HTMLElementTagNameMap {
    "metro-repeat-button": MetroRepeatButton;
  }
}
