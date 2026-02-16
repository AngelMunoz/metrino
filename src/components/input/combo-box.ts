import { LitElement, html, css, type PropertyValues } from "lit";
import "../primitives/icon.ts";

const baseStyles = css`
  :host {
    display: block;
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
    position: relative;
  }
  .combo-container {
    position: relative;
  }
  .combo-input {
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
    cursor: pointer;
  }
  .combo-input:focus {
    border-color: var(--metro-accent, #0078d4);
  }
  .combo-arrow {
    position: absolute;
    right: var(--metro-spacing-md, 12px);
    top: 50%;
    transform: translateY(-50%);
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
    pointer-events: none;
    transition: transform var(--metro-transition-fast, 167ms) ease-out;
  }
  :host([open]) .combo-arrow {
    transform: translateY(-50%) rotate(180deg);
  }
  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--metro-background, #1f1f1f);
    border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
    border-top: none;
    max-height: 200px;
    overflow-y: auto;
    z-index: 100;
    display: none;
    animation: dropdownEnter var(--metro-transition-fast, 167ms) ease-out;
  }
  @keyframes dropdownEnter {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  :host([open]) .dropdown {
    display: block;
  }
  .dropdown-item {
    padding: var(--metro-spacing-md, 12px);
    cursor: pointer;
    color: var(--metro-foreground, #ffffff);
    transition: background-color var(--metro-transition-fast, 167ms) ease-out;
  }
  .dropdown-item:hover,
  .dropdown-item.selected {
    background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
  }
  .dropdown-item.selected {
    color: var(--metro-accent, #0078d4);
  }
  .placeholder {
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
  }
`;

export class MetroComboBox extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: String, reflect: true },
    placeholder: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    name: { type: String, reflect: true },
    open: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare name: string;
  declare open: boolean;

  static styles = baseStyles;

  #internals: ElementInternals;
  #options: string[] = [];
  #selectedIndex = -1;

  constructor() {
    super();
    this.value = "";
    this.placeholder = "Select...";
    this.disabled = false;
    this.name = "";
    this.open = false;
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      <div class="combo-container">
        <input
          class="combo-input"
          type="text"
          .value=${this.value}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          readonly
          @click=${this.#toggle}
          @keydown=${this.#handleKeydown}
        />
        <metro-icon class="combo-arrow" icon="chevron-down" size="small"></metro-icon>
      </div>
      <div class="dropdown">
        ${this.#options.map(
          (option, index) => html`
            <div
              class="dropdown-item ${index === this.#selectedIndex
                ? "selected"
                : ""}"
              @click=${() => this.#selectOption(option, index)}
            >
              ${option}
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

  #toggle(): void {
    if (this.disabled) return;
    this.open = !this.open;
  }

  #selectOption(option: string, index: number): void {
    this.value = option;
    this.#selectedIndex = index;
    this.open = false;
    this.#updateFormValue();

    this.dispatchEvent(
      new CustomEvent("selectionchanged", {
        detail: { selectedValue: option, selectedIndex: index },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.#toggle();
    } else if (e.key === "Escape") {
      this.open = false;
    } else if (e.key === "ArrowDown" && this.open) {
      e.preventDefault();
      this.#selectedIndex = Math.min(
        this.#selectedIndex + 1,
        this.#options.length - 1,
      );
      this.requestUpdate();
    } else if (e.key === "ArrowUp" && this.open) {
      e.preventDefault();
      this.#selectedIndex = Math.max(this.#selectedIndex - 1, 0);
      this.requestUpdate();
    }
  }

  setOptions(options: string[]): void {
    this.#options = options;
    this.requestUpdate();
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("click", this.#handleDocumentClick);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("click", this.#handleDocumentClick);
  }

  #handleDocumentClick = (e: MouseEvent): void => {
    if (!this.contains(e.target as Node)) {
      this.open = false;
    }
  };

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = "";
    this.#selectedIndex = -1;
    this.#updateFormValue();
  }
}

customElements.define("metro-combo-box", MetroComboBox);

declare global {
  interface HTMLElementTagNameMap {
    "metro-combo-box": MetroComboBox;
  }
}
