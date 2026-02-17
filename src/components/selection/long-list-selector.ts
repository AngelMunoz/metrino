import { LitElement, html, css, type PropertyValues, type TemplateResult } from "lit";

export interface LongListSelectorItem {
  [key: string]: unknown;
}

export interface LongListSelectorGroup {
  key: string;
  items: LongListSelectorItem[];
}

type SelectionMode = "none" | "single" | "multiple";

const baseStyles = css`
  :host {
    display: block;
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
    position: relative;
  }
  .list-container {
    max-height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 24px;
  }
  ::-webkit-scrollbar {
    width: 4px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: var(--metro-border, rgba(255,255,255,0.2));
    border-radius: 2px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--metro-border, rgba(255,255,255,0.4));
  }
  .group {
    display: block;
  }
  .group-header {
    background: var(--metro-highlight, rgba(255,255,255,0.1));
    color: var(--metro-accent, #0078d4);
    padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: var(--metro-font-size-small, 12px);
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .list-item {
    display: flex;
    align-items: center;
    padding: var(--metro-spacing-md, 12px);
    cursor: pointer;
    color: var(--metro-foreground, #ffffff);
    border-bottom: 1px solid var(--metro-border, rgba(255,255,255,0.1));
    transition: background-color var(--metro-transition-fast, 167ms) ease-out;
    min-height: 44px;
    box-sizing: border-box;
  }
  .list-item:hover {
    background: var(--metro-highlight, rgba(255,255,255,0.1));
  }
  .list-item:focus {
    outline: 2px solid var(--metro-accent, #0078d4);
    outline-offset: -2px;
  }
  .list-item.selected {
    background: var(--metro-accent, #0078d4);
    color: #ffffff;
  }
  .list-item:active {
    background: var(--metro-accent-dark, #005a9e);
  }
  .empty-message {
    padding: var(--metro-spacing-lg, 16px);
    color: var(--metro-foreground-secondary, rgba(255,255,255,0.5));
    text-align: center;
  }
  .jump-list {
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    width: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 400;
    user-select: none;
    pointer-events: none;
    z-index: 2;
    gap: 1px;
  }
  .jump-item {
    width: 20px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--metro-accent, #0078d4);
    pointer-events: auto;
    opacity: 0.6;
    transition: opacity var(--metro-transition-fast, 167ms) ease-out,
                background-color var(--metro-transition-fast, 167ms) ease-out;
  }
  .jump-item:hover {
    opacity: 1;
    background: var(--metro-highlight, rgba(255,255,255,0.1));
  }
  .jump-item.disabled {
    color: var(--metro-foreground-secondary, rgba(255,255,255,0.2));
    cursor: default;
    display: none;
  }
  .jump-list:hover .jump-item:not(.disabled) {
    opacity: 0.9;
  }
`;

export class MetroLongListSelector extends LitElement {
  static properties = {
    items: { type: Array },
    groupKey: { type: String, attribute: "group-key" },
    displayMember: { type: String, attribute: "display-member" },
    valueMember: { type: String, attribute: "value-member" },
    selectionMode: { type: String, attribute: "selection-mode" },
    selectedValue: { type: Object, attribute: "selected-value" },
    maxHeight: { type: String, attribute: "max-height" },
    showJumpList: { type: Boolean, attribute: "show-jump-list" },
  };

  declare items: LongListSelectorItem[];
  declare groupKey: string;
  declare displayMember: string;
  declare valueMember: string;
  declare selectionMode: SelectionMode;
  declare selectedValue: unknown;
  declare maxHeight: string;
  declare showJumpList: boolean;

  static styles = baseStyles;

  #selectedIndices: Set<number> = new Set();

  constructor() {
    super();
    this.items = [];
    this.groupKey = "";
    this.displayMember = "";
    this.valueMember = "";
    this.selectionMode = "none";
    this.selectedValue = null;
    this.maxHeight = "300px";
    this.showJumpList = true;
  }

  render() {
    const groups = this.#getGroupedItems();
    const hasGroups = groups.length > 0 && this.groupKey;

    return html`
      <div class="list-container" style="max-height: ${this.maxHeight}">
        ${this.items.length === 0
          ? html`<div class="empty-message">No items</div>`
          : hasGroups
            ? this.#renderGroupedList(groups)
            : this.#renderFlatList()}
      </div>
      ${this.showJumpList && hasGroups
        ? html`<div class="jump-list" part="jump-list">
            ${this.#renderJumpList(groups)}
          </div>`
        : ""}
    `;
  }

  #getGroupedItems(): LongListSelectorGroup[] {
    if (!this.groupKey || this.items.length === 0) {
      return [];
    }

    const groupMap = new Map<string, LongListSelectorItem[]>();
    const keyOrder: string[] = [];

    for (const item of this.items) {
      const keyValue = String(item[this.groupKey] ?? "#");
      if (!groupMap.has(keyValue)) {
        groupMap.set(keyValue, []);
        keyOrder.push(keyValue);
      }
      groupMap.get(keyValue)!.push(item);
    }

    return keyOrder
      .sort((a, b) => a.localeCompare(b))
      .map(key => ({ key, items: groupMap.get(key)! }));
  }

