import { LitElement, html, css } from "lit";
import { baseTypography, dropdownAnimation } from "../../styles/shared.ts";

export class MetroContextMenu extends LitElement {
  static properties = {
    target: { type: String },
    open: { type: Boolean, reflect: true },
    delay: { type: Number },
  };

  declare target: string;
  declare open: boolean;
  declare delay: number;

  static styles = [
    baseTypography,
    dropdownAnimation,
    css`
      :host {
        display: none;
        position: fixed;
        z-index: 1000;
      }
      :host([open]) {
        display: block;
      }
      .backdrop {
        position: fixed;
        inset: 0;
        background: transparent;
      }
      .context-menu {
        background: var(--metro-background, #1f1f1f);
        min-width: 160px;
        max-width: 280px;
        border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
        animation: dropdownEnter var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      ::slotted([slot="item"]) {
        display: flex;
        align-items: center;
        gap: var(--metro-spacing-sm, 8px);
        padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
        cursor: pointer;
        color: var(--metro-foreground, #ffffff);
        font-size: var(--metro-font-size-normal, 14px);
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        user-select: none;
      }
      ::slotted([slot="item"]:hover) {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      ::slotted([slot="item"]:active) {
        background: var(--metro-accent, #0078d4);
      }
      ::slotted(.menu-divider) {
        height: 1px;
        background: var(--metro-border, rgba(255, 255, 255, 0.2));
        margin: var(--metro-spacing-xs, 4px) 0;
      }
    `,
  ];

  #targetElement: Element | null = null;
  #longPressTimer: number | null = null;
  #boundPointerDown: (e: PointerEvent) => void;
  #boundPointerUp: () => void;
  #boundPointerLeave: () => void;
  #boundBackdropClick: () => void;
  #boundHandleKeyDown: (e: KeyboardEvent) => void;

  constructor() {
    super();
    this.target = "";
    this.open = false;
    this.delay = 500;
    this.#boundPointerDown = this.#handlePointerDown.bind(this);
    this.#boundPointerUp = this.#handlePointerUp.bind(this);
    this.#boundPointerLeave = this.#handlePointerLeave.bind(this);
    this.#boundBackdropClick = this.#handleBackdropClick.bind(this);
    this.#boundHandleKeyDown = this.#handleKeyDown.bind(this);
  }

  render() {
    return html`
      ${this.open ? html`<div class="backdrop" @click=${this.#boundBackdropClick}></div>` : ""}
      <div class="context-menu" role="menu" aria-label="Context menu" tabindex="-1" @keydown=${this.#boundHandleKeyDown}>
        <slot name="item" @click=${this.#handleItemClick}></slot>
      </div>
    `;
  }

  #handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this.#close();
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.target) {
      this.#attachToTarget();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#detachFromTarget();
    this.#clearTimer();
  }

  #attachToTarget(): void {
    this.#targetElement = document.querySelector(this.target);
    if (!this.#targetElement) return;

    this.#targetElement.addEventListener("pointerdown", this.#boundPointerDown as EventListener);
    this.#targetElement.addEventListener("pointerup", this.#boundPointerUp as EventListener);
    this.#targetElement.addEventListener("pointerleave", this.#boundPointerLeave as EventListener);
  }

  #detachFromTarget(): void {
    if (!this.#targetElement) return;

    this.#targetElement.removeEventListener("pointerdown", this.#boundPointerDown as EventListener);
    this.#targetElement.removeEventListener("pointerup", this.#boundPointerUp as EventListener);
    this.#targetElement.removeEventListener("pointerleave", this.#boundPointerLeave as EventListener);
    this.#targetElement = null;
  }

  #handlePointerDown(e: PointerEvent): void {
    if (e.button !== 0) return;
    this.#clearTimer();
    this.#longPressTimer = window.setTimeout(() => {
      this.#showMenu(e);
    }, this.delay);
  }

  #handlePointerUp(): void {
    this.#clearTimer();
  }

  #handlePointerLeave(): void {
    this.#clearTimer();
  }

  #clearTimer(): void {
    if (this.#longPressTimer !== null) {
      clearTimeout(this.#longPressTimer);
      this.#longPressTimer = null;
    }
  }

  #showMenu(e: PointerEvent): void {
    if (!this.#targetElement) return;
    this.open = true;
    this.updateComplete.then(() => this.#positionMenu(e.clientX, e.clientY));
    this.dispatchEvent(new CustomEvent("show", { bubbles: true, composed: true }));
  }

  #positionMenu(x: number, y: number): void {
    const menu = this.shadowRoot?.querySelector(".context-menu") as HTMLElement;
    if (!menu) return;

    const menuRect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let left = x;
    let top = y;

    if (x + menuRect.width > viewportWidth) {
      left = viewportWidth - menuRect.width - 8;
    }
    if (y + menuRect.height > viewportHeight) {
      top = viewportHeight - menuRect.height - 8;
    }

    left = Math.max(8, left);
    top = Math.max(8, top);

    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  }

  #handleBackdropClick(): void {
    this.#close();
  }

  #handleItemClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (target.slot === "item" || target.closest('[slot="item"]')) {
      const item = target.slot === "item" ? target : target.closest('[slot="item"]');
      this.dispatchEvent(
        new CustomEvent("itemclick", {
          detail: { item },
          bubbles: true,
          composed: true,
        }),
      );
      this.#close();
    }
  }

  #close(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent("hide", { bubbles: true, composed: true }));
  }

  show(x: number, y: number): void {
    this.open = true;
    this.updateComplete.then(() => this.#positionMenu(x, y));
    this.dispatchEvent(new CustomEvent("show", { bubbles: true, composed: true }));
  }

  hide(): void {
    this.#close();
  }
}

customElements.define("metro-context-menu", MetroContextMenu);

declare global {
  interface HTMLElementTagNameMap {
    "metro-context-menu": MetroContextMenu;
  }
}
