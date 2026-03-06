import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

/**
 * Metro App Bar Separator Component
 *
 * A visual separator line for use within the Metro App Bar. Creates a
 * vertical line between buttons or groups of buttons to visually
 * distinguish different sections of the app bar.
 *
 * Features:
 * - Vertical line separator with standard dimensions
 * - Configurable visibility (can be hidden while preserving layout)
 * - Standard spacing margins on both sides
 * - Semi-transparent styling to blend with Metro design
 *
 * Use within metro-app-bar to separate groups of related buttons.
 *
 * @cssprop --metro-foreground - Foreground color for the separator line (default: #ffffff)
 * @cssprop --metro-spacing-sm - Spacing on both sides of the separator (default: 8px)
 *
 * @csspart separator - The actual separator line element
 */
export class MetroAppBarSeparator extends LitElement {
  static properties = {
    /**
     * Controls the visibility of the separator. When false, the separator
     * is hidden but still occupies space in the layout.
     * @default true
     */
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
