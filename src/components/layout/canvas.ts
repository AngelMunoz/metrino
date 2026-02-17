import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

export class MetroCanvas extends LitElement {
  static styles = [
    baseTypography,
    css`
      :host {
        display: block;
        position: relative;
        box-sizing: border-box;
      }
      ::slotted(*) {
        position: absolute;
      }
    `,
  ];

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("metro-canvas", MetroCanvas);

declare global {
  interface HTMLElementTagNameMap {
    "metro-canvas": MetroCanvas;
  }
}
