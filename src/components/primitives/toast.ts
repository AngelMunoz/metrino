import { LitElement, html, css } from "lit";
import "./icon.ts";

const baseStyles = css`
  :host {
    position: fixed;
    top: var(--metro-spacing-lg, 16px);
    right: var(--metro-spacing-lg, 16px);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    gap: var(--metro-spacing-sm, 8px);
    pointer-events: none;
  }
  .toast {
    background: var(--metro-background, #1f1f1f);
    border-left: 4px solid var(--metro-accent, #0078d4);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
    min-width: 280px;
    max-width: 400px;
    pointer-events: auto;
    animation: toast-enter var(--metro-transition-normal, 250ms)
      var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
    font-family: var(--metro-font-family, system-ui, -apple-system, sans-serif);
  }
  @keyframes toast-enter {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  @keyframes toast-exit {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100%);
    }
  }
  .toast.exiting {
    animation: toast-exit var(--metro-transition-fast, 167ms) ease-out forwards;
  }
  .toast.success {
    border-left-color: #00a300;
  }
  .toast.warning {
    border-left-color: #f09609;
  }
  .toast.error {
    border-left-color: #e51400;
  }
  .toast-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--metro-spacing-xs, 4px);
  }
  .toast-title {
    font-size: var(--metro-font-size-normal, 14px);
    font-weight: 600;
    color: var(--metro-foreground, #ffffff);
  }
  .toast-close {
    background: none;
    border: none;
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
    font-size: 16px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }
  .toast-close:hover {
    color: var(--metro-foreground, #ffffff);
  }
  .toast-message {
    font-size: var(--metro-font-size-small, 12px);
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
  }
`;

interface ToastOptions {
  title?: string;
  message: string;
  severity?: "informational" | "success" | "warning" | "error";
  duration?: number;
}

export class MetroToast extends LitElement {
  static styles = baseStyles;

  #toasts: Map<string, HTMLElement> = new Map();
  #toastId = 0;

  render() {
    return html`<slot></slot>`;
  }

  show(options: ToastOptions): string {
    const id = `toast-${++this.#toastId}`;
    const toast = document.createElement("div");
    toast.className = `toast ${options.severity || "informational"}`;
    toast.id = id;

    const closeIcon = document.createElement("metro-icon");
    closeIcon.setAttribute("icon", "close");
    closeIcon.setAttribute("size", "normal");

    toast.innerHTML = `
      <div class="toast-header">
        ${options.title ? `<span class="toast-title">${options.title}</span>` : ""}
        <button class="toast-close" aria-label="Close"></button>
      </div>
      <div class="toast-message">${options.message}</div>
    `;

    const closeBtn = toast.querySelector(".toast-close");
    if (closeBtn) {
      closeBtn.appendChild(closeIcon);
      closeBtn.addEventListener("click", () => this.hide(id));
    }

    this.shadowRoot?.appendChild(toast);
    this.#toasts.set(id, toast);

    const duration = options.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => this.hide(id), duration);
    }

    return id;
  }

  hide(id: string): void {
    const toast = this.#toasts.get(id);
    if (!toast) return;

    toast.classList.add("exiting");
    setTimeout(() => {
      toast.remove();
      this.#toasts.delete(id);
    }, 167);
  }

  clearAll(): void {
    this.#toasts.forEach((_, id) => this.hide(id));
  }
}

customElements.define("metro-toast", MetroToast);

// Global toast instance
let globalToast: MetroToast | null = null;

export function showToast(options: ToastOptions): string {
  if (!globalToast) {
    globalToast = document.createElement("metro-toast") as MetroToast;
    document.body.appendChild(globalToast);
  }
  return globalToast.show(options);
}

export function hideToast(id: string): void {
  globalToast?.hide(id);
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-toast": MetroToast;
  }
}
