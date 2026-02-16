import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host { display: grid; box-sizing: border-box; }
  ::slotted(*) { min-width: 0; min-height: 0; }
`;

export class MetroGrid extends LitElement {
  static properties = {
    rows: { type: String },
    columns: { type: String },
  };

  declare rows: string | undefined;
  declare columns: string | undefined;

  static styles = baseStyles;

  render() {
    const rowStyles = this.rows ? `grid-template-rows: ${this.rows};` : "";
    const colStyles = this.columns ? `grid-template-columns: ${this.columns};` : "";
    return html`
      <style>
        :host { ${rowStyles} ${colStyles} gap: var(--metro-gap, 8px); }
      </style>
      <slot></slot>
    `;
  }
}

customElements.define("metro-grid", MetroGrid);

declare global {
  interface HTMLElementTagNameMap {
    "metro-grid": MetroGrid;
  }
}
