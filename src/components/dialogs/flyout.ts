import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: none;
    position: fixed;
    z-index: 1000;
  }
  :host([open]) {
    display: block;
  }
  .flyout {
    position: absolute;
    background: var(--metro-background, #1f1f1f);
    border: 1px solid var(--metro-border, rgba(255,255,255,0.2));
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    min-width: 160px;
    animation: flyoutEnter var(--metro-transition-fast, 167ms) ease-out;
  }
  @keyframes flyoutEnter {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .backdrop {
    position: fixed;
    inset: 0;
    z-index: -1;
  }
`;

export class MetroFlyout extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    placement: { type: String, reflect: true },
  };

  declare open: boolean;
  declare placement: "top" | "bottom" | "left" | "right";

  static styles = baseStyles;

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
    this.updateComplete.then(() => this.#positionFlyout());
    this.dispatchEvent(new CustomEvent("show", { bubbles: true }));
  }

  hide(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true }));
  }

  #positionFlyout(): void {
    if (!this.#target) return;
    const rect = this.#target.getBoundingClientRect();
    const flyout = this.shadowRoot?.querySelector(".flyout") as HTMLElement;
    if (!flyout) return;

    let top = 0;
    let left = 0;

    switch (this.placement) {
      case "top":
        top = rect.top - flyout.offsetHeight;
        left = rect.left;
        break;
      case "bottom":
        top = rect.bottom;
        left = rect.left;
        break;
      case "left":
        top = rect.top;
        left = rect.left - flyout.offsetWidth;
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
