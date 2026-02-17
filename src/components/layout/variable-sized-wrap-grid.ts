import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

export class MetroVariableSizedWrapGrid extends LitElement {
  static properties = {
    orientation: { type: String, reflect: true },
    itemWidth: { type: Number, reflect: true, attribute: "item-width" },
    itemHeight: { type: Number, reflect: true, attribute: "item-height" },
    maximumRowsOrColumns: { type: Number, reflect: true, attribute: "maximum-rows-or-columns" },
  };

  declare orientation: "horizontal" | "vertical";
  declare itemWidth: number;
  declare itemHeight: number;
  declare maximumRowsOrColumns: number;

  static styles = [
    baseTypography,
    css`
      :host {
        display: grid;
        box-sizing: border-box;
      }
      ::slotted(*) {
        box-sizing: border-box;
      }
    `,
  ];

  constructor() {
    super();
    this.orientation = "horizontal";
    this.itemWidth = 50;
    this.itemHeight = 50;
    this.maximumRowsOrColumns = -1;
  }

  render() {
    const isHorizontal = this.orientation === "horizontal";
    const cellWidth = this.itemWidth;
    const cellHeight = this.itemHeight;

    let gridTemplateColumns: string;
    let gridTemplateRows: string;
    let gridAutoFlow: string;

    if (isHorizontal) {
      const maxCols = this.maximumRowsOrColumns > 0 ? this.maximumRowsOrColumns : 0;
      gridTemplateColumns = maxCols > 0
        ? `repeat(${maxCols}, ${cellWidth}px)`
        : `repeat(auto-fill, ${cellWidth}px)`;
      gridTemplateRows = `repeat(auto-fill, ${cellHeight}px)`;
      gridAutoFlow = "row";
    } else {
      const maxRows = this.maximumRowsOrColumns > 0 ? this.maximumRowsOrColumns : 0;
      gridTemplateColumns = `repeat(auto-fill, ${cellWidth}px)`;
      gridTemplateRows = maxRows > 0
        ? `repeat(${maxRows}, ${cellHeight}px)`
        : `repeat(auto-fill, ${cellHeight}px)`;
      gridAutoFlow = "column";
    }

    return html`
      <style>
        :host {
          grid-template-columns: ${gridTemplateColumns};
          grid-template-rows: ${gridTemplateRows};
          grid-auto-flow: ${gridAutoFlow};
          grid-auto-columns: ${cellWidth}px;
          grid-auto-rows: ${cellHeight}px;
        }
      </style>
      <slot @slotchange=${this.#handleSlotChange}></slot>
    `;
  }

  #handleSlotChange(): void {
    this.#updateItemSpans();
  }

  #updateItemSpans(): void {
    const slot = this.shadowRoot?.querySelector("slot");
    if (!slot) return;

    const items = slot.assignedElements({ flatten: true });
    for (const item of items) {
      if (item instanceof HTMLElement) {
        const rowSpan = item.getAttribute("data-row-span");
        const colSpan = item.getAttribute("data-col-span");

        if (rowSpan) {
          const span = parseInt(rowSpan, 10) || 1;
          item.style.gridRow = `span ${span}`;
        }
        if (colSpan) {
          const span = parseInt(colSpan, 10) || 1;
          item.style.gridColumn = `span ${span}`;
        }
      }
    }
  }
}

customElements.define("metro-variable-sized-wrap-grid", MetroVariableSizedWrapGrid);

declare global {
  interface HTMLElementTagNameMap {
    "metro-variable-sized-wrap-grid": MetroVariableSizedWrapGrid;
  }
}
