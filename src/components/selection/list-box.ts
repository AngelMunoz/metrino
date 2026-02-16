import { LitElement, html, css } from "lit";

type SelectionMode = "single" | "multiple" | "extended";

const baseStyles = css`
  :host {
    display: block;
    font-family: var(--metro-font-family, system-ui, -apple-system, sans-serif);
    border: 2px solid var(--metro-border, rgba(255,255,255,0.2));
    background: var(--metro-background, #1f1f1f);
  }
  :host([disabled]) {
    opacity: 0.4;
  }
  .list-container {
    max-height: 200px;
    overflow-y: auto;
  }
  ::slotted(.list-item) {
    display: flex;
    align-items: center;
    gap: var(--metro-spacing-sm, 8px);
    padding: var(--metro-spacing-md, 12px);
    cursor: pointer;
    color: var(--metro-foreground, #ffffff);
    border-bottom: 1px solid var(--metro-border, rgba(255,255,255,0.1));
    transition: background-color var(--metro-transition-fast, 167ms) ease-out;
    user-select: none;
  }
  ::slotted(.list-item:hover) {
    background: var(--metro-highlight, rgba(255,255,255,0.1));
  }
  ::slotted(.list-item[selected]) {
    background: var(--metro-accent, #0078d4);
    color: #ffffff;
  }
  ::slotted(.list-item .selection-indicator) {
    width: 16px;
    height: 16px;
    border: 2px solid var(--metro-foreground-secondary, rgba(255,255,255,0.5));
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--metro-transition-fast, 167ms) ease-out;
  }
  ::slotted(.list-item[selected] .selection-indicator) {
    background: #ffffff;
    border-color: #ffffff;
  }
  ::slotted(.list-item .selection-indicator::after) {
    content: "";
    width: 8px;
    height: 8px;
    background: var(--metro-accent, #0078d4);
    opacity: 0;
    transition: opacity var(--metro-transition-fast, 167ms) ease-out;
  }
  ::slotted(.list-item[selected] .selection-indicator::after) {
    opacity: 1;
  }
  ::-webkit-scrollbar {
    width: 8px;
  }
  ::-webkit-scrollbar-thumb {
    background: var(--metro-border, rgba(255,255,255,0.2));
    border-radius: 4px;
  }
`;

export class MetroListBox extends LitElement {
  static properties = {
    disabled: { type: Boolean, reflect: true },
    selectionMode: { type: String, reflect: true },
  };

  declare disabled: boolean;
  declare selectionMode: SelectionMode;

  static styles = baseStyles;

  #selectedIndices: Set<number> = new Set();
  #lastSelectedIndex = -1;

  constructor() {
    super();
    this.disabled = false;
    this.selectionMode = "single";
  }

  render() {
    return html`
      <div class="list-container" role="listbox" ?aria-disabled=${this.disabled} ?aria-multiselectable=${this.selectionMode !== "single"}>
        <slot @slotchange=${this.#setupItems}></slot>
      </div>
    `;
  }

  #setupItems(): void {
    const items = this.querySelectorAll(".list-item");
    items.forEach((item, index) => {
      item.setAttribute("data-index", String(index));
      item.addEventListener("click", (e) => this.#handleItemClick(e, index));
    });
  }

  #handleItemClick(e: Event, index: number): void {
    if (this.disabled) return;
    
    const isCtrlClick = (e as MouseEvent).ctrlKey || (e as MouseEvent).metaKey;
    const isShiftClick = (e as MouseEvent).shiftKey;
    
    switch (this.selectionMode) {
      case "single":
        this.#clearSelection();
        this.#selectItem(index);
        break;
        
      case "multiple":
        this.#toggleItem(index);
        break;
        
      case "extended":
        if (isCtrlClick) {
          this.#toggleItem(index);
        } else if (isShiftClick && this.#lastSelectedIndex >= 0) {
          this.#selectRange(this.#lastSelectedIndex, index);
        } else {
          this.#clearSelection();
          this.#selectItem(index);
        }
        break;
    }
    
    this.#lastSelectedIndex = index;
    this.#emitSelectionChanged();
  }

  #selectItem(index: number): void {
    this.#selectedIndices.add(index);
    const items = this.querySelectorAll(".list-item");
    if (items[index]) {
      items[index].toggleAttribute("selected", true);
    }
  }

  #toggleItem(index: number): void {
    const items = this.querySelectorAll(".list-item");
    if (this.#selectedIndices.has(index)) {
      this.#selectedIndices.delete(index);
      if (items[index]) {
        items[index].toggleAttribute("selected", false);
      }
    } else {
      this.#selectItem(index);
    }
  }

  #selectRange(start: number, end: number): void {
    const min = Math.min(start, end);
    const max = Math.max(start, end);
    for (let i = min; i <= max; i++) {
      this.#selectItem(i);
    }
  }

  #clearSelection(): void {
    this.#selectedIndices.clear();
    const items = this.querySelectorAll(".list-item");
    items.forEach(item => item.removeAttribute("selected"));
  }

  #emitSelectionChanged(): void {
    const items = this.querySelectorAll(".list-item");
    const selectedItems = Array.from(this.#selectedIndices).map(i => items[i]).filter(Boolean);
    const selectedValues = selectedItems.map(item => item.textContent);
    
    this.dispatchEvent(new CustomEvent("selectionchanged", {
      detail: { 
        selectedIndices: Array.from(this.#selectedIndices),
        selectedItems,
        selectedValues
      },
      bubbles: true,
      composed: true,
    }));
  }

  get selectedIndices(): number[] {
    return Array.from(this.#selectedIndices);
  }

  get selectedItems(): Element[] {
    const items = this.querySelectorAll(".list-item");
    return Array.from(this.#selectedIndices).map(i => items[i]).filter(Boolean);
  }

  selectAll(): void {
    if (this.selectionMode === "single") return;
    const items = this.querySelectorAll(".list-item");
    items.forEach((_, index) => this.#selectItem(index));
    this.#emitSelectionChanged();
  }

  clearSelection(): void {
    this.#clearSelection();
    this.#emitSelectionChanged();
  }
}

customElements.define("metro-list-box", MetroListBox);

declare global {
  interface HTMLElementTagNameMap {
    "metro-list-box": MetroListBox;
  }
}
