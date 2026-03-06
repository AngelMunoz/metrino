import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

/**
 * Metro Panorama Item Component
 *
 * A child component for MetroPanorama that represents a single scrollable panel.
 * Each PanoramaItem is displayed at 85% width with snap-point alignment,
 * creating a peek-at-next-item effect that encourages horizontal exploration.
 *
 * Features:
 * - Optional header displayed in accent color
 * - Semi-transparent background for visual distinction
 * - Flexbox layout with scrollable content area
 * - Designed to be used within metro-panorama for immersive scrolling
 *
 * Use as children of metro-panorama. Set the "header" attribute to define
 * the panel title displayed at the top.
 *
 * @cssprop --metro-accent - Header text color (default: #0078d4)
 * @cssprop --metro-highlight - Background color (default: rgba(255,255,255,0.1))
 * @cssprop --metro-spacing-md - Medium spacing unit (default: 12px)
 * @cssprop --metro-spacing-lg - Large spacing unit (default: 16px)
 * @cssprop --metro-font-size-large - Font size for header (default: 20px)
 *
 * @slot - Default slot for panel content
 *
 * @csspart item-header - The panel header element
 * @csspart item-content - The scrollable content container
 */
export class MetroPanoramaItem extends LitElement {
  static properties = {
    /**
     * Text displayed as the panel header in accent color.
     * If not provided, no header is rendered.
     * @default ""
     */
    header: { type: String, reflect: true },
  };

  declare header: string;

  static styles = [
    baseTypography,
    css`
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
    `,
  ];

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
