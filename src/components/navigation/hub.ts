import { LitElement, html, css } from "lit";
import { baseTypography, scrollbarHiddenClass } from "../../styles/shared.ts";

/**
 * Metro Hub Component
 *
 * A horizontal scrolling container that groups related sections with headers.
 * The Hub is designed for organizing large amounts of related content into
 * distinct, independently scrollable sections. Similar to the Windows Phone Hub concept.
 *
 * Features:
 * - Optional main title displayed above the section container
 * - Horizontal scrolling for sections with hidden scrollbar
 * - Large, typography-focused section headers
 * - Flexible section sizing with minimum widths
 * - Touch-friendly horizontal scrolling
 *
 * Use the Hub when you need to present multiple distinct content sections
 * that users can horizontally navigate between. Combine with metro-hub-section
 * children to create individual sections.
 *
 * @cssprop --metro-foreground - Title text color (default: #ffffff)
 * @cssprop --metro-spacing-lg - Large spacing unit (default: 16px)
 * @cssprop --metro-spacing-xl - Extra large spacing unit (default: 24px)
 * @cssprop --metro-font-size-xxlarge - Font size for the main title (default: 42px)
 *
 * @slot - Default slot for metro-hub-section children
 *
 * @csspart hub-title - The main title element
 * @csspart hub-container - The horizontal scrolling container
 */
export class MetroHub extends LitElement {
  static properties = {
    /**
     * Main title displayed at the top of the hub.
     * If not provided, no title is rendered.
     * @default ""
     */
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
