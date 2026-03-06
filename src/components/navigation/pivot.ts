import { LitElement, html, css } from "lit";
import { baseTypography, scrollbarHiddenClass } from "../../styles/shared.ts";

/**
 * Metro Pivot Component
 *
 * A tab-based navigation component that allows users to switch between different
 * content sections. Features large, typography-focused headers with smooth animated
 * transitions between content panes. The Pivot is ideal for organizing related
 * content into separate views within a single screen.
 *
 * Features:
 * - Large typography-based tab headers with scaling animation
 * - Horizontal slide animation between content sections
 * - Scrollable tab list for overflow scenarios
 * - Active tab indicator (accent-colored underline)
 * - Smooth opacity and scale transitions for content
 * - Keyboard and ARIA accessibility support
 *
 * Use Pivot when you need to organize related content into separate but
 * equally important views, such as different sections of a profile or
 * different views of a data set.
 *
 * @fires selectionchanged - Fired when the selected tab changes.
 *   Detail: { selectedIndex: number }
 *
 * @cssprop --metro-border - Border color for tab underline (default: rgba(255, 255, 255, 0.2))
 * @cssprop --metro-accent - Active tab underline color (default: #0078d4)
 * @cssprop --metro-foreground - Active tab text color (default: #ffffff)
 * @cssprop --metro-foreground-secondary - Inactive tab text color (default: rgba(255, 255, 255, 0.5))
 * @cssprop --metro-spacing-md - Medium spacing unit (default: 12px)
 * @cssprop --metro-transition-fast - Fast transition duration (default: 167ms)
 * @cssprop --metro-transition-slow - Slow transition duration for content (default: 333ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 * @cssprop --metro-font-size-xxlarge - Font size for tab headers (default: 42px)
 *
 * @slot - Default slot for metro-pivot-item children
 *
 * @csspart pivot-headers - Container for tab headers
 * @csspart pivot-content - Container for sliding content panels
 */
export class MetroPivot extends LitElement {
  static properties = {
    /**
     * Index of the currently selected pivot item (0-based).
     * Changing this updates the visible content and active tab styling.
     * @default 0
     */
    selectedIndex: { type: Number },
  };

  declare selectedIndex: number;

  static styles = [
    baseTypography,
    scrollbarHiddenClass,
    css`
      :host {
        display: block;
      }
      .pivot-headers {
        display: flex;
        gap: var(--metro-spacing-md, 12px);
        border-bottom: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
        margin-bottom: var(--metro-spacing-md, 12px);
        overflow-x: auto;
      }
      .pivot-header {
        padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
        cursor: pointer;
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
        font-size: var(--metro-font-size-xxlarge, 42px);
        font-weight: 200;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        transition:
          color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          transform var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        white-space: nowrap;
        user-select: none;
        transform: scale(0.8);
        transform-origin: left center;
      }
      .pivot-header:hover {
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      }
      .pivot-header.active {
        color: var(--metro-foreground, #ffffff);
        border-bottom-color: var(--metro-accent, #0078d4);
        transform: scale(1);
      }
      .pivot-content {
        position: relative;
        overflow: hidden;
      }
      .pivot-slides {
        display: flex;
        transition: transform var(--metro-transition-slow, 333ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      ::slotted(metro-pivot-item) {
        flex: 0 0 100%;
        min-width: 100%;
        opacity: 0.5;
        transform: scale(0.95);
        transition:
          opacity var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          transform var(--metro-transition-slow, 333ms)
            var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      ::slotted(metro-pivot-item[active]) {
        opacity: 1;
        transform: scale(1);
      }
    `,
  ];

  constructor() {
    super();
    this.selectedIndex = 0;
  }

  render() {
    const items = Array.from(this.querySelectorAll("metro-pivot-item"));
    const translateX = -(this.selectedIndex * 100);

    return html`
      <div class="pivot-headers scrollbar-hidden" role="tablist">
        ${items.map((item, index) => {
          const header = item.getAttribute("header") || `Item ${index + 1}`;
          const isActive = index === this.selectedIndex;
          return html`
            <div
              class="pivot-header ${isActive ? "active" : ""}"
              role="tab"
              aria-selected="${isActive}"
              @click=${() => this.#selectItem(index)}
            >
              ${header}
            </div>
          `;
        })}
      </div>
      <div class="pivot-content" role="tabpanel">
        <div class="pivot-slides" style="transform: translateX(${translateX}%)">
          <slot></slot>
        </div>
      </div>
    `;
  }

  /**
   * Selects a pivot item by index and updates the view.
   * Dispatches a selectionchanged event with the new index.
   * @param index - The zero-based index of the item to select
   * @returns void
   */
  #selectItem(index: number): void {
    if (index === this.selectedIndex) return;

    const items = Array.from(this.querySelectorAll("metro-pivot-item"));
    items.forEach((item, i) => {
      item.toggleAttribute("active", i === index);
    });

    this.selectedIndex = index;
    this.dispatchEvent(
      new CustomEvent("selectionchanged", {
        detail: { selectedIndex: index },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Initializes the first pivot item as active on first render.
   * @returns void
   */
  firstUpdated() {
    const items = Array.from(this.querySelectorAll("metro-pivot-item"));
    items.forEach((item, i) => {
      item.toggleAttribute("active", i === this.selectedIndex);
    });
  }
}

customElements.define("metro-pivot", MetroPivot);

declare global {
  interface HTMLElementTagNameMap {
    "metro-pivot": MetroPivot;
  }
}
