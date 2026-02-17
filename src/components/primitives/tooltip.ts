import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

export class MetroTooltip extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    text: { type: String, reflect: true },
    placement: { type: String, reflect: true },
  };

  declare open: boolean;
  declare text: string;
  declare placement: "top" | "bottom" | "left" | "right";

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
        transition: opacity var(--metro-transition-fast, 167ms) ease-out;
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

  show(target: Element): void {
    this.#target = target;
    this.open = true;
  }

  hide(): void {
    this.open = false;
  }

  showDelayed(target: Element, delay: number = 500): void {
    this.#hideTimeout = window.setTimeout(() => {
      this.show(target);
    }, delay);
  }

  hideImmediate(): void {
    if (this.#hideTimeout) {
      clearTimeout(this.#hideTimeout);
      this.#hideTimeout = null;
    }
    this.hide();
  }

  protected updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("open") && this.open && this.#target) {
      requestAnimationFrame(() => this.#positionTooltip());
    }
  }

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
