import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

/**
 * Displays a menu of commands anchored to a trigger element, following the
 * Metro popup menu pattern: flyouts open imperatively (show/hide), are
 * anchored to a trigger, and dismiss on outside interaction.
 *
 * @element metro-menu-flyout
 * @slot - Menu rows (.menu-item) and separators (.menu-divider)
 * @fires show - Fired when the flyout opens
 * @fires close - Fired when the flyout closes
 */
export class MetroMenuFlyout extends LitElement {
  #open = false;
  #target: Element | null = null;
  #boundDocumentKeyDown: (e: KeyboardEvent) => void;

  /** Whether the flyout is currently shown. State is read-only; use show()/hide(). */
  get open(): boolean {
    return this.#open;
  }

  static styles = [
    baseTypography,
    css`
      :host {
        display: block;
        position: fixed;
        z-index: 1000;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        background: transparent;
      }
      /* Positioned so it paints above the backdrop; left/top anchor it to the host box */
      .menu-flyout {
        position: absolute;
        background: var(--metro-background, #1f1f1f);
        min-width: 160px;
        animation: menuEnter var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
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
      ::slotted(.menu-item) {
        display: flex;
        align-items: center;
        gap: var(--metro-spacing-sm, 8px);
        padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
        cursor: pointer;
        color: var(--metro-foreground, #ffffff);
        font-size: var(--metro-font-size-normal, 14px);
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      ::slotted(.menu-item:hover) {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      ::slotted(.menu-item:active) {
        background: var(--metro-accent, #0078d4);
      }
      ::slotted(.menu-divider) {
        height: 1px;
        background: var(--metro-border, rgba(255, 255, 255, 0.2));
        margin: var(--metro-spacing-xs, 4px) 0;
      }
    `,
  ];

  constructor() {
    super();
    this.#boundDocumentKeyDown = this.#handleDocumentKeyDown.bind(this);
  }

  render() {
    if (!this.#open) {
      return html``;
    }
    return html`
      <div class="backdrop" @click=${this.#close}></div>
      <div
        class="menu-flyout"
        role="menu"
        aria-label=${this.getAttribute("aria-label") ?? "Menu"}
        tabindex="-1"
      >
        <slot></slot>
      </div>
    `;
  }

  /**
   * Shows the flyout, anchored below the target element (or at the given
   * viewport coordinates when x and y are provided).
   */
  show(target: Element, x?: number, y?: number): void {
    this.#target = target;
    this.#open = true;
    document.addEventListener("keydown", this.#boundDocumentKeyDown);
    this.requestUpdate();
    this.updateComplete.then(() => {
      this.#positionMenu(x, y);
      this.#focusMenu();
    });
    this.dispatchEvent(new CustomEvent("show", { bubbles: true, composed: true }));
  }

  /** Hides the flyout. Does nothing when the flyout is already hidden. */
  hide(): void {
    if (!this.#open) return;
    this.#open = false;
    document.removeEventListener("keydown", this.#boundDocumentKeyDown);
    this.#restoreFocus();
    this.#target = null;
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.#boundDocumentKeyDown);
    this.#open = false;
    this.#target = null;
  }

  #positionMenu(x?: number, y?: number): void {
    const menu = this.shadowRoot?.querySelector(".menu-flyout") as HTMLElement;
    if (!menu) return;

    // The menu is absolute inside the host, while target rects and x/y are
    // viewport coordinates; convert them to host-relative offsets.
    const hostRect = this.getBoundingClientRect();
    if (x !== undefined && y !== undefined) {
      menu.style.left = `${x - hostRect.left}px`;
      menu.style.top = `${y - hostRect.top}px`;
    } else if (this.#target) {
      const rect = this.#target.getBoundingClientRect();
      menu.style.left = `${rect.left - hostRect.left}px`;
      menu.style.top = `${rect.bottom - hostRect.top}px`;
    }
  }

  #focusMenu(): void {
    const menu = this.shadowRoot?.querySelector(".menu-flyout") as HTMLElement | null;
    menu?.focus();
  }

  #restoreFocus(): void {
    if (this.#target instanceof HTMLElement) {
      this.#target.focus({ preventScroll: true });
    }
  }

  #handleDocumentKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this.hide();
    }
  }

  #close(): void {
    this.hide();
  }
}

export function registerMetroMenuFlyout(): void {
  if (!customElements.get("metro-menu-flyout")) {
    customElements.define("metro-menu-flyout", MetroMenuFlyout);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-menu-flyout": MetroMenuFlyout;
  }
}
