import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 1000;
  }
  :host([open]) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
  }
  .dialog {
    position: relative;
    background: var(--metro-background, #1f1f1f);
    border: 1px solid var(--metro-border, rgba(255,255,255,0.2));
    min-width: 280px;
    max-width: 400px;
    animation: dialogEnter var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
  }
  @keyframes dialogEnter {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(20px);
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
    border-bottom: 1px solid var(--metro-border, rgba(255,255,255,0.1));
  }
  .dialog-content {
    padding: var(--metro-spacing-lg, 16px);
    color: var(--metro-foreground-secondary, rgba(255,255,255,0.7));
    font-size: var(--metro-font-size-normal, 14px);
  }
  .dialog-buttons {
    display: flex;
    justify-content: flex-end;
    gap: var(--metro-spacing-sm, 8px);
    padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
    border-top: 1px solid var(--metro-border, rgba(255,255,255,0.1));
  }
`;

export class MetroMessageDialog extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    title: { type: String, reflect: true },
  };

  declare open: boolean;
  declare title: string;

  static styles = baseStyles;

  constructor() {
    super();
    this.open = false;
    this.title = "";
  }

  render() {
    return html`
      <div class="backdrop" @click=${this.#close}></div>
      <div class="dialog" role="dialog" aria-modal="true">
        ${this.title ? html`<div class="dialog-header">${this.title}</div>` : ""}
        <div class="dialog-content">
          <slot></slot>
        </div>
        <div class="dialog-buttons">
          <slot name="buttons"></slot>
        </div>
      </div>
    `;
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

customElements.define("metro-message-dialog", MetroMessageDialog);

declare global {
  interface HTMLElementTagNameMap {
    "metro-message-dialog": MetroMessageDialog;
  }
}
