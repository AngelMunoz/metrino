import { LitElement, html, css } from "lit";
import type { PropertyValues } from "lit";
import "../primitives/icon.ts";

const baseStyles = css`
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
    font-family: inherit;
    transition: background-color var(--metro-transition-fast, 167ms) ease-out;
  }
  :host(:hover) {
    background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
  }
  :host(:active) {
    background: var(--metro-highlight, rgba(255, 255, 255, 0.2));
  }
  .icon-circle {
    width: 36px;
    height: 36px;
    border: 2px solid var(--metro-foreground, #ffffff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color var(--metro-transition-fast, 167ms) ease-out,
      border-color var(--metro-transition-fast, 167ms) ease-out;
  }
  :host(:hover) .icon-circle {
    background: var(--metro-foreground, #ffffff);
    border-color: var(--metro-foreground, #ffffff);
  }
  :host(:hover) .icon-circle metro-icon {
    color: var(--metro-background, #1f1f1f);
  }
  .icon-inner {
    color: var(--metro-foreground, #ffffff);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color var(--metro-transition-fast, 167ms) ease-out;
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
      max-height var(--metro-transition-fast, 167ms) ease-out,
      opacity var(--metro-transition-fast, 167ms) ease-out,
      margin-top var(--metro-transition-fast, 167ms) ease-out;
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
`;

export class MetroAppBarButton extends LitElement {
  static properties = {
    icon: { type: String, reflect: true },
    label: { type: String, reflect: true },
  };

  declare icon: string;
  declare label: string;

  static styles = baseStyles;

  #observer: MutationObserver | null = null;

  constructor() {
    super();
    this.icon = "";
    this.label = "";
  }

  render() {
    return html`
      <div class="icon-circle">
        ${this.icon
          ? html`<metro-icon class="icon-inner" icon=${this.icon} size="medium"></metro-icon>`
          : html`<slot></slot>`}
      </div>
      ${this.label ? html`<div class="label">${this.label}</div>` : ""}
    `;
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

customElements.define("metro-app-bar-button", MetroAppBarButton);

declare global {
  interface HTMLElementTagNameMap {
    "metro-app-bar-button": MetroAppBarButton;
  }
}
