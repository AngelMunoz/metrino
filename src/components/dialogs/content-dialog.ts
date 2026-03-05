import { LitElement, html, css } from "lit";
import { baseTypography, modalBackdrop, dialogAnimation, closeButton } from "../../styles/shared.ts";
import "../primitives/icon.ts";

export class MetroContentDialog extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    closing: { type: Boolean, reflect: true },
    title: { type: String, reflect: true },
    closable: { type: Boolean, reflect: true },
  };

  declare open: boolean;
  declare closing: boolean;
  declare title: string;
  declare closable: boolean;

  static styles = [
    baseTypography,
    modalBackdrop,
    dialogAnimation,
    closeButton,
    css`
      :host {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        visibility: hidden;
        opacity: 0;
        transition: visibility 0ms linear 280ms, opacity 280ms var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      :host([open]) {
        visibility: visible;
        opacity: 1;
        transition-delay: 0ms;
      }
      :host([closing]) {
        visibility: visible;
        opacity: 0;
      }
      .dialog {
        position: relative;
        background: var(--metro-background, #1f1f1f);
        min-width: 320px;
        max-width: 500px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        animation: dialogEnter 280ms var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      :host([closing]) .dialog {
        animation: dialogExit 280ms var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
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
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
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
        font-size: 20px;
      }
    `,
  ];

  constructor() {
    super();
    this.open = false;
    this.closing = false;
    this.title = "";
    this.closable = true;
  }

  render() {
    return html`
      <div class="backdrop" @click=${this.#handleBackdropClick}></div>
      <div class="dialog" role="dialog" aria-modal="true" @animationend=${this.#handleAnimationEnd}>
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

  #handleAnimationEnd(e: AnimationEvent): void {
    if (e.animationName === "dialogExit" && this.closing) {
      this.closing = false;
      this.open = false;
    }
  }

  #handleBackdropClick(e: Event): void {
    if (this.closable) {
      this.#close();
    }
    e.stopPropagation();
  }

  #close(): void {
    if (!this.open || this.closing) return;
    this.closing = true;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true }));
  }

  show(): void {
    this.closing = false;
    this.open = true;
    this.dispatchEvent(new CustomEvent("show", { bubbles: true }));
  }

  hide(): void {
    this.#close();
  }
}

customElements.define("metro-content-dialog", MetroContentDialog);

declare global {
  interface HTMLElementTagNameMap {
    "metro-content-dialog": MetroContentDialog;
  }
}
