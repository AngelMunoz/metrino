import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host { display: flex; flex-direction: column; }
  :host([orientation="horizontal"]) { flex-direction: row; }
  ::slotted(*) { flex-shrink: 0; }
`;

const gapStyles = css`
  :host([orientation="vertical"]) ::slotted(*) + ::slotted(*) { margin-top: var(--metro-gap, 0); }
  :host([orientation="horizontal"]) ::slotted(*) + ::slotted(*) { margin-inline-start: var(--metro-gap, 0); }
`;

export type StackOrientation = "horizontal" | "vertical";

export class MetroStackPanel extends LitElement {
  static properties = {
    orientation: { type: String, reflect: true },
  };

  declare orientation: StackOrientation;

  static styles = [baseStyles, gapStyles];

  constructor() {
    super();
    this.orientation = "vertical";
  }

  render() {
    return html`<slot></slot>`;
  }
}

customElements.define("metro-stack-panel", MetroStackPanel);

declare global {
  interface HTMLElementTagNameMap {
    "metro-stack-panel": MetroStackPanel;
  }
}
