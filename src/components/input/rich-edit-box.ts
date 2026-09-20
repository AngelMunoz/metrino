import { LitElement, html, css, type PropertyValues } from "lit";
import { baseTypography, formLabel, disabledState } from "../../styles/shared.ts";
import { sanitizeHtmlFragment } from "../../utils/sanitize.ts";

/**
 * Metro Rich Edit Box Component
 *
 * A contenteditable rich text editor. `value` holds the editor's HTML and new
 * values are sanitized by a built-in allowlist before they reach the editor;
 * pasted and dropped markup is sanitized as well. An optional `sanitize`
 * function can apply an additional policy first. Sanitize the emitted value on
 * the host side before persisting it or rendering it outside the editor.
 */
export class MetroRichEditBox extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: String },
    placeholder: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    label: { type: String, reflect: true },
    name: { type: String, reflect: true },
    sanitize: { attribute: false },
  };

  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare readonly: boolean;
  declare label: string;
  declare name: string;
  /**
   * Optional sanitizer applied to programmatic values and pasted markup
   * before the built-in sanitizer runs, e.g.
   * `el.sanitize = (html) => DOMPurify.sanitize(html)`. Property only.
   */
  declare sanitize: ((html: string) => string) | undefined;

  static styles = [
    baseTypography,
    formLabel,
    disabledState,
    css`
      :host {
        display: block;
      }
      .toolbar {
        display: flex;
        gap: 2px;
        padding: var(--metro-spacing-xs, 4px);
        background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
        border: 2px solid transparent;
        border-bottom: none;
      }
      .toolbar-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        background: transparent;
        border: none;
        color: var(--metro-foreground, #ffffff);
        cursor: pointer;
        font-size: var(--metro-font-size-normal, 14px);
        font-weight: 600;
        transition: background-color var(--metro-transition-fast, 167ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .toolbar-btn:focus {
        outline: 2px solid var(--metro-accent, #0078d4);
        outline-offset: 2px;
      }
      .toolbar-btn:hover {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      .toolbar-btn:active {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.2));
      }
      .toolbar-btn.active {
        background: var(--metro-accent, #0078d4);
      }
      .editor-container {
        position: relative;
      }
      .editor {
        width: 100%;
        min-height: 100px;
        padding: var(--metro-spacing-md, 12px);
        font-size: var(--metro-font-size-normal, 14px);
        line-height: 1.4;
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        border: 2px solid transparent;
        color: var(--metro-foreground, #ffffff);
        outline: none;
        transition: border-color var(--metro-transition-fast, 167ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        box-sizing: border-box;
        overflow: auto;
      }
      .editor:focus {
        border-color: var(--metro-accent, #0078d4);
      }
      .editor:empty::before {
        content: attr(data-placeholder);
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        pointer-events: none;
      }
      .editor[contenteditable="false"] {
        cursor: default;
      }
    `,
  ];

  #internals: ElementInternals;

  constructor() {
    super();
    this.value = "";
    this.placeholder = "";
    this.disabled = false;
    this.readonly = false;
    this.label = "";
    this.name = "";
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : ""}
      <div class="toolbar" ?hidden=${this.disabled || this.readonly}>
        <button
          class="toolbar-btn"
          type="button"
          @click=${() => this.#execCommand("bold")}
          title="Bold"
          aria-label="Bold"
        >
          B
        </button>
        <button
          class="toolbar-btn"
          type="button"
          @click=${() => this.#execCommand("italic")}
          title="Italic"
          aria-label="Italic"
          style="font-style: italic;"
        >
          I
        </button>
        <button
          class="toolbar-btn"
          type="button"
          @click=${() => this.#execCommand("underline")}
          title="Underline"
          aria-label="Underline"
          style="text-decoration: underline;"
        >
          U
        </button>
        <button
          class="toolbar-btn"
          type="button"
          @click=${() => this.#execCommand("strikeThrough")}
          title="Strikethrough"
          aria-label="Strikethrough"
          style="text-decoration: line-through;"
        >
          S
        </button>
      </div>
      <div class="editor-container">
        <div
          class="editor"
          role="textbox"
          aria-multiline="true"
          aria-label=${this.label || "Rich text editor"}
          contenteditable=${!this.disabled && !this.readonly ? "true" : "false"}
          data-placeholder=${this.placeholder}
          @input=${this.#handleInput}
          @blur=${this.#handleBlur}
          @paste=${this.#handlePaste}
          @dragover=${this.#handleDragOver}
          @drop=${this.#handleDrop}
        ></div>
      </div>
    `;
  }

  #lastSyncedValue = "";

  firstUpdated(): void {
    this.#writeValue(this.value);
    this.#updateFormValue();
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("value")) {
      if (this.value !== this.#lastSyncedValue) {
        this.#writeValue(this.value);
      }
      this.#updateFormValue();
    }
  }

  #getEditor(): HTMLDivElement | null {
    return this.shadowRoot?.querySelector<HTMLDivElement>(".editor") ?? null;
  }

  /**
   * Places a value in the editor through the built-in sanitizer (after the
   * optional `sanitize` hook) without using an innerHTML sink.
   * @param value - The HTML value to write
   * @returns void
   */
  #writeValue(value: string): void {
    const editor = this.#getEditor();
    if (!editor) return;

    const source = value && this.sanitize ? this.sanitize(value) : value;
    const fragment = sanitizeHtmlFragment(source);

    const probe = document.createElement("div");
    probe.appendChild(fragment);
    if (probe.innerHTML === editor.innerHTML) return;

    editor.replaceChildren(...Array.from(probe.childNodes));
  }

  #updateFormValue(): void {
    this.#internals.setFormValue(this.value);
  }

  #execCommand(command: string): void {
    document.execCommand(command, false);
    this.#syncValue();
  }

  #syncValue(): void {
    const editor = this.#getEditor();
    if (editor) {
      this.#lastSyncedValue = editor.innerHTML;
      this.value = editor.innerHTML;
      this.#updateFormValue();
    }
  }

  #handleInput(): void {
    this.#syncValue();
    this.#emit("input");
  }

  #handlePaste(e: ClipboardEvent): void {
    const data = e.clipboardData;
    if (!data || this.disabled || this.readonly) return;
    e.preventDefault();
    this.#insertMarkup(data.getData("text/html"), data.getData("text/plain"));
  }

  #handleDragOver(e: DragEvent): void {
    e.preventDefault();
  }

  #handleDrop(e: DragEvent): void {
    const data = e.dataTransfer;
    if (!data || this.disabled || this.readonly) return;
    e.preventDefault();
    this.#insertMarkup(data.getData("text/html"), data.getData("text/plain"));
  }

  #insertMarkup(html: string, text: string): void {
    if (html) {
      const source = this.sanitize ? this.sanitize(html) : html;
      this.#insertNode(sanitizeHtmlFragment(source));
    } else if (text) {
      this.#insertNode(document.createTextNode(text));
    } else {
      return;
    }
    this.#syncValue();
    this.#emit("input");
  }

  #insertNode(node: Node): void {
    const editor = this.#getEditor();
    if (!editor) return;

    const lastNode =
      node.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? node.lastChild : node;
    const selection = window.getSelection();
    const range =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    if (!range || !editor.contains(range.commonAncestorContainer)) {
      editor.appendChild(node);
    } else {
      range.deleteContents();
      range.insertNode(node);
    }

    if (selection && lastNode) {
      const after = document.createRange();
      after.setStartAfter(lastNode);
      after.collapse(true);
      selection.removeAllRanges();
      selection.addRange(after);
    }
  }

  #emit(type: "input" | "change"): void {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #handleBlur(): void {
    this.#emit("change");
  }

  formAssociatedCallback(_form: HTMLFormElement): void {}

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = "";
    this.#writeValue("");
    this.#updateFormValue();
  }

  formStateRestoreCallback(
    state: string | File | FormData | null,
    _mode: "restore" | "autocomplete",
  ): void {
    if (typeof state === "string") {
      this.value = state;
      this.#writeValue(state);
      this.#updateFormValue();
    }
  }
}

export function registerMetroRichEditBox(): void {
  if (!customElements.get("metro-rich-edit-box")) {
    customElements.define("metro-rich-edit-box", MetroRichEditBox);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-rich-edit-box": MetroRichEditBox;
  }
}
