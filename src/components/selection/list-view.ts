import { LitElement, html, css, type PropertyValues, type TemplateResult } from "lit";
import { baseTypography, scrollbarVisible, selectableItemBase, groupHeader } from "../../styles/shared.ts";
import {
  calculateVisibleRange,
  calculateVisibleRangeWithGroups,
  groupItems,
  type VirtualizationGroup,
} from "../../utils/virtualization.ts";

type SelectionMode = "none" | "single" | "multiple" | "extended";

export interface ListViewGroup {
  key: string;
  items: unknown[];
  indices: number[];
}

export class MetroListView extends LitElement {
  static properties = {
    items: { type: Array },
    itemHeight: { type: Number, attribute: "item-height" },
    selectionMode: { type: String, attribute: "selection-mode" },
    groupKey: { type: String, attribute: "group-key" },
    groupHeaderHeight: { type: Number, attribute: "group-header-height" },
    displayMember: { type: String, attribute: "display-member" },
  };

  declare items: unknown[];
  declare itemHeight: number;
  declare selectionMode: SelectionMode;
  declare groupKey: string;
  declare groupHeaderHeight: number;
  declare displayMember: string;

  static styles = [
    baseTypography,
    scrollbarVisible,
    selectableItemBase,
    groupHeader,
    css`
      :host {
        display: block;
        position: relative;
        overflow: hidden;
      }
      .list-container {
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
      }
      .viewport {
        position: relative;
        overflow: hidden;
      }
      .empty-message {
        padding: var(--metro-spacing-lg, 16px);
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
        text-align: center;
      }
    `,
  ];

  #selectedIndices: Set<number> = new Set();
  #groups: VirtualizationGroup<unknown>[] = [];
  #totalHeight = 0;
  #scrollTop = 0;
  #clientHeight = 400;
  #lastFocusedIndex: number | null = null;

  constructor() {
    super();
    this.items = [];
    this.itemHeight = 44;
    this.selectionMode = "none";
    this.groupKey = "";
    this.groupHeaderHeight = 32;
    this.displayMember = "";
  }

  render() {
    const hasGroups = this.#groups.length > 0 && this.groupKey;

    if (this.items.length === 0) {
      return html`
        <div class="list-container">
          <div class="empty-message">No items</div>
        </div>
      `;
    }

    return html`
      <div class="list-container" @scroll=${this.#onScroll}>
        <div class="viewport" style="height: ${this.#totalHeight}px;">
          ${hasGroups ? this.#renderGroupedContent() : this.#renderFlatContent()}
        </div>
      </div>
    `;
  }

