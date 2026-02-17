import { LitElement, html, css } from "lit";
import { tileBase, tileSizes, tileBadge } from "../../styles/shared.ts";
import "../primitives/icon.ts";

type TileSize = "small" | "medium" | "large";

export class MetroIconicTile extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
    icon: { type: String, reflect: true },
    title: { type: String, reflect: true },
    count: { type: Number, reflect: true },
    badge: { type: String, reflect: true },
  };

  declare size: TileSize;
  declare icon: string;
  declare title: string;
  declare count: number;
  declare badge: string;

  static styles = [
    tileBase,
    tileSizes,
    tileBadge,
    css`
      .tile-container {
        width: 100%;
        height: 100%;
        background: var(--metro-accent, #0078d4);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--metro-spacing-md, 12px);
        box-sizing: border-box;
        color: #ffffff;
      }
      .tile-icon {
        margin-bottom: var(--metro-spacing-sm, 8px);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tile-title {
        font-size: var(--metro-font-size-normal, 14px);
        font-weight: 400;
        text-align: center;
      }
      .tile-count {
        font-size: var(--metro-font-size-xxlarge, 42px);
        font-weight: 300;
        margin-bottom: var(--metro-spacing-xs, 4px);
      }
      :host([size="small"]) .tile-title { display: none; }
      :host([size="small"]) .tile-icon { margin-bottom: 0; }
    `,
  ];

  constructor() {
    super();
    this.size = "medium";
    this.icon = "";
    this.title = "";
    this.count = 0;
    this.badge = "";
  }

  render() {
    const iconSize = this.size === "small" ? "medium" : this.size === "large" ? "xlarge" : "large";
    return html`
      <div class="tile-container" @click=${this.#handleClick}>
        ${this.badge ? html`<div class="tile-badge">${this.badge}</div>` : ""}
        ${this.icon
          ? html`<div class="tile-icon">
              <metro-icon icon=${this.icon} size=${iconSize}></metro-icon>
            </div>`
          : ""}
        ${this.count > 0 ? html`<div class="tile-count">${this.count}</div>` : ""}
        ${this.title ? html`<div class="tile-title">${this.title}</div>` : ""}
        <slot></slot>
      </div>
    `;
  }

  #handleClick(): void {
    this.dispatchEvent(new CustomEvent("click", { bubbles: true }));
  }
}

customElements.define("metro-iconic-tile", MetroIconicTile);

declare global {
  interface HTMLElementTagNameMap {
    "metro-iconic-tile": MetroIconicTile;
  }
}
