import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";
import "../primitives/icon.ts";

/**
 * Metro App Bar Button Component
 *
 * A specialized button designed for use within the Metro App Bar. Features a circular
 * icon container with hover inversion effects and optional label display. The label
 * appears only when the parent App Bar is in expanded state.
 *
 * Features:
 * - Circular icon container with border
 * - Hover color inversion effect (icon becomes dark on light background)
 * - Optional text label that appears when app bar is expanded
 * - Support for both regular app bar and menu item modes
 * - Metro icon integration with size variants
 *
 * Use this component within metro-app-bar for navigation and action buttons.
 * For menu items in the expandable panel, use the "menu-item" attribute.
 *
 * @cssprop --metro-foreground - Icon and border color (default: #ffffff)
 * @cssprop --metro-background - Inverted background color on hover (default: #1f1f1f)
 * @cssprop --metro-highlight - Hover background color (default: rgba(255, 255, 255, 0.1))
 * @cssprop --metro-spacing-xs - Extra small spacing unit (default: 4px)
 * @cssprop --metro-spacing-md - Medium spacing unit (default: 12px)
 * @cssprop --metro-spacing-lg - Large spacing unit (default: 16px)
 * @cssprop --metro-transition-fast - Transition duration (default: 167ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 * @cssprop --metro-font-size-small - Font size for the label (default: 12px)
 *
 * @slot - Default slot for custom content (used when no icon is specified)
 *
 * @csspart icon-circle - The circular container for the icon
 * @csspart label - The text label element
 */
export class MetroAppBarButton extends LitElement {
  static properties = {
    /**
     * The name of the Metro icon to display. See metro-icon for available icons.
     * If not provided, the default slot content is rendered instead.
     * @default ""
     */
    icon: { type: String, reflect: true },
    /**
     * Text label displayed below the icon. Only visible when the parent
     * metro-app-bar has the "expanded" attribute set.
     * @default ""
     */
    label: { type: String, reflect: true },
  };

  declare icon: string;
  declare label: string;

  static styles = [
    baseTypography,
    css`
      :host {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 48px;
        min-height: 48px;
        padding: var(--metro-spacing-xs, 4px);
        background: transparent;
        border: none;
        color: var(--metro-foreground, #ffffff);
        cursor: pointer;
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      :host(:hover) {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      :host(:active) {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.2));
      }
      .icon-circle {
        width: 36px;
        height: 36px;
        border: 2px solid var(--metro-foreground, #ffffff);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          border-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      :host(:hover) .icon-circle {
        background: var(--metro-foreground, #ffffff);
        border-color: var(--metro-foreground, #ffffff);
      }
      :host(:hover) .icon-circle metro-icon {
        color: var(--metro-background, #1f1f1f);
      }
      .icon-inner {
        color: var(--metro-foreground, #ffffff);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .label {
        font-size: var(--metro-font-size-small, 12px);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        margin-top: 0;
        transition:
          max-height var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          opacity var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          margin-top var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      :host-context(metro-app-bar[expanded]) .label {
        max-height: 20px;
        opacity: 1;
        margin-top: var(--metro-spacing-xs, 4px);
      }
      :host([menu-item]) {
        flex-direction: row;
        min-width: auto;
        min-height: auto;
        padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
        justify-content: flex-start;
      }
      :host([menu-item]) .icon-circle {
        width: 24px;
        height: 24px;
        border-width: 1px;
        margin-right: var(--metro-spacing-md, 12px);
        flex-shrink: 0;
      }
      :host([menu-item]) .icon-inner {
        font-size: 14px;
      }
      :host([menu-item]) .label {
        max-height: 20px;
        opacity: 1;
        margin-top: 0;
        text-transform: none;
      }
    `,
  ];

  constructor() {
    super();
    this.icon = "";
    this.label = "";
  }

  render() {
    return html`
      <div class="icon-circle">
        ${this.icon
          ? html`<metro-icon class="icon-inner" icon=${this.icon} size="medium"></metro-icon>`
          : html`<slot></slot>`}
      </div>
      ${this.label ? html`<div class="label">${this.label}</div>` : ""}
    `;
  }
}

customElements.define("metro-app-bar-button", MetroAppBarButton);

declare global {
  interface HTMLElementTagNameMap {
    "metro-app-bar-button": MetroAppBarButton;
  }
}
