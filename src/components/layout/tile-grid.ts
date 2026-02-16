import { LitElement, html, css } from "lit";

const TILE_UNIT = 70;
const TILE_GAP = 10;

const baseStyles = css`
  :host {
    display: grid;
    box-sizing: border-box;
    grid-template-columns: repeat(auto-fill, ${TILE_UNIT}px);
    grid-auto-rows: ${TILE_UNIT}px;
    gap: ${TILE_GAP}px;
    padding: ${TILE_GAP}px;
  }
  ::slotted(*) {
    min-width: 0;
    min-height: 0;
  }
  ::slotted(metro-flip-tile[size="small"]),
  ::slotted(metro-cycle-tile[size="small"]),
  ::slotted(metro-iconic-tile[size="small"]) {
    grid-column: span 1;
    grid-row: span 1;
  }
  ::slotted(metro-flip-tile[size="medium"]),
  ::slotted(metro-cycle-tile[size="medium"]),
  ::slotted(metro-iconic-tile[size="medium"]) {
    grid-column: span 2;
    grid-row: span 2;
  }
  ::slotted(metro-flip-tile[size="wide"]),
  ::slotted(metro-cycle-tile[size="wide"]) {
    grid-column: span 4;
    grid-row: span 2;
  }
  ::slotted(metro-flip-tile[size="large"]) {
    grid-column: span 4;
    grid-row: span 4;
  }
`;

export class MetroTileGrid extends LitElement {
  static properties = {
    columns: { type: Number },
  };

  declare columns: number;

  static styles = baseStyles;

  constructor() {
    super();
    this.columns = 4;
  }

  render() {
    const gridWidth = this.columns * TILE_UNIT + (this.columns - 1) * TILE_GAP;
    return html`
      <style>
        :host {
          max-width: ${gridWidth}px;
          margin: 0 auto;
        }
      </style>
      <slot></slot>
    `;
  }
}

customElements.define("metro-tile-grid", MetroTileGrid);

declare global {
  interface HTMLElementTagNameMap {
    "metro-tile-grid": MetroTileGrid;
  }
}
