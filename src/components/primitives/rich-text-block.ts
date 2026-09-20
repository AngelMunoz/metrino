import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";
import { sanitizeHtmlFragment } from "../../utils/sanitize.ts";

const TRIMMING_NONE = "none";
const TRIMMING_CLIP = "clip";
const TRIMMING_ELLIPSIS = "ellipsis";
const VALID_TRIMMINGS = new Set([TRIMMING_NONE, TRIMMING_CLIP, TRIMMING_ELLIPSIS]);

/**
 * Metro Rich Text Block Component
 *
 * Renders formatting markup from `content`, or projects slotted children when
 * `content` is empty. Content is always sanitized before rendering: only basic
 * text-formatting elements and safe link attributes survive. Provide a
 * `sanitize` function to apply an additional policy, or use the default slot
 * to project arbitrary (trusted) content.
 *
 * @slot - Default slot used when `content` is empty
 */
export class MetroRichTextBlock extends LitElement {
  static properties = {
    content: { type: String },
    textTrimming: { type: String, attribute: "text-trimming", reflect: true },
    maxLines: { type: Number, attribute: "max-lines", reflect: true },
    sanitize: { attribute: false },
  };

  declare content: string;
  declare textTrimming: string;
  declare maxLines: number | null;
  /**
   * Optional sanitizer applied to `content` before the built-in sanitizer
   * runs, e.g. `el.sanitize = (html) => DOMPurify.sanitize(html)`.
   * Property only.
   */
  declare sanitize: ((html: string) => string) | undefined;

  static styles = [
    baseTypography,
    css`
      :host {
        display: block;
        font-size: var(--metro-font-size-normal, 14px);
        font-weight: 400;
        color: var(--metro-foreground, #ffffff);
        line-height: 1.4;
        word-wrap: break-word;
        overflow-wrap: break-word;
      }
      :host([text-trimming="clip"]) .content {
        overflow: hidden;
      }
      :host([text-trimming="ellipsis"]) .content {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .content {
        width: 100%;
      }
      .line-clamp {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: var(--max-lines, 1);
        overflow: hidden;
      }
    `,
  ];

  constructor() {
    super();
    this.content = "";
    this.textTrimming = TRIMMING_NONE;
    this.maxLines = null;
  }

  willUpdate(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("textTrimming")) {
      if (this.textTrimming && !VALID_TRIMMINGS.has(this.textTrimming)) {
        throw new TypeError(
          `Invalid text-trimming "${this.textTrimming}". Expected: none, clip, ellipsis`,
        );
      }
    }
  }

  render() {
    const shouldClamp = this.maxLines !== null && this.maxLines > 0;
    const raw = this.sanitize ? this.sanitize(this.content) : this.content;
    const content = raw ? sanitizeHtmlFragment(raw) : html`<slot></slot>`;

    return html`
      <div
        class="content${shouldClamp ? " line-clamp" : ""}"
        style=${shouldClamp ? `--max-lines: ${this.maxLines}` : ""}
      >
        ${content}
      </div>
    `;
  }
}

export function registerMetroRichTextBlock(): void {
  if (!customElements.get("metro-rich-text-block")) {
    customElements.define("metro-rich-text-block", MetroRichTextBlock);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-rich-text-block": MetroRichTextBlock;
  }
}
