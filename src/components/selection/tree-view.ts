import { LitElement, html, css } from "lit";
import { baseTypography, scrollbarVisible } from "../../styles/shared.ts";
import type { PropertyValueMap } from "lit";
import "../primitives/icon.ts";

export interface TreeViewItem {
  id: string;
  label: string;
  icon?: string;
  children?: TreeViewItem[];
  expanded?: boolean;
}

type SelectionMode = "none" | "single";

export class MetroTreeView extends LitElement {
  static properties = {
    items: { type: Array },
    selected: { type: String, reflect: true },
    selectionMode: { type: String, reflect: true, attribute: "selection-mode" },
  };

  declare items: TreeViewItem[];
  declare selected: string;
  declare selectionMode: SelectionMode;

  static styles = [
    baseTypography,
    scrollbarVisible,
    css`
      :host {
        display: block;
        background: var(--metro-background, #1f1f1f);
      }
      .tree-container {
        overflow-y: auto;
        max-height: 100%;
      }
      .tree-item {
        display: flex;
        align-items: center;
        padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
        cursor: pointer;
        color: var(--metro-foreground, #ffffff);
        transition: background-color var(--metro-transition-fast, 167ms) ease-out;
        user-select: none;
        outline: none;
      }
      .tree-item:hover {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      .tree-item:focus {
        outline: 2px solid var(--metro-accent, #0078d4) inset;
        outline-offset: -2px;
      }
      .tree-item.selected {
        background: var(--metro-accent, #0078d4);
      }
      .tree-item.selected:hover {
        background: var(--metro-accent-hover, #1a86d9);
      }
      .chevron {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        margin-right: 4px;
        flex-shrink: 0;
        transition: transform var(--metro-transition-fast, 167ms) ease-out;
      }
      .chevron.expanded {
        transform: rotate(90deg);
      }
      .chevron.empty {
        visibility: hidden;
      }
      .item-icon {
        margin-right: var(--metro-spacing-sm, 8px);
        flex-shrink: 0;
      }
      .item-label {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .children {
        display: none;
      }
      .children.expanded {
        display: block;
      }
    `,
  ];

  #expandedIds: Set<string> = new Set();
  #focusedId: string | null = null;

  constructor() {
    super();
    this.items = [];
    this.selected = "";
    this.selectionMode = "none";
  }

  protected updated(changedProperties: PropertyValueMap<this>): void {
    if (changedProperties.has("items")) {
      this.#initializeExpanded();
    }
  }

