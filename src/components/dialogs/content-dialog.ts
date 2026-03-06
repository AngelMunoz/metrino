import { LitElement, html, css } from "lit";
import { baseTypography, modalBackdrop, dialogAnimation, closeButton } from "../../styles/shared.ts";
import "../primitives/icon.ts";

/**
 * Metro Content Dialog Component
 *
 * A customizable modal dialog for displaying content with optional title,
 * content area, and button slot. Features smooth enter/exit animations and
 * backdrop dimming. Suitable for forms, confirmations, or any custom content.
 *
 * Features:
 * - Optional title header with border separator
 * - Scrollable content area for long content
 * - Dedicated button slot for action buttons
 * - Optional close button (can be disabled for required dialogs)
 * - Smooth enter/exit animations
 * - Backdrop click to close (when closable)
 * - ARIA dialog role with modal support
 * - Programmatic show/hide API
 *
 * Use for custom modal content that requires user interaction or attention.
 * For simple message dialogs, consider MetroMessageDialog instead.
 *
 * @fires show - Fired when the dialog opens (bubbles: true)
 * @fires close - Fired when the dialog closes (bubbles: true)
 *
 * @cssprop --metro-background - Dialog background color (default: #1f1f1f)
 * @cssprop --metro-foreground - Title text color (default: #ffffff)
 * @cssprop --metro-foreground-secondary - Content text color (default: rgba(255, 255, 255, 0.6))
 * @cssprop --metro-border - Border color for separators (default: rgba(255, 255, 255, 0.1))
 * @cssprop --metro-spacing-lg - Large spacing unit (default: 16px)
 * @cssprop --metro-spacing-md - Medium spacing unit (default: 12px)
 * @cssprop --metro-font-size-large - Title font size (default: 20px)
 * @cssprop --metro-font-size-normal - Content font size (default: 14px)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 *
 * @slot - Default slot for dialog content
 * @slot buttons - Slot for action buttons displayed in the footer
 *
 * @csspart dialog - The main dialog container element
 * @csspart dialog-header - The title header section
 * @csspart dialog-content - The scrollable content area
 * @csspart dialog-buttons - The button footer section
 * @csspart close-btn - The close button element
 * @csspart backdrop - The backdrop overlay element
 */
export class MetroContentDialog extends LitElement {
  static properties = {
    /**
     * Controls the visibility of the dialog. When true, the dialog is displayed
     * with enter animation. Use show() and hide() methods for proper event dispatching.
     * @default false
     */
    open: { type: Boolean, reflect: true },
    /**
     * Set internally during exit animation. When true, the dialog is visible
     * but fading out. Do not set directly.
     * @default false
     */
    closing: { type: Boolean, reflect: true },
    /**
     * Title text displayed in the dialog header. If not provided, no header
     * is rendered.
     * @default ""
     */
    title: { type: String, reflect: true },
    /**
     * When true, displays a close button in the top-right corner and allows
     * closing via backdrop click. When false, the dialog can only be closed
     * programmatically.
     * @default true
     */
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

  /**
   * Handles animation end events to fully close the dialog after exit animation completes.
   * @param e - The animation event
   * @returns void
   */
  #handleAnimationEnd(e: AnimationEvent): void {
    if (e.animationName === "dialogExit" && this.closing) {
      this.closing = false;
      this.open = false;
    }
  }

  /**
   * Handles backdrop click to close the dialog when closable is true.
   * @param e - The click event
   * @returns void
   */
  #handleBackdropClick(e: Event): void {
    if (this.closable) {
      this.#close();
    }
    e.stopPropagation();
  }

  /**
   * Initiates the close sequence with exit animation and dispatches close event.
   * @returns void
   */
  #close(): void {
    if (!this.open || this.closing) return;
    this.closing = true;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true }));
  }

  /**
   * Opens the dialog with enter animation and dispatches show event.
   * @returns void
   */
  show(): void {
    this.closing = false;
    this.open = true;
    this.dispatchEvent(new CustomEvent("show", { bubbles: true }));
  }

  /**
   * Closes the dialog with exit animation and dispatches close event.
   * @returns void
   */
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
