import { LitElement, html, css, type PropertyValues } from "lit";
import { baseTypography, formLabel, disabledState } from "../../styles/shared.ts";

export class MetroRichEditBox extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: String },
    placeholder: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    readonly: { type: Boolean, reflect: true },
    label: { type: String, reflect: true },
    name: { type: String, reflect: true },
  };

  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare readonly: boolean;
  declare label: string;
  declare name: string;

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
        transition: background-color var(--metro-transition-fast, 167ms) ease-out;
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
        font-family: inherit;
        line-height: 1.4;
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        border: 2px solid transparent;
        color: var(--metro-foreground, #ffffff);
        outline: none;
        transition: border-color var(--metro-transition-fast, 167ms) ease-out;
        box-sizing: border-box;
        overflow: auto;
      }
      .editor:focus {
        border-color: var(--metro-accent, #0078d4);
      }
      .editor:empty::before {
        content: attr(data-placeholder);
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
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
        >B</button>
        <button
          class="toolbar-btn"
          type="button"
          @click=${() => this.#execCommand("italic")}
          title="Italic"
          aria-label="Italic"
          style="font-style: italic;"
        >I</button>
        <button
          class="toolbar-btn"
          type="button"
          @click=${() => this.#execCommand("underline")}
          title="Underline"
          aria-label="Underline"
          style="text-decoration: underline;"
        >U</button>
        <button
          class="toolbar-btn"
          type="button"
          @click=${() => this.#execCommand("strikeThrough")}
          title="Strikethrough"
          aria-label="Strikethrough"
          style="text-decoration: line-through;"
        >S</button>
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
        ></div>
      </div>
    `;
  }

  firstUpdated(): void {
    const editor = this.shadowRoot?.querySelector(".editor") as HTMLDivElement;
    if (editor && this.value) {
      editor.innerHTML = this.value;
    }
    this.#updateFormValue();
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("value")) {
      const editor = this.shadowRoot?.querySelector(".editor") as HTMLDivElement;
      if (editor && editor.innerHTML !== this.value) {
        editor.innerHTML = this.value;
      }
      this.#updateFormValue();
    }
  }

  #updateFormValue(): void {
    this.#internals.setFormValue(this.value);
  }

  #execCommand(command: string): void {
    document.execCommand(command, false);
    this.#syncValue();
  }

  #syncValue(): void {
    const editor = this.shadowRoot?.querySelector(".editor") as HTMLDivElement;
    if (editor) {
      this.value = editor.innerHTML;
      this.#updateFormValue();
    }
  }

  #handleInput(): void {
    this.#syncValue();
    this.dispatchEvent(
      new CustomEvent("input", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #handleBlur(): void {
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  formAssociatedCallback(_form: HTMLFormElement): void {}

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = "";
    const editor = this.shadowRoot?.querySelector(".editor") as HTMLDivElement;
    if (editor) {
      editor.innerHTML = "";
    }
    this.#updateFormValue();
  }

  formStateRestoreCallback(
    state: string | File | FormData | null,
    _mode: "restore" | "autocomplete",
  ): void {
    if (typeof state === "string") {
      this.value = state;
      const editor = this.shadowRoot?.querySelector(".editor") as HTMLDivElement;
      if (editor) {
        editor.innerHTML = state;
      }
      this.#updateFormValue();
    }
  }
}

customElements.define("metro-rich-edit-box", MetroRichEditBox);

declare global {
  interface HTMLElementTagNameMap {
    "metro-rich-edit-box": MetroRichEditBox;
  }
}
