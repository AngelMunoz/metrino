import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: flex;
    flex-direction: column;
    min-width: 200px;
    flex: 1;
  }
  .section-header {
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
    font-size: var(--metro-font-size-xxlarge, 42px);
    font-weight: 200;
    color: var(--metro-foreground, #ffffff);
    margin: 0 0 var(--metro-spacing-md, 12px) 0;
    padding: var(--metro-spacing-sm, 8px) 0;
    cursor: pointer;
    transition: color var(--metro-transition-fast, 167ms) ease-out;
    user-select: none;
  }
  .section-header:hover {
    color: var(--metro-accent, #0078d4);
  }
  .section-content {
    padding: var(--metro-spacing-md, 12px);
    padding-top: 0;
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
      <div class="section-content">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("metro-hub-section", MetroHubSection);

declare global {
  interface HTMLElementTagNameMap {
    "metro-hub-section": MetroHubSection;
  }
}
