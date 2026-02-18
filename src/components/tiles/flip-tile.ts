import { LitElement, html, css } from "lit";
import { tileBase, tileSizes } from "../../styles/shared.ts";

type TileSize = "small" | "medium" | "wide" | "large";

export class MetroFlipTile extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
    flipped: { type: Boolean, reflect: true },
  };

  declare size: TileSize;
  declare flipped: boolean;

  static styles = [
    tileBase,
    tileSizes,
    css`
      :host {
        perspective: 1000px;
      }
      .tile-container {
        position: relative;
        width: 100%;
        height: 100%;
        transition: transform var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        transform-style: preserve-3d;
      }
      :host([flipped]) .tile-container {
        transform: rotateY(180deg);
      }
      .tile-face {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--metro-spacing-sm, 8px);
        box-sizing: border-box;
      }
      .tile-front {
        background: var(--metro-accent, #0078d4);
        color: #ffffff;
      }
      .tile-back {
        background: var(--metro-background, #1f1f1f);
        color: var(--metro-foreground, #ffffff);
        transform: rotateY(180deg);
      }
    `,
  ];

  constructor() {
    super();
    this.size = "medium";
    this.flipped = false;
  }

  render() {
    return html`
      <div class="tile-container" @click=${this.#flip}>
        <div class="tile-face tile-front">
          <slot name="front"></slot>
        </div>
        <div class="tile-face tile-back">
          <slot name="back"></slot>
        </div>
      </div>
    `;
  }

  #flip(): void {
    this.flipped = !this.flipped;
    this.dispatchEvent(
      new CustomEvent("flipped", {
        detail: { flipped: this.flipped },
        bubbles: true,
      }),
    );
  }
}

customElements.define("metro-flip-tile", MetroFlipTile);

declare global {
  interface HTMLElementTagNameMap {
    "metro-flip-tile": MetroFlipTile;
  }
}
