import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: inline-block;
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
    font-size: var(--metro-font-size-normal, 14px);
    font-weight: 400;
    color: var(--metro-foreground, #ffffff);
    line-height: 1.4;
  }
  :host([bold]) { font-weight: 700; }
  :host([italic]) { font-style: italic; }
  :host([underline]) { text-decoration: underline; }
  :host([strikethrough]) { text-decoration: line-through; }
  :host([wrap]) { white-space: normal; word-wrap: break-word; overflow-wrap: break-word; }
  :host(:not([wrap])) { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`;

export class MetroTextBlock extends LitElement {
  static properties = {
    bold: { type: Boolean, reflect: true },
    italic: { type: Boolean, reflect: true },
    underline: { type: Boolean, reflect: true },
    strikethrough: { type: Boolean, reflect: true },
    wrap: { type: Boolean, reflect: true },
  };

  declare bold: boolean;
  declare italic: boolean;
  declare underline: boolean;
  declare strikethrough: boolean;
  declare wrap: boolean;

  static styles = baseStyles;

  constructor() {
    super();
    this.bold = false;
    this.italic = false;
    this.underline = false;
    this.strikethrough = false;
    this.wrap = false;
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("metro-text-block", MetroTextBlock);

declare global {
  interface HTMLElementTagNameMap {
    "metro-text-block": MetroTextBlock;
  }
}
