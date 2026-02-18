import { LitElement, html, css } from "lit";
import { baseTypography, modalBackdrop, scrollbarVisible, closeButton } from "../../styles/shared.ts";

export type ListPickerItem = string | { label: string; value: string; icon?: string };

function getItemLabel(item: ListPickerItem): string {
  return typeof item === "string" ? item : item.label;
}

function getItemIcon(item: ListPickerItem): string | undefined {
  return typeof item === "string" ? undefined : item.icon;
}

export class MetroListPicker extends LitElement {
  static properties = {
    items: { type: Array },
    selectedIndex: { type: Number, attribute: "selected-index", reflect: true },
    title: { type: String },
    open: { type: Boolean, reflect: true },
  };

  declare items: ListPickerItem[];
  declare selectedIndex: number;
  declare title: string;
  declare open: boolean;

  static styles = [
    baseTypography,
    modalBackdrop,
    scrollbarVisible,
    closeButton,
    css`
      :host {
        display: none;
      }
      :host([open]) {
        display: block;
      }
      .picker-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 1000;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        animation: overlayEnter var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      @keyframes overlayEnter {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      .picker-container {
        width: 100%;
        max-height: 80vh;
        background: var(--metro-background, #1f1f1f);
        animation: pickerSlideUp var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        display: flex;
        flex-direction: column;
      }
      @keyframes pickerSlideUp {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }
      .picker-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
        border-bottom: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }
      .picker-title {
        font-size: var(--metro-font-size-medium, 16px);
        font-weight: 600;
        color: var(--metro-foreground, #ffffff);
        margin: 0;
      }
      .close-btn {
        font-size: 24px;
      }
      .picker-list {
        list-style: none;
        margin: 0;
        padding: 0;
        overflow-y: auto;
        flex: 1;
      }
      .picker-item {
        display: flex;
        align-items: center;
        gap: var(--metro-spacing-sm, 8px);
        padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
        cursor: pointer;
        color: var(--metro-foreground, #ffffff);
        font-size: var(--metro-font-size-normal, 14px);
        border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.1));
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        user-select: none;
      }
      .picker-item:hover {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      .picker-item:active {
        background: var(--metro-accent, #0078d4);
      }
      .picker-item[selected] {
        background: var(--metro-accent, #0078d4);
        color: #ffffff;
      }
      .picker-item .checkmark {
        width: 16px;
        height: 16px;
        margin-inline-start: auto;
        opacity: 0;
      }
      .picker-item[selected] .checkmark {
        opacity: 1;
      }
    `,
  ];

  #boundKeydown: (e: KeyboardEvent) => void;

  constructor() {
    super();
    this.items = [];
    this.selectedIndex = -1;
    this.title = "";
    this.open = false;
    this.#boundKeydown = this.#handleKeydown.bind(this);
  }

  render() {
    return html`
      ${this.open
        ? html`
            <div class="picker-overlay" @click=${this.#handleOverlayClick}>
              <div class="picker-container" @click=${(e: Event) => e.stopPropagation()}>
                <div class="picker-header">
                  <h3 class="picker-title">${this.title}</h3>
                  <button class="close-btn" @click=${this.#close} aria-label="Close">×</button>
                </div>
                <ul class="picker-list" role="listbox">
                  ${this.items.map(
                    (item, index) => html`
                      <li
                        class="picker-item"
                        role="option"
                        ?selected=${index === this.selectedIndex}
                        @click=${() => this.#selectItem(index)}
                      >
                        ${getItemIcon(item) ? html`<span class="item-icon">${getItemIcon(item)}</span>` : ""}
                        <span class="item-label">${getItemLabel(item)}</span>
                        <svg class="checkmark" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </li>
                    `,
                  )}
                </ul>
              </div>
            </div>
          `
        : ""}
    `;
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("keydown", this.#boundKeydown);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("keydown", this.#boundKeydown);
  }

  #handleKeydown(e: KeyboardEvent): void {
    if (!this.open) return;
    if (e.key === "Escape") {
      this.#close();
    }
  }

  #handleOverlayClick(): void {
    this.#close();
  }

  #selectItem(index: number): void {
    this.selectedIndex = index;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          index,
          item: this.items[index],
        },
        bubbles: true,
        composed: true,
      }),
    );
    this.#close();
  }

  #close(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true }));
  }

  show(): void {
    this.open = true;
    this.dispatchEvent(new CustomEvent("open", { bubbles: true, composed: true }));
  }

  hide(): void {
    this.#close();
  }
}

customElements.define("metro-list-picker", MetroListPicker);

declare global {
  interface HTMLElementTagNameMap {
    "metro-list-picker": MetroListPicker;
  }
}
