import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: block;
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
  }
  .hub-title {
    font-size: var(--metro-font-size-xxlarge, 42px);
    font-weight: 200;
    color: var(--metro-foreground, #ffffff);
    margin: 0 0 var(--metro-spacing-xl, 24px) 0;
    padding: 0 var(--metro-spacing-lg, 16px);
  }
  .hub-container {
    display: flex;
    gap: var(--metro-spacing-xl, 24px);
    padding: 0 var(--metro-spacing-lg, 16px);
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .hub-container::-webkit-scrollbar {
    display: none;
  }
  ::slotted(metro-hub-section) {
    flex: 0 0 auto;
    min-width: 250px;
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
