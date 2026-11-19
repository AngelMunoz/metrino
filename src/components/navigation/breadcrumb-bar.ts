import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";
import type { MetroBreadcrumbItem } from "./breadcrumb-item.ts";

/**
 * Detail of the "itemclicked" event fired by the breadcrumb bar.
 */
export interface BreadcrumbItemClickedEventDetail {
  /** Zero-based index of the clicked crumb among all metro-breadcrumb-item children. */
  index: number;
  /** The clicked metro-breadcrumb-item element, or null when it is gone. */
  item: MetroBreadcrumbItem | null;
}

/** One rendered crumb derived from a light-DOM metro-breadcrumb-item child. */
interface Crumb {
  index: number;
  label: string;
  href: string;
  element: MetroBreadcrumbItem | null;
}

/**
 * Metro Breadcrumb Bar Component
 *
 * A WinUI BreadcrumbBar-style trail with flat Metro styling: light-DOM
 * metro-breadcrumb-item children render as a chevron-separated trail inside a
 * nav labelled "breadcrumb". Every crumb except the last is a button (or a
 * link when the item sets "href"); the last crumb carries aria-current="page"
 * and is not clickable.
 *
 * When the trail overflows its container, leading crumbs collapse behind an
 * ellipsis "..." button that opens a small flyout listing the collapsed
 * crumbs. The flyout closes on Escape or on pointer presses outside of it.
 *
 * Keyboard support comes from native buttons and links (Tab, Enter, Space).
 *
 * @fires itemclicked - Fired when a non-current crumb is activated, from the
 *   trail or from the collapsed-items flyout.
 *   Detail: { index: number, item: MetroBreadcrumbItem | null }
 *
 * @cssprop --metro-foreground - Trail text color (default: #ffffff)
 * @cssprop --metro-foreground-secondary - Chevron color (default: rgba(255, 255, 255, 0.6))
 * @cssprop --metro-accent - Hover color and focus outline (default: #0078d4)
 * @cssprop --metro-background - Flyout background (default: #1f1f1f)
 * @cssprop --metro-border - Flyout border color (default: rgba(255, 255, 255, 0.2))
 * @cssprop --metro-highlight - Flyout item hover background (default: rgba(255, 255, 255, 0.1))
 * @cssprop --metro-spacing-sm - Spacing around chevrons (default: 8px)
 * @cssprop --metro-transition-fast - Hover transition duration (default: 167ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 *
 * @slot - Default slot for metro-breadcrumb-item children (not displayed directly;
 *   the bar renders the trail from them)
 *
 * @csspart breadcrumb-nav - The nav landmark
 * @csspart breadcrumb-list - The ordered list of crumbs
 * @csspart breadcrumb-item - Each crumb list item
 * @csspart breadcrumb-link - A non-current crumb button or link
 * @csspart breadcrumb-current - The current-page crumb
 * @csspart breadcrumb-ellipsis - The overflow ellipsis button
 * @csspart breadcrumb-flyout - The collapsed-items flyout
 */
export class MetroBreadcrumbBar extends LitElement {
  static properties = {
    /** Leading crumbs hidden behind the ellipsis; managed from overflow. */
    collapsedCount: { state: true },
    /** Whether the collapsed-items flyout is open. */
    flyoutOpen: { state: true },
  };

  declare collapsedCount: number;
  declare flyoutOpen: boolean;

  static styles = [
    baseTypography,
    css`
      :host {
        display: block;
        position: relative;
      }
      nav {
        overflow: hidden;
      }
      ol {
        display: flex;
        align-items: center;
        list-style: none;
        margin: 0;
        padding: 0;
        white-space: nowrap;
      }
      .crumb {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }
      .crumb + .crumb::before {
        content: "›";
        margin-inline: var(--metro-spacing-sm, 8px);
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      }
      :host-context([dir="rtl"]) .crumb + .crumb::before {
        content: "‹";
      }
      .link,
      .ellipsis {
        background: transparent;
        border: none;
        border-radius: 0;
        padding: 4px 2px;
        font: inherit;
        font-size: var(--metro-font-size-normal, 14px);
        color: var(--metro-foreground, #ffffff);
        cursor: pointer;
        text-decoration: none;
        white-space: nowrap;
        transition: color var(--metro-transition-fast, 167ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .link:hover,
      .ellipsis:hover {
        color: var(--metro-accent, #0078d4);
      }
      .link:focus-visible,
      .ellipsis:focus-visible,
      .flyout-item:focus-visible {
        outline: 2px solid var(--metro-accent, #0078d4);
        outline-offset: 2px;
      }
      .ellipsis {
        min-width: 32px;
        min-height: 32px;
        font-weight: 600;
        letter-spacing: 1px;
      }
      .current {
        padding: 4px 2px;
        font-size: var(--metro-font-size-normal, 14px);
        font-weight: 600;
        color: var(--metro-foreground, #ffffff);
        white-space: nowrap;
      }
      .flyout {
        position: absolute;
        top: 100%;
        inset-inline-start: 0;
        min-width: 160px;
        max-width: 100%;
        background: var(--metro-background, #1f1f1f);
        border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
        border-radius: 0;
        padding: 4px;
        z-index: 100;
        box-sizing: border-box;
      }
      .flyout-item {
        display: block;
        width: 100%;
        box-sizing: border-box;
        text-align: start;
        background: transparent;
        border: none;
        border-radius: 0;
        padding: 8px 12px;
        font: inherit;
        font-size: var(--metro-font-size-normal, 14px);
        color: var(--metro-foreground, #ffffff);
        cursor: pointer;
        text-decoration: none;
        white-space: nowrap;
        transition: background-color var(--metro-transition-fast, 167ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .flyout-item:hover {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      ::slotted(metro-breadcrumb-item) {
        display: none;
      }
    `,
  ];