  #onScroll(e: Event): void {
    const target = e.target as HTMLElement;
    this.#scrollTop = target.scrollTop;
    this.#clientHeight = target.clientHeight;
    this.requestUpdate();
  }

  #renderFlatContent(): TemplateResult {
    const { startIndex, endIndex, offsetY, totalHeight } = calculateVisibleRange(
      this.#scrollTop,
      this.#clientHeight,
      this.items.length,
      { itemHeight: this.itemHeight, overscan: 10 }
    );

    this.#totalHeight = totalHeight;

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
    const { visibleGroups, totalHeight } = calculateVisibleRangeWithGroups(
      this.#scrollTop,
      this.#clientHeight,
      this.#groups,
      { itemHeight: this.itemHeight, overscan: 10, groupHeaderHeight: this.groupHeaderHeight }
    );

    this.#totalHeight = totalHeight;

    const parts: TemplateResult[] = [];

    for (const { group, startIndex, endIndex, offsetY } of visibleGroups) {
      const visibleItems: TemplateResult[] = [];
      for (let i = startIndex; i <= endIndex; i++) {
        visibleItems.push(this.#renderItem(group.items[i], group.indices[i]));
      }

      parts.push(html`
        <div style="position: absolute; top: ${group.headerOffset}px; left: 0; right: 0;">
          <div class="group-header" style="height: ${this.groupHeaderHeight}px;" data-group-key="${group.key}">
            ${group.key}
          </div>
          <div style="position: relative; top: ${offsetY}px; height: ${group.contentHeight - offsetY}px;">
            ${visibleItems}
          </div>
        </div>
      `);
    }

    return html`${parts}`;
  }

  #renderItem(item: unknown, index: number): TemplateResult {
    let displayText: string;
    if (this.displayMember && typeof item === "object" && item !== null) {
      displayText = String((item as Record<string, unknown>)[this.displayMember] ?? "");
    } else if (typeof item === "object" && item !== null && "label" in item) {
      displayText = String((item as { label: unknown }).label);
    } else if (typeof item === "object" && item !== null && "name" in item) {
      displayText = String((item as { name: unknown }).name);
    } else {
      displayText = String(item);
    }
    const isSelected = this.#selectedIndices.has(index);

    return html`
      <div
        class="list-item ${isSelected ? "selected" : ""}"
        role="option"
        tabindex="0"
        aria-selected=${isSelected}
        data-index=${index}
        style="height: ${this.itemHeight}px;"
        @click=${() => this.#handleItemClick(index)}
        @keydown=${(e: KeyboardEvent) => this.#handleKeyDown(e, index)}
        @dblclick=${() => this.#handleItemInvoke(index)}
      >
        <span>${displayText}</span>
      </div>
    `;
  }

  #handleItemClick(index: number): void {
    this.dispatchEvent(
      new CustomEvent("itemclick", {
        detail: { item: this.items[index], index },
        bubbles: true,
        composed: true,
      })
    );

    if (this.selectionMode === "none") return;

    if (this.selectionMode === "single") {
      this.#selectedIndices.clear();
      this.#selectedIndices.add(index);
    } else if (this.selectionMode === "multiple") {
      if (this.#selectedIndices.has(index)) {
        this.#selectedIndices.delete(index);
      } else {
        this.#selectedIndices.add(index);
      }
    } else if (this.selectionMode === "extended") {
      if (this.#lastFocusedIndex !== null && this.#lastFocusedIndex !== index) {
        const start = Math.min(this.#lastFocusedIndex, index);
        const end = Math.max(this.#lastFocusedIndex, index);
        for (let i = start; i <= end; i++) {
          this.#selectedIndices.add(i);
        }
      } else {
        this.#selectedIndices.clear();
        this.#selectedIndices.add(index);
      }
    }

    this.#lastFocusedIndex = index;
    this.requestUpdate();
    this.#dispatchSelectionChange();
  }

  #handleItemInvoke(index: number): void {
    this.dispatchEvent(
      new CustomEvent("iteminvoke", {
        detail: { item: this.items[index], index },
        bubbles: true,
        composed: true,
      })
    );
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
      : index * this.itemHeight;

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
        return group.headerOffset + this.groupHeaderHeight + localIdx * this.itemHeight;
      }
    }
    return 0;
  }

  #dispatchSelectionChange(): void {
    const selectedItems = Array.from(this.#selectedIndices).map((i) => this.items[i]);
    this.dispatchEvent(
      new CustomEvent("selectionchange", {
        detail: {
          selectedItems,
          selectedIndices: Array.from(this.#selectedIndices),
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  #rebuildGroups(): void {
    if (!this.groupKey || this.items.length === 0) {
      this.#groups = [];
      this.#totalHeight = this.items.length * this.itemHeight;
      return;
    }

    this.#groups = groupItems(
      this.items,
      (item: unknown) => {
        if (typeof item === "object" && item !== null && this.groupKey in item) {
          return String((item as Record<string, unknown>)[this.groupKey] ?? "#");
        }
        return "#";
      },
      { itemHeight: this.itemHeight, overscan: 10, groupHeaderHeight: this.groupHeaderHeight }
    );

    if (this.#groups.length > 0) {
      const lastGroup = this.#groups[this.#groups.length - 1];
      this.#totalHeight = lastGroup.headerOffset + this.groupHeaderHeight + lastGroup.contentHeight;
    }
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("items") || changedProperties.has("groupKey")) {
      this.#rebuildGroups();
    }

    if (changedProperties.has("items")) {
      this.#selectedIndices.clear();
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.#rebuildGroups();
  }

  getSelectedItems(): unknown[] {
    return Array.from(this.#selectedIndices).map((i) => this.items[i]);
  }

  getSelectedIndices(): number[] {
    return Array.from(this.#selectedIndices);
  }

  clearSelection(): void {
    this.#selectedIndices.clear();
    this.requestUpdate();
  }

  scrollToIndex(index: number): void {
    const container = this.shadowRoot?.querySelector(".list-container") as HTMLElement;
    if (!container) return;

    const targetScroll = this.#groups.length > 0
      ? this.#getScrollPositionForIndex(index)
      : index * this.itemHeight;

    container.scrollTo({
      top: Math.max(0, targetScroll),
      behavior: "smooth",
    });
  }
}

customElements.define("metro-list-view", MetroListView);

declare global {
  interface HTMLElementTagNameMap {
    "metro-list-view": MetroListView;
  }
}
