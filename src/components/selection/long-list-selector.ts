import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: block;
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
    position: relative;
  }
  .list-container {
    max-height: 300px;
    overflow-y: auto;
    border: 2px solid var(--metro-border, rgba(255,255,255,0.2));
  }
  .group-header {
    background: var(--metro-highlight, rgba(255,255,255,0.1));
    color: var(--metro-accent, #0078d4);
    padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-size: var(--metro-font-size-small, 12px);
    position: sticky;
    top: 0;
  }
  ::slotted(.list-item) {
    display: block;
    padding: var(--metro-spacing-md, 12px);
    cursor: pointer;
    color: var(--metro-foreground, #ffffff);
    border-bottom: 1px solid var(--metro-border, rgba(255,255,255,0.1));
    transition: background-color var(--metro-transition-fast, 167ms) ease-out;
  }
  ::slotted(.list-item:hover) {
    background: var(--metro-highlight, rgba(255,255,255,0.1));
  }
  .jump-list {
    position: absolute;
    right: 4px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    flex-direction: column;
    font-size: 10px;
    font-weight: 600;
    color: var(--metro-accent, #0078d4);
  }
  .jump-item {
    padding: 2px 4px;
    cursor: pointer;
  }
`;

export class MetroLongListSelector extends LitElement {
  static properties = {
    groupBy: { type: String, reflect: true },
  };

  declare groupBy: string;

  static styles = baseStyles;

  constructor() {
    super();
    this.groupBy = "";
  }

  render() {
    return html`
      <div class="list-container">
        <slot></slot>
      </div>
      <div class="jump-list" part="jump-list">
        ${this.#renderJumpList()}
      </div>
    `;
  }

  #renderJumpList() {
    const items = this.querySelectorAll("[data-group]");
    const groups = new Set(Array.from(items).map(item => item.getAttribute("data-group")));
    return Array.from(groups).map(group => html`
      <span class="jump-item" @click=${() => this.#jumpToGroup(group)}>${group?.charAt(0)}</span>
    `);
  }

  #jumpToGroup(group: string | null): void {
    const target = this.querySelector(`[data-group="${group}"]`);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  }
}

customElements.define("metro-long-list-selector", MetroLongListSelector);

declare global {
  interface HTMLElementTagNameMap {
    "metro-long-list-selector": MetroLongListSelector;
  }
}
