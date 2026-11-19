import { LitElement, html, css } from "lit";
import { baseTypography, scrollbarHiddenClass } from "../../styles/shared.ts";

/** Detail of the `tabclosed` event fired when a closable tab is closed. */
export interface TabClosedEventDetail {
  /** Index of the closed tab at the time it was closed. */
  index: number;
}

/** Detail of the `selectionchanged` event fired when the selected tab changes. */
export interface TabViewSelectionChangedEventDetail {
  /** Index of the newly selected tab. */
  selectedIndex: number;
}

/** Counter backing the generated ids that link tabs to their panels. */
let panelIdCounter = 0;

/**
 * Metro Tab View Component
 *
 * A WinUI-style TabView rendered in flat Metro styling: a square-edged tab
 * strip with an accent underline for the selected tab. Distinct from
 * MetroPivot (large typography headers with a sliding row): tabs own a short
 * header plus panel content, only the selected panel is shown, and tabs can
 * be closable with an add button for new tabs.
 *
 * Features:
 * - Flat Metro tab strip with accent underline for the selected tab
 * - Per-item header text with an optional icon slot
 * - Closable tabs that fire tabclosed and move selection to a neighbor
 * - Optional add button firing addbuttonclick
 * - ARIA tablist/tab/tabpanel roles with aria-selected and aria-controls
 * - Keyboard navigation (Arrow/Home/End) with clamped ends and roving tabindex
 *
 * @fires selectionchanged - Fired when the selected tab changes.
 *   Detail: { selectedIndex: number }
 * @fires tabclosed - Fired when a closable tab is closed. Cancelable:
 *   preventing the default keeps the tab. Detail: { index: number }
 * @fires addbuttonclick - Fired when the add button is pressed.
 *
 * @cssprop --metro-border - Border color for the tab strip (default: rgba(255, 255, 255, 0.2))
 * @cssprop --metro-accent - Selected tab underline color (default: #0078d4)
 * @cssprop --metro-foreground - Selected tab text color (default: #ffffff)
 * @cssprop --metro-foreground-secondary - Inactive tab text color (default: rgba(255, 255, 255, 0.5))
 * @cssprop --metro-highlight - Hover background for tabs (default: rgba(255, 255, 255, 0.1))
 * @cssprop --metro-spacing-sm - Small spacing unit (default: 8px)
 * @cssprop --metro-spacing-md - Medium spacing unit (default: 12px)
 * @cssprop --metro-transition-fast - Fast transition duration (default: 167ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 * @cssprop --metro-font-size-medium - Font size for tab labels (default: 16px)
 *
 * @slot - Default slot for metro-tab-view-item children
 *
 * @csspart tab-strip - Container for the tab entries and the add button
 * @csspart tab-panels - Container for the tab panels
 */
export class MetroTabView extends LitElement {
  static properties = {
    /**
     * Index of the currently selected tab (0-based).
     * Changing this updates the visible panel and the active tab styling.
     * @default 0
     */
    selectedIndex: { type: Number },
    /**
     * When set, an add button is rendered after the last tab.
     * @default false
     */
    showAddButton: { type: Boolean, attribute: "show-add-button", reflect: true },
  };

  declare selectedIndex: number;
  declare showAddButton: boolean;

  static styles = [
    baseTypography,
    scrollbarHiddenClass,
    css`
      :host {
        display: block;
      }
      .tab-strip {
        display: flex;
        align-items: stretch;
        border-bottom: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
        overflow-x: auto;
      }
      .tab {
        display: flex;
        align-items: center;
        gap: var(--metro-spacing-sm, 8px);
        padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
        cursor: pointer;
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
        font-size: var(--metro-font-size-medium, 16px);
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        border-radius: 0;
        white-space: nowrap;
        user-select: none;
        transition:
          color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          border-color var(--metro-transition-fast, 167ms)
            var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          background-color var(--metro-transition-fast, 167ms)
            var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .tab:hover {
        color: var(--metro-foreground, #ffffff);
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      .tab.active {
        color: var(--metro-foreground, #ffffff);
        border-bottom-color: var(--metro-accent, #0078d4);
      }
      .tab:focus-visible {
        outline: 2px solid var(--metro-accent, #0078d4);
        outline-offset: -2px;
      }
      .tab-icon {
        display: inline-flex;
        align-items: center;
      }
      .tab-icon[hidden] {
        display: none;
      }
      .tab-close {
        background: none;
        border: none;
        border-radius: 0;
        color: inherit;
        cursor: pointer;
        padding: 2px 6px;
        font-size: 14px;
        line-height: 1;
      }
      .tab-close:hover {
        color: var(--metro-foreground, #ffffff);
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      .tab-close:focus-visible {
        outline: 2px solid var(--metro-accent, #0078d4);
        outline-offset: -2px;
      }
      .add-button {
        background: none;
        border: none;
        border-radius: 0;
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
        transition:
          color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          background-color var(--metro-transition-fast, 167ms)
            var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .add-button:hover {
        color: var(--metro-foreground, #ffffff);
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      .add-button:focus-visible {
        outline: 2px solid var(--metro-accent, #0078d4);
        outline-offset: -2px;
      }
    `,
  ];

