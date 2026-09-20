import { LitElement, html, css } from "lit";

export class MetroGrid extends LitElement {
  static properties = {
    rows: { type: String },
    columns: { type: String },
  };

  declare rows: string | undefined;
  declare columns: string | undefined;

  #hostStyles: CSSStyleSheet | undefined;

  static styles = css`
    :host { display: grid; box-sizing: border-box; gap: var(--metro-gap, 8px); }
    ::slotted(*) { min-width: 0; min-height: 0; }
  `;

  render() {
    return html`<slot></slot>`;
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();
    if (!(root instanceof ShadowRoot)) return root;
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(":host {}");
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet];
    this.#hostStyles = sheet;
    return root;
  }

  protected updated(): void {
    const sheet = this.#hostStyles;
    if (!sheet) return;
    const rule = sheet.cssRules[0];
    if (!(rule instanceof CSSStyleRule)) return;
    const style = rule.style;
    style.setProperty("grid-template-rows", "");
    style.setProperty("grid-template-columns", "");
    if (this.rows) style.setProperty("grid-template-rows", this.rows);
    if (this.columns) style.setProperty("grid-template-columns", this.columns);
  }
}

export function registerMetroGrid(): void {
  if (!customElements.get("metro-grid")) {
    customElements.define("metro-grid", MetroGrid);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-grid": MetroGrid;
  }
}
