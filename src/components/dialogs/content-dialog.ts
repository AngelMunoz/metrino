import { LitElement, html, css } from "lit";
import { baseTypography, modalBackdrop, closeButton } from "../../styles/shared.ts";
import "../primitives/icon.ts";

/**
 * Metro Content Dialog Component
 *
 * A customizable modal dialog for displaying content with optional title,
 * content area, and button slot. Uses the View Transitions API for smooth
 * coordinated enter/exit animations of the dialog and backdrop. Suitable
 * for forms, confirmations, or any custom content.
 *
 * Features:
 * - Optional title header with border separator
 * - Scrollable content area for long content
 * - Dedicated button slot for action buttons
 * - Optional close button (can be disabled for required dialogs)
 * - View Transition-powered enter/exit animations
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
 * @cssprop --metro-spacing-sm - Small spacing unit (default: 8px)
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
  declare title: string;
  declare closable: boolean;

  static styles = [
    baseTypography,
    modalBackdrop,
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
      /* Prevent the host from being captured during a dialog transition */
      :host(:active-view-transition) {
        view-transition-name: none;
      }
      .dialog {
        position: relative;
        background: var(--metro-background, #1f1f1f);
        min-width: 320px;
        max-width: 500px;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
        view-transition-name: dialog-content;
      }
      .backdrop {
        view-transition-name: dialog-backdrop;
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

  #previousFocus: HTMLElement | null = null;

  constructor() {
    super();
    this.open = false;
    this.title = "";
    this.closable = true;
  }

  render() {
    return html`
      <div class="backdrop" @click=${this.#handleBackdropClick}></div>
      <div class="dialog" role="dialog" aria-modal="true" aria-labelledby="${this.title ? "dialog-title" : ""}" @keydown=${this.#handleKeydown}>
        ${this.closable
          ? html`<button class="close-btn" @click=${this.#close} aria-label="Close">
              <metro-icon icon="close" size="medium"></metro-icon>
            </button>`
          : ""}
        ${this.title
          ? html`<div class="dialog-header" id="dialog-title">${this.title}</div>`
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

  #handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape" && this.closable) {
      e.preventDefault();
      this.#close();
    }
    if (e.key === "Tab") {
      this.#trapFocus(e);
    }
  }

  #trapFocus(e: KeyboardEvent): void {
    const dialog = this.shadowRoot?.querySelector(".dialog");
    if (!dialog) return;

    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  #saveFocus(): void {
    this.#previousFocus = document.activeElement as HTMLElement;
    requestAnimationFrame(() => {
      const dialog = this.shadowRoot?.querySelector(".dialog");
      if (dialog) {
        const firstFocusable = dialog.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    });
  }

  #restoreFocus(): void {
    if (this.#previousFocus) {
      this.#previousFocus.focus();
      this.#previousFocus = null;
    }
  }

  #handleBackdropClick(e: Event): void {
    if (this.closable) {
      this.#close();
    }
    e.stopPropagation();
  }

  #close(): void {
    if (!this.open) return;
    void this.hide();
  }

  /**
   * Applies a property change via View Transitions with headless fallback.
   * Uses the applied-flag pattern to ensure DOM updates even when
   * startViewTransition skips the callback (headless browsers).
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
          types: ["content-dialog"],
        });
        try {
          await transition.updateCallbackDone;
        } catch {
          // updateCallbackDone rejected — transition was skipped
        }
        // Await finished to fully clean up the transition so it
        // doesn't block subsequent startViewTransition calls.
        try {
          await transition.finished;
        } catch {
          // finished rejected — transition was skipped
        }
      } catch {
        // startViewTransition threw synchronously — fall through to fallback
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
   * Uses View Transitions for a coordinated backdrop + dialog animation.
   * @returns Promise that resolves when the dialog is fully open.
   */
  async show(): Promise<void> {
    if (this.open) return;
    this.#saveFocus();
    this.dispatchEvent(new CustomEvent("show", { bubbles: true }));
    await this.#applyChange(() => { this.open = true; });
  }

  /**
   * Closes the dialog with exit animation and dispatches close event.
   * Uses View Transitions for a coordinated backdrop + dialog animation.
   * @returns Promise that resolves when the dialog is fully closed.
   */
  async hide(): Promise<void> {
    if (!this.open) return;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true }));
    await this.#applyChange(() => { this.open = false; });
    this.#restoreFocus();
  }
}

customElements.define("metro-content-dialog", MetroContentDialog);

declare global {
  interface HTMLElementTagNameMap {
    "metro-content-dialog": MetroContentDialog;
  }
}
