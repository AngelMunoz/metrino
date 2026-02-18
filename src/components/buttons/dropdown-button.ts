import { LitElement, html, css, type PropertyValues } from "lit";
import { focusRing, pressState, disabledState, baseTypography, buttonBase, menuItemStyles } from "../../styles/shared.ts";
import {
  updateAriaDisabled,
  setupButtonRole,
  createButtonHandlers,
  bindButtonEvents,
  unbindButtonEvents,
  type ButtonEventHandlers,
} from "./shared.ts";

type DropdownPlacement = "top" | "bottom";

export class MetroDropdownButton extends LitElement {
  static properties = {
    label: { type: String },
    icon: { type: String },
    disabled: { type: Boolean, reflect: true },
    placement: { type: String, reflect: true },
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

  #handlers: ButtonEventHandlers;
  #boundDocumentClick: (e: Event) => void;

  constructor() {
    super();
    this.label = "";
    this.disabled = false;
    this.placement = "bottom";
    this.open = false;
    this.#handlers = createButtonHandlers(this);
    this.#boundDocumentClick = this.#handleDocumentClick.bind(this);
  }

  render() {
    return html`
      <div class="button-content" @click=${this.#toggleDropdown}>
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
    setupButtonRole(this, this.disabled);
    this.setAttribute("aria-haspopup", "menu");
    this.setAttribute("aria-expanded", String(this.open));
    bindButtonEvents(this, this.#handlers);
    document.addEventListener("click", this.#boundDocumentClick, true);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    unbindButtonEvents(this, this.#handlers);
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

  #toggleDropdown(e: Event): void {
    if (this.disabled) return;
    e.stopPropagation();
    this.open = !this.open;
    if (this.open) {
      this.dispatchEvent(new CustomEvent("show", { bubbles: true, composed: true }));
    } else {
      this.dispatchEvent(new CustomEvent("hide", { bubbles: true, composed: true }));
    }
  }

  #handleDocumentClick(e: Event): void {
    if (!this.open) return;
    // Don't close if clicking inside the dropdown or button
    const path = e.composedPath();
    if (path.includes(this)) return;
    this.open = false;
    this.dispatchEvent(new CustomEvent("hide", { bubbles: true, composed: true }));
  }

  #handleItemClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains("menu-item") || target.closest(".menu-item")) {
      this.open = false;
      this.dispatchEvent(new CustomEvent("hide", { bubbles: true, composed: true }));
    }
  }

  click(): void {
    if (this.disabled) return;
    this.#toggleDropdown(new Event("click"));
  }

  show(): void {
    if (this.disabled) return;
    this.open = true;
    this.dispatchEvent(new CustomEvent("show", { bubbles: true, composed: true }));
  }

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
