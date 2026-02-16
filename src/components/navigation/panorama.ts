import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: block;
    position: relative;
    overflow: hidden;
    background: var(--metro-background, #1f1f1f);
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
  }
  .parallax-bg {
    position: absolute;
    inset: -20%;
    background-size: cover;
    background-position: center;
    opacity: 0.15;
    pointer-events: none;
    will-change: transform;
    transition: transform 0.1s linear;
  }
  .panorama-container {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: var(--metro-spacing-lg, 16px) 0;
    position: relative;
  }
  .panorama-container::-webkit-scrollbar {
    display: none;
  }
  ::slotted(metro-panorama-item) {
    scroll-snap-align: start;
    flex-shrink: 0;
    width: 85%;
    margin-right: var(--metro-spacing-lg, 16px);
  }
  .panorama-title {
    font-size: var(--metro-font-size-xlarge, 28px);
    font-weight: 300;
    color: var(--metro-foreground, #ffffff);
    padding: var(--metro-spacing-lg, 16px);
    margin: 0;
    position: relative;
    z-index: 1;
  }
`;

export class MetroPanorama extends LitElement {
  static properties = {
    title: { type: String },
    backgroundImage: { type: String, reflect: true, attribute: "background-image" },
  };

  declare title: string;
  declare backgroundImage: string;

  static styles = baseStyles;

  #scrollContainer: HTMLElement | null = null;

  render() {
    return html`
      ${this.backgroundImage
        ? html`<div
            class="parallax-bg"
            style="background-image: url(${this.backgroundImage})"
          ></div>`
        : ""}
      ${this.title ? html`<h2 class="panorama-title">${this.title}</h2>` : ""}
      <div class="panorama-container" @scroll=${this.#handleScroll}>
        <slot></slot>
      </div>
    `;
  }

  firstUpdated(): void {
    this.#scrollContainer = this.shadowRoot?.querySelector(".panorama-container") || null;
  }

  #handleScroll(): void {
    if (!this.#scrollContainer || !this.backgroundImage) return;
    
    const parallaxBg = this.shadowRoot?.querySelector(".parallax-bg") as HTMLElement;
    if (!parallaxBg) return;
    
    const scrollLeft = this.#scrollContainer.scrollLeft;
    const maxScroll = this.#scrollContainer.scrollWidth - this.#scrollContainer.clientWidth;
    const parallaxOffset = (scrollLeft / maxScroll) * 20;
    
    parallaxBg.style.transform = `translateX(-${parallaxOffset}%)`;
  }
}

customElements.define("metro-panorama", MetroPanorama);

declare global {
  interface HTMLElementTagNameMap {
    "metro-panorama": MetroPanorama;
  }
}
