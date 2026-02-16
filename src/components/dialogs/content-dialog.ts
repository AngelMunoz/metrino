import { LitElement, html, css } from "lit";
import "../primitives/icon.ts";

const baseStyles = css`
  :host {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 1000;
    align-items: center;
    justify-content: center;
  }
  :host([open]) {
    display: flex;
  }
  .backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
  }
  .dialog {
    position: relative;
    background: var(--metro-background, #1f1f1f);
    border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
    min-width: 320px;
    max-width: 500px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    animation: dialogEnter var(--metro-transition-slow, 333ms)
      var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
  }
  @keyframes dialogEnter {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  .dialog-header {
    padding: var(--metro-spacing-lg, 16px);
    font-size: var(--metro-font-size-large, 20px);
    font-weight: 300;
    color: var(--metro-foreground, #ffffff);
    border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.1));
  }
  .dialog-content {
    flex: 1;
    padding: var(--metro-spacing-lg, 16px);
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
    font-size: var(--metro-font-size-normal, 14px);
    overflow-y: auto;
  }
  .dialog-buttons {
    display: flex;
    justify-content: flex-end;
    gap: var(--metro-spacing-sm, 8px);
    padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
    border-top: 1px solid var(--metro-border, rgba(255, 255, 255, 0.1));
  }
  .close-btn {
    position: absolute;
    top: var(--metro-spacing-md, 12px);
    right: var(--metro-spacing-md, 12px);
    background: none;
    border: none;
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
    font-size: 20px;
    cursor: pointer;
    padding: 4px;
    line-height: 1;
  }
  .close-btn:hover {
    color: var(--metro-foreground, #ffffff);
  }
`;

export class MetroContentDialog extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    title: { type: String, reflect: true },
    closable: { type: Boolean, reflect: true },
  };

  declare open: boolean;
  declare title: string;
  declare closable: boolean;

  static styles = baseStyles;

  constructor() {
    super();
    this.open = false;
    this.title = "";
    this.closable = true;
  }

  render() {
    return html`
      <div class="backdrop" @click=${this.#handleBackdropClick}></div>
      <div class="dialog" role="dialog" aria-modal="true">
        ${this.closable
          ? html`<button class="close-btn" @click=${this.#close}>
              <metro-icon icon="close" size="medium"></metro-icon>
            </button>`
          : ""}
        ${this.title
          ? html`<div class="dialog-header">${this.title}</div>`
          : ""}
        <div class="dialog-content">
          <slot></slot>
        </div>
        <div class="dialog-buttons">
          <slot name="buttons"></slot>
        </div>
      </div>
    `;
  }

  #handleBackdropClick(e: Event): void {
    if (this.closable) {
      this.#close();
    }
    e.stopPropagation();
  }

  #close(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true }));
  }

  show(): void {
    this.open = true;
    this.dispatchEvent(new CustomEvent("show", { bubbles: true }));
  }
}

customElements.define("metro-content-dialog", MetroContentDialog);

declare global {
  interface HTMLElementTagNameMap {
    "metro-content-dialog": MetroContentDialog;
  }
}
