import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: block;
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
  }
  .hub-container {
    display: flex;
    flex-wrap: wrap;
    gap: var(--metro-spacing-lg, 16px);
    padding: var(--metro-spacing-lg, 16px);
  }
  .hub-title {
    font-size: var(--metro-font-size-xlarge, 28px);
    font-weight: 300;
    color: var(--metro-foreground, #ffffff);
    margin: 0 0 var(--metro-spacing-lg, 16px) 0;
    padding: 0 var(--metro-spacing-lg, 16px);
  }
`;

export class MetroHub extends LitElement {
  static properties = {
    title: { type: String },
  };

  declare title: string;

  static styles = baseStyles;

  render() {
    return html`
      ${this.title ? html`<h2 class="hub-title">${this.title}</h2>` : ""}
      <div class="hub-container">
        <slot></slot>
      </div>
    `;
  }
}

customElements.define("metro-hub", MetroHub);

declare global {
  interface HTMLElementTagNameMap {
    "metro-hub": MetroHub;
  }
}
