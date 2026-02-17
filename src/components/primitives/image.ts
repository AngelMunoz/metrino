import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

export class MetroImage extends LitElement {
  static properties = {
    src: { type: String, reflect: true },
    alt: { type: String, reflect: true },
    placeholder: { type: String, reflect: true },
    fallback: { type: String, reflect: true },
    stretch: { type: String, reflect: true },
  };

  declare src: string;
  declare alt: string;
  declare placeholder: string;
  declare fallback: string;
  declare stretch: "none" | "fill" | "uniform" | "uniformToFill";

  static styles = [
    baseTypography,
    css`
      :host {
        display: inline-block;
        position: relative;
        overflow: hidden;
      }
      .image-container {
        width: 100%;
        height: 100%;
        position: relative;
      }
      img {
        display: block;
        width: 100%;
        height: 100%;
      }
      img.stretch-none {
        width: auto;
        height: auto;
      }
      img.stretch-fill {
        object-fit: fill;
      }
      img.stretch-uniform {
        object-fit: contain;
      }
      img.stretch-uniformToFill {
        object-fit: cover;
      }
      .placeholder,
      .fallback {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
        font-size: var(--metro-font-size-small, 12px);
      }
      .placeholder img,
      .fallback img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .hidden {
        display: none !important;
      }
    `,
  ];

  #loaded = false;
  #hasError = false;

  constructor() {
    super();
    this.src = "";
    this.alt = "";
    this.placeholder = "";
    this.fallback = "";
    this.stretch = "uniform";
  }

  render() {
    const showPlaceholder = !this.#loaded && !this.#hasError && this.placeholder;
    const showFallback = this.#hasError && this.fallback;
    const showImage = this.src && !this.#hasError;

    return html`
      <div class="image-container">
        ${showPlaceholder
          ? html`
              <div class="placeholder">
                ${this.placeholder.startsWith("data:") || this.placeholder.startsWith("http")
                  ? html`<img src="${this.placeholder}" alt="" />`
                  : this.placeholder}
              </div>
            `
          : ""}
        ${showFallback
          ? html`
              <div class="fallback">
                ${this.fallback.startsWith("data:") || this.fallback.startsWith("http")
                  ? html`<img src="${this.fallback}" alt="" />`
                  : this.fallback}
              </div>
            `
          : ""}
        ${showImage
          ? html`
              <img
                src="${this.src}"
                alt="${this.alt}"
                class="stretch-${this.stretch}"
                @load=${this.#handleLoad}
                @error=${this.#handleError}
              />
            `
          : ""}
      </div>
    `;
  }

  #handleLoad(): void {
    this.#loaded = true;
    this.#hasError = false;
    this.dispatchEvent(new Event("load", { bubbles: true, composed: true }));
  }

  #handleError(): void {
    this.#hasError = true;
    this.#loaded = false;
    this.dispatchEvent(new Event("error", { bubbles: true, composed: true }));
    this.requestUpdate();
  }
}

customElements.define("metro-image", MetroImage);

declare global {
  interface HTMLElementTagNameMap {
    "metro-image": MetroImage;
  }
}
