import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

/**
 * Metro App Bar Component
 *
 * A fixed-position application bar that provides primary navigation and actions.
 * The App Bar appears at the top or bottom of the screen and supports an expandable
 * menu panel for additional options. It's designed for mobile and touch-first interfaces.
 *
 * Features:
 * - Fixed positioning at top or bottom of viewport
 * - Expandable menu panel with slide animation
 * - Slots for buttons, content, and menu items
 * - Visual separator between content and button areas
 * - Smooth height transitions when expanding/collapsing
 *
 * The App Bar is commonly used as the primary navigation container in Metro-style
 * applications, housing navigation buttons, action buttons, and an overflow menu.
 *
 * @fires expanded - Fired when the menu panel is expanded (composed: true, bubbles: true)
 * @fires collapsed - Fired when the menu panel is collapsed (composed: true, bubbles: true)
 *
 * @cssprop --metro-background - Background color of the app bar (default: #1f1f1f)
 * @cssprop --metro-border - Border color for separators (default: rgba(255, 255, 255, 0.2))
 * @cssprop --metro-spacing-sm - Small spacing unit for padding (default: 8px)
 * @cssprop --metro-spacing-md - Medium spacing unit (default: 12px)
 * @cssprop --metro-transition-fast - Fast transition duration (default: 167ms)
 * @cssprop --metro-transition-slow - Slow transition duration for height changes (default: 333ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 *
 * @slot - Default slot for app bar buttons (displayed in the button area)
 * @slot content - Slot for content displayed on the left side of the bar
 * @slot menu - Slot for menu items displayed in the expandable panel
 *
 * @csspart app-bar-content - The main content area of the app bar
 * @csspart menu-panel - The expandable menu panel container
 * @csspart ellipsis-btn - The "..." button that toggles the menu panel
 */
export class MetroAppBar extends LitElement {
  static properties = {
    /**
     * Position of the app bar. "bottom" places it at the bottom of the viewport (default),
     * "top" places it at the top. Affects border placement and animation direction.
     * @default "bottom"
     */
    placement: { type: String, reflect: true },
    /**
     * Controls the visibility of the expandable menu panel.
     * When true, the menu panel is displayed with slide-in animation.
     * @default false
     */
    expanded: { type: Boolean, reflect: true },
  };

  declare placement: "top" | "bottom";
  declare expanded: boolean;

  static styles = [
    baseTypography,
    css`
      :host {
        display: flex;
        flex-direction: column;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--metro-background, #1f1f1f);
        z-index: 1000;
        transition: height var(--metro-transition-slow, 333ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      :host([placement="top"]) {
        top: 0;
        bottom: auto;
      }
      .app-bar-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--metro-spacing-sm, 8px);
      }
      :host(:not([expanded])) .app-bar-content {
        border-top: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }
      :host([placement="top"]:not([expanded])) .app-bar-content {
        border-top: none;
        border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }
      :host([expanded]) {
        border-top: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }
      :host([placement="top"][expanded]) {
        border-top: none;
        border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }
      .app-bar-buttons {
        display: flex;
        gap: var(--metro-spacing-sm, 8px);
        align-items: center;
      }
      .ellipsis-btn {
        min-width: 48px;
        min-height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: var(--metro-foreground, #ffffff);
        cursor: pointer;
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 3px;
        transition: background-color var(--metro-transition-fast, 167ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .ellipsis-btn:hover {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      .menu-panel {
        display: none;
        flex-direction: column;
        padding: 0 var(--metro-spacing-md, 12px) var(--metro-spacing-sm, 8px);
      }
      :host([expanded]) .menu-panel {
        display: flex;
        animation: menuSlide var(--metro-transition-normal, 250ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      @keyframes menuSlide {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `,
  ];

  constructor() {
    super();
    this.placement = "bottom";
    this.expanded = false;
  }

  render() {
    return html`
      <div class="menu-panel" role="menu">
        <slot name="menu"></slot>
      </div>
      <div class="app-bar-content">
        <slot name="content"></slot>
        <div class="app-bar-buttons">
          <slot></slot>
        </div>
        <button
          class="ellipsis-btn"
          @click=${this.#toggleMenu}
          aria-label="More options"
          aria-expanded=${this.expanded}
        >
          ...
        </button>
      </div>
    `;
  }

  /**
   * Toggles the expandable menu panel open or closed.
   * Updates the expanded property and dispatches appropriate events.
   * @returns void
   */
  #toggleMenu(): void {
    this.expanded = !this.expanded;
  }
}

customElements.define("metro-app-bar", MetroAppBar);

declare global {
  interface HTMLElementTagNameMap {
    "metro-app-bar": MetroAppBar;
  }
}
