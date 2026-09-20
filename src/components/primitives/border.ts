import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

/**
 * Metro Border Component
 *
 * Wraps slotted content in a configurable border. `borderColor` and
 * `background` accept CSS values; invalid declarations are ignored.
 */
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
    return html`
      <div class="border-container">
        <slot></slot>
      </div>
    `;
  }

  protected updated(): void {
    const container = this.shadowRoot?.querySelector<HTMLElement>(".border-container");
    if (!container) return;

    const thickness = this.#parseBorderThickness(this.borderThickness);
    const pad = this.#parsePadding(this.padding);
    const style = container.style;

    style.borderTopWidth = `${thickness.top}px`;
    style.borderRightWidth = `${thickness.right}px`;
    style.borderBottomWidth = `${thickness.bottom}px`;
    style.borderLeftWidth = `${thickness.left}px`;
    style.borderStyle = "solid";
    style.borderRadius = `${this.cornerRadius}px`;
    style.borderColor = "";
    style.borderColor = this.borderColor || "var(--metro-border, rgba(255, 255, 255, 0.2))";
    style.background = "";
    style.background = this.background;
    style.paddingTop = `${pad.top}px`;
    style.paddingRight = `${pad.right}px`;
    style.paddingBottom = `${pad.bottom}px`;
    style.paddingLeft = `${pad.left}px`;
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

export function registerMetroBorder(): void {
  if (!customElements.get("metro-border")) {
    customElements.define("metro-border", MetroBorder);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-border": MetroBorder;
  }
}
