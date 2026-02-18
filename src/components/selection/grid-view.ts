import { LitElement, html, css, type PropertyValues, type TemplateResult } from "lit";
import { baseTypography, scrollbarVisible, groupHeader } from "../../styles/shared.ts";
import {
  calculateGridVisibleRange,
  type VirtualizationGroup,
  groupItems,
} from "../../utils/virtualization.ts";
import {
  createGestureState,
  updateGesture,
  resolveGesture,
  normalizePointerEvent,
  type GestureState,
} from "../../utils/touch-physics.ts";

type SelectionMode = "none" | "single" | "multiple" | "extended";

export interface GridViewItem {
  [key: string]: unknown;
}

export interface GridViewGroup {
  key: string;
  items: GridViewItem[];
  indices: number[];
}

export class MetroGridView extends LitElement {
  static properties = {
    items: { type: Array },
    itemWidth: { type: Number, attribute: "item-width" },
    itemHeight: { type: Number, attribute: "item-height" },
    columns: { type: Number },
    selectionMode: { type: String, attribute: "selection-mode" },
    groupKey: { type: String, attribute: "group-key" },
    displayMember: { type: String, attribute: "display-member" },
  };

  declare items: GridViewItem[];
  declare itemWidth: number;
  declare itemHeight: number;
  declare columns: number;
  declare selectionMode: SelectionMode;
  declare groupKey: string;
  declare displayMember: string;

  static styles = [
    baseTypography,
    scrollbarVisible,
    groupHeader,
    css`
      :host {
        display: block;
        position: relative;
        overflow: hidden;
      }
      .grid-container {
        overflow: auto;
        height: 100%;
      }
      .viewport {
        position: relative;
        min-height: 100%;
      }
      .grid-layout {
        display: grid;
        gap: var(--metro-spacing-sm, 8px);
        padding: var(--metro-spacing-sm, 8px);
      }
      .grid-item {
        cursor: pointer;
        color: var(--metro-foreground, #ffffff);
        border: 2px solid transparent;
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          border-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          transform var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
      }
      .grid-item:hover {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        transform: scale(1.02);
      }
      .grid-item:focus {
        outline: 2px solid var(--metro-accent, #0078d4);
        outline-offset: -2px;
      }
      .grid-item.selected {
        background: var(--metro-accent, #0078d4);
        border-color: var(--metro-accent, #0078d4);
      }
      .grid-item:active {
        transform: scale(0.98);
      }
      .group-header {
        grid-column: 1 / -1;
      }
      .empty-message {
        padding: var(--metro-spacing-lg, 16px);
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
        text-align: center;
      }
    `,
  ];

  #selectedIndices: Set<number> = new Set();
  #scrollTop = 0;
  #scrollLeft = 0;
  #clientHeight = 400;
  #clientWidth = 800;
  #lastFocusedIndex: number | null = null;
  #groups: VirtualizationGroup<GridViewItem>[] = [];
  #gestureState: GestureState | null = null;

  constructor() {
    super();
    this.items = [];
    this.itemWidth = 150;
    this.itemHeight = 150;
    this.columns = 0;
    this.selectionMode = "none";
    this.groupKey = "";
    this.displayMember = "";
  }

  render() {
    if (this.items.length === 0) {
      return html`
        <div class="grid-container">
          <div class="empty-message">No items</div>
        </div>
      `;
    }

    const computedColumns = this.#getComputedColumns();
    const { visibleIndices, offsetY, offsetX, totalHeight, totalWidth } = calculateGridVisibleRange(
      this.#scrollTop,
      this.#scrollLeft,
      this.#clientHeight,
      this.#clientWidth,
      this.items.length,
      this.itemWidth,
      this.itemHeight,
      computedColumns
    );

    return html`
      <div class="grid-container" @scroll=${this.#onScroll}>
        <div class="viewport" style="height: ${totalHeight}px; width: ${totalWidth}px;">
          <div
            class="grid-layout"
            style="
              grid-template-columns: repeat(${computedColumns}, ${this.itemWidth}px);
              grid-auto-rows: ${this.itemHeight}px;
              transform: translate(${offsetX}px, ${offsetY}px);
            "
          >
            ${this.groupKey
              ? this.#renderGroupedItems(visibleIndices, computedColumns)
              : this.#renderItems(visibleIndices)}
          </div>
        </div>
      </div>
    `;
  }

