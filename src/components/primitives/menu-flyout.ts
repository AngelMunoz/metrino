import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: none;
    position: fixed;
    z-index: 1000;
  }
  :host([open]) {
    display: block;
  }
  .menu-flyout {
    background: var(--metro-background, #1f1f1f);
    min-width: 160px;
    animation: menuEnter var(--metro-transition-fast, 167ms) ease-out;
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
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
    font-size: var(--metro-font-size-normal, 14px);
    transition: background-color var(--metro-transition-fast, 167ms) ease-out;
  }
  ::slotted(.menu-item:hover) {
    background: var(--metro-highlight, rgba(255,255,255,0.1));
  }
  ::slotted(.menu-item:active) {
    background: var(--metro-accent, #0078d4);
  }
  ::slotted(.menu-divider) {
    height: 1px;
    background: var(--metro-border, rgba(255,255,255,0.2));
    margin: var(--metro-spacing-xs, 4px) 0;
  }
  .backdrop {
    position: fixed;
    inset: 0;
  }
`;

export class MetroMenuFlyout extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
  };

  declare open: boolean;

  static styles = baseStyles;

  #target: Element | null = null;

  constructor() {
    super();
    this.open = false;
  }

  render() {
    return html`
      ${this.open ? html`<div class="backdrop" @click=${this.#close}></div>` : ""}
      <div class="menu-flyout">
        <slot></slot>
      </div>
    `;
  }

  show(target: Element, x?: number, y?: number): void {
    this.#target = target;
    this.open = true;
    this.updateComplete.then(() => this.#positionMenu(x, y));
    this.dispatchEvent(new CustomEvent("show", { bubbles: true }));
  }

  #positionMenu(x?: number, y?: number): void {
    const menu = this.shadowRoot?.querySelector(".menu-flyout") as HTMLElement;
    if (!menu) return;

    if (x !== undefined && y !== undefined) {
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
    } else if (this.#target) {
      const rect = this.#target.getBoundingClientRect();
      menu.style.left = `${rect.left}px`;
      menu.style.top = `${rect.bottom}px`;
    }
  }

  #close(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true }));
  }
}

customElements.define("metro-menu-flyout", MetroMenuFlyout);

declare global {
  interface HTMLElementTagNameMap {
    "metro-menu-flyout": MetroMenuFlyout;
  }
}
