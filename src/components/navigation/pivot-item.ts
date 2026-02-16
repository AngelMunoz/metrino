import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: block;
    padding: var(--metro-spacing-md, 12px);
    box-sizing: border-box;
  }
`;

export class MetroPivotItem extends LitElement {
  static properties = {
    header: { type: String, reflect: true },
  };

  declare header: string;

  static styles = baseStyles;

  constructor() {
    super();
    this.header = "";
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("metro-pivot-item", MetroPivotItem);

declare global {
  interface HTMLElementTagNameMap {
    "metro-pivot-item": MetroPivotItem;
  }
}
