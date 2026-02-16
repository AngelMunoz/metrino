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
      ${this.open ? html`<div class="backdrop" @click=${this.#close}></div>` : ""}
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

  #positionFlyout(): void {
    if (!this.#target) return;
    const rect = this.#target.getBoundingClientRect();
    const flyout = this.shadowRoot?.querySelector(".flyout") as HTMLElement;
    if (!flyout) return;

    switch (this.placement) {
      case "top":
        flyout.style.top = `${rect.top - flyout.offsetHeight}px`;
        flyout.style.left = `${rect.left}px`;
        break;
      case "bottom":
        flyout.style.top = `${rect.bottom}px`;
        flyout.style.left = `${rect.left}px`;
        break;
      case "left":
        flyout.style.top = `${rect.top}px`;
        flyout.style.left = `${rect.left - flyout.offsetWidth}px`;
        break;
      case "right":
        flyout.style.top = `${rect.top}px`;
        flyout.style.left = `${rect.right}px`;
        break;
    }
  }

  #close(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true }));
  }
}

customElements.define("metro-flyout", MetroFlyout);

declare global {
  interface HTMLElementTagNameMap {
    "metro-flyout": MetroFlyout;
  }
}
