import { LitElement, html, css } from "lit";
import "./icon.ts";

const baseStyles = css`
  :host {
    display: block;
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
    border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
    background: var(--metro-background, #1f1f1f);
  }
  .expander-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
    cursor: pointer;
    background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
    transition: background-color var(--metro-transition-fast, 167ms) ease-out;
  }
  .expander-header:hover {
    background: var(--metro-highlight-hover, rgba(255, 255, 255, 0.15));
  }
  .expander-title {
    font-size: var(--metro-font-size-normal, 14px);
    font-weight: 400;
    color: var(--metro-foreground, #ffffff);
  }
  .expander-icon {
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
    transition: transform var(--metro-transition-fast, 167ms) ease-out;
    font-size: 12px;
  }
  :host([expanded]) .expander-icon {
    transform: rotate(180deg);
  }
  .expander-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height var(--metro-transition-slow, 333ms)
      var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
  }
  :host([expanded]) .expander-content {
    max-height: 500px;
  }
  .expander-inner {
    padding: var(--metro-spacing-lg, 16px);
  }
`;

export class MetroExpander extends LitElement {
  static properties = {
    expanded: { type: Boolean, reflect: true },
    title: { type: String, reflect: true },
  };

  declare expanded: boolean;
  declare title: string;

  static styles = baseStyles;

  constructor() {
    super();
    this.expanded = false;
    this.title = "";
  }

  render() {
    return html`
      <div class="expander-header" @click=${this.#toggle}>
        <span class="expander-title"
          >${this.title || html`<slot name="header"></slot>`}</span
        >
        <metro-icon class="expander-icon" icon="chevron-down" size="small"></metro-icon>
      </div>
      <div class="expander-content">
        <div class="expander-inner">
          <slot></slot>
        </div>
      </div>
    `;
  }

  #toggle(): void {
    this.expanded = !this.expanded;
    this.dispatchEvent(
      new CustomEvent("expanded", {
        detail: { expanded: this.expanded },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define("metro-expander", MetroExpander);

declare global {
  interface HTMLElementTagNameMap {
    "metro-expander": MetroExpander;
  }
}
