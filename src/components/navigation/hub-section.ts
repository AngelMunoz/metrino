import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

export class MetroHubSection extends LitElement {
  static properties = {
    header: { type: String, reflect: true },
  };

  declare header: string;

  static styles = [
    baseTypography,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-width: 200px;
        flex: 1;
      }
      .section-header {
        font-size: var(--metro-font-size-xxlarge, 42px);
        font-weight: 200;
        color: var(--metro-foreground, #ffffff);
        margin: 0 0 var(--metro-spacing-md, 12px) 0;
        padding: var(--metro-spacing-sm, 8px) 0;
        cursor: pointer;
        transition: color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        user-select: none;
      }
      .section-header:hover {
        color: var(--metro-accent, #0078d4);
      }
      .section-content {
        padding: var(--metro-spacing-md, 12px);
        padding-top: 0;
      }
    `,
  ];

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
