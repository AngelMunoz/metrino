import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

export class MetroViewbox extends LitElement {
  static properties = {
    stretch: { type: String, reflect: true },
    stretchDirection: { type: String, reflect: true, attribute: "stretch-direction" },
  };

  declare stretch: "none" | "fill" | "uniform" | "uniformToFill";
  declare stretchDirection: "upOnly" | "downOnly" | "both";

  static styles = [
    baseTypography,
    css`
      :host {
        display: block;
        position: relative;
        overflow: hidden;
      }
      .viewbox-container {
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .viewbox-content {
        transform-origin: 0 0;
        width: fit-content;
        height: fit-content;
      }
    `,
  ];

  #contentElement: HTMLDivElement | null = null;
  #resizeObserver: ResizeObserver | null = null;
  #naturalWidth = 0;
  #naturalHeight = 0;

  constructor() {
    super();
    this.stretch = "uniform";
    this.stretchDirection = "both";
  }

  firstUpdated(): void {
    this.#contentElement = this.shadowRoot?.querySelector(".viewbox-content") ?? null;
    this.#resizeObserver = new ResizeObserver(() => this.#updateScale());
    this.#resizeObserver.observe(this);
    this.#measureContent();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
  }

  render() {
    return html`
      <div class="viewbox-container">
        <div class="viewbox-content">
          <slot @slotchange=${this.#handleSlotChange}></slot>
        </div>
      </div>
    `;
  }

  #handleSlotChange(): void {
    requestAnimationFrame(() => {
      this.#measureContent();
      this.#updateScale();
    });
  }

  #measureContent(): void {
    if (!this.#contentElement) return;
    
    // Get first slotted element
    const slotted = this.querySelector(":first-child") as HTMLElement;
    if (!slotted) return;
    
    // Get natural dimensions from style or element
    const style = getComputedStyle(slotted);
    this.#naturalWidth = parseFloat(style.width) || slotted.offsetWidth || 400;
    this.#naturalHeight = parseFloat(style.height) || slotted.offsetHeight || 200;
  }

  #updateScale(): void {
    if (!this.#contentElement) return;
    if (this.#naturalWidth === 0 || this.#naturalHeight === 0) {
      this.#measureContent();
      if (this.#naturalWidth === 0 || this.#naturalHeight === 0) return;
    }

    const containerRect = this.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    if (containerWidth === 0 || containerHeight === 0) return;

    let scaleX = containerWidth / this.#naturalWidth;
    let scaleY = containerHeight / this.#naturalHeight;

    switch (this.stretch) {
      case "none":
        scaleX = 1;
        scaleY = 1;
        break;
      case "fill":
        // keep individual scales
        break;
      case "uniform":
        scaleX = scaleY = Math.min(scaleX, scaleY);
        break;
      case "uniformToFill":
        scaleX = scaleY = Math.max(scaleX, scaleY);
        break;
    }

    switch (this.stretchDirection) {
      case "upOnly":
        scaleX = Math.max(1, scaleX);
        scaleY = Math.max(1, scaleY);
        break;
      case "downOnly":
        scaleX = Math.min(1, scaleX);
        scaleY = Math.min(1, scaleY);
        break;
      case "both":
        break;
    }

    this.#contentElement.style.transform = `scale(${scaleX}, ${scaleY})`;
  }
}

customElements.define("metro-viewbox", MetroViewbox);

declare global {
  interface HTMLElementTagNameMap {
    "metro-viewbox": MetroViewbox;
  }
}
