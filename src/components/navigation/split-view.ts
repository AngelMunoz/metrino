import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: flex;
    position: relative;
    height: 100%;
    width: 100%;
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
    overflow: hidden;
  }

  .split-pane {
    height: 100%;
    background: var(--metro-background, #1f1f1f);
    overflow: hidden;
    box-sizing: border-box;
  }

  .pane-content {
    height: 100%;
    width: 320px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .content {
    flex: 1;
    height: 100%;
    overflow: auto;
    background: var(--metro-background, #1f1f1f);
  }

  /* Overlay mode - pane slides over content */
  :host([display-mode="overlay"]) .split-pane {
    position: absolute;
    top: 0;
    left: 0;
    width: 320px;
    transform: translateX(-100%);
    transition: transform var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
    z-index: 100;
    border-right: 1px solid var(--metro-border, rgba(255,255,255,0.2));
  }

  :host([display-mode="overlay"][pane-placement="right"]) .split-pane {
    left: auto;
    right: 0;
    transform: translateX(100%);
    border-right: none;
    border-left: 1px solid var(--metro-border, rgba(255,255,255,0.2));
  }

  :host([display-mode="overlay"][open]) .split-pane {
    transform: translateX(0);
  }

  /* Inline mode - pane pushes content */
  :host([display-mode="inline"]) .split-pane {
    width: 0;
    transition: width var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
    border-right: 1px solid var(--metro-border, rgba(255,255,255,0.2));
  }

  :host([display-mode="inline"][pane-placement="right"]) .split-pane {
    order: 2;
    border-right: none;
    border-left: 1px solid var(--metro-border, rgba(255,255,255,0.2));
  }

  :host([display-mode="inline"][pane-placement="right"]) .content {
    order: 1;
  }

  :host([display-mode="inline"][open]) .split-pane {
    width: 320px;
  }

  /* Compact mode - always shows 48px, expands to full when open */
  :host([display-mode="compact"]) .split-pane {
    width: 48px;
    transition: width var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
    border-right: 1px solid var(--metro-border, rgba(255,255,255,0.2));
  }

  :host([display-mode="compact"][pane-placement="right"]) .split-pane {
    order: 2;
    border-right: none;
    border-left: 1px solid var(--metro-border, rgba(255,255,255,0.2));
  }

  :host([display-mode="compact"][pane-placement="right"]) .content {
    order: 1;
  }

  :host([display-mode="compact"][open]) .split-pane {
    width: 320px;
  }

  :host([display-mode="compact"]) .pane-content {
    width: 320px;
  }

  /* Backdrop for overlay mode */
  .backdrop {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 50;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--metro-transition-fast, 167ms) ease-out;
  }

  :host([display-mode="overlay"][open]) .backdrop {
    opacity: 1;
    pointer-events: auto;
  }
`;

export class MetroSplitView extends LitElement {
  static properties = {
    open: { type: Boolean, reflect: true },
    displayMode: { type: String, reflect: true, attribute: "display-mode" },
    panePlacement: { type: String, reflect: true, attribute: "pane-placement" },
  };

  declare open: boolean;
  declare displayMode: "overlay" | "inline" | "compact";
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
      <div class="backdrop" @click=${this.#handleBackdropClick}></div>
      <div class="split-pane">
        <div class="pane-content">
          <slot name="pane"></slot>
        </div>
      </div>
      <div class="content">
        <slot></slot>
      </div>
    `;
  }

  #handleBackdropClick(): void {
    if (this.displayMode === "overlay") {
      this.open = false;
      this.dispatchEvent(new CustomEvent("paneclosed", { bubbles: true }));
    }
  }

  toggle(): void {
    this.open = !this.open;
    this.dispatchEvent(new CustomEvent(this.open ? "paneopened" : "paneclosed", { bubbles: true }));
  }

  show(): void {
    if (!this.open) {
      this.open = true;
      this.dispatchEvent(new CustomEvent("paneopened", { bubbles: true }));
    }
  }

  hide(): void {
    if (this.open) {
      this.open = false;
      this.dispatchEvent(new CustomEvent("paneclosed", { bubbles: true }));
    }
  }
}

customElements.define("metro-split-view", MetroSplitView);

declare global {
  interface HTMLElementTagNameMap {
    "metro-split-view": MetroSplitView;
  }
}
