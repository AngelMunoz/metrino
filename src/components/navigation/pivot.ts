import { LitElement, html, css } from "lit";
import { baseTypography, scrollbarHiddenClass } from "../../styles/shared.ts";

export class MetroPivot extends LitElement {
  static properties = {
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
