import { LitElement, html, css, type PropertyValues, type TemplateResult, nothing } from "lit";
import { baseTypography, scrollbarVisible } from "../../styles/shared.ts";
import { animationKeyframes, animationEntrance } from "../../utils/animations.ts";
import { prefersReducedMotion } from "../../utils/reduced-motion.ts";
import {
  attachDragPan,
  createGestureState,
  updateGesture,
  resolveGesture,
  normalizePointerEvent,
  type GestureState,
} from "../../utils/touch-physics.ts";

/** Stagger tail (256ms delay + 250ms run) after which recycled items stay plain. */
const ENTRANCE_WINDOW_MS = 600;

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

/** Where the jump grid is in its open/close cycle. */
type JumpGridState = "closed" | "open" | "closing";

const ITEM_HEIGHT = 44;
const GROUP_HEADER_HEIGHT = 32;
const OVERSCAN = 10;

/**
 * Bound on the wait for the grid's exit animation: an element that is hidden or
 * removed by someone else never reports `animationend`.
 */
const GRID_EXIT_GUARD_MS = 400;

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
    jumpGrid: { type: Boolean, attribute: "jump-grid" },
  };

  declare items: LongListSelectorItem[];
  declare groupKey: string;
  declare displayMember: string;
  declare valueMember: string;
  declare selectionMode: SelectionMode;
  declare selectedValue: unknown;
  declare maxHeight: string;
  declare showJumpList: boolean;
  declare jumpGrid: boolean;

  static styles = [
    baseTypography,
    scrollbarVisible,
    animationKeyframes,
    animationEntrance,
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
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
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
      .list-item.cross-sliding {
        transform: translateX(var(--cross-slide-offset, 0px));
        opacity: 0.8;
        transition: transform 0.15s var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
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
        transition: opacity var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
                    background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
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
      .group-header[tabindex],
      .jump-item[tabindex] {
        cursor: pointer;
      }
      .group-header:focus-visible,
      .jump-item:focus-visible {
        outline: 2px solid var(--metro-accent, #0078d4);
        outline-offset: -2px;
      }
      /* The jump grid replaces the whole screen, because a list long enough to
         need it has more groups than the alphabet strip can show at once. */
      .jump-grid {
        position: fixed;
        inset: 0;
        z-index: 1100;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        align-content: start;
        gap: 12px;
        padding: 24px;
        overflow: auto;
        background: var(--metro-background, #1f1f1f);
        color: var(--metro-foreground, #ffffff);
      }
      .jump-grid:not(.closing) {
        animation: metro-turnstile-in 450ms var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)) backwards;
      }
      .jump-grid.closing {
        animation: metro-turnstile-out 350ms var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
      }
      .jump-grid-tile {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
        gap: var(--metro-spacing-xs, 4px);
        min-height: 96px;
        padding: var(--metro-spacing-md, 12px);
        border: none;
        background: var(--metro-accent, #0078d4);
        color: #ffffff;
        font: inherit;
        text-align: start;
        cursor: pointer;
      }
      .jump-grid-tile:hover {
        background: var(--metro-accent-dark, #005a9e);
      }
      .jump-grid-tile:focus-visible {
        outline: 2px solid #ffffff;
        outline-offset: -4px;
      }
      .jump-grid-key {
        font-size: var(--metro-font-size-xlarge, 28px);
        font-weight: 600;
        line-height: 1;
      }
      .jump-grid-count {
        font-size: var(--metro-font-size-small, 12px);
        opacity: 0.8;
      }
    `,
  ];

  #selectedIndices: Set<number> = new Set();
  #groups: LongListSelectorGroup[] = [];
  #totalHeight = 0;
  #scrollTop = 0;
  #clientHeight = 300;
  #jumpListCache: Map<string, LongListSelectorGroup> = new Map();
  #gestureState: GestureState | null = null;
  #crossSlideIndex: number | null = null;
  #jumpGridState: JumpGridState = "closed";
  #jumpGridTrigger: HTMLElement | null = null;
  #jumpGridNeedsFocus = false;
  #gridCloseTimer = 0;
  #detachDragPan: (() => void) | null = null;
  #panContainer: HTMLElement | null = null;
  #entrancePlayed = false;
  #entranceTimer = 0;

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
    this.jumpGrid = false;
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
      <div
        class="list-container"
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
      ${this.#renderJumpGrid()}
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
          <div
            class="group-header"
            data-group-key="${group.key}"
            tabindex=${this.jumpGrid ? "0" : nothing}
            @click=${this.#handleGroupHeaderClick}
            @keydown=${this.#handleGroupHeaderKeyDown}
          >${group.key}</div>
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
        class="list-item ${isSelected ? "selected" : ""} ${this.#crossSlideIndex === index ? "cross-sliding" : ""}"
        role="option"
        tabindex="0"
        aria-selected=${isSelected}
        data-index=${index}
        @click=${() => this.#handleItemClick(index)}
        @keydown=${(e: KeyboardEvent) => this.#handleKeyDown(e, index)}
        @pointerdown=${(e: PointerEvent) => this.#handleItemPointerDown(e, index)}
        @pointermove=${(e: PointerEvent) => this.#handleItemPointerMove(e)}
        @pointerup=${(e: PointerEvent) => this.#handleItemPointerUp(e, index)}
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
          tabindex=${hasItems && this.jumpGrid ? "0" : nothing}
          @click=${hasItems ? (e: Event) => this.#handleJumpItemClick(letter, e) : undefined}
          @keydown=${hasItems ? (e: KeyboardEvent) => this.#handleJumpItemKeyDown(letter, e) : undefined}
        >${letter}</span>
      `;
    });
  }

  /**
   * The full-screen group grid: one tile per group, each naming the group and
   * how many items it holds.
   */
  #renderJumpGrid(): TemplateResult | typeof nothing {
    if (this.#jumpGridState === "closed") return nothing;

    const closing = this.#jumpGridState === "closing" ? "closing" : "";

    return html`
      <div
        class="jump-grid ${closing}"
        role="dialog"
        aria-modal="true"
        aria-label="Jump to group"
        @keydown=${this.#handleGridKeyDown}
      >
        ${this.#groups.map(
          (group) => html`
            <button
              type="button"
              class="jump-grid-tile"
              data-group-key=${group.key}
              @click=${() => this.#handleGridTileClick(group)}
            >
              <span class="jump-grid-key">${group.key}</span>
              <span class="jump-grid-count">${group.items.length}</span>
            </button>
          `
        )}
      </div>
    `;
  }

  #handleGroupHeaderClick = (event: Event): void => {
    this.#openJumpGrid(event.currentTarget as HTMLElement);
  };

  #handleGroupHeaderKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    this.#openJumpGrid(event.currentTarget as HTMLElement);
  };

  #handleJumpItemClick = (letter: string, event: Event): void => {
    if (!this.jumpGrid) {
      this.#jumpToGroup(letter);
      return;
    }
    this.#openJumpGrid(event.currentTarget as HTMLElement);
  };

  #handleJumpItemKeyDown = (letter: string, event: KeyboardEvent): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    this.#handleJumpItemClick(letter, event);
  };

  #handleGridKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    this.#closeJumpGrid();
  };

  #handleGridTileClick = (group: LongListSelectorGroup): void => {
    this.#scrollToOffset(group.headerOffset);
    this.#closeJumpGrid();
  };

  #openJumpGrid(trigger: HTMLElement): void {
    if (!this.jumpGrid || this.#groups.length === 0) return;
    if (this.#jumpGridState !== "closed") return;

    this.#jumpGridTrigger = trigger;
    this.#jumpGridNeedsFocus = true;
    this.#jumpGridState = "open";
    this.requestUpdate();
  }

  #closeJumpGrid(): void {
    if (this.#jumpGridState !== "open") return;

    const grid = this.shadowRoot?.querySelector<HTMLElement>(".jump-grid");
    const trigger = this.#jumpGridTrigger;
    this.#jumpGridTrigger = null;

    if (!grid || prefersReducedMotion()) {
      this.#jumpGridState = "closed";
      this.requestUpdate();
    } else {
      this.#jumpGridState = "closing";
      this.requestUpdate();
      grid.addEventListener("animationend", this.#handleGridAnimationEnd);
      this.#gridCloseTimer = window.setTimeout(
        () => this.#finishGridClose(),
        GRID_EXIT_GUARD_MS
      );
    }

    // The list keeps its position: where it ends up is the jump's business, not
    // the focus move's.
    trigger?.focus({ preventScroll: true });
  }

  #handleGridAnimationEnd = (event: AnimationEvent): void => {
    if (event.animationName !== "metro-turnstile-out") return;
    this.#finishGridClose();
  };

  #finishGridClose(): void {
    window.clearTimeout(this.#gridCloseTimer);
    this.#gridCloseTimer = 0;
    this.shadowRoot
      ?.querySelector<HTMLElement>(".jump-grid")
      ?.removeEventListener("animationend", this.#handleGridAnimationEnd);

    if (this.#jumpGridState === "closed") return;
    this.#jumpGridState = "closed";
    this.requestUpdate();
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

  #handleItemPointerDown(e: PointerEvent, index: number): void {
    if (this.selectionMode === "none") return;
    this.#gestureState = createGestureState(normalizePointerEvent(e));
    this.#crossSlideIndex = index;
  }

  #handleItemPointerMove(e: PointerEvent): void {
    if (!this.#gestureState || this.selectionMode === "none") return;
    this.#gestureState = updateGesture(this.#gestureState, normalizePointerEvent(e));

    if (this.#gestureState.resolved === "cross-slide" || this.#gestureState.resolved === "drag-x") {
      const dx = normalizePointerEvent(e).clientX - this.#gestureState.startX;
      const el = (e.target as HTMLElement).closest(".list-item") as HTMLElement;
      if (el) {
        el.style.setProperty("--cross-slide-offset", `${Math.min(dx, 50)}px`);
      }
    }
  }

  #handleItemPointerUp(e: PointerEvent, index: number): void {
    if (!this.#gestureState || this.selectionMode === "none") return;
    const result = resolveGesture(this.#gestureState);

    if (result.type === "cross-slide" || (result.type === "drag-x" && Math.abs(result.dx) > 30)) {
      if (this.#selectedIndices.has(index)) {
        this.#selectedIndices.delete(index);
      } else {
        this.#selectedIndices.add(index);
      }
      this.requestUpdate();
      this.#dispatchSelectionChange();
    }

    const el = (e.target as HTMLElement).closest(".list-item") as HTMLElement;
    if (el) {
      el.style.removeProperty("--cross-slide-offset");
    }
    this.#gestureState = null;
    this.#crossSlideIndex = null;
    this.requestUpdate();
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

    this.#scrollToOffset(group.headerOffset);
  }

  /**
   * Scrolls the list to a content offset. Reduced motion goes straight there:
   * a glide is exactly the motion the preference asks not to see.
   */
  #scrollToOffset(top: number): void {
    const container = this.shadowRoot?.querySelector<HTMLElement>(".list-container");
    if (!container) return;

    container.scrollTo({
      top,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  }

  #getValue(item: LongListSelectorItem): unknown {
    if (this.valueMember) {
      return item[this.valueMember];
    }
    if (this.displayMember) {
      return item[this.displayMember];
    }
    return item;
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

  protected updated(changed: PropertyValues<this>): void {
    this.#ensureDragPan();
    this.#playEntranceOnce();
    const container = this.shadowRoot?.querySelector<HTMLElement>(".list-container");
    if (container) {
      container.style.maxHeight = "";
      container.style.maxHeight = this.maxHeight;
    }

    if (this.#jumpGridState === "open" && this.#jumpGridNeedsFocus) {
      this.#jumpGridNeedsFocus = false;
      this.shadowRoot
        ?.querySelector<HTMLElement>(".jump-grid-tile")
        ?.focus({ preventScroll: true });
    }

    if (changed.has("jumpGrid") && !this.jumpGrid) {
      this.#finishGridClose();
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.#rebuildGroups();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearTimeout(this.#gridCloseTimer);
    this.#gridCloseTimer = 0;
    this.#jumpGridState = "closed";
    this.#jumpGridTrigger = null;
    this.#jumpGridNeedsFocus = false;
    this.#detachDragPan?.();
    this.#detachDragPan = null;
    this.#panContainer = null;
    window.clearTimeout(this.#entranceTimer);
  }

  /** Mouse grab-to-pan on the list scroller; touch keeps native scrolling. */
  #ensureDragPan(): void {
    const container = this.renderRoot.querySelector<HTMLElement>(".list-container");
    if (container === this.#panContainer) return;
    this.#detachDragPan?.();
    this.#panContainer = container;
    this.#detachDragPan =
      container === null ? null : attachDragPan(container, { axis: "y" });
  }

  /**
   * The Metro entrance stagger, once per mount. The class comes off after the
   * stagger tail so virtualization recycling during scroll never re-animates.
   */
  #playEntranceOnce(): void {
    if (this.#entrancePlayed || prefersReducedMotion()) return;
    const layer = this.renderRoot.querySelector<HTMLElement>(".viewport");
    if (layer === null) return;
    this.#entrancePlayed = true;
    layer.classList.add("metro-entrance-stagger");
    this.#entranceTimer = window.setTimeout(() => {
      layer.classList.remove("metro-entrance-stagger");
    }, ENTRANCE_WINDOW_MS);
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

export function registerMetroLongListSelector(): void {
  if (!customElements.get("metro-long-list-selector")) {
    customElements.define("metro-long-list-selector", MetroLongListSelector);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-long-list-selector": MetroLongListSelector;
  }
}
