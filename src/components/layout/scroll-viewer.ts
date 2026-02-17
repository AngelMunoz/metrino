import { LitElement, html, css } from "lit";
import { scrollbarVisible } from "../../styles/shared.ts";

export type ScrollOrientation = "horizontal" | "vertical" | "both";

export class MetroScrollViewer extends LitElement {
  static properties = {
    scrollOrientation: { type: String, reflect: true },
  };

  declare scrollOrientation: ScrollOrientation;

  static styles = [
    scrollbarVisible,
    css`
      :host { display: block; overflow: hidden; box-sizing: border-box; }
      .scroll-container { width: 100%; height: 100%; overflow: auto; }
      :host([scrollOrientation="horizontal"]) .scroll-container { overflow-x: auto; overflow-y: hidden; }
      :host([scrollOrientation="vertical"]) .scroll-container { overflow-x: hidden; overflow-y: auto; }
      :host([scrollOrientation="both"]) .scroll-container { overflow: auto; }
    `,
  ];

  constructor() {
    super();
    this.scrollOrientation = "vertical";
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
