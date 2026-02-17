import { LitElement, html, css } from "lit";

export class MetroWrapPanel extends LitElement {
  static properties = {
    orientation: { type: String, reflect: true },
  };

  declare orientation: "horizontal" | "vertical";

  static styles = css`
    :host { display: flex; flex-wrap: wrap; box-sizing: border-box; }
    ::slotted(*) { flex-shrink: 0; }
  `;

  constructor() {
    super();
    this.orientation = "horizontal";
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("metro-wrap-panel", MetroWrapPanel);

declare global {
  interface HTMLElementTagNameMap {
    "metro-wrap-panel": MetroWrapPanel;
  }
}
