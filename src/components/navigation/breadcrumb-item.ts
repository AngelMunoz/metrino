import { LitElement, html, css } from "lit";
import { reducedMotionBlanket } from "../../styles/shared.ts";

/**
 * Metro Breadcrumb Item Component
 *
 * A child component for MetroBreadcrumbBar that represents a single crumb in
 * the trail. The label comes from the "header" attribute, falling back to the
 * element text content. An optional "href" turns the crumb into a link instead
 * of a button when rendered by the parent bar.
 *
 * Use as light-DOM children of metro-breadcrumb-bar.
 *
 * @slot - Default slot for the crumb label (used when "header" is not set)
 */
export class MetroBreadcrumbItem extends LitElement {
  static properties = {
    /**
     * Text label for this crumb.
     * Falls back to the element text content when not set.
     * @default ""
     */
    header: { type: String, reflect: true },
    /**
     * Optional URL for this crumb. When set, the parent renders a link;
     * otherwise it renders a button.
     * @default ""
     */
    href: { type: String, reflect: true },
  };

  declare header: string;
  declare href: string;

  static styles = [
    reducedMotionBlanket,
    css`
      :host {
        display: inline;
      }
    `,
  ];

  constructor() {
    super();
    this.header = "";
    this.href = "";
  }

  render() {
    return html`<slot></slot>`;
  }

  /**
   * The display label for this crumb: the header attribute or the trimmed
   * text content, whichever carries the label.
   * @returns the crumb label
   */
  get label(): string {
    if (this.header) {
      return this.header;
    }
    return (this.textContent ?? "").trim();
  }
}

export function registerMetroBreadcrumbItem(): void {
  if (!customElements.get("metro-breadcrumb-item")) {
    customElements.define("metro-breadcrumb-item", MetroBreadcrumbItem);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-breadcrumb-item": MetroBreadcrumbItem;
  }
}
