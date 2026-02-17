import { LitElement, html, css } from "lit";
import { baseTypography, scrollbarHiddenClass } from "../../styles/shared.ts";

export class MetroHub extends LitElement {
  static properties = {
    title: { type: String },
  };

  declare title: string;

  static styles = [
    baseTypography,
    scrollbarHiddenClass,
    css`
      :host {
        display: block;
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
      }
      ::slotted(metro-hub-section) {
        flex: 0 0 auto;
        min-width: 250px;
      }
    `,
  ];

  render() {
    return html`
      ${this.title ? html`<h2 class="hub-title">${this.title}</h2>` : ""}
      <div class="hub-container scrollbar-hidden">
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
