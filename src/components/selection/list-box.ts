import { LitElement, html, css } from "lit";
import { baseTypography, disabledState, scrollbarVisible } from "../../styles/shared.ts";

type SelectionMode = "single" | "multiple" | "extended";

export class MetroListBox extends LitElement {
  static formAssociated = true;

  static properties = {
    disabled: { type: Boolean, reflect: true },
    name: { type: String, reflect: true },
    selectionMode: { type: String, reflect: true, attribute: "selection-mode" },
  };

  declare disabled: boolean;
  declare name: string;
  declare selectionMode: SelectionMode;

  static styles = [
    baseTypography,
    disabledState,
    scrollbarVisible,
    css`
      :host {
        display: block;
        border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
        background: var(--metro-background, #1f1f1f);
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
        border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.1));
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        user-select: none;
      }
      ::slotted(.list-item:hover) {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      ::slotted(.list-item[selected]) {
        background: var(--metro-accent, #0078d4);
        color: #ffffff;
      }
      ::slotted(.list-item .selection-indicator) {
        width: 16px;
        height: 16px;
        border: 2px solid var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
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
        transition: opacity var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      ::slotted(.list-item[selected] .selection-indicator::after) {
        opacity: 1;
      }
    `,
  ];

  #selectedIndices: Set<number> = new Set();
  #lastSelectedIndex = -1;
  #internals: ElementInternals;

  constructor() {
    super();
    this.disabled = false;
    this.name = "";
    this.selectionMode = "single";
    this.#internals = this.attachInternals();
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
    
    this.#updateFormValue();
    
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

  #updateFormValue(): void {
    const selectedValues = this.#getSelectedValues();
    
    if (selectedValues.length === 0) {
      this.#internals.setFormValue(null);
    } else if (selectedValues.length === 1) {
      this.#internals.setFormValue(selectedValues[0]);
    } else {
      const formData = new FormData();
      for (const val of selectedValues) {
        formData.append(this.name || "list-box", val);
      }
      this.#internals.setFormValue(formData);
    }
  }

  #getSelectedValues(): string[] {
    const items = this.querySelectorAll(".list-item");
    const selectedItems = Array.from(this.#selectedIndices).map(i => items[i]).filter(Boolean);
    return selectedItems.map(item => {
      const dataValue = item.getAttribute("data-value");
      return dataValue !== null ? dataValue : (item.textContent?.trim() || "");
    });
  }

  get value(): string[] {
    return this.#getSelectedValues();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.#clearSelection();
    this.#updateFormValue();
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
