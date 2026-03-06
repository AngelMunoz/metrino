import { LitElement, html, css, type PropertyValues } from "lit";
import { focusRing, pressState, disabledState, baseTypography, buttonBase, menuItemStyles } from "../../styles/shared.ts";
import {
  updateAriaDisabled,
  handleKeyboardActivation,
  addPressedState,
} from "./shared.ts";

/**
 * Dropdown placement options for the dropdown menu.
 */
type DropdownPlacement = "top" | "bottom";

/**
 * Metro Dropdown Button Component
 *
 * A button that reveals a dropdown menu when clicked. Supports labeled buttons
 * with optional icons and configurable menu placement. Items in the dropdown
 * should use the CSS class "menu-item" on their root element.
 *
 * Features:
 * - Labeled button with optional icon
 * - Configurable dropdown placement (top/bottom)
 * - Animated chevron rotation when opened
 * - Menu enter/exit animations
 * - Click outside to close
 * - Keyboard navigation support
 * - ARIA attributes for accessibility (menu, expanded state)
 *
 * Use for action menus, filter options, or any UI requiring a collapsible list
 * of selectable items attached to a button trigger.
 *
 * @fires show - Fired when the dropdown menu opens
 * @fires hide - Fired when the dropdown menu closes
 *
 * @cssprop --metro-background - Dropdown menu background color (default: #1f1f1f)
 * @cssprop --metro-border - Border color for dropdown menu (default: rgba(255, 255, 255, 0.2))
 * @cssprop --metro-spacing-sm - Small spacing unit (default: 8px)
 * @cssprop --metro-spacing-md - Medium spacing unit (default: 12px)
 * @cssprop --metro-transition-normal - Normal transition duration (default: 250ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 *
 * @slot - Default slot for dropdown menu items (use CSS class "menu-item" on items)
 *
 * @csspart button-content - The clickable button area containing label, icon, and chevron
 * @csspart dropdown - The dropdown menu container
 */
export class MetroDropdownButton extends LitElement {
  static properties = {
    /**
     * Text label displayed on the button. Shows an empty button if not set.
     * @default ""
     */
    label: { type: String },
    /**
     * Optional icon displayed before the label. Use the icon name from the Metro icon set.
     * @default undefined
     */
    icon: { type: String },
    /**
     * When true, the button is disabled and cannot be interacted with.
     * Also prevents the dropdown from opening and removes from tab order.
     * @default false
     */
    disabled: { type: Boolean, reflect: true },
    /**
     * Position of the dropdown menu relative to the button.
     * "bottom" places the menu below the button (default).
     * "top" places the menu above the button.
     * @default "bottom"
     */
    placement: { type: String, reflect: true },
    /**
     * Controls the visibility of the dropdown menu. When true, the menu is displayed.
     * Can be set programmatically or via the show()/hide() methods.
     * @default false
     */
    open: { type: Boolean, reflect: true },
  };

  declare label: string;
  declare icon: string | undefined;
  declare disabled: boolean;
  declare placement: DropdownPlacement;
  declare open: boolean;

  static styles = [
    focusRing,
    pressState,
    disabledState,
    baseTypography,
    buttonBase,
    menuItemStyles,
    css`
      :host {
        position: relative;
      }
      .button-content {
        display: flex;
        align-items: center;
        gap: var(--metro-spacing-sm, 8px);
      }
      .chevron {
        width: 12px;
        height: 12px;
        margin-inline-start: var(--metro-spacing-sm, 8px);
        transition: transform var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      :host([open]) .chevron {
        transform: rotate(180deg);
      }
      .dropdown {
        position: absolute;
        left: 0;
        background: var(--metro-background, #1f1f1f);
        min-width: 100%;
        border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
        z-index: 1000;
        animation: menuEnter var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        display: none;
      }
      :host([open]) .dropdown {
        display: block;
      }
      :host([placement="top"]) .dropdown {
        bottom: 100%;
        margin-bottom: 4px;
      }
      :host([placement="bottom"]) .dropdown {
        top: 100%;
        margin-top: 4px;
      }
      ::slotted(.menu-item) {
        white-space: nowrap;
      }
      @keyframes menuEnter {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `,
  ];

