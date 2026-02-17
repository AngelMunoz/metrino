import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

export class MetroAppBarSeparator extends LitElement {
  static properties = {
    visible: { type: Boolean, reflect: true },
  };

  declare visible: boolean;

  static styles = [
    baseTypography,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 1px;
        height: 48px;
        margin: 0 var(--metro-spacing-sm, 8px);
      }
      :host(:not([visible])) {
        display: none;
      }
      .separator {
        width: 1px;
        height: 28px;
        background: var(--metro-foreground, #ffffff);
        opacity: 0.25;
      }
    `,
  ];

  constructor() {
    super();
    this.visible = true;
  }

  render() {
    return html`<div class="separator"></div>`;
  }
}

customElements.define("metro-app-bar-separator", MetroAppBarSeparator);

declare global {
  interface HTMLElementTagNameMap {
    "metro-app-bar-separator": MetroAppBarSeparator;
  }
}
