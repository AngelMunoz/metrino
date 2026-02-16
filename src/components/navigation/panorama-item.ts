import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    background: var(--metro-highlight, rgba(255,255,255,0.1));
    min-height: 400px;
  }
  .item-header {
    font-size: var(--metro-font-size-large, 20px);
    font-weight: 300;
    color: var(--metro-accent, #0078d4);
    padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
    margin: 0;
  }
  .item-content {
    flex: 1;
    padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
  }
`;

export class MetroPanoramaItem extends LitElement {
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
      ${this.header ? html`<h3 class="item-header">${this.header}</h3>` : ""}
      <div class="item-content">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("metro-panorama-item", MetroPanoramaItem);

declare global {
  interface HTMLElementTagNameMap {
    "metro-panorama-item": MetroPanoramaItem;
  }
}