  #boundDocumentClick: (e: Event) => void;

  constructor() {
    super();
    this.label = "";
    this.disabled = false;
    this.placement = "bottom";
    this.open = false;
    this.#boundDocumentClick = this.#handleDocumentClick.bind(this);
  }

  render() {
    return html`
      <div class="button-content" role="button" tabindex=${this.disabled ? -1 : 0} ?aria-disabled=${this.disabled} aria-haspopup="menu" aria-expanded=${this.open} @click=${this.#handleButtonClick} @keydown=${this.#handleKeydown} @mousedown=${this.#handlePointerDown} @touchstart=${this.#handlePointerDown}>
        ${this.icon ? html`<span class="icon">${this.icon}</span>` : ""}
        <span class="label">${this.label}</span>
        <svg class="chevron" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="dropdown" role="menu">
        <slot @click=${this.#handleItemClick}></slot>
      </div>
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("click", this.#boundDocumentClick, true);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("click", this.#boundDocumentClick, true);
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("disabled")) {
      updateAriaDisabled(this, this.disabled);
      if (this.disabled && this.open) {
        this.open = false;
      }
    }
    if (changedProperties.has("open")) {
      this.setAttribute("aria-expanded", String(this.open));
    }
  }

  /**
   * Handles button click to toggle the dropdown menu.
   * Prevents interaction when disabled.
   * @param e - The click event
   * @returns void
   */
  #handleButtonClick(e: Event): void {
    if (this.disabled) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    this.#toggleDropdown(e);
  }

  /**
   * Handles keyboard activation (Enter/Space) to toggle the dropdown.
   * @param e - The keyboard event
   * @returns void
   */
  #handleKeydown(e: KeyboardEvent): void {
    handleKeyboardActivation(e, this.disabled, () => this.click());
  }

  /**
   * Applies pressed state styling when the button is pressed.
   * @param e - The pointer event
   * @returns void
   */
  #handlePointerDown(e: Event): void {
    const target = e.currentTarget as HTMLElement;
    addPressedState(target, this.disabled);
  }

  /**
   * Toggles the dropdown menu open/closed state and dispatches appropriate events.
   * @param e - The event that triggered the toggle
   * @returns void
   */
  #toggleDropdown(e: Event): void {
    e.stopPropagation();
    this.open = !this.open;
    if (this.open) {
      this.dispatchEvent(new CustomEvent("show", { bubbles: true, composed: true }));
    } else {
      this.dispatchEvent(new CustomEvent("hide", { bubbles: true, composed: true }));
    }
  }

  /**
   * Handles document click events to close the dropdown when clicking outside.
   * @param e - The document click event
   * @returns void
   */
  #handleDocumentClick(e: Event): void {
    if (!this.open) return;
    const path = e.composedPath();
    if (path.includes(this)) return;
    this.open = false;
    this.dispatchEvent(new CustomEvent("hide", { bubbles: true, composed: true }));
  }

  /**
   * Handles item click events in the dropdown menu to close it after selection.
   * @param e - The item click event
   * @returns void
   */
  #handleItemClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains("menu-item") || target.closest(".menu-item")) {
      this.open = false;
      this.dispatchEvent(new CustomEvent("hide", { bubbles: true, composed: true }));
    }
  }

  /**
   * Programmatically triggers a click on the dropdown button, toggling the menu.
   * Does nothing if the button is disabled.
   * @returns void
   */
  click(): void {
    if (this.disabled) return;
    this.#toggleDropdown(new Event("click"));
  }

  /**
   * Programmatically opens the dropdown menu and dispatches the "show" event.
   * Does nothing if the button is disabled or already open.
   * @returns void
   */
  show(): void {
    if (this.disabled) return;
    this.open = true;
    this.dispatchEvent(new CustomEvent("show", { bubbles: true, composed: true }));
  }

  /**
   * Programmatically closes the dropdown menu and dispatches the "hide" event.
   * @returns void
   */
  hide(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent("hide", { bubbles: true, composed: true }));
  }
}

customElements.define("metro-dropdown-button", MetroDropdownButton);

declare global {
  interface HTMLElementTagNameMap {
    "metro-dropdown-button": MetroDropdownButton;
  }
}
