import { LitElement, html, css, type PropertyValues } from "lit";
import { focusRing, disabledState, baseTypography, applyTiltEffect } from "../../styles/shared.ts";
import {
  updateAriaDisabled,
  handleDisabledClick,
  handleKeyboardActivation,
  addPressedState,
} from "./shared.ts";

/**
 * Navigates to the hyperlink destination when the button is activated.
 * @param el - The MetroHyperlinkButton instance
 * @returns void
 */
function navigate(el: MetroHyperlinkButton): void {
  if (!el.href) return;
  if (el.target === "_blank") {
    window.open(el.href, "_blank", "noopener,noreferrer");
  } else {
    window.location.href = el.href;
  }
}

/**
 * Metro Hyperlink Button Component
 *
 * A button-styled hyperlink that combines the visual appearance of a Metro button
 * with the navigation behavior of an anchor element. Ideal for call-to-action
 * links, navigation buttons, or any UI element that needs to both look like a
 * button and navigate to another page.
 *
 * Features:
 * - Styled as a transparent button with accent-colored text
 * - Supports external links with target="_blank" (adds security attributes)
 * - Hover underline effect for clear link affordance
 * - Tilt animation effect on pointer interaction
 * - Keyboard activation support (Enter/Space)
 * - Can function as a button without href (uses click handler instead)
 *
 * @fires click - Fired when the button is clicked or activated via keyboard
 *
 * @cssprop --metro-accent - Text color for the hyperlink button (default: #0078d4)
 * @cssprop --metro-background - Background color applied on hover (default: #1f1f1f)
 * @cssprop --metro-transition-fast - Transition duration for state changes (default: 167ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 * @cssprop --metro-font-size-normal - Font size for button text (default: 14px)
 *
 * @slot - Default slot for button content (text, icons, or other elements)
 *
 * @csspart button - The main anchor element that receives hover/press states
 */
export class MetroHyperlinkButton extends LitElement {
  static properties = {
    /**
     * When true, the button is disabled and cannot be interacted with.
     * Disabled buttons have reduced opacity, no pointer events, and
     * are removed from the tab navigation order.
     * @default false
     */
    disabled: { type: Boolean, reflect: true },
    /**
     * The URL to navigate to when the button is clicked. If not provided,
     * the button behaves as a regular button without navigation.
     * @default undefined
     */
    href: { type: String },
    /**
     * Specifies where to open the linked document. Use "_blank" for new tab.
     * When "_blank" is used, security attributes (noopener, noreferrer) are added.
     * @default undefined
     */
    target: { type: String },
  };

  declare disabled: boolean;
  declare href: string | undefined;
  declare target: string | undefined;

  static styles = [
    focusRing,
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
        background: transparent;
        color: var(--metro-accent, #0078d4);
        cursor: pointer;
        text-align: center;
        text-decoration: none;
        user-select: none;
        box-sizing: border-box;
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }

      .button:hover {
        text-decoration: underline;
      }

      .button.pressed {
        opacity: 0.7;
      }
    `,
  ];

  #cleanupTilt?: () => void;

  constructor() {
    super();
    this.disabled = false;
  }

  render() {
    return html`<a class="button" role=${this.href ? "link" : "button"} href=${this.href || ""} target=${this.target || ""} ?aria-disabled=${this.disabled} tabindex=${this.disabled ? -1 : 0} @click=${this.#handleClick} @keydown=${this.#handleKeydown} @mousedown=${this.#handlePointerDown} @touchstart=${this.#handlePointerDown}><slot></slot></a>`;
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
   * Handles click events, preventing interaction when disabled and managing navigation.
   * @param e - The click event
   * @returns void
   */
  #handleClick = (e: Event): void => {
    if (!handleDisabledClick(e, this.disabled)) return;
    if (this.href) {
      e.preventDefault();
      navigate(this);
    }
  };

  /**
   * Handles keyboard activation (Enter/Space keys) to trigger navigation or click.
   * @param e - The keyboard event
   * @returns void
   */
  #handleKeydown = (e: KeyboardEvent): void => {
    handleKeyboardActivation(e, this.disabled, () => {
      if (this.href) {
        navigate(this);
      } else {
        this.click();
      }
    });
  };

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

customElements.define("metro-hyperlink-button", MetroHyperlinkButton);

declare global {
  interface HTMLElementTagNameMap {
    "metro-hyperlink-button": MetroHyperlinkButton;
  }
}
