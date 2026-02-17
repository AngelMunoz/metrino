import { LitElement, html, css } from "lit";
import { tileBase, tileSizes, tileBadge } from "../../styles/shared.ts";

type TileSize = "small" | "medium" | "wide" | "large";

interface LiveTileItem {
  title?: string;
  message?: string;
}

export class MetroLiveTile extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
    interval: { type: Number },
    count: { type: Number, reflect: true },
    badge: { type: String, reflect: true },
  };

  declare size: TileSize;
  declare interval: number;
  declare count: number | undefined;
  declare badge: string | undefined;

  static styles = [
    tileBase,
    tileSizes,
    tileBadge,
    css`
      .live-container {
        position: relative;
        width: 100%;
        height: 100%;
        background: var(--metro-accent, #0078d4);
        color: #ffffff;
      }
      .live-content {
        position: absolute;
        inset: 0;
        padding: var(--metro-spacing-sm, 8px);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        opacity: 0;
        transform: translateY(100%);
        transition:
          opacity var(--metro-transition-slow, 333ms) ease-out,
          transform var(--metro-transition-slow, 333ms) ease-out;
        box-sizing: border-box;
      }
      .live-content.active {
        opacity: 1;
        transform: translateY(0);
      }
      .live-content.exiting {
        opacity: 0;
        transform: translateY(-100%);
      }
      .live-title {
        font-size: var(--metro-font-size-normal, 14px);
        font-weight: 600;
        margin-bottom: var(--metro-spacing-xs, 4px);
      }
      .live-message {
        font-size: var(--metro-font-size-small, 12px);
        opacity: 0.8;
      }
      .live-count {
        position: absolute;
        top: var(--metro-spacing-sm, 8px);
        right: var(--metro-spacing-sm, 8px);
        font-size: var(--metro-font-size-medium, 16px);
        font-weight: 600;
      }
    `,
  ];

  #timer: number | null = null;
  #currentIndex = 0;
  #items: LiveTileItem[] = [];

  constructor() {
    super();
    this.size = "medium";
    this.interval = 5000;
  }

  render() {
    return html`
      <div class="live-container">
        <slot name="icon"></slot>
        ${this.count !== undefined
          ? html`<div class="live-count">${this.count}</div>`
          : ""}
        ${this.badge
          ? html`<div class="tile-badge">${this.badge}</div>`
          : ""}
        <slot></slot>
      </div>
    `;
  }

  setItems(items: LiveTileItem[]): void {
    this.#items = items;
    this.#renderCurrentItem();
    this.#startCycle();
  }

  #renderCurrentItem(): void {
    if (this.#items.length === 0) return;

    const container = this.shadowRoot?.querySelector(".live-container");
    if (!container) return;

    const existing = container.querySelectorAll(".live-content");
    existing.forEach((el) => {
      el.classList.remove("active");
      el.classList.add("exiting");
      setTimeout(() => el.remove(), 333);
    });

    const item = this.#items[this.#currentIndex];
    const content = document.createElement("div");
    content.className = "live-content";
    content.innerHTML = `
      ${item.title ? `<div class="live-title">${item.title}</div>` : ""}
      ${item.message ? `<div class="live-message">${item.message}</div>` : ""}
    `;

    container.appendChild(content);
    requestAnimationFrame(() => {
      content.classList.add("active");
    });
  }

  #startCycle(): void {
    this.#stopCycle();
    if (this.#items.length <= 1) return;

    this.#timer = window.setInterval(() => {
      this.#currentIndex = (this.#currentIndex + 1) % this.#items.length;
      this.#renderCurrentItem();
    }, this.interval);
  }

  #stopCycle(): void {
    if (this.#timer !== null) {
      clearInterval(this.#timer);
      this.#timer = null;
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.#items.length > 0) {
      this.#startCycle();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#stopCycle();
  }
}

customElements.define("metro-live-tile", MetroLiveTile);

declare global {
  interface HTMLElementTagNameMap {
    "metro-live-tile": MetroLiveTile;
  }
}
