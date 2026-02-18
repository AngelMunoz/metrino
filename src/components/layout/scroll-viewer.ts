import { LitElement, html, css } from "lit";
import { scrollbarVisible } from "../../styles/shared.ts";

export type ScrollOrientation = "horizontal" | "vertical" | "both";
export type ScrollbarMode = "auto" | "visible" | "hidden";

export class MetroScrollViewer extends LitElement {
  static properties = {
    scrollOrientation: { type: String, reflect: true },
    scrollbarMode: { type: String, reflect: true },
  };

  declare scrollOrientation: ScrollOrientation;
  declare scrollbarMode: ScrollbarMode;

  static styles = [
    scrollbarVisible,
    css`
      :host { display: block; overflow: hidden; box-sizing: border-box; }
      .scroll-container { width: 100%; height: 100%; overflow: auto; }
      :host([scrollOrientation="horizontal"]) .scroll-container { overflow-x: auto; overflow-y: hidden; }
      :host([scrollOrientation="vertical"]) .scroll-container { overflow-x: hidden; overflow-y: auto; }
      :host([scrollOrientation="both"]) .scroll-container { overflow: auto; }

      /* Hidden mode: always hide scrollbars */
      :host([scrollbarMode="hidden"]) .scroll-container {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      :host([scrollbarMode="hidden"]) .scroll-container::-webkit-scrollbar {
        display: none;
      }

      /* Auto mode: hide scrollbars by default, show on scroll */
      :host([scrollbarMode="auto"]) .scroll-container {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      :host([scrollbarMode="auto"]) .scroll-container::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }
      :host([scrollbarMode="auto"]) .scroll-container::-webkit-scrollbar-track {
        background: transparent;
      }
      :host([scrollbarMode="auto"]) .scroll-container::-webkit-scrollbar-thumb {
        background: transparent;
        border-radius: 3px;
        transition: background 0.3s ease;
      }
      :host([scrollbarMode="auto"]) .scroll-container.scrolling {
        scrollbar-width: thin;
      }
      :host([scrollbarMode="auto"]) .scroll-container.scrolling::-webkit-scrollbar-thumb {
        background: var(--metro-border, rgba(255, 255, 255, 0.3));
      }
    `,
  ];

  #scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  #scrollHandler: (() => void) | null = null;

  constructor() {
    super();
    this.scrollOrientation = "vertical";
    this.scrollbarMode = "auto";
  }

  protected firstUpdated(): void {
    if (this.scrollbarMode === "auto") {
      this.#attachScrollListener();
    }
  }

  protected updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("scrollbarMode")) {
      this.#detachScrollListener();
      if (this.scrollbarMode === "auto") {
        this.#attachScrollListener();
      }
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#detachScrollListener();
  }

  #attachScrollListener(): void {
    const container = this.shadowRoot?.querySelector(".scroll-container");
    if (!container) return;

    this.#scrollHandler = () => {
      container.classList.add("scrolling");
      if (this.#scrollTimeout) clearTimeout(this.#scrollTimeout);
      this.#scrollTimeout = setTimeout(() => {
        container.classList.remove("scrolling");
      }, 1500);
    };

    container.addEventListener("scroll", this.#scrollHandler, { passive: true });
  }

  #detachScrollListener(): void {
    if (this.#scrollHandler) {
      const container = this.shadowRoot?.querySelector(".scroll-container");
      container?.removeEventListener("scroll", this.#scrollHandler);
      this.#scrollHandler = null;
    }
    if (this.#scrollTimeout) {
      clearTimeout(this.#scrollTimeout);
      this.#scrollTimeout = null;
    }
  }

  render() {
    return html`
      <div class="scroll-container">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("metro-scroll-viewer", MetroScrollViewer);

declare global {
  interface HTMLElementTagNameMap {
    "metro-scroll-viewer": MetroScrollViewer;
  }
}
