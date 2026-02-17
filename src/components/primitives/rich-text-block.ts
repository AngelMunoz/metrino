import { LitElement, html, css } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { baseTypography } from "../../styles/shared.ts";

const TRIMMING_NONE = "none";
const TRIMMING_CLIP = "clip";
const TRIMMING_ELLIPSIS = "ellipsis";
const VALID_TRIMMINGS = new Set([TRIMMING_NONE, TRIMMING_CLIP, TRIMMING_ELLIPSIS]);

export class MetroRichTextBlock extends LitElement {
  static properties = {
    content: { type: String },
    textTrimming: { type: String, attribute: "text-trimming", reflect: true },
    maxLines: { type: Number, attribute: "max-lines", reflect: true },
  };

  declare content: string;
  declare textTrimming: string;
  declare maxLines: number | null;

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
    const content = this.content ? unsafeHTML(this.content) : html`<slot></slot>`;

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

customElements.define("metro-rich-text-block", MetroRichTextBlock);

declare global {
  interface HTMLElementTagNameMap {
    "metro-rich-text-block": MetroRichTextBlock;
  }
}
