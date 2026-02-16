import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    background: var(--metro-highlight, rgba(255,255,255,0.1));
    padding: var(--metro-spacing-md, 12px);
    min-width: 200px;
    flex: 1;
  }
  .section-header {
    font-size: var(--metro-font-size-large, 20px);
    font-weight: 300;
    color: var(--metro-accent, #0078d4);
    margin: 0 0 var(--metro-spacing-md, 12px) 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

export class MetroHubSection extends LitElement {
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
    return html`
      ${this.header ? html`<h3 class="section-header">${this.header}</h3>` : ""}
      <slot></slot>
    `;
  }
}

customElements.define("metro-hub-section", MetroHubSection);

declare global {
  interface HTMLElementTagNameMap {
    "metro-hub-section": MetroHubSection;
  }
}
