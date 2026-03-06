import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

/**
 * Tooltip placement options relative to the target element.
 */
type TooltipPlacement = "top" | "bottom" | "left" | "right";

/**
 * Metro Tooltip Component
 *
 * A floating informational popup that appears near a target element to provide
 * additional context or explanation. Features automatic positioning, delayed
 * show for hover interactions, and fade animations.
 *
 * Features:
 * - Four placement options: top, bottom, left, right
 * - Automatic positioning based on target element
 * - Fade in/out transitions
 * - Delayed show support for hover scenarios
 * - Immediate hide support
 * - Pointer-events none to allow clicking through
 * - Fixed positioning for viewport-relative placement
 *
 * Unlike MetroFlyout, the Tooltip is designed for brief informational text
 * and does not support rich content or interaction. Use for explaining icons,
 * buttons, or other UI elements.
 *
 * @cssprop --metro-background - Tooltip background color (default: #1f1f1f)
 * @cssprop --metro-foreground - Tooltip text color (default: #ffffff)
 * @cssprop --metro-spacing-sm - Small padding (default: 8px)
 * @cssprop --metro-spacing-md - Medium padding (default: 12px)
 * @cssprop --metro-font-size-small - Tooltip font size (default: 12px)
 * @cssprop --metro-transition-normal - Transition duration (default: 250ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 *
 * @slot - Default slot for tooltip content (text or HTML)
 *
 * @csspart tooltip - The tooltip panel element
 */
export class MetroTooltip extends LitElement {
  static properties = {
    /**
     * Controls the visibility of the tooltip. When true, the tooltip is displayed.
     * @default false
     */
    open: { type: Boolean, reflect: true },
    /**
     * Text content displayed in the tooltip.
     * Can be set via attribute or slot for more complex content.
     * @default ""
     */
    text: { type: String, reflect: true },
    /**
     * Position of the tooltip relative to the target element.
     * @default "top"
     */
    placement: { type: String, reflect: true },
  };

  declare open: boolean;
  declare text: string;
  declare placement: TooltipPlacement;

  static styles = [
    baseTypography,
    css`
      :host {
        display: none;
        position: fixed;
        z-index: 1000;
        pointer-events: none;
      }
      :host([open]) {
        display: block;
      }
      .tooltip {
        position: fixed;
        background: var(--metro-background, #1f1f1f);
        color: var(--metro-foreground, #ffffff);
        padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
        font-size: var(--metro-font-size-small, 12px);
        border-radius: 0;
        white-space: nowrap;
        opacity: 0;
        transition: opacity var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      :host([open]) .tooltip {
        opacity: 1;
      }
    `,
  ];

  #target: Element | null = null;
  #hideTimeout: number | null = null;

  constructor() {
    super();
    this.open = false;
    this.text = "";
    this.placement = "top";
  }

  render() {
    return html`
      <div class="tooltip" role="tooltip">
        ${this.text || html`<slot></slot>`}
      </div>
    `;
  }

  /**
   * Shows the tooltip positioned relative to the target element.
   * @param target - The element to position the tooltip relative to
   * @returns void
   */
  show(target: Element): void {
    this.#target = target;
    this.open = true;
  }

  /**
   * Hides the tooltip immediately, clearing any pending delayed show.
   * @returns void
   */
  hide(): void {
    this.open = false;
  }

  /**
   * Shows the tooltip after a delay. Useful for hover interactions.
   * @param target - The element to position the tooltip relative to
   * @param delay - Delay in milliseconds before showing (default: 500ms)
   * @returns void
   */
  showDelayed(target: Element, delay: number = 500): void {
    this.#hideTimeout = window.setTimeout(() => {
      this.show(target);
    }, delay);
  }

  /**
   * Hides the tooltip immediately and cancels any pending delayed show.
   * @returns void
   */
  hideImmediate(): void {
    if (this.#hideTimeout) {
      clearTimeout(this.#hideTimeout);
      this.#hideTimeout = null;
    }
    this.hide();
  }

  /**
   * Updates tooltip position when opened.
   * @param changedProperties - Map of changed properties
   * @returns void
   */
  protected updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("open") && this.open && this.#target) {
      requestAnimationFrame(() => this.#positionTooltip());
    }
  }

  /**
   * Calculates and sets the tooltip position based on placement and target.
   * @returns void
   */
  #positionTooltip(): void {
    const tooltip = this.shadowRoot?.querySelector(".tooltip") as HTMLElement;
    if (!tooltip || !this.#target) return;

    const targetRect = this.#target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top = 0;
    let left = 0;

    switch (this.placement) {
      case "top":
        top = targetRect.top - tooltipRect.height - 8;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = targetRect.bottom + 8;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - 8;
        break;
      case "right":
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + 8;
        break;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }
}

customElements.define("metro-tooltip", MetroTooltip);

declare global {
  interface HTMLElementTagNameMap {
    "metro-tooltip": MetroTooltip;
  }
}
