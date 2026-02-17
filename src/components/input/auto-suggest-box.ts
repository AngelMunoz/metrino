import { LitElement, html, css, type PropertyValues } from "lit";
import "../primitives/icon.ts";

const baseStyles = css`
  :host {
    display: block;
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
    position: relative;
  }
  .input-container {
    position: relative;
    display: flex;
    align-items: center;
  }
  input {
    width: 100%;
    padding: var(--metro-spacing-md, 12px);
    padding-right: 40px;
    font-size: var(--metro-font-size-normal, 14px);
    font-family: inherit;
    background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
    border: 2px solid transparent;
    color: var(--metro-foreground, #ffffff);
    outline: none;
    transition: border-color var(--metro-transition-fast, 167ms) ease-out;
    box-sizing: border-box;
  }
  input:focus {
    border-color: var(--metro-accent, #0078d4);
  }
  input::placeholder {
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
  }
  .search-icon {
    position: absolute;
    right: var(--metro-spacing-md, 12px);
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
    pointer-events: none;
  }
  .suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--metro-background, #1f1f1f);
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
    display: none;
  }
  .suggestions.open {
    display: block;
  }
  .suggestion-item {
    padding: var(--metro-spacing-md, 12px);
    cursor: pointer;
    color: var(--metro-foreground, #ffffff);
    transition: background-color var(--metro-transition-fast, 167ms) ease-out;
  }
  .suggestion-item:hover,
  .suggestion-item.highlighted {
    background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
  }
  .suggestion-item strong {
    color: var(--metro-accent, #0078d4);
  }
  .no-results {
    padding: var(--metro-spacing-md, 12px);
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
    font-style: italic;
  }
`;

export class MetroAutoSuggestBox extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: String, reflect: true },
    placeholder: { type: String, reflect: true },
    query: { type: String },
    disabled: { type: Boolean, reflect: true },
    name: { type: String, reflect: true },
  };

  declare value: string;
  declare placeholder: string;
  declare query: string;
  declare disabled: boolean;
  declare name: string;

  static styles = baseStyles;

  #internals: ElementInternals;
  #suggestions: string[] = [];
  #highlightedIndex = -1;
  #isOpen = false;

  constructor() {
    super();
    this.value = "";
    this.placeholder = "Search...";
    this.query = "";
    this.disabled = false;
    this.name = "";
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      <div class="input-container">
        <input
          type="text"
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          @input=${this.#handleInput}
          @keydown=${this.#handleKeydown}
          @focus=${this.#handleFocus}
          @blur=${this.#handleBlur}
        />
        <metro-icon class="search-icon" icon="search" size="normal"></metro-icon>
      </div>
      <div class="suggestions ${this.#isOpen ? "open" : ""}">
        ${this.#suggestions.length === 0 && this.query
          ? html`<div class="no-results">No results found</div>`
          : this.#suggestions.map(
              (suggestion, index) => html`
                <div
                  class="suggestion-item ${index === this.#highlightedIndex
                    ? "highlighted"
                    : ""}"
                  @mousedown=${(e: Event) =>
                    this.#selectSuggestion(suggestion, e)}
                >
                  ${this.#highlightMatch(suggestion)}
                </div>
              `,
            )}
      </div>
    `;
  }

  firstUpdated(): void {
    this.#updateFormValue();
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("value")) {
      this.#updateFormValue();
    }
  }

  #updateFormValue(): void {
    this.#internals.setFormValue(this.value);
  }

  #highlightMatch(text: string) {
    if (!this.query) return text;
    const regex = new RegExp(`(${this.query})`, "gi");
    const parts = text.split(regex);
    return parts.map((part) =>
      part.toLowerCase() === this.query.toLowerCase()
        ? html`<strong>${part}</strong>`
        : part,
    );
  }

  #handleInput(e: InputEvent): void {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    this.query = this.value;
    this.#updateFormValue();
    this.#isOpen = true;
    this.#highlightedIndex = -1;

    this.dispatchEvent(
      new CustomEvent("textchanged", {
        detail: { text: this.value },
        bubbles: true,
        composed: true,
      }),
    );

    this.requestUpdate();
  }

  #handleKeydown(e: KeyboardEvent): void {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.#highlightedIndex = Math.min(
        this.#highlightedIndex + 1,
        this.#suggestions.length - 1,
      );
      this.requestUpdate();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.#highlightedIndex = Math.max(this.#highlightedIndex - 1, -1);
      this.requestUpdate();
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (
        this.#highlightedIndex >= 0 &&
        this.#highlightedIndex < this.#suggestions.length
      ) {
        this.#selectSuggestion(this.#suggestions[this.#highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      this.#isOpen = false;
      this.requestUpdate();
    }
  }

  #handleFocus(): void {
    if (this.value) {
      this.#isOpen = true;
      this.requestUpdate();
    }
  }

  #handleBlur(): void {
    setTimeout(() => {
      this.#isOpen = false;
      this.requestUpdate();
    }, 200);
  }

  #selectSuggestion(suggestion: string, e?: Event): void {
    if (e) e.preventDefault();
    this.value = suggestion;
    this.query = "";
    this.#isOpen = false;
    this.#updateFormValue();

    this.dispatchEvent(
      new CustomEvent("suggestionchosen", {
        detail: { selectedValue: suggestion },
        bubbles: true,
        composed: true,
      }),
    );

    this.requestUpdate();
  }

  setSuggestions(suggestions: string[]): void {
    this.#suggestions = suggestions;
    this.requestUpdate();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = "";
    this.query = "";
    this.#updateFormValue();
  }
}

customElements.define("metro-auto-suggest-box", MetroAutoSuggestBox);

declare global {
  interface HTMLElementTagNameMap {
    "metro-auto-suggest-box": MetroAutoSuggestBox;
  }
}
