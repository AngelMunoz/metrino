import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

/**
 * Metro Hub Section Component
 *
 * A child component for MetroHub that represents a single horizontally-scrolling
 * section. Each section has an optional clickable header and a content area
 * for hosting tiles, lists, or other content.
 *
 * Features:
 * - Optional clickable section header with hover accent color
 * - Large typography-focused header styling
 * - Flexible content area with standard padding
 * - Designed to be used within metro-hub for horizontal scrolling layouts
 *
 * Use as children of metro-hub. Set the "header" attribute to define the
 * section title. The header is clickable and changes to accent color on hover.
 *
 * @cssprop --metro-foreground - Header text color (default: #ffffff)
 * @cssprop --metro-accent - Header hover color (default: #0078d4)
 * @cssprop --metro-spacing-sm - Small spacing unit (default: 8px)
 * @cssprop --metro-spacing-md - Medium spacing unit (default: 12px)
 * @cssprop --metro-transition-fast - Transition duration (default: 167ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 * @cssprop --metro-font-size-xxlarge - Font size for the header (default: 42px)
 *
 * @slot - Default slot for section content (tiles, lists, etc.)
 *
 * @csspart section-header - The clickable header element
 * @csspart section-content - The content container
 */
export class MetroHubSection extends LitElement {
  static properties = {
    /**
     * Text displayed as the section header.
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
