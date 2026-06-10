import { LitElement, html, css } from "lit";
import { baseTypography, modalBackdrop } from "../../styles/shared.ts";

/**
 * Metro Message Dialog Component
 *
 * A simplified modal dialog designed for displaying messages with optional
 * title and content. Smaller than ContentDialog, making it ideal for alerts,
 * confirmations, and simple notifications. Always closable via backdrop click.
 *
 * Features:
 * - Compact design optimized for simple messages
 * - Optional title header with border separator
 * - Content area for message text
 * - Dedicated button slot for action buttons (OK, Cancel, etc.)
 * - View Transition animations for enter/exit
 * - Backdrop click to close
 * - ARIA dialog role with modal support
 * - Programmatic show/hide API
 *
 * Use for simple alert messages, confirmations, or any brief notification
 * that requires user acknowledgment. For complex content or forms, use
 * MetroContentDialog instead.
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
 * @cssprop --metro-spacing-sm - Small spacing unit (default: 8px)
 * @cssprop --metro-font-size-large - Title font size (default: 20px)
 * @cssprop --metro-font-size-normal - Content font size (default: 14px)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 *
 * @slot - Default slot for dialog message content
 * @slot buttons - Slot for action buttons displayed in the footer
 *
 * @csspart dialog - The main dialog container element
 * @csspart dialog-header - The title header section
 * @csspart dialog-content - The content area
 * @csspart dialog-buttons - The button footer section
 * @csspart backdrop - The backdrop overlay element
 */
export class MetroMessageDialog extends LitElement {
  static properties = {
    /**
     * Controls the visibility of the dialog. When true, the dialog is displayed
     * with enter animation. Use show() and hide() methods for proper event dispatching.
     * @default false
     */
    open: { type: Boolean, reflect: true },
    /**
     * Title text displayed in the dialog header. If not provided, no header
     * is rendered.
     * @default ""
     */
    title: { type: String, reflect: true },
  };

  declare open: boolean;
  declare title: string;

  static styles = [
    baseTypography,
    modalBackdrop,
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
      :host(:active-view-transition) {
        view-transition-name: none;
      }
      .backdrop {
        view-transition-name: msg-dialog-backdrop;
      }
      .dialog {
        position: relative;
        background: var(--metro-background, #1f1f1f);
        min-width: 280px;
        max-width: 400px;
        view-transition-name: msg-dialog-content;
      }
      .dialog-header {
        padding: var(--metro-spacing-lg, 16px);
        font-size: var(--metro-font-size-large, 20px);
        font-weight: 300;
        color: var(--metro-foreground, #ffffff);
        border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.1));
      }
      .dialog-content {
        padding: var(--metro-spacing-lg, 16px);
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        font-size: var(--metro-font-size-normal, 14px);
      }
      .dialog-buttons {
        display: flex;
        justify-content: flex-end;
        gap: var(--metro-spacing-sm, 8px);
        padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
        border-top: 1px solid var(--metro-border, rgba(255, 255, 255, 0.1));
      }
    `,
  ];

  constructor() {
    super();
    this.open = false;
    this.title = "";
  }

  render() {
    return html`
      <div class="backdrop" @click=${this.#close}></div>
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="${this.title ? "msg-dialog-title" : ""}" @keydown=${this.#handleKeydown}>
        ${this.title ? html`<div class="dialog-header" id="msg-dialog-title">${this.title}</div>` : ""}
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
   * Handles keyboard events for Escape key to close the dialog.
   * @param e - The keyboard event
   * @returns void
   */
  #handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.preventDefault();
      this.#close();
    }
  }

  #close(): void {
    if (!this.open) return;
    void this.hide();
  }

  /**
   * Applies a property change via View Transitions with headless fallback.
   * Awaits both updateCallbackDone and finished to properly clean up
   * the transition before returning.
   */
  async #applyChange(setter: () => void): Promise<void> {
    if ("startViewTransition" in document) {
      let applied = false;
      try {
        const transition = document.startViewTransition({
          update: () => {
            setter();
            applied = true;
            return this.updateComplete;
          },
          types: ["message-dialog"],
        });
        try {
          await transition.updateCallbackDone;
        } catch {
          // updateCallbackDone rejected — transition was skipped
        }
        try {
          await transition.finished;
        } catch {
          // finished rejected — transition was skipped
        }
      } catch {
        // startViewTransition threw synchronously
      }
      if (!applied) {
        setter();
        await this.updateComplete;
      }
    } else {
      setter();
      await this.updateComplete;
    }
  }

  /**
   * Opens the dialog with enter animation and dispatches show event.
   * @returns Promise that resolves when the dialog is fully open.
   */
  async show(): Promise<void> {
    if (this.open) return;
    this.dispatchEvent(new CustomEvent("show", { bubbles: true }));
    await this.#applyChange(() => { this.open = true; });
  }

  /**
   * Closes the dialog with exit animation and dispatches close event.
   * @returns Promise that resolves when the dialog is fully closed.
   */
  async hide(): Promise<void> {
    if (!this.open) return;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true }));
    await this.#applyChange(() => { this.open = false; });
  }
}

customElements.define("metro-message-dialog", MetroMessageDialog);

declare global {
  interface HTMLElementTagNameMap {
    "metro-message-dialog": MetroMessageDialog;
  }
}
