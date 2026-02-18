import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

export class MetroBorder extends LitElement {
  static properties = {
    borderThickness: { type: String, reflect: true, attribute: "border-thickness" },
    borderColor: { type: String, reflect: true, attribute: "border-color" },
    background: { type: String, reflect: true },
    cornerRadius: { type: Number, reflect: true, attribute: "corner-radius" },
    padding: { type: String, reflect: true },
  };

  declare borderThickness: string;
  declare borderColor: string;
  declare background: string;
  declare cornerRadius: number;
  declare padding: string;

  static styles = [
    baseTypography,
    css`
      :host {
        display: block;
        box-sizing: border-box;
      }
      .border-container {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
      }
      ::slotted(*) {
        width: 100%;
        height: 100%;
      }
    `,
  ];

  constructor() {
    super();
    this.borderThickness = "2";
    this.borderColor = "";
    this.background = "";
    this.cornerRadius = 0;
    this.padding = "0";
  }

  render() {
    const thickness = this.#parseBorderThickness(this.borderThickness);
    const color = this.borderColor || "var(--metro-border, rgba(255, 255, 255, 0.2))";
    const radius = this.cornerRadius;
    const bg = this.background;
    const pad = this.#parsePadding(this.padding);

    const style = `
      border-top-width: ${thickness.top}px;
      border-right-width: ${thickness.right}px;
      border-bottom-width: ${thickness.bottom}px;
      border-left-width: ${thickness.left}px;
      border-color: ${color};
      border-style: solid;
      border-radius: ${radius}px;
      ${bg ? `background: ${bg};` : ""}
      padding-top: ${pad.top}px;
      padding-right: ${pad.right}px;
      padding-bottom: ${pad.bottom}px;
      padding-left: ${pad.left}px;
    `;

    return html`
      <style>
        .border-container { ${style} }
      </style>
      <div class="border-container">
        <slot></slot>
      </div>
    `;
  }

  #parseBorderThickness(value: string): { top: number; right: number; bottom: number; left: number } {
    const parts = value.split(",").map(s => parseFloat(s.trim()) || 0);
    if (parts.length === 1) {
      return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
    }
    if (parts.length === 4) {
      return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    }
    const uniform = parseFloat(value) || 1;
    return { top: uniform, right: uniform, bottom: uniform, left: uniform };
  }

  #parsePadding(value: string): { top: number; right: number; bottom: number; left: number } {
    const parts = value.split(",").map(s => parseFloat(s.trim()) || 0);
    if (parts.length === 1) {
      return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
    }
    if (parts.length === 4) {
      return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    }
    const uniform = parseFloat(value) || 0;
    return { top: uniform, right: uniform, bottom: uniform, left: uniform };
  }
}

customElements.define("metro-border", MetroBorder);

declare global {
  interface HTMLElementTagNameMap {
    "metro-border": MetroBorder;
  }
}