  #renderGroupedList(groups: LongListSelectorGroup[]): TemplateResult {
    let globalIndex = 0;
    return html`
      ${groups.map(
        group => html`
          <div class="group">
            <div class="group-header" data-group-key="${group.key}">${group.key}</div>
            ${group.items.map(item => {
              const currentIndex = globalIndex++;
              return this.#renderItem(item, currentIndex);
            })}
          </div>
        `
      )}
    `;
  }

  #renderFlatList(): TemplateResult {
    return html`
      ${this.items.map((item, index) => this.#renderItem(item, index))}
    `;
  }

  #renderItem(item: LongListSelectorItem, index: number): TemplateResult {
    const displayText = this.displayMember
      ? String(item[this.displayMember] ?? "")
      : String(item);
    const isSelected = this.#selectedIndices.has(index);

    return html`
      <div
        class="list-item ${isSelected ? "selected" : ""}"
        role="option"
        tabindex="0"
        aria-selected=${isSelected}
        data-index=${index}
        @click=${() => this.#handleItemClick(index)}
        @keydown=${(e: KeyboardEvent) => this.#handleKeyDown(e, index)}
      >
        ${this.#renderItemContent(item, displayText)}
      </div>
    `;
  }

  #renderItemContent(_item: LongListSelectorItem, displayText: string): TemplateResult {
    return html`<span>${displayText}</span>`;
  }

  #renderJumpList(groups: LongListSelectorGroup[]): TemplateResult[] {
    const availableKeys = new Set(groups.map(g => g.key.toUpperCase()));
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

    return alphabet.map(letter => {
      const hasItems = availableKeys.has(letter);
      return html`
        <span
          class="jump-item ${hasItems ? "" : "disabled"}"
          @click=${hasItems ? () => this.#jumpToGroup(letter) : undefined}
        >${letter}</span>
      `;
    });
  }

  #handleItemClick(index: number): void {
    if (this.selectionMode === "none") {
      this.dispatchEvent(
        new CustomEvent("itemclick", {
          detail: { item: this.items[index], index },
          bubbles: true,
          composed: true,
        })
      );
      return;
    }

    if (this.selectionMode === "single") {
      this.#selectedIndices.clear();
      this.#selectedIndices.add(index);
      this.selectedValue = this.#getValue(this.items[index]);
    } else if (this.selectionMode === "multiple") {
      if (this.#selectedIndices.has(index)) {
        this.#selectedIndices.delete(index);
      } else {
        this.#selectedIndices.add(index);
      }
    }

    this.requestUpdate();
    this.#dispatchSelectionChange();
  }

  #handleKeyDown(e: KeyboardEvent, index: number): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.#handleItemClick(index);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.#focusNext(index);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.#focusPrevious(index);
    }
  }

  #focusNext(currentIndex: number): void {
    const nextIndex = Math.min(currentIndex + 1, this.items.length - 1);
    this.#focusItem(nextIndex);
  }

  #focusPrevious(currentIndex: number): void {
    const prevIndex = Math.max(currentIndex - 1, 0);
    this.#focusItem(prevIndex);
  }

  #focusItem(index: number): void {
    const item = this.shadowRoot?.querySelector(`[data-index="${index}"]`) as HTMLElement;
    item?.focus();
    const container = this.shadowRoot?.querySelector(".list-container") as HTMLElement;
    if (item && container) {
      const itemTop = item.offsetTop - container.offsetTop;
      container.scrollTop = itemTop - 10;
    }
  }

  #jumpToGroup(letter: string): void {
    const groupHeader = this.shadowRoot?.querySelector(
      `[data-group-key="${letter}"], [data-group-key="${letter.toLowerCase()}"]`
    ) as HTMLElement;
    const container = this.shadowRoot?.querySelector(".list-container") as HTMLElement;
    if (groupHeader && container) {
      const headerTop = groupHeader.offsetTop - container.offsetTop;
      container.scrollTo({
        top: headerTop,
        behavior: "smooth",
      });
    }
  }

  #getValue(item: LongListSelectorItem): unknown {
    return this.valueMember ? item[this.valueMember] : item;
  }

  #dispatchSelectionChange(): void {
    const selectedItems = Array.from(this.#selectedIndices).map(i => this.items[i]);
    this.dispatchEvent(
      new CustomEvent("selectionchange", {
        detail: {
          selectedItems,
          selectedIndices: Array.from(this.#selectedIndices),
          selectedValue: this.selectedValue,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("items")) {
      this.#selectedIndices.clear();
      if (this.selectedValue !== null && this.selectionMode !== "none") {
        this.#syncSelectionFromValue();
      }
    }
    if (changedProperties.has("selectedValue") && this.selectedValue !== null && this.selectionMode !== "none") {
      this.#syncSelectionFromValue();
    }
  }

  protected updated(_changedProperties: PropertyValues<this>): void {}

  #syncSelectionFromValue(): void {
    this.#selectedIndices.clear();
    for (let i = 0; i < this.items.length; i++) {
      if (this.#getValue(this.items[i]) === this.selectedValue) {
        this.#selectedIndices.add(i);
        break;
      }
    }
  }

  getSelectedItems(): LongListSelectorItem[] {
    return Array.from(this.#selectedIndices).map(i => this.items[i]);
  }

  getSelectedIndices(): number[] {
    return Array.from(this.#selectedIndices);
  }

  clearSelection(): void {
    this.#selectedIndices.clear();
    this.selectedValue = null;
    this.requestUpdate();
  }

  setItems(items: LongListSelectorItem[]): void {
    this.items = items;
  }
}

customElements.define("metro-long-list-selector", MetroLongListSelector);

declare global {
  interface HTMLElementTagNameMap {
    "metro-long-list-selector": MetroLongListSelector;
  }
}
