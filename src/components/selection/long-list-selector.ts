import { LitElement, html, css, type PropertyValues, type TemplateResult, nothing } from "lit";
import { baseTypography, scrollbarVisible } from "../../styles/shared.ts";

export interface LongListSelectorItem {
  [key: string]: unknown;
}

export interface LongListSelectorGroup {
  key: string;
  items: LongListSelectorItem[];
  indices: number[];
  headerOffset: number;
  contentHeight: number;
}

type SelectionMode = "none" | "single" | "multiple";

const ITEM_HEIGHT = 44;
const GROUP_HEADER_HEIGHT = 32;
const OVERSCAN = 10;

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

  static styles = [
    baseTypography,
    scrollbarVisible,
    css`
      :host {
        display: block;
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
      ::-webkit-scrollbar-thumb {
        border-radius: 2px;
      }
      .viewport {
        position: relative;
        overflow: hidden;
      }
      .group-header {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        color: var(--metro-accent, #0078d4);
        padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: var(--metro-font-size-small, 12px);
        height: ${GROUP_HEADER_HEIGHT}px;
        box-sizing: border-box;
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
        border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.1));
        transition: background-color var(--metro-transition-fast, 167ms) ease-out;
        height: ${ITEM_HEIGHT}px;
        box-sizing: border-box;
      }
      .list-item:hover {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
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
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
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
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      .jump-item.disabled {
        display: none;
      }
      .jump-list:hover .jump-item:not(.disabled) {
        opacity: 0.9;
      }
    `,
  ];

  #selectedIndices: Set<number> = new Set();
  #groups: LongListSelectorGroup[] = [];
  #totalHeight = 0;
  #scrollTop = 0;
  #clientHeight = 300;
  #jumpListCache: Map<string, LongListSelectorGroup> = new Map();

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
    const hasGroups = this.#groups.length > 0 && this.groupKey;

    if (this.items.length === 0) {
      return html`
        <div class="list-container" style="max-height: ${this.maxHeight}">
          <div class="empty-message">No items</div>
        </div>
      `;
    }

    return html`
      <div
        class="list-container"
        style="max-height: ${this.maxHeight}"
        @scroll=${this.#onScroll}
      >
        <div class="viewport" style="height: ${this.#totalHeight}px;">
          ${hasGroups ? this.#renderGroupedContent() : this.#renderFlatContent()}
        </div>
      </div>
      ${this.showJumpList && hasGroups
        ? html`<div class="jump-list" part="jump-list">
            ${this.#renderJumpList()}
          </div>`
        : nothing}
    `;
  }

  #onScroll(e: Event): void {
    const target = e.target as HTMLElement;
    this.#scrollTop = target.scrollTop;
    this.#clientHeight = target.clientHeight;
    this.requestUpdate();
  }

  #renderFlatContent(): TemplateResult {
    const scrollTop = this.#scrollTop;
    const clientHeight = this.#clientHeight;

    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN);
    const endIndex = Math.min(
      this.items.length - 1,
      Math.ceil((scrollTop + clientHeight) / ITEM_HEIGHT) + OVERSCAN
    );

    const offsetY = startIndex * ITEM_HEIGHT;

    const items: TemplateResult[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push(this.#renderItem(this.items[i], i));
    }

    return html`
      <div style="position: absolute; top: ${offsetY}px; left: 0; right: 0;">
        ${items}
      </div>
    `;
  }

  #renderGroupedContent(): TemplateResult {
    const scrollTop = this.#scrollTop;
    const clientHeight = this.#clientHeight;
    const viewportEnd = scrollTop + clientHeight + OVERSCAN * ITEM_HEIGHT;

    const parts: TemplateResult[] = [];

    for (const group of this.#groups) {
      const groupStart = group.headerOffset;
      const groupEnd = groupStart + GROUP_HEADER_HEIGHT + group.contentHeight;

      if (groupEnd < scrollTop - OVERSCAN * ITEM_HEIGHT) continue;
      if (groupStart > viewportEnd) break;

      const contentTop = groupStart + GROUP_HEADER_HEIGHT;
      const firstItemVisible = Math.max(0, Math.floor((scrollTop - contentTop) / ITEM_HEIGHT) - OVERSCAN);
      const lastItemVisible = Math.min(
        group.items.length - 1,
        Math.ceil((scrollTop + clientHeight - contentTop) / ITEM_HEIGHT) + OVERSCAN
      );

      const itemsOffsetY = firstItemVisible * ITEM_HEIGHT;

      const visibleItems: TemplateResult[] = [];
      for (let i = firstItemVisible; i <= lastItemVisible; i++) {
        visibleItems.push(this.#renderItem(group.items[i], group.indices[i]));
      }

      parts.push(html`
        <div style="position: absolute; top: ${groupStart}px; left: 0; right: 0;">
          <div class="group-header" data-group-key="${group.key}">${group.key}</div>
          <div style="position: relative; top: ${itemsOffsetY}px; height: ${group.contentHeight - itemsOffsetY}px;">
            ${visibleItems}
          </div>
        </div>
      `);
    }

    return html`${parts}`;
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
        <span>${displayText}</span>
      </div>
    `;
  }

  #renderJumpList(): TemplateResult[] {
    const availableKeys = new Set(this.#groups.map(g => g.key.toUpperCase()));
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
    const container = this.shadowRoot?.querySelector(".list-container") as HTMLElement;
    if (!container) return;

    const targetScroll = this.#groups.length > 0
      ? this.#getScrollPositionForIndex(index)
      : index * ITEM_HEIGHT;

    container.scrollTo({
      top: Math.max(0, targetScroll - 10),
      behavior: "smooth",
    });

    setTimeout(() => {
      const item = this.shadowRoot?.querySelector(`[data-index="${index}"]`) as HTMLElement;
      item?.focus();
    }, 100);
  }

  #getScrollPositionForIndex(itemIndex: number): number {
    for (const group of this.#groups) {
      const localIdx = group.indices.indexOf(itemIndex);
      if (localIdx !== -1) {
        return group.headerOffset + GROUP_HEADER_HEIGHT + localIdx * ITEM_HEIGHT;
      }
    }
    return 0;
  }

  #jumpToGroup(letter: string): void {
    const group = this.#jumpListCache.get(letter.toUpperCase());
    if (!group) return;

    const container = this.shadowRoot?.querySelector(".list-container") as HTMLElement;
    if (!container) return;

    container.scrollTo({
      top: group.headerOffset,
      behavior: "smooth",
    });
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

  #rebuildGroups(): void {
    if (!this.groupKey || this.items.length === 0) {
      this.#groups = [];
      this.#jumpListCache.clear();
      this.#totalHeight = this.items.length * ITEM_HEIGHT;
      return;
    }

    const groupMap = new Map<string, { items: LongListSelectorItem[]; indices: number[] }>();

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      const keyValue = String(item[this.groupKey] ?? "#");
      if (!groupMap.has(keyValue)) {
        groupMap.set(keyValue, { items: [], indices: [] });
      }
      const entry = groupMap.get(keyValue)!;
      entry.items.push(item);
      entry.indices.push(i);
    }

    const sortedKeys = Array.from(groupMap.keys()).sort((a, b) => a.localeCompare(b));
    this.#groups = [];
    this.#jumpListCache.clear();

    let currentOffset = 0;
    for (const key of sortedKeys) {
      const entry = groupMap.get(key)!;
      const contentHeight = entry.items.length * ITEM_HEIGHT;
      const group: LongListSelectorGroup = {
        key,
        items: entry.items,
        indices: entry.indices,
        headerOffset: currentOffset,
        contentHeight,
      };
      this.#groups.push(group);
      this.#jumpListCache.set(key.toUpperCase(), group);
      currentOffset += GROUP_HEADER_HEIGHT + contentHeight;
    }

    this.#totalHeight = currentOffset;
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("items") || changedProperties.has("groupKey")) {
      this.#rebuildGroups();
    }

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

  connectedCallback(): void {
    super.connectedCallback();
    this.#rebuildGroups();
  }

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

  scrollToIndex(index: number): void {
    const container = this.shadowRoot?.querySelector(".list-container") as HTMLElement;
    if (!container) return;

    const targetScroll = this.#groups.length > 0
      ? this.#getScrollPositionForIndex(index)
      : index * ITEM_HEIGHT;

    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: "smooth",
    });
  }
}

customElements.define("metro-long-list-selector", MetroLongListSelector);

declare global {
  interface HTMLElementTagNameMap {
    "metro-long-list-selector": MetroLongListSelector;
  }
}
