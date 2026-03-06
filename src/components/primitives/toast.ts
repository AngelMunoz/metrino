import { LitElement, html, css } from "lit";
import { baseTypography, closeButton } from "../../styles/shared.ts";
import "./icon.ts";

/**
 * Options for showing a toast notification.
 */
interface ToastOptions {
  /** Optional title displayed above the message */
  title?: string;
  /** Main message content of the toast */
  message: string;
  /** Visual severity level affecting border/icon color */
  severity?: "informational" | "success" | "warning" | "error";
  /** Duration in milliseconds before auto-dismiss (0 for persistent) */
  duration?: number;
}

/**
 * Icon mapping for each toast severity level.
 */
const severityIcons: Record<string, string> = {
  informational: "info",
  success: "check",
  warning: "warning",
  error: "close",
};

/**
 * Metro Toast Component
 *
 * A notification container that displays toast messages at the top of the screen.
 * Supports multiple severity levels with distinct colors, auto-dismiss, and manual close.
 *
 * Features:
 * - Four severity levels: informational, success, warning, error
 * - Auto-dismiss with configurable duration
 * - Manual close button on each toast
 * - Slide-down enter and slide-up exit animations
 * - Color-coded border and icon for each severity
 * - Stacking multiple toasts vertically
 * - Clear all functionality
 *
 * The component is typically used via the exported showToast() function for
 * simple global toast notifications, or instantiated directly for more control.
 *
 * @fires toastshown - Fired when a toast is displayed
 * @fires toashidden - Fired when a toast is dismissed
 *
 * @cssprop --metro-background - Toast background color (default: #1f1f1f)
 * @cssprop --metro-accent - Default border and icon color (default: #0078d4)
 * @cssprop --metro-foreground - Title text color (default: #ffffff)
 * @cssprop --metro-foreground-secondary - Message text color (default: rgba(255, 255, 255, 0.6))
 * @cssprop --metro-spacing-md - Medium spacing (default: 12px)
 * @cssprop --metro-spacing-lg - Large spacing (default: 16px)
 * @cssprop --metro-spacing-sm - Small spacing (default: 8px)
 * @cssprop --metro-transition-slow - Animation duration (default: 333ms)
 * @cssprop --metro-easing - Easing curve (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 * @cssprop --metro-font-size-normal - Title font size (default: 14px)
 * @cssprop --metro-font-size-small - Message font size (default: 12px)
 *
 * @csspart toast - Individual toast element
 * @csspart toast-icon - The severity icon element
 * @csspart toast-content - Content wrapper for title and message
 * @csspart toast-title - The title element
 * @csspart toast-message - The message element
 * @csspart close-btn - The close button element
 */
export class MetroToast extends LitElement {
  static styles = [
    baseTypography,
    closeButton,
    css`
      :host {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: var(--metro-spacing-md, 12px);
        gap: var(--metro-spacing-sm, 8px);
        pointer-events: none;
      }
      .toast {
        background: var(--metro-background, #1f1f1f);
        border-top: 4px solid var(--metro-accent, #0078d4);
        padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
        min-width: 300px;
        max-width: 400px;
        width: 100%;
        pointer-events: auto;
        animation: metro-slide-down var(--metro-transition-slow, 333ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        display: flex;
        align-items: flex-start;
        gap: var(--metro-spacing-md, 12px);
      }
      @keyframes metro-slide-down {
        from {
          opacity: 0;
          transform: translateY(-100%);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes metro-slide-up {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-100%);
        }
      }
      .toast.exiting {
        animation: metro-slide-up var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
      }
      .toast.success {
        border-top-color: #00a300;
      }
      .toast.warning {
        border-top-color: #f09609;
      }
      .toast.error {
        border-top-color: #e51400;
      }
      .toast-icon {
        flex-shrink: 0;
        color: var(--metro-accent, #0078d4);
      }
      .toast.success .toast-icon {
        color: #00a300;
      }
      .toast.warning .toast-icon {
        color: #f09609;
      }
      .toast.error .toast-icon {
        color: #e51400;
      }
      .toast-content {
        flex: 1;
        min-width: 0;
      }
      .toast-title {
        font-size: var(--metro-font-size-normal, 14px);
        font-weight: 600;
        color: var(--metro-foreground, #ffffff);
        margin-bottom: 2px;
      }
      .toast-message {
        font-size: var(--metro-font-size-small, 12px);
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      }
      .close-btn {
        padding: 0;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ];

  #toasts: Map<string, HTMLElement> = new Map();
  #toastId = 0;

  render() {
    return html`<slot></slot>`;
  }

  /**
   * Shows a new toast notification.
   * @param options - Toast configuration options
   * @returns string - The unique ID of the created toast
   */
  show(options: ToastOptions): string {
    const id = `toast-${++this.#toastId}`;
    const severity = options.severity || "informational";
    
    const toast = document.createElement("div");
    toast.className = `toast ${severity}`;
    toast.id = id;

    const iconEl = document.createElement("metro-icon");
    iconEl.setAttribute("icon", severityIcons[severity]);
    iconEl.setAttribute("size", "medium");
    iconEl.className = "toast-icon";

    const closeIcon = document.createElement("metro-icon");
    closeIcon.setAttribute("icon", "close");
    closeIcon.setAttribute("size", "normal");

    const content = document.createElement("div");
    content.className = "toast-content";
    content.innerHTML = `
      ${options.title ? `<div class="toast-title">${options.title}</div>` : ""}
      <div class="toast-message">${options.message}</div>
    `;

    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.appendChild(closeIcon);
    closeBtn.addEventListener("click", () => this.hide(id));

    toast.appendChild(iconEl);
    toast.appendChild(content);
    toast.appendChild(closeBtn);

    this.shadowRoot?.appendChild(toast);
    this.#toasts.set(id, toast);

    const duration = options.duration ?? 3000;
    if (duration > 0) {
      setTimeout(() => this.hide(id), duration);
    }

    return id;
  }

  /**
   * Hides a specific toast by ID with exit animation.
   * @param id - The toast ID to hide
   * @returns void
   */
  hide(id: string): void {
    const toast = this.#toasts.get(id);
    if (!toast) return;

    toast.classList.add("exiting");
    toast.remove();
    this.#toasts.delete(id);
  }

  /**
   * Hides all currently displayed toasts.
   * @returns void
   */
  clearAll(): void {
    this.#toasts.forEach((_, id) => this.hide(id));
  }
}

customElements.define("metro-toast", MetroToast);

let globalToast: MetroToast | null = null;

/**
 * Shows a toast notification using the global toast instance.
 * Creates the global instance on first call.
 * @param options - Toast configuration options
 * @returns string - The unique ID of the created toast
 */
export function showToast(options: ToastOptions): string {
  if (!globalToast) {
    globalToast = document.createElement("metro-toast") as MetroToast;
    document.body.appendChild(globalToast);
  }
  return globalToast.show(options);
}

/**
 * Hides a specific toast by ID from the global toast instance.
 * @param id - The toast ID to hide
 * @returns void
 */
export function hideToast(id: string): void {
  globalToast?.hide(id);
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-toast": MetroToast;
  }
}