  #initializeExpanded(): void {
    const initExpanded = (items: TreeViewItem[]): void => {
      for (const item of items) {
        if (item.expanded) {
          this.#expandedIds.add(item.id);
        }
        if (item.children) {
          initExpanded(item.children);
        }
      }
    };
    initExpanded(this.items);
  }

  render() {
    return html`
      <div class="tree-container" role="tree" @keydown=${this.#handleKeyDown}>
        ${this.#renderItems(this.items, 0)}
      </div>
    `;
  }

  #renderItems(items: TreeViewItem[], level: number): unknown {
    return items.map(item => this.#renderItem(item, level));
  }

  #renderItem(item: TreeViewItem, level: number): unknown {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = this.#expandedIds.has(item.id);
    const isSelected = this.selected === item.id;
    const isFocused = this.#focusedId === item.id;
    const indent = level * 20;

    return html`
      <div
        class="tree-item ${isSelected ? "selected" : ""}"
        role="treeitem"
        aria-expanded=${hasChildren ? isExpanded : undefined}
        aria-selected=${isSelected}
        tabindex=${isFocused || (this.#focusedId === null && isSelected) ? "0" : "-1"}
        style="padding-left: ${indent + 12}px"
        data-id=${item.id}
        @click=${(e: MouseEvent) => this.#handleItemClick(e, item)}
      >
        <span class="chevron ${isExpanded ? "expanded" : ""} ${!hasChildren ? "empty" : ""}">
          ${hasChildren
            ? html`<metro-icon icon="chevron-down" size="small"></metro-icon>`
            : null}
        </span>
        ${item.icon
          ? html`<metro-icon class="item-icon" icon=${item.icon} size="normal"></metro-icon>`
          : null}
        <span class="item-label">${item.label}</span>
      </div>
      ${hasChildren
        ? html`
            <div class="children ${isExpanded ? "expanded" : ""}" role="group">
              ${this.#renderItems(item.children!, level + 1)}
            </div>
          `
        : null}
    `;
  }

  #handleItemClick(e: MouseEvent | KeyboardEvent, item: TreeViewItem): void {
    const hasChildren = item.children && item.children.length > 0;
    const target = e.target as Element;
    const isChevronClick = target.closest(".chevron");

    this.#focusedId = item.id;
    this.#focusItem(item.id);

    if (hasChildren || isChevronClick) {
      this.#toggleExpanded(item.id);
    }

    if (this.selectionMode === "single") {
      this.selected = item.id;
      this.dispatchEvent(
        new CustomEvent("selectionchange", {
          detail: { selectedId: item.id, item },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  #toggleExpanded(id: string): void {
    if (this.#expandedIds.has(id)) {
      this.#expandedIds.delete(id);
      this.dispatchEvent(
        new CustomEvent("collapse", {
          detail: { id },
          bubbles: true,
          composed: true,
        }),
      );
    } else {
      this.#expandedIds.add(id);
      this.dispatchEvent(
        new CustomEvent("expand", {
          detail: { id },
          bubbles: true,
          composed: true,
        }),
      );
    }
    this.requestUpdate();
  }

  #handleKeyDown(e: KeyboardEvent): void {
    const focusedItem = this.#findItemById(this.#focusedId || this.selected);
    switch (e.key) {
      case "ArrowRight":
        if (focusedItem && this.#expandedIds.has(focusedItem.id)) {
          this.#focusNext();
        } else if (focusedItem?.children?.length) {
          this.#toggleExpanded(focusedItem.id);
        }
        e.preventDefault();
        break;
      case "ArrowLeft":
        if (focusedItem && this.#expandedIds.has(focusedItem.id)) {
          this.#toggleExpanded(focusedItem.id);
        } else {
          this.#focusParent();
        }
        e.preventDefault();
        break;
      case "ArrowDown":
        this.#focusNext();
        e.preventDefault();
        break;
      case "ArrowUp":
        this.#focusPrevious();
        e.preventDefault();
        break;
      case "Enter":
      case " ":
        if (this.#focusedId) {
          const item = this.#findItemById(this.#focusedId);
          if (item) {
            this.#handleItemClick(e, item);
          }
        }
        e.preventDefault();
        break;
    }
  }

  #focusItem(id: string): void {
    this.#focusedId = id;
    const itemEl = this.shadowRoot?.querySelector(`[data-id="${id}"]`) as HTMLElement;
    if (itemEl) {
      itemEl.focus();
    }
  }

  #focusNext(): void {
    const flatList = this.#getFlatItems();
    const currentIndex = flatList.findIndex(i => i.id === this.#focusedId);
    if (currentIndex < flatList.length - 1) {
      this.#focusItem(flatList[currentIndex + 1].id);
    }
  }

  #focusPrevious(): void {
    const flatList = this.#getFlatItems();
    const currentIndex = flatList.findIndex(i => i.id === this.#focusedId);
    if (currentIndex > 0) {
      this.#focusItem(flatList[currentIndex - 1].id);
    }
  }

  #focusParent(): void {
    const parentId = this.#findParentId(this.items, this.#focusedId, null);
    if (parentId) {
      this.#focusItem(parentId);
    }
  }

  #getFlatItems(): TreeViewItem[] {
    const result: TreeViewItem[] = [];
    const flatten = (items: TreeViewItem[]): void => {
      for (const item of items) {
        result.push(item);
        if (item.children && this.#expandedIds.has(item.id)) {
          flatten(item.children);
        }
      }
    };
    flatten(this.items);
    return result;
  }

  #findItemById(id: string, items: TreeViewItem[] = this.items): TreeViewItem | null {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = this.#findItemById(id, item.children);
        if (found) return found;
      }
    }
    return null;
  }

  #findParentId(
    items: TreeViewItem[],
    targetId: string | null,
    parentId: string | null,
  ): string | null {
    for (const item of items) {
      if (item.id === targetId) return parentId;
      if (item.children) {
        const found = this.#findParentId(item.children, targetId, item.id);
        if (found !== undefined) return found;
      }
    }
    return null;
  }

  expandAll(): void {
    const expand = (items: TreeViewItem[]): void => {
      for (const item of items) {
        if (item.children?.length) {
          this.#expandedIds.add(item.id);
          expand(item.children);
        }
      }
    };
    expand(this.items);
    this.requestUpdate();
  }

  collapseAll(): void {
    this.#expandedIds.clear();
    this.requestUpdate();
  }

  expandItem(id: string): void {
    this.#expandedIds.add(id);
    this.requestUpdate();
  }

  collapseItem(id: string): void {
    this.#expandedIds.delete(id);
    this.requestUpdate();
  }
}

customElements.define("metro-tree-view", MetroTreeView);

declare global {
  interface HTMLElementTagNameMap {
    "metro-tree-view": MetroTreeView;
  }
}
