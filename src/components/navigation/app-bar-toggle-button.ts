import { LitElement, html, css } from "lit";
import type { PropertyValues } from "lit";
import { baseTypography, disabledState, hoverHighlight } from "../../styles/shared.ts";
import "../primitives/icon.ts";

/**
 * Metro App Bar Toggle Button Component
 *
 * A toggle button for use within the Metro App Bar. Functions as a checkbox
 * with visual checked state using accent color fill. Supports the same
 * circular icon design as the standard AppBarButton.
 *
 * Features:
 * - Toggle/checkbox behavior with checked state
 * - Circular icon container with accent fill when checked
 * - Hover color inversion effect
 * - Optional text label that appears when app bar is expanded
 * - Support for both regular and menu item modes
 * - ARIA checkbox role support
 *
 * Use within metro-app-bar for toggle actions like pinning, favoriting,
 * or any on/off state that needs to be visually prominent.
 *
 * @fires change - Fired when the checked state changes.
 *   Detail: { checked: boolean }
 *
 * @cssprop --metro-foreground - Icon and border color (default: #ffffff)
 * @cssprop --metro-background - Inverted background color on hover (default: #1f1f1f)
 * @cssprop --metro-accent - Checked state background (default: #0078d4)
 * @cssprop --metro-accent-light - Hover state when checked (default: #429ce3)
 * @cssprop --metro-spacing-xs - Extra small spacing (default: 4px)
 * @cssprop --metro-spacing-md - Medium spacing (default: 12px)
 * @cssprop --metro-spacing-lg - Large spacing (default: 16px)
 * @cssprop --metro-transition-fast - Transition duration (default: 167ms)
 * @cssprop --metro-easing - Easing curve (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 * @cssprop --metro-font-size-small - Font size for label (default: 12px)
 *
 * @slot - Default slot for custom content (used when no icon is specified)
 *
 * @csspart icon-circle - The circular container for the icon
 * @csspart label - The text label element
 */
export class MetroAppBarToggleButton extends LitElement {
  static properties = {
    /**
     * The name of the Metro icon to display. See metro-icon for available icons.
     * @default ""
     */
    icon: { type: String, reflect: true },
    /**
     * Text label displayed below the icon. Only visible when the parent
     * metro-app-bar has the "expanded" attribute set.
     * @default ""
     */
    label: { type: String, reflect: true },
    /**
     * The checked/toggled state of the button. When true, the icon circle
     * is filled with the accent color.
     * @default false
     */
    checked: { type: Boolean, reflect: true },
    /**
     * When true, the button is disabled and cannot be toggled.
     * @default false
     */
    disabled: { type: Boolean, reflect: true },
    /**
     * When true, renders the button in menu item mode (row layout with
     * smaller icon and always-visible label). Set automatically when
     * used in the app bar's menu panel.
     * @default false
     */
    menuItem: { type: Boolean, attribute: "menu-item", reflect: true },
  };

  declare icon: string;
  declare label: string;
  declare checked: boolean;
  declare disabled: boolean;
  declare menuItem: boolean;

  static styles = [
    baseTypography,
    disabledState,
    hoverHighlight,
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
      .icon-circle {
        width: 40px;
        height: 40px;
        border: 2px solid var(--metro-foreground, #ffffff);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          border-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      :host([checked]) .icon-circle {
        background: var(--metro-accent, #0078d4);
        border-color: var(--metro-accent, #0078d4);
      }
      :host([checked]) .icon-circle metro-icon {
        color: var(--metro-foreground, #ffffff);
      }
      :host(:hover) .icon-circle {
        background: var(--metro-foreground, #ffffff);
        border-color: var(--metro-foreground, #ffffff);
      }
      :host(:hover) .icon-circle metro-icon {
        color: var(--metro-background, #1f1f1f);
      }
      :host([checked]:hover) .icon-circle {
        background: var(--metro-accent-light, #429ce3);
        border-color: var(--metro-accent-light, #429ce3);
      }
      :host([checked]:hover) .icon-circle metro-icon {
        color: var(--metro-foreground, #ffffff);
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
      :host([data-expanded]) .label {
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

  #observer: MutationObserver | null = null;

  constructor() {
    super();
    this.icon = "";
    this.label = "";
    this.checked = false;
    this.disabled = false;
    this.menuItem = false;
  }

  render() {
    return html`
      <div class="icon-circle" @click=${this.#handleClick} @keydown=${this.#handleKeyDown} tabindex="0" role="checkbox" aria-checked=${this.checked} aria-disabled=${this.disabled}>
        ${this.icon
          ? html`<metro-icon class="icon-inner" icon=${this.icon} size="medium"></metro-icon>`
          : html`<slot></slot>`}
      </div>
      ${this.label ? html`<div class="label">${this.label}</div>` : ""}
    `;
  }

  /**
   * Handles click events to toggle the checked state.
   * @param e - The mouse event
   * @returns void
   */
  #handleClick(e: MouseEvent): void {
    if (this.disabled) return;
    e.stopPropagation();
    this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Handles keyboard events (Enter/Space) to toggle the checked state.
   * @param e - The keyboard event
   * @returns void
   */
  #handleKeyDown(e: KeyboardEvent): void {
    if (this.disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.checked = !this.checked;
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: { checked: this.checked },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  /**
   * Sets up the mutation observer to watch for parent app bar expanded state.
   * @returns void
   */
  connectedCallback(): void {
    super.connectedCallback();
    this.#setupObserver();
  }

  /**
   * Cleans up the mutation observer when disconnected.
   * @returns void
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }
  }

  /**
   * Sets up a mutation observer to watch the parent app bar's expanded attribute.
   * @returns void
   */
  #setupObserver(): void {
    const appBar = this.closest("metro-app-bar");
    if (!appBar) return;

    this.#observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "expanded") {
          this.#updateExpandedState(appBar);
        }
      }
    });

    this.#observer.observe(appBar, { attributes: true, attributeFilter: ["expanded"] });
    this.#updateExpandedState(appBar);
  }

  /**
   * Updates the data-expanded attribute based on parent app bar state.
   * @param appBar - The parent metro-app-bar element
   * @returns void
   */
  #updateExpandedState(appBar: Element): void {
    const isExpanded = appBar.hasAttribute("expanded");
    this.toggleAttribute("data-expanded", isExpanded);
  }

  /**
   * Re-sets up observer when icon or label changes (in case parent changed).
   * @param changedProperties - Map of changed properties
   * @returns void
   */
  protected updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);
    if (changedProperties.has("icon") || changedProperties.has("label")) {
      const appBar = this.closest("metro-app-bar");
      if (appBar) {
        this.#updateExpandedState(appBar);
      }
    }
  }
}

customElements.define("metro-app-bar-toggle-button", MetroAppBarToggleButton);

declare global {
  interface HTMLElementTagNameMap {
    "metro-app-bar-toggle-button": MetroAppBarToggleButton;
  }
}