  #getComputedColumns(): number {
    if (this.columns > 0) {
      return this.columns;
    }
    return Math.max(1, Math.floor(this.#clientWidth / this.itemWidth));
  }

  #renderItems(visibleIndices: Set<number>): TemplateResult[] {
    const items: TemplateResult[] = [];
    visibleIndices.forEach((index) => {
      if (index < this.items.length) {
        items.push(this.#renderItem(this.items[index], index));
      }
    });
    return items;
  }

  #renderGroupedItems(visibleIndices: Set<number>, _columns: number): TemplateResult[] {
    if (this.#groups.length === 0) {
      return this.#renderItems(visibleIndices);
    }

    const result: TemplateResult[] = [];
    let renderedHeaders = new Set<string>();

    visibleIndices.forEach((index) => {
      if (index >= this.items.length) return;

      const group = this.#findGroupForIndex(index);
      if (group && !renderedHeaders.has(group.key)) {
        renderedHeaders.add(group.key);
        result.push(html`
          <div class="group-header" style="height: 32px;">${group.key}</div>
        `);
      }

      result.push(this.#renderItem(this.items[index], index));
    });

    return result;
  }

  #findGroupForIndex(index: number): VirtualizationGroup<GridViewItem> | null {
    for (const group of this.#groups) {
      if (group.indices.includes(index)) {
        return group;
      }
    }
    return null;
  }

  #renderItem(item: GridViewItem, index: number): TemplateResult {
    const isSelected = this.#selectedIndices.has(index);

    return html`
      <div
        class="grid-item ${isSelected ? "selected" : ""}"
        role="gridcell"
        tabindex="0"
        aria-selected=${isSelected}
        data-index=${index}
        style="width: ${this.itemWidth}px; height: ${this.itemHeight}px;"
        @click=${() => this.#handleItemClick(index)}
        @keydown=${(e: KeyboardEvent) => this.#handleKeyDown(e, index)}
        @dblclick=${() => this.#handleItemInvoke(index)}
        @pointerdown=${(e: PointerEvent) => this.#handleItemPointerDown(e)}
        @pointermove=${(e: PointerEvent) => this.#handleItemPointerMove(e)}
        @pointerup=${(e: PointerEvent) => this.#handleItemPointerUp(e, index)}
      >
        ${this.#renderItemContent(item, index)}
      </div>
    `;
  }

  #renderItemContent(item: GridViewItem, _index: number): TemplateResult {
    let displayText: string;
    if (this.displayMember) {
      displayText = String(item[this.displayMember] ?? "");
    } else if ("name" in item) {
      displayText = String(item.name ?? "");
    } else if ("label" in item) {
      displayText = String(item.label ?? "");
    } else {
      displayText = String(item);
    }
    return html`<span>${displayText}</span>`;
  }

  #onScroll(e: Event): void {
    const target = e.target as HTMLElement;
    this.#scrollTop = target.scrollTop;
    this.#scrollLeft = target.scrollLeft;
    this.#clientHeight = target.clientHeight;
    this.#clientWidth = target.clientWidth;
    this.requestUpdate();
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

  #handleItemPointerDown(e: PointerEvent): void {
    if (this.selectionMode === "none") return;
    this.#gestureState = createGestureState(normalizePointerEvent(e));
  }

  #handleItemPointerMove(e: PointerEvent): void {
    if (!this.#gestureState || this.selectionMode === "none") return;
    this.#gestureState = updateGesture(this.#gestureState, normalizePointerEvent(e));
  }

  #handleItemPointerUp(_e: PointerEvent, index: number): void {
    if (!this.#gestureState || this.selectionMode === "none") return;
    const result = resolveGesture(this.#gestureState);
    this.#gestureState = null;

    if (result.type === "cross-slide" || (result.type === "drag-x" && Math.abs(result.dx) > 30)) {
      if (this.#selectedIndices.has(index)) {
        this.#selectedIndices.delete(index);
      } else {
        this.#selectedIndices.add(index);
      }
      this.requestUpdate();
      this.#dispatchSelectionChange();
    }
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
    const columns = this.#getComputedColumns();
    
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.#handleItemClick(index);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      this.#focusItem(index + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      this.#focusItem(index - 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      this.#focusItem(index + columns);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.#focusItem(index - columns);
    }
  }

  #focusItem(index: number): void {
    if (index < 0 || index >= this.items.length) return;
    
    requestAnimationFrame(() => {
      const item = this.shadowRoot?.querySelector(`[data-index="${index}"]`) as HTMLElement;
      item?.focus();
    });
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
      return;
    }

    this.#groups = groupItems(
      this.items,
      this.groupKey as keyof GridViewItem,
      { itemHeight: this.itemHeight, overscan: 5 }
    );
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

  getSelectedItems(): GridViewItem[] {
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
    const container = this.shadowRoot?.querySelector(".grid-container") as HTMLElement;
    if (!container) return;

    const columns = this.#getComputedColumns();
    const row = Math.floor(index / columns);
    const col = index % columns;

    container.scrollTo({
      top: row * this.itemHeight,
      left: col * this.itemWidth,
      behavior: "smooth",
    });
  }
}

customElements.define("metro-grid-view", MetroGridView);

declare global {
  interface HTMLElementTagNameMap {
    "metro-grid-view": MetroGridView;
  }
}
