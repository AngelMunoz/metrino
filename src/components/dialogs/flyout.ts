import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

export class MetroFlyout extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    placement: { type: String, reflect: true },
  };

  declare open: boolean;
  declare placement: "top" | "bottom" | "left" | "right";

  static styles = [
    baseTypography,
    css`
      :host {
        display: none;
        position: fixed;
        z-index: 1000;
      }
      :host([open]) {
        display: block;
      }
      .flyout {
        position: fixed;
        background: var(--metro-background, #1f1f1f);
        min-width: 160px;
        opacity: 0;
        transform: translateY(-8px);
        transition: opacity var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)), transform var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      :host([open]) .flyout {
        opacity: 1;
        transform: translateY(0);
      }
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: -1;
      }
    `,
  ];

  #target: Element | null = null;

  constructor() {
    super();
    this.open = false;
    this.placement = "bottom";
  }

  render() {
    return html`
      <div class="backdrop" @click=${this.#close}></div>
      <div class="flyout">
        <slot></slot>
      </div>
    `;
  }

  show(target: Element): void {
    this.#target = target;
    this.open = true;
    this.dispatchEvent(new CustomEvent("show", { bubbles: true }));
  }

  hide(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true }));
  }

  protected updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("open") && this.open && this.#target) {
      requestAnimationFrame(() => this.#positionFlyout());
    }
  }

  #positionFlyout(): void {
    if (!this.#target) return;
    const rect = this.#target.getBoundingClientRect();
    const flyout = this.shadowRoot?.querySelector(".flyout") as HTMLElement;
    if (!flyout) return;

    const flyoutRect = flyout.getBoundingClientRect();
    let top = 0;
    let left = 0;

    switch (this.placement) {
      case "top":
        top = rect.top - flyoutRect.height;
        left = rect.left;
        break;
      case "bottom":
        top = rect.bottom;
        left = rect.left;
        break;
      case "left":
        top = rect.top;
        left = rect.left - flyoutRect.width;
        break;
      case "right":
        top = rect.top;
        left = rect.right;
        break;
    }

    flyout.style.top = `${top}px`;
    flyout.style.left = `${left}px`;
  }

  #close(): void {
    this.hide();
  }
}

customElements.define("metro-flyout", MetroFlyout);

declare global {
  interface HTMLElementTagNameMap {
    "metro-flyout": MetroFlyout;
  }
}
