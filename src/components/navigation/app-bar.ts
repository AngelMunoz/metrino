import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";
import "../primitives/icon.ts";

export class MetroAppBar extends LitElement {
  static properties = {
    placement: { type: String, reflect: true },
    expanded: { type: Boolean, reflect: true },
  };

  declare placement: "top" | "bottom";
  declare expanded: boolean;

  static styles = [
    baseTypography,
    css`
      :host {
        display: flex;
        flex-direction: column;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--metro-background, #1f1f1f);
        z-index: 1000;
        transition: height var(--metro-transition-normal, 250ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      :host([placement="top"]) {
        top: 0;
        bottom: auto;
      }
      .app-bar-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--metro-spacing-sm, 8px);
      }
      :host(:not([expanded])) .app-bar-content {
        border-top: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }
      :host([placement="top"]:not([expanded])) .app-bar-content {
        border-top: none;
        border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }
      :host([expanded]) {
        border-top: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }
      :host([placement="top"][expanded]) {
        border-top: none;
        border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }
      .app-bar-buttons {
        display: flex;
        gap: var(--metro-spacing-sm, 8px);
        align-items: center;
      }
      .ellipsis-btn {
        min-width: 48px;
        min-height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: var(--metro-foreground, #ffffff);
        cursor: pointer;
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 3px;
        transition: background-color var(--metro-transition-fast, 167ms) ease-out;
      }
      .ellipsis-btn:hover {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      .menu-panel {
        display: none;
        flex-direction: column;
        padding: 0 var(--metro-spacing-md, 12px) var(--metro-spacing-sm, 8px);
      }
      :host([placement="top"]) .menu-panel {
        animation: menuSlideDown var(--metro-transition-normal, 250ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      @keyframes menuSlideUp {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes menuSlideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      :host([expanded]) .menu-panel {
        display: flex;
      }
      ::slotted(metro-app-bar-button) {
        --button-label-hidden: 1;
      }
      :host([expanded]) ::slotted(metro-app-bar-button) {
        --button-label-hidden: 0;
      }
    `,
  ];

  constructor() {
    super();
    this.placement = "bottom";
    this.expanded = false;
  }

  render() {
    return html`
      <div class="menu-panel" role="menu">
        <slot name="menu"></slot>
      </div>
      <div class="app-bar-content">
        <slot name="content"></slot>
        <div class="app-bar-buttons">
          <slot></slot>
        </div>
        <button
          class="ellipsis-btn"
          @click=${this.#toggleMenu}
          aria-label="More options"
          aria-expanded=${this.expanded}
        >
          ...
        </button>
      </div>
    `;
  }

  #toggleMenu(): void {
    this.expanded = !this.expanded;
    this.dispatchEvent(
      new CustomEvent("menu-toggle", {
        detail: { expanded: this.expanded },
        bubbles: true,
        composed: true,
      }),
    );
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("click", this.#handleDocumentClick);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("click", this.#handleDocumentClick);
  }

  #handleDocumentClick = (e: MouseEvent): void => {
    if (!this.contains(e.target as Node) && this.expanded) {
      this.expanded = false;
    }
  };
}

customElements.define("metro-app-bar", MetroAppBar);

declare global {
  interface HTMLElementTagNameMap {
    "metro-app-bar": MetroAppBar;
  }
}
