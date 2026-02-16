import { LitElement, html, css, type PropertyValues } from "lit";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const baseStyles = css`
  :host {
    display: block;
    font-family: var(--metro-font-family, "Segoe UI", system-ui, sans-serif);
  }
  .picker-container {
    display: flex;
    gap: 2px;
    background: var(--metro-background, #1f1f1f);
    border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
    padding: var(--metro-spacing-md, 12px);
    user-select: none;
  }
  .picker-column {
    flex: 1;
    position: relative;
    height: 180px;
    overflow: hidden;
  }
  .picker-column::before,
  .picker-column::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 60px;
    pointer-events: none;
    z-index: 1;
  }
  .picker-column::before {
    top: 0;
    background: linear-gradient(to bottom, var(--metro-background, #1f1f1f) 0%, transparent 100%);
  }
  .picker-column::after {
    bottom: 0;
    background: linear-gradient(to top, var(--metro-background, #1f1f1f) 0%, transparent 100%);
  }
  .picker-list {
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
    transition: transform var(--metro-transition-fast, 167ms) ease-out;
  }
  .picker-item {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--metro-font-size-normal, 14px);
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    transition:
      color var(--metro-transition-fast, 167ms) ease-out,
      transform var(--metro-transition-fast, 167ms) ease-out;
  }
  .picker-item.selected {
    color: var(--metro-foreground, #ffffff);
    font-size: var(--metro-font-size-medium, 16px);
    font-weight: 600;
  }
  .picker-item:hover {
    color: var(--metro-foreground, #ffffff);
  }
  .selection-indicator {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 40px;
    transform: translateY(-50%);
    border-top: 2px solid var(--metro-accent, #0078d4);
    border-bottom: 2px solid var(--metro-accent, #0078d4);
    pointer-events: none;
  }
  .label {
    display: block;
    margin-bottom: var(--metro-spacing-xs, 4px);
    font-size: var(--metro-font-size-small, 12px);
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
  }
`;

export class MetroDatePickerRoller extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
    name: { type: String, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    minYear: { type: Number, attribute: "min-year" },
    maxYear: { type: Number, attribute: "max-year" },
  };

  declare value: string;
  declare label: string;
  declare name: string;
  declare required: boolean;
  declare disabled: boolean;
  declare minYear: number;
  declare maxYear: number;

  static styles = baseStyles;

  #internals: ElementInternals;
  #dayOffset = 0;
  #monthOffset = 0;
  #yearOffset = 0;
  #days: number[] = [];
  #years: number[] = [];

  constructor() {
    super();
    this.value = "";
    this.label = "";
    this.name = "";
    this.required = false;
    this.disabled = false;
    this.minYear = 1900;
    this.maxYear = new Date().getFullYear() + 10;
    this.#internals = this.attachInternals();
    this.#updateArrays();
  }

  #updateArrays(): void {
    this.#days = Array.from({ length: 31 }, (_, i) => i + 1);
    this.#years = Array.from(
      { length: this.maxYear - this.minYear + 1 },
      (_, i) => this.minYear + i
    );
  }

  #parseValue(): { day: number; month: number; year: number } {
    const today = new Date();
    if (this.value) {
      const parts = this.value.split("-");
      return {
        year: parseInt(parts[0], 10) || today.getFullYear(),
        month: (parseInt(parts[1], 10) || today.getMonth() + 1) - 1,
        day: parseInt(parts[2], 10) || today.getDate(),
      };
    }
    return {
      year: today.getFullYear(),
      month: today.getMonth(),
      day: today.getDate(),
    };
  }

  #updateOffsetsFromValue(): void {
    const { day, month, year } = this.#parseValue();
    this.#dayOffset = day - 1;
    this.#monthOffset = month;
    this.#yearOffset = year - this.minYear;
  }

  render() {
    this.#updateArrays();
    this.#updateOffsetsFromValue();

    const dayTransform = `translateY(calc(-50% + ${this.#dayOffset * 40}px))`;
    const monthTransform = `translateY(calc(-50% + ${this.#monthOffset * 40}px))`;
    const yearTransform = `translateY(calc(-50% + ${this.#yearOffset * 40}px))`;

    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : ""}
      <div class="picker-container">
        <div class="picker-column" @click=${this.#handleDayClick}>
          <div class="selection-indicator"></div>
          <ul class="picker-list" style="transform: ${dayTransform}">
            ${this.#days.map((day, i) => html`
              <li class="picker-item ${i === this.#dayOffset ? "selected" : ""}" data-index="${i}">
                ${String(day).padStart(2, "0")}
              </li>
            `)}
          </ul>
        </div>
        <div class="picker-column" @click=${this.#handleMonthClick}>
          <div class="selection-indicator"></div>
          <ul class="picker-list" style="transform: ${monthTransform}">
            ${MONTHS.map((month, i) => html`
              <li class="picker-item ${i === this.#monthOffset ? "selected" : ""}" data-index="${i}">
                ${month}
              </li>
            `)}
          </ul>
        </div>
        <div class="picker-column" @click=${this.#handleYearClick}>
          <div class="selection-indicator"></div>
          <ul class="picker-list" style="transform: ${yearTransform}">
            ${this.#years.map((year, i) => html`
              <li class="picker-item ${i === this.#yearOffset ? "selected" : ""}" data-index="${i}">
                ${year}
              </li>
            `)}
          </ul>
        </div>
      </div>
    `;
  }

  #handleDayClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains("picker-item")) {
      const index = parseInt(target.dataset.index || "0", 10);
      this.#dayOffset = index;
      this.#updateValue();
    }
  }

  #handleMonthClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains("picker-item")) {
      const index = parseInt(target.dataset.index || "0", 10);
      this.#monthOffset = index;
      this.#updateValue();
    }
  }

  #handleYearClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains("picker-item")) {
      const index = parseInt(target.dataset.index || "0", 10);
      this.#yearOffset = index;
      this.#updateValue();
    }
  }

  #updateValue(): void {
    const day = this.#days[this.#dayOffset];
    const month = this.#monthOffset + 1;
    const year = this.#years[this.#yearOffset];
    
    this.value = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    this.#internals.setFormValue(this.value);
    
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
    
    this.requestUpdate();
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

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    const today = new Date();
    this.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    this.#updateFormValue();
  }
}

customElements.define("metro-date-picker-roller", MetroDatePickerRoller);

declare global {
  interface HTMLElementTagNameMap {
    "metro-date-picker-roller": MetroDatePickerRoller;
  }
}
