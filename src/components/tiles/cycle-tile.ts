import { LitElement, html, css } from "lit";
import { tileBase, tileSizes } from "../../styles/shared.ts";

type TileSize = "medium" | "wide";

export class MetroCycleTile extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
    interval: { type: Number },
  };

  declare size: TileSize;
  declare interval: number;

  static styles = [
    tileBase,
    tileSizes,
    css`
      .tile-container {
        position: relative;
        width: 100%;
        height: 100%;
        background: var(--metro-accent, #0078d4);
      }
      ::slotted([slot="cycle"]) {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        transform: translateY(100%);
        transition:
          opacity var(--metro-transition-slow, 333ms) ease-out,
          transform var(--metro-transition-slow, 333ms) ease-out;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        box-sizing: border-box;
      }
      ::slotted(.cycle-content.active) {
        opacity: 1;
        transform: translateY(0);
      }
      ::slotted(.cycle-content.exiting) {
        opacity: 0;
        transform: translateY(-100%);
      }
    `,
  ];

  #currentIndex = 0;
  #timer: number | null = null;
  #items: Element[] = [];

  constructor() {
    super();
    this.size = "medium";
    this.interval = 3000;
  }

  connectedCallback(): void {
    super.connectedCallback();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#stopCycle();
  }

  render() {
    return html`
      <div class="tile-container" @click=${this.#handleClick}>
        <slot name="front"></slot>
        <slot name="cycle"></slot>
      </div>
    `;
  }

  firstUpdated() {
    this.#items = Array.from(this.querySelectorAll('[slot="cycle"]'));
    if (this.#items.length > 0) {
      this.#items.forEach(item => item.classList.add("cycle-content"));
      this.#items[0].classList.add("active");
      if (this.#items.length > 1) {
        this.#startCycle();
      }
    }
  }

  #startCycle(): void {
    if (this.#items.length <= 1) return;
    this.#timer = window.setInterval(() => {
      this.#cycleContent();
    }, this.interval);
  }

  #stopCycle(): void {
    if (this.#timer !== null) {
      clearInterval(this.#timer);
      this.#timer = null;
    }
  }

  #cycleContent(): void {
    if (this.#items.length === 0) return;
    
    const current = this.#items[this.#currentIndex];
    current.classList.remove("active");
    current.classList.add("exiting");
    
    setTimeout(() => {
      current.classList.remove("exiting");
    }, 333);
    
    this.#currentIndex = (this.#currentIndex + 1) % this.#items.length;
    this.#items[this.#currentIndex].classList.add("active");
  }

  #handleClick(): void {
    this.dispatchEvent(new CustomEvent("click", { bubbles: true }));
  }
}

customElements.define("metro-cycle-tile", MetroCycleTile);

declare global {
  interface HTMLElementTagNameMap {
    "metro-cycle-tile": MetroCycleTile;
  }
}
