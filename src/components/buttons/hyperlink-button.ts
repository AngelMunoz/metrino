import { LitElement, html, css, type PropertyValues } from "lit";
import { focusRing, disabledState, baseTypography, applyTiltEffect } from "../../styles/shared.ts";
import {
  updateAriaDisabled,
  handleDisabledClick,
  handleKeyboardActivation,
  addPressedState,
} from "./shared.ts";
import { isSafeUrl } from "../../utils/sanitize.ts";

/**
 * Returns true when a hyperlink is safe to navigate to. Empty values are
 * allowed (they render as a button instead of a link); otherwise only
 * relative URLs and the `http`, `https`, `mailto` and `tel` schemes pass.
 * Dangerous schemes such as `javascript:`, `data:` and `blob:` are rejected.
 * @param href - The href value to validate
 * @returns boolean
 */
export function isSafeHyperlink(href: string | undefined): boolean {
  if (!href) return true;
  return isSafeUrl(href);
}

/**
 * Navigates to the hyperlink destination when the button is activated.
 * @param el - The MetroHyperlinkButton instance
 * @returns void
 */
function navigate(el: MetroHyperlinkButton): void {
  if (!el.href || !isSafeHyperlink(el.href)) return;
  if (el.target === "_blank") {
    window.open(el.href, "_blank", "noopener,noreferrer");
  } else {
    window.location.href = el.href;
  }
}

/**
 * Returns the href to render on the anchor, or an empty string when the
 * value uses an unsafe scheme.
 * @param el - The MetroHyperlinkButton instance
 * @returns string
 */
function renderedHref(el: MetroHyperlinkButton): string {
  return el.href && isSafeHyperlink(el.href) ? el.href : "";
}

/**
 * Metro Hyperlink Button Component
 *
 * A text hyperlink sized to its content: underlined accent-colored text with
 * color-only hover/press feedback and no background block, so it sits inside
 * sentences like a regular link instead of occupying a button rectangle.
 *
 * Features:
 * - Underlined accent-colored text, content-sized hit area
 * - Color-only feedback: theme-aware accent on hover and press (darker in light
 *   themes, lighter in dark themes), no block highlight
 * - Minimum 24px hit area for standalone use while staying content-sized
 * - Supports external links with target="_blank" (adds rel="noopener noreferrer")
 * - Only relative URLs and http, https, mailto and tel schemes are navigated
 * - Tilt animation effect on pointer interaction
 * - Keyboard activation support (Enter/Space)
 * - Can function as a button without href (uses click handler instead)
 *
 * @fires click - Fired when the button is clicked or activated via keyboard
 *
 * @cssprop --metro-accent - Text color (default: #0078d4)
 * @cssprop --metro-accent-text-hover - Theme-aware text color on hover and press (default: #005a9e in light themes, #429ce3 in dark themes)
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
        font-size: var(--metro-font-size-normal, 14px);
        font-weight: 400;
        letter-spacing: 0.02em;
        padding: 2px 4px;
        min-height: 24px;
        border: none;
        background: transparent;
        color: var(--metro-accent, #0078d4);
        cursor: pointer;
        text-decoration: underline;
        user-select: none;
        box-sizing: border-box;
        transition: color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }

      .button:hover {
        color: var(--metro-accent-text-hover, var(--metro-accent-light, #429ce3));
      }

      .button.pressed {
        color: var(--metro-accent-text-hover, var(--metro-accent-light, #429ce3));
      }
    `,
  ];

  #cleanupTilt?: () => void;

  constructor() {
    super();
    this.disabled = false;
  }

  render() {
    const href = renderedHref(this);
    const rel = this.target === "_blank" ? "noopener noreferrer" : "";
    return html`<a class="button" role=${href ? "link" : "button"} href=${href} target=${this.target || ""} rel=${rel} ?aria-disabled=${this.disabled} tabindex=${this.disabled ? -1 : 0} @click=${this.#handleClick} @keydown=${this.#handleKeydown} @mousedown=${this.#handlePointerDown} @touchstart=${this.#handlePointerDown}><slot></slot></a>`;
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

export function registerMetroHyperlinkButton(): void {
  if (!customElements.get("metro-hyperlink-button")) {
    customElements.define("metro-hyperlink-button", MetroHyperlinkButton);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-hyperlink-button": MetroHyperlinkButton;
  }
}
