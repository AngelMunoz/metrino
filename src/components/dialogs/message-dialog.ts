import { LitElement, html, css } from "lit";
import { baseTypography, modalBackdrop } from "../../styles/shared.ts";
import { createTransitionScope } from "../../utils/view-transition.ts";
import { prefersReducedMotion } from "../../utils/reduced-motion.ts";
import { focusFirstInside, rememberedFocus, trapTabKey } from "../../utils/dialog-focus.ts";

/**
 * The ::view-transition rules of one message dialog instance, keyed to its
 * scoped part names. Injected only while the dialog is active, so a second
 * instance on the same page cannot share a view-transition-name.
 */
function msgDialogTransitionRules(names: Record<string, string>): string {
  return `
html:active-view-transition-type(message-dialog)::view-transition-new(${names.content}) {
  animation: metro-msg-dialog-enter 280ms var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
}
html:active-view-transition-type(message-dialog)::view-transition-old(${names.content}) {
  animation: metro-msg-dialog-exit 280ms var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)) both;
}
html:active-view-transition-type(message-dialog)::view-transition-new(${names.backdrop}) {
  animation: metro-fade-in 280ms var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
}
html:active-view-transition-type(message-dialog)::view-transition-old(${names.backdrop}) {
  animation: metro-fade-out 280ms var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)) both;
}
`;
}

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
 * - Escape to close, focus moves into the dialog on open and back to the opener
 *   on close, and Tab stays inside the dialog while it is open
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
      .dialog {
        position: relative;
        background: var(--metro-background, #1f1f1f);
        min-width: 280px;
        max-width: 400px;
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

  #transition = createTransitionScope("message-dialog", ["content", "backdrop"]);
  #transitionRules = msgDialogTransitionRules(this.#transition.names);
  #previousFocus: HTMLElement | null = null;
  #closing = false;

  constructor() {
    super();
    this.open = false;
    this.title = "";
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.#handleEscapeKey);
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
   * Handles Escape and Tab while focus is inside the dialog.
   * @param e - The keyboard event
   * @returns void
   */
  #handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      this.#close();
    }
    if (e.key === "Tab") {
      const dialog = this.shadowRoot?.querySelector<HTMLElement>(".dialog");
      if (dialog) trapTabKey(dialog, e);
    }
  }

  /**
   * Escape while the dialog is open, listened for on the document: the key is
   * handled even when focus did not move into the dialog.
   */
  #handleEscapeKey = (e: KeyboardEvent): void => {
    if (e.key === "Escape") this.#close();
  };

  #close(): void {
    void this.hide();
  }

  /**
   * Returns focus to the element that opened the dialog. A custom-element host is
   * not focusable itself, so the first tab stop inside it takes focus.
   * @returns void
   */
  #restoreFocus(): void {
    const target = this.#previousFocus;
    this.#previousFocus = null;
    if (target) focusFirstInside(target);
  }

  #transitionTargets(): Record<string, HTMLElement | null> {
    const root = this.shadowRoot;
    return {
      content: root?.querySelector<HTMLElement>(".dialog") ?? null,
      backdrop: root?.querySelector<HTMLElement>(".backdrop") ?? null,
    };
  }

  /**
   * Applies a property change via View Transitions with headless fallback.
   * Awaits both updateCallbackDone and finished to properly clean up
   * the transition before returning.
   */
  async #applyChange(setter: () => void): Promise<void> {
    if (prefersReducedMotion() || !("startViewTransition" in document)) {
      setter();
      await this.updateComplete;
      return;
    }

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
  }

  /**
   * Opens the dialog with enter animation and dispatches show event.
   * Escape is listened for on the document from the first moment, so a key
   * pressed while the entrance is still running dismisses the dialog. Focus
   * moves in only after `open` is applied: the dialog is hidden until then, so an
   * earlier focus call would land on the opener.
   * @returns Promise that resolves when the dialog is fully open.
   */
  async show(): Promise<void> {
    if (this.open) return;
    this.#previousFocus = rememberedFocus();
    document.addEventListener("keydown", this.#handleEscapeKey);
    this.dispatchEvent(new CustomEvent("show", { bubbles: true }));
    await this.updateComplete;
    this.#transition.attach(this.#transitionTargets(), this.#transitionRules);
    await this.#applyChange(() => { this.open = true; });
    const dialog = this.shadowRoot?.querySelector<HTMLElement>(".dialog");
    if (dialog) focusFirstInside(dialog);
  }

  /**
   * Closes the dialog with exit animation and dispatches close event.
   * @returns Promise that resolves when the dialog is fully closed.
   */
  async hide(): Promise<void> {
    if (!this.open || this.#closing) return;
    this.#closing = true;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true }));
    // Names stay held until the exit transition has captured them.
    await this.#applyChange(() => { this.open = false; });
    this.#transition.detach(this.#transitionTargets());
    document.removeEventListener("keydown", this.#handleEscapeKey);
    this.#restoreFocus();
    this.#closing = false;
  }
}

export function registerMetroMessageDialog(): void {
  if (!customElements.get("metro-message-dialog")) {
    customElements.define("metro-message-dialog", MetroMessageDialog);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-message-dialog": MetroMessageDialog;
  }
}
