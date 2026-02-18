import { LitElement, html, css } from "lit";
import type { PropertyValues } from "lit";
import { baseTypography, disabledState, hoverHighlight } from "../../styles/shared.ts";
import "../primitives/icon.ts";

export class MetroAppBarToggleButton extends LitElement {
  static properties = {
    icon: { type: String, reflect: true },
    label: { type: String, reflect: true },
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    menuItem: { type: Boolean, attribute: "menu-item", reflect: true },
  };

  declare icon: string;
  declare label: string;
  declare checked: boolean;
  declare disabled: boolean;
  declare menuItem: boolean;

  static styles = [
    baseTypography,
    disabledState,
    hoverHighlight,
    css`
      :host {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 48px;
        min-height: 48px;
        padding: var(--metro-spacing-xs, 4px);
        background: transparent;
        border: none;
        color: var(--metro-foreground, #ffffff);
        cursor: pointer;
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .icon-circle {
        width: 40px;
        height: 40px;
        border: 2px solid var(--metro-foreground, #ffffff);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition:
          background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          border-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      :host([checked]) .icon-circle {
        background: var(--metro-accent, #0078d4);
        border-color: var(--metro-accent, #0078d4);
      }
      :host([checked]) .icon-circle metro-icon {
        color: var(--metro-foreground, #ffffff);
      }
      :host(:hover) .icon-circle {
        background: var(--metro-foreground, #ffffff);
        border-color: var(--metro-foreground, #ffffff);
      }
      :host(:hover) .icon-circle metro-icon {
        color: var(--metro-background, #1f1f1f);
      }
      :host([checked]:hover) .icon-circle {
        background: var(--metro-accent-light, #429ce3);
        border-color: var(--metro-accent-light, #429ce3);
      }
      :host([checked]:hover) .icon-circle metro-icon {
        color: var(--metro-foreground, #ffffff);
      }
      .icon-inner {
        color: var(--metro-foreground, #ffffff);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .label {
        font-size: var(--metro-font-size-small, 12px);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        max-height: 0;
        opacity: 0;
        overflow: hidden;
        margin-top: 0;
        transition:
          max-height var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          opacity var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
          margin-top var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      :host([data-expanded]) .label {
        max-height: 20px;
        opacity: 1;
        margin-top: var(--metro-spacing-xs, 4px);
      }
      :host([menu-item]) {
        flex-direction: row;
        min-width: auto;
        min-height: auto;
        padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
        justify-content: flex-start;
      }
      :host([menu-item]) .icon-circle {
        width: 24px;
        height: 24px;
        border-width: 1px;
        margin-right: var(--metro-spacing-md, 12px);
        flex-shrink: 0;
      }
      :host([menu-item]) .icon-inner {
        font-size: 14px;
      }
      :host([menu-item]) .label {
        max-height: 20px;
        opacity: 1;
        margin-top: 0;
        text-transform: none;
      }
    `,
  ];

  #observer: MutationObserver | null = null;

  constructor() {
    super();
    this.icon = "";
    this.label = "";
    this.checked = false;
    this.disabled = false;
    this.menuItem = false;
  }

  render() {
    return html`
      <div class="icon-circle" @click=${this.#handleClick} @keydown=${this.#handleKeyDown} tabindex="0" role="checkbox" aria-checked=${this.checked} aria-disabled=${this.disabled}>
        ${this.icon
          ? html`<metro-icon class="icon-inner" icon=${this.icon} size="medium"></metro-icon>`
          : html`<slot></slot>`}
      </div>
      ${this.label ? html`<div class="label">${this.label}</div>` : ""}
    `;
  }

  #handleClick(e: MouseEvent): void {
    if (this.disabled) return;
    e.stopPropagation();
    this.checked = !this.checked;
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { checked: this.checked },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #handleKeyDown(e: KeyboardEvent): void {
    if (this.disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.checked = !this.checked;
      this.dispatchEvent(
        new CustomEvent("change", {
          detail: { checked: this.checked },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.#setupObserver();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = null;
    }
  }

  #setupObserver(): void {
    const appBar = this.closest("metro-app-bar");
    if (!appBar) return;

    this.#observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "expanded") {
          this.#updateExpandedState(appBar);
        }
      }
    });

    this.#observer.observe(appBar, { attributes: true, attributeFilter: ["expanded"] });
    this.#updateExpandedState(appBar);
  }

  #updateExpandedState(appBar: Element): void {
    const isExpanded = appBar.hasAttribute("expanded");
    this.toggleAttribute("data-expanded", isExpanded);
  }

  protected updated(changedProperties: PropertyValues<this>): void {
    super.updated(changedProperties);
    if (changedProperties.has("icon") || changedProperties.has("label")) {
      const appBar = this.closest("metro-app-bar");
      if (appBar) {
        this.#updateExpandedState(appBar);
      }
    }
  }
}

customElements.define("metro-app-bar-toggle-button", MetroAppBarToggleButton);

declare global {
  interface HTMLElementTagNameMap {
    "metro-app-bar-toggle-button": MetroAppBarToggleButton;
  }
}
