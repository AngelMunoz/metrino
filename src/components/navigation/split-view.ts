import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: flex;
    height: 100%;
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
  }
  .split-pane {
    background: var(--metro-background, #1f1f1f);
    border-right: 1px solid var(--metro-border, rgba(255,255,255,0.2));
    transition: width var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
    overflow: hidden;
  }
  :host([pane-placement="right"]) .split-pane {
    border-right: none;
    border-left: 1px solid var(--metro-border, rgba(255,255,255,0.2));
    order: 2;
  }
  :host([pane-placement="right"]) .content {
    order: 1;
  }
  .split-pane.closed {
    width: 0;
  }
  .split-pane.compact {
    width: 48px;
  }
  .split-pane.full {
    width: 320px;
  }
  .pane-content {
    width: 320px;
    height: 100%;
    overflow-y: auto;
  }
  .compact .pane-content {
    width: 48px;
  }
  .content {
    flex: 1;
    overflow: auto;
    background: var(--metro-background, #1f1f1f);
  }
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--metro-transition-fast, 167ms) ease-out;
  }
  :host([open]) .backdrop {
    opacity: 1;
    pointer-events: auto;
  }
  @media (max-width: 768px) {
    .split-pane {
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 1000;
      transform: translateX(-100%);
      transition: transform var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
    }
    :host([pane-placement="right"]) .split-pane {
      left: auto;
      right: 0;
      transform: translateX(100%);
    }
    :host([open]) .split-pane {
      transform: translateX(0);
    }
    .split-pane.compact {
      width: 280px;
    }
    .split-pane.full {
      width: 280px;
    }
  }
`;

export class MetroSplitView extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    displayMode: { type: String, reflect: true },
    panePlacement: { type: String, reflect: true },
  };

  declare open: boolean;
  declare displayMode: "overlay" | "compact" | "full";
  declare panePlacement: "left" | "right";

  static styles = baseStyles;

  constructor() {
    super();
    this.open = false;
    this.displayMode = "overlay";
    this.panePlacement = "left";
  }

  render() {
    return html`
      ${this.#isMobile() && this.open ? html`<div class="backdrop" @click=${this.#close}></div>` : ""}
      <div class="split-pane ${this.#getPaneClass()}">
        <div class="pane-content">
          <slot name="pane"></slot>
        </div>
      </div>
      <div class="content">
        <slot></slot>
      </div>
    `;
  }

  #getPaneClass(): string {
    if (this.#isMobile()) {
      return this.open ? "full" : "closed";
    }
    if (this.displayMode === "compact") return "compact";
    if (this.displayMode === "full") return "full";
    return this.open ? "full" : "closed";
  }

  #isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  #close(): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent("paneclosed", { bubbles: true }));
  }

  toggle(): void {
    this.open = !this.open;
    this.dispatchEvent(new CustomEvent(this.open ? "paneopened" : "paneclosed", { bubbles: true }));
  }
}

customElements.define("metro-split-view", MetroSplitView);

declare global {
  interface HTMLElementTagNameMap {
    "metro-split-view": MetroSplitView;
  }
}