  #resizeObserver: ResizeObserver | null = null;
  #childObserver: MutationObserver | null = null;
  #fitQueued = false;

  constructor() {
    super();
    this.collapsedCount = 0;
    this.flyoutOpen = false;
  }

  render() {
    const crumbs = this.#crumbs();
    const collapsed = crumbs.slice(0, this.collapsedCount);
    const visible = crumbs.slice(this.collapsedCount);
    const lastIndex = crumbs.length - 1;
    return html`
      <nav aria-label="breadcrumb" part="breadcrumb-nav">
        <ol part="breadcrumb-list">
          ${collapsed.length > 0
            ? html`
              <li class="crumb" part="breadcrumb-item">
                <button
                  type="button"
                  class="ellipsis"
                  part="breadcrumb-ellipsis"
                  aria-label="Show collapsed breadcrumbs"
                  aria-haspopup="menu"
                  aria-expanded="${this.flyoutOpen}"
                  @click=${this.#toggleFlyout}
                >...</button>
              </li>
            `
            : ""}
          ${visible.map((crumb) =>
            crumb.index === lastIndex
              ? html`
                <li class="crumb" part="breadcrumb-item">
                  <span class="current" part="breadcrumb-current" aria-current="page"
                    >${crumb.label}</span
                  >
                </li>
              `
              : crumb.href
                ? html`
                  <li class="crumb" part="breadcrumb-item">
                    <a
                      class="link"
                      part="breadcrumb-link"
                      href=${crumb.href}
                      @click=${() => this.#handleItemClick(crumb)}
                      >${crumb.label}</a
                    >
                  </li>
                `
                : html`
                  <li class="crumb" part="breadcrumb-item">
                    <button
                      type="button"
                      class="link"
                      part="breadcrumb-link"
                      @click=${() => this.#handleItemClick(crumb)}
                      >${crumb.label}</button
                    >
                  </li>
                `,
          )}
        </ol>
      </nav>
      ${this.flyoutOpen && collapsed.length > 0
        ? html`
          <div
            class="flyout"
            part="breadcrumb-flyout"
            role="menu"
            aria-label="Collapsed breadcrumbs"
            @keydown=${this.#handleFlyoutKeyDown}
          >
            ${collapsed.map((crumb) =>
              crumb.href
                ? html`
                  <a
                    class="flyout-item"
                    role="menuitem"
                    href=${crumb.href}
                    @click=${() => this.#handleFlyoutItemClick(crumb)}
                    >${crumb.label}</a
                  >
                `
                : html`
                  <button
                    type="button"
                    class="flyout-item"
                    role="menuitem"
                    @click=${() => this.#handleFlyoutItemClick(crumb)}
                    >${crumb.label}</button
                  >
                `,
            )}
          </div>
        `
        : ""}
      <slot @slotchange=${this.#handleSlotChange}></slot>
    `;
  }

  firstUpdated(): void {
    if (typeof ResizeObserver !== "undefined") {
      this.#resizeObserver = new ResizeObserver(() => this.#scheduleFit());
      const nav = this.renderRoot.querySelector("nav");
      if (nav !== null) {
        this.#resizeObserver.observe(nav);
      }
    }
    if (typeof MutationObserver !== "undefined") {
      this.#childObserver = new MutationObserver(() => {
        this.requestUpdate();
        this.#scheduleFit();
      });
      this.#childObserver.observe(this, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ["header", "href"],
      });
    }
    this.#scheduleFit();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#resizeObserver?.disconnect();
    this.#resizeObserver = null;
    this.#childObserver?.disconnect();
    this.#childObserver = null;
    document.removeEventListener(
      "pointerdown",
      this.#handleDocumentPointerDown,
      true,
    );
  }