  /** Guards the initial sync so connecting never fires selectionchanged. */
  #initialized = false;

  /**
   * Watches light-DOM header, closable, and icon-slot changes so edits made
   * after first render refresh the strip. The attributes this component sets
   * itself (active, role, aria-labelledby, id) are not observed, so syncing
   * never schedules another update.
   */
  #observer: MutationObserver | null = null;

  constructor() {
    super();
    this.selectedIndex = 0;
    this.showAddButton = false;
  }

  /**
   * Starts watching item header, closable, and icon-slot changes.
   * @returns void
   */
  connectedCallback(): void {
    super.connectedCallback();
    this.#observer = new MutationObserver(() => {
      this.requestUpdate();
    });
    this.#observer.observe(this, {
      attributes: true,
      attributeFilter: ["header", "closable", "slot"],
      subtree: true,
    });
  }

  /**
   * Stops watching item changes.
   * @returns void
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#observer?.disconnect();
    this.#observer = null;
  }

  render() {
    const items = this.#items();

    return html`
      <div
        class="tab-strip scrollbar-hidden"
        role="tablist"
        part="tab-strip"
        @keydown=${this.#handleKeyDown}
      >
        ${items.map((item, index) => {
          const header = item.getAttribute("header") || `Tab ${index + 1}`;
          const isActive = index === this.selectedIndex;
          const closable = item.hasAttribute("closable");
          return html`
            <div
              class="tab ${isActive ? "active" : ""}"
              role="tab"
              id="${this.#tabId(item)}"
              aria-selected="${isActive ? "true" : "false"}"
              aria-controls="${this.#panelId(item)}"
              tabindex="${isActive ? 0 : -1}"
              @click=${() => this.#selectTab(index)}
            >
              <span class="tab-icon" data-icon-for="${index}" hidden></span>
              <span class="tab-label">${header}</span>
              ${closable
                ? html`
                    <button
                      class="tab-close"
                      aria-label="Close ${header}"
                      @click=${(event: MouseEvent) => this.#closeTab(index, event)}
                    >
                      ×
                    </button>
                  `
                : ""}
            </div>
          `;
        })}
        ${this.showAddButton
          ? html`
              <button
                class="add-button"
                aria-label="Add new tab"
                @click=${this.#handleAddButton}
              >
                +
              </button>
            `
          : ""}
      </div>
      <div class="tab-panels" part="tab-panels">
        <slot @slotchange=${this.#handleSlotChange}></slot>
      </div>
    `;
  }

  /**
   * Clamps the selection into the live item range before rendering so a stale
   * or out-of-range index never leaves every tab unselected.
   * @returns void
   */
  willUpdate(): void {
    const count = this.#items().length;
    if (count === 0) return;
    const clamped = this.#clampIndex(this.selectedIndex, count);
    if (clamped !== this.selectedIndex) {
      this.selectedIndex = clamped;
    }
  }

  /**
   * Syncs item attributes and icons after a render, firing selectionchanged
   * exactly once per selectedIndex change after the initial render.
   * @param changed - Properties that changed since the last update
   * @returns void
   */
  updated(changed: Map<string, unknown>): void {
    const items = this.#items();
    if (items.length === 0) {
      this.#initialized = true;
      return;
    }
    this.#syncItems(items);
    this.#syncIcons(items);
    if (!this.#initialized) {
      this.#initialized = true;
      return;
    }
    if (changed.has("selectedIndex")) {
      this.dispatchEvent(
        new CustomEvent<TabViewSelectionChangedEventDetail>("selectionchanged", {
          detail: { selectedIndex: this.selectedIndex },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  #items(): HTMLElement[] {
    return Array.from(this.querySelectorAll<HTMLElement>("metro-tab-view-item"));
  }

  #tabs(): HTMLElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLElement>('[role="tab"]'));
  }

  #clampIndex(index: number, count: number): number {
    const raw = Number.isFinite(index) ? Math.trunc(index) : 0;
    return Math.min(Math.max(raw, 0), count - 1);
  }

  /**
   * Returns the panel id for an item, assigning a stable generated one when
   * the item carries none so tabs can always reference their panel.
   * @param item - The tab view item owning the panel
   * @returns the panel element id
   */
  #panelId(item: HTMLElement): string {
    if (item.id === "") {
      panelIdCounter += 1;
      item.id = `metro-tabview-panel-${panelIdCounter}`;
    }
    return item.id;
  }

  /**
   * Returns the id of the tab entry controlling an item panel.
   * @param item - The tab view item owning the panel
   * @returns the tab element id
   */
  #tabId(item: HTMLElement): string {
    return `${this.#panelId(item)}-tab`;
  }

  /**
   * Marks the selected item active and links every item to its tab entry.
   * @param items - The tab view items in document order
   * @returns void
   */
  #syncItems(items: HTMLElement[]): void {
    items.forEach((item, index) => {
      item.toggleAttribute("active", index === this.selectedIndex);
      item.setAttribute("role", "tabpanel");
      item.setAttribute("aria-labelledby", this.#tabId(item));
    });
  }

  /**
   * Projects each item icon into its tab entry. The original node stays on
   * the item (where the icon sink slot hides it from the panel) and a clone
   * without slot or id attributes is shown in the strip, so re-renders and
   * item removals can never lose user content.
   * @param items - The tab view items in document order
   * @returns void
   */
  #syncIcons(items: HTMLElement[]): void {
    items.forEach((item, index) => {
      const host = this.renderRoot.querySelector(`[data-icon-for="${index}"]`);
      if (!(host instanceof HTMLElement)) return;
      const icon = item.querySelector(":scope > [slot='icon']");
      if (icon === null) {
        host.replaceChildren();
        host.hidden = true;
        return;
      }
      const clone = icon.cloneNode(true) as HTMLElement;
      clone.removeAttribute("slot");
      clone.removeAttribute("id");
      clone.querySelectorAll("[id]").forEach((node) => {
        node.removeAttribute("id");
      });
      host.hidden = false;
      host.replaceChildren(clone);
    });
  }

  /**
   * Selects a tab by index. Out-of-range indexes clamp in willUpdate; the
   * selectionchanged event fires from updated() exactly once per change.
   * @param index - The index of the tab to select
   * @returns void
   */
  #selectTab(index: number): void {
    if (index === this.selectedIndex) return;
    this.selectedIndex = index;
  }

  /**
   * Closes a tab: fires a cancelable tabclosed event, removes the item unless
   * prevented, and moves selection to the neighbor sliding into its place
   * (or the previous tab when the last one closed).
   * @param index - The index of the tab to close
   * @param event - The click event on the close button
   * @returns void
   */
  #closeTab(index: number, event: MouseEvent): void {
    event.stopPropagation();
    const items = this.#items();
    const item = items[index];
    if (item === undefined) return;

    const closed = this.dispatchEvent(
      new CustomEvent<TabClosedEventDetail>("tabclosed", {
        detail: { index },
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (!closed) return;

    const strip = this.renderRoot.querySelector(".tab-strip");
    const hadFocus = strip !== null && strip.contains(document.activeElement);
    const wasSelected = index === this.selectedIndex;

    item.remove();
    const remaining = items.length - 1;
    if (remaining <= 0) {
      this.selectedIndex = 0;
      this.requestUpdate();
      return;
    }
    if (wasSelected) {
      this.selectedIndex = Math.min(index, remaining - 1);
    } else if (index < this.selectedIndex) {
      this.selectedIndex = this.selectedIndex - 1;
    }
    this.requestUpdate();

    if (hadFocus) {
      void this.updateComplete.then(() => {
        this.#tabs()[this.selectedIndex]?.focus();
      });
    }
  }

  /**
   * Fires addbuttonclick when the add button is pressed.
   * @returns void
   */
  #handleAddButton = (): void => {
    this.dispatchEvent(
      new CustomEvent("addbuttonclick", {
        bubbles: true,
        composed: true,
      }),
    );
  };

  /**
   * Re-renders the strip when items are added or removed outside the tab API.
   * @returns void
   */
  #handleSlotChange = (): void => {
    this.requestUpdate();
  };

  /**
   * Handles keys on the tab list. Arrows move one tab, Home and End go to the
   * ends, and the ends clamp: pressing past them keeps selection and focus.
   * Focus follows the selection.
   * @param event - The keyboard event
   * @returns void
   */
  #handleKeyDown = (event: KeyboardEvent): void => {
    const count = this.#items().length;
    if (count === 0) return;

    // The tabs run in the inline direction, so in RTL the forward key is the
    // left arrow — the reading metro-hub already uses.
    const rtl = getComputedStyle(this).direction === "rtl";
    const forwardKey = rtl ? "ArrowLeft" : "ArrowRight";
    const backKey = rtl ? "ArrowRight" : "ArrowLeft";

    const current = this.#clampIndex(this.selectedIndex, count);
    let target: number;
    if (event.key === forwardKey) {
      target = Math.min(current + 1, count - 1);
    } else if (event.key === backKey) {
      target = Math.max(current - 1, 0);
    } else if (event.key === "Home") {
      target = 0;
    } else if (event.key === "End") {
      target = count - 1;
    } else {
      return;
    }

    event.preventDefault();
    if (target === current) return;

    this.#selectTab(target);
    const tabs = this.#tabs();
    const next = tabs[target];
    if (next !== undefined) {
      next.focus();
    }
  };
}

export function registerMetroTabView(): void {
  if (!customElements.get("metro-tab-view")) {
    customElements.define("metro-tab-view", MetroTabView);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-tab-view": MetroTabView;
  }
}
