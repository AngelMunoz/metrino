import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";
import "./icon.ts";

/**
 * Metro Expander Component
 *
 * A collapsible content container with a clickable header. Features smooth
 * height animation when expanding/collapsing and a rotating chevron icon
 * to indicate state.
 *
 * Features:
 * - Clickable header to toggle expanded state
 * - Smooth height transition animation (max-height based)
 * - Rotating chevron icon indicating state
 * - Optional title attribute or slot for header content
 * - Highlight background on header hover
 * - ARIA expanded state support
 *
 * Use for collapsible sections of content, FAQ-style layouts, or anywhere
 * you need to show/hide content while preserving layout space.
 *
 * @fires expanded - Fired when the expander state changes
 *   Detail: { expanded: boolean }
 *
 * @cssprop --metro-background - Background color (default: #1f1f1f)
 * @cssprop --metro-highlight - Header background color (default: rgba(255, 255, 255, 0.1))
 * @cssprop --metro-highlight-hover - Header hover color (default: rgba(255, 255, 255, 0.15))
 * @cssprop --metro-foreground - Title text color (default: #ffffff)
 * @cssprop --metro-foreground-secondary - Icon color (default: rgba(255, 255, 255, 0.6))
 * @cssprop --metro-spacing-md - Medium spacing (default: 12px)
 * @cssprop --metro-spacing-lg - Large spacing (default: 16px)
 * @cssprop --metro-transition-fast - Header transition (default: 167ms)
 * @cssprop --metro-transition-slow - Content transition (default: 333ms)
 * @cssprop --metro-easing - Easing curve (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 * @cssprop --metro-font-size-normal - Title font size (default: 14px)
 *
 * @slot - Default slot for collapsible content
 * @slot header - Slot for custom header content (used when title attribute not set)
 *
 * @csspart expander-header - The clickable header element
 * @csspart expander-title - The title text element
 * @csspart expander-icon - The chevron icon element
 * @csspart expander-content - The collapsible content container
 * @csspart expander-inner - The inner content wrapper
 */
export class MetroExpander extends LitElement {
  static properties = {
    /**
     * Controls whether the expander is open (expanded) or closed (collapsed).
     * When true, the content area is visible with height animation.
     * @default false
     */
    expanded: { type: Boolean, reflect: true },
    /**
     * Title text displayed in the header. If not provided, the "header" slot
     * is used instead for custom header content.
     * @default ""
     */
    title: { type: String, reflect: true },
  };

  declare expanded: boolean;
  declare title: string;

  static styles = [
    baseTypography,
    css`
      :host {
        display: block;
        background: var(--metro-background, #1f1f1f);
      }
      .expander-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
        cursor: pointer;
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .expander-header:hover {
        background: var(--metro-highlight-hover, rgba(255, 255, 255, 0.15));
      }
      .expander-title {
        font-size: var(--metro-font-size-normal, 14px);
        font-weight: 400;
        color: var(--metro-foreground, #ffffff);
      }
      .expander-icon {
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        transition: transform var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        font-size: 12px;
      }
      :host([expanded]) .expander-icon {
        transform: rotate(180deg);
      }
      .expander-content {
        max-height: 0;
        overflow: hidden;
        transition: max-height var(--metro-transition-slow, 333ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      :host([expanded]) .expander-content {
        max-height: 500px;
      }
      .expander-inner {
        padding: var(--metro-spacing-lg, 16px);
      }
    `,
  ];

  constructor() {
    super();
    this.expanded = false;
    this.title = "";
  }

  render() {
    return html`
      <div class="expander-header" @click=${this.#toggle}>
        <span class="expander-title"
          >${this.title || html`<slot name="header"></slot>`}</span
        >
        <metro-icon class="expander-icon" icon="chevron-down" size="small"></metro-icon>
      </div>
      <div class="expander-content">
        <div class="expander-inner">
          <slot></slot>
        </div>
      </div>
    `;
  }

  /**
   * Toggles the expanded state and dispatches the expanded event.
   * @returns void
   */
  #toggle(): void {
    this.expanded = !this.expanded;
    this.dispatchEvent(
      new CustomEvent("expanded", {
        detail: { expanded: this.expanded },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define("metro-expander", MetroExpander);

declare global {
  interface HTMLElementTagNameMap {
    "metro-expander": MetroExpander;
  }
}