  /**
   * Reads the light-DOM metro-breadcrumb-item children as crumbs.
   * @returns the crumbs in document order
   */
  #crumbs(): Crumb[] {
    const nodes = this.querySelectorAll("metro-breadcrumb-item");
    return Array.from(nodes).map((node, index) => {
      const item = node as MetroBreadcrumbItem;
      const header = item.getAttribute("header");
      const label =
        header !== null && header !== ""
          ? header
          : (item.textContent ?? "").trim();
      return {
        index,
        label,
        href: item.getAttribute("href") ?? "",
        element: item as MetroBreadcrumbItem,
      };
    });
  }

  /**
   * Fires itemclicked for a non-current crumb activated in the trail.
   * @param crumb - The activated crumb
   * @returns void
   */
  #handleItemClick(crumb: Crumb): void {
    this.dispatchEvent(
      new CustomEvent<BreadcrumbItemClickedEventDetail>("itemclicked", {
        detail: { index: crumb.index, item: crumb.element },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Fires itemclicked for a collapsed crumb and closes the flyout.
   * @param crumb - The activated collapsed crumb
   * @returns void
   */
  #handleFlyoutItemClick(crumb: Crumb): void {
    this.#closeFlyout(false);
    this.#handleItemClick(crumb);
  }

  /**
   * Opens or closes the collapsed-items flyout.
   * @returns void
   */
  #toggleFlyout = (): void => {
    this.flyoutOpen = !this.flyoutOpen;
    if (this.flyoutOpen) {
      document.addEventListener(
        "pointerdown",
        this.#handleDocumentPointerDown,
        true,
      );
      void this.updateComplete.then(() => {
        this.renderRoot
          .querySelector<HTMLElement>(".flyout-item")
          ?.focus();
      });
    } else {
      document.removeEventListener(
        "pointerdown",
        this.#handleDocumentPointerDown,
        true,
      );
    }
  };

  /**
   * Closes the collapsed-items flyout.
   * @param returnFocus - Whether to move focus back to the ellipsis button
   * @returns void
   */
  #closeFlyout(returnFocus: boolean): void {
    if (!this.flyoutOpen) {
      return;
    }
    this.flyoutOpen = false;
    document.removeEventListener(
      "pointerdown",
      this.#handleDocumentPointerDown,
      true,
    );
    if (returnFocus) {
      void this.updateComplete.then(() => {
        this.renderRoot.querySelector<HTMLElement>(".ellipsis")?.focus();
      });
    }
  }

  /**
   * Closes the flyout on pointer presses outside the bar (light dismiss).
   * @param event - The pointer event
   * @returns void
   */
  #handleDocumentPointerDown = (event: PointerEvent): void => {
    if (!event.composedPath().includes(this)) {
      this.#closeFlyout(false);
    }
  };

  /**
   * Closes the flyout on Escape.
   * @param event - The keyboard event
   * @returns void
   */
  #handleFlyoutKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.stopPropagation();
      this.#closeFlyout(true);
    }
  };

  /**
   * Re-renders the trail when children are added or removed.
   * @returns void
   */
  #handleSlotChange = (): void => {
    this.requestUpdate();
    this.#scheduleFit();
  };

  /**
   * Queues an overflow fit on the next animation frame.
   * @returns void
   */
  #scheduleFit(): void {
    if (this.#fitQueued) {
      return;
    }
    this.#fitQueued = true;
    requestAnimationFrame(() => {
      this.#fitQueued = false;
      void this.#fit();
    });
  }

  /**
   * Collapses leading crumbs behind the ellipsis until the trail fits, then
   * reveals crumbs again while they still fit.
   * @returns void
   */
  async #fit(): Promise<void> {
    const nav = this.renderRoot.querySelector<HTMLElement>("nav");
    if (nav === null) {
      return;
    }
    const total = this.#crumbs().length;
    for (let i = 0; i < total; i++) {
      await this.updateComplete;
      if (!this.#overflows(nav)) {
        break;
      }
      if (this.collapsedCount >= total - 1) {
        break;
      }
      this.collapsedCount += 1;
    }
    await this.updateComplete;
    while (this.collapsedCount > 0) {
      this.collapsedCount -= 1;
      await this.updateComplete;
      if (this.#overflows(nav)) {
        this.collapsedCount += 1;
        await this.updateComplete;
        break;
      }
    }
  }

  /**
   * Reports whether the trail overflows its nav container.
   * @param nav - The nav landmark element
   * @returns true when the trail is wider than the container
   */
  #overflows(nav: HTMLElement): boolean {
    return nav.scrollWidth > nav.clientWidth + 1;
  }
}

export function registerMetroBreadcrumbBar(): void {
  if (!customElements.get("metro-breadcrumb-bar")) {
    customElements.define("metro-breadcrumb-bar", MetroBreadcrumbBar);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-breadcrumb-bar": MetroBreadcrumbBar;
  }
}
