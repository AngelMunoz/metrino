import { LitElement, html, css, type PropertyValues } from "lit";
import { baseTypography, formLabel, pickerRollerBase } from "../../styles/shared.ts";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ITEM_HEIGHT = 40;

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function createDaysArray(year: number, month: number): number[] {
  const days = getDaysInMonth(year, month);
  return Array.from({ length: days }, (_, i) => i + 1);
}

function createYearsArray(minYear: number, maxYear: number): number[] {
  return Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
}

function parseValue(value: string): { day: number; month: number; year: number } {
  const today = new Date();
  if (value) {
    const parts = value.split("-");
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

function clampDay(day: number, year: number, month: number): number {
  const maxDay = getDaysInMonth(year, month);
  return Math.min(day, maxDay);
}

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

  static styles = [
    baseTypography,
    formLabel,
    pickerRollerBase,
    css`
      :host {
        display: inline-block;
        min-width: max-content;
      }
      .picker-column--day {
        width: 50px;
      }
      .picker-column--month {
        width: 120px;
      }
      .picker-column--year {
        width: 70px;
      }
      .picker-list.dragging {
        transition: none;
      }
      .picker-item:hover {
        color: var(--metro-foreground, #ffffff);
      }
    `,
  ];

  #internals: ElementInternals;
  #day = 1;
  #month = 0;
  #year: number;
  #days: number[] = [];
  #years: number[] = [];

  #dragState: {
    column: "day" | "month" | "year" | null;
    startY: number;
    startOffset: number;
    currentOffset: number;
  } = { column: null, startY: 0, startOffset: 0, currentOffset: 0 };

  constructor() {
    super();
    this.value = "";
    this.label = "";
    this.name = "";
    this.required = false;
    this.disabled = false;
    this.minYear = 1900;
    this.maxYear = new Date().getFullYear() + 10;
    this.#year = new Date().getFullYear();
    this.#internals = this.attachInternals();
  }

  #getYearsArray(): number[] {
    return createYearsArray(this.minYear, this.maxYear);
  }

  #getDaysArray(): number[] {
    return createDaysArray(this.#year, this.#month);
  }

  #updateFromDate(): void {
    const { day, month, year } = parseValue(this.value);
    this.#year = Math.max(this.minYear, Math.min(this.maxYear, year));
    this.#month = month;
    this.#day = clampDay(day, this.#year, this.#month);
  }

  #getDayOffset(): number {
    return this.#day - 1;
  }

  #getMonthOffset(): number {
    return this.#month;
  }

  #getYearOffset(): number {
    return this.#year - this.minYear;
  }

  #getMaxDayOffset(): number {
    return this.#getDaysArray().length - 1;
  }

  #handlePointerDown(column: "day" | "month" | "year", e: PointerEvent): void {
    if (this.disabled) return;
    const target = e.target as HTMLElement;
    const columnEl = target.closest(".picker-column") as HTMLElement;
    if (!columnEl) return;

    const list = columnEl.querySelector(".picker-list") as HTMLElement;
    list.classList.add("dragging");

    const offset = column === "day" ? this.#getDayOffset() :
                   column === "month" ? this.#getMonthOffset() :
                   this.#getYearOffset();

    this.#dragState = {
      column,
      startY: e.clientY,
      startOffset: offset,
      currentOffset: offset,
    };

    columnEl.setPointerCapture(e.pointerId);
  }

  #handlePointerMove(e: PointerEvent): void {
    if (!this.#dragState.column || this.disabled) return;

    const delta = e.clientY - this.#dragState.startY;
    const offsetDelta = Math.round(delta / ITEM_HEIGHT);
    let newOffset = this.#dragState.startOffset - offsetDelta;

    const maxOffset = this.#dragState.column === "day" ? this.#getMaxDayOffset() :
                      this.#dragState.column === "month" ? 11 :
                      this.#getYearsArray().length - 1;

    newOffset = Math.max(0, Math.min(maxOffset, newOffset));
    this.#dragState.currentOffset = newOffset;

    this.#updateDragTransform();
  }

  #handlePointerUp(e: PointerEvent): void {
    if (!this.#dragState.column || this.disabled) return;

    const columnEl = (e.target as HTMLElement).closest(".picker-column") as HTMLElement;
    if (columnEl) {
      const list = columnEl.querySelector(".picker-list") as HTMLElement;
      list.classList.remove("dragging");
    }

    if (this.#dragState.column === "day") {
      this.#day = this.#dragState.currentOffset + 1;
    } else if (this.#dragState.column === "month") {
      this.#month = this.#dragState.currentOffset;
      this.#day = clampDay(this.#day, this.#year, this.#month);
    } else {
      this.#year = this.#dragState.currentOffset + this.minYear;
      this.#day = clampDay(this.#day, this.#year, this.#month);
    }

    this.#updateValue();
    this.#dragState = { column: null, startY: 0, startOffset: 0, currentOffset: 0 };
  }

  #handleWheel(column: "day" | "month" | "year", e: WheelEvent): void {
    if (this.disabled) return;
    e.preventDefault();

    const delta = e.deltaY > 0 ? 1 : -1;

    if (column === "day") {
      const maxOffset = this.#getMaxDayOffset();
      const newOffset = Math.max(0, Math.min(maxOffset, this.#getDayOffset() + delta));
      this.#day = newOffset + 1;
    } else if (column === "month") {
      this.#month = Math.max(0, Math.min(11, this.#month + delta));
      this.#day = clampDay(this.#day, this.#year, this.#month);
    } else {
      const years = this.#getYearsArray();
      const yearIndex = Math.max(0, Math.min(years.length - 1, this.#getYearOffset() + delta));
      this.#year = years[yearIndex];
      this.#day = clampDay(this.#day, this.#year, this.#month);
    }

    this.#updateValue();
  }

  #updateDragTransform(): void {
    if (!this.#dragState.column) return;

    const columnClass = this.#dragState.column === "day" ? "picker-column--day" :
                        this.#dragState.column === "month" ? "picker-column--month" :
                        "picker-column--year";

    const columnEl = this.shadowRoot?.querySelector(`.${columnClass}`) as HTMLElement;
    const list = columnEl?.querySelector(".picker-list") as HTMLElement;
    if (list) {
      list.style.transform = `translateY(-${this.#dragState.currentOffset * ITEM_HEIGHT}px)`;
    }
  }

  #handleClick(column: "day" | "month" | "year", e: MouseEvent): void {
    if (this.disabled || this.#dragState.column) return;

    const target = e.target as HTMLElement;
    if (!target.classList.contains("picker-item")) return;

    const index = parseInt(target.dataset.index || "0", 10);

    if (column === "day") {
      const maxOffset = this.#getMaxDayOffset();
      this.#day = Math.max(0, Math.min(maxOffset, index)) + 1;
    } else if (column === "month") {
      this.#month = Math.max(0, Math.min(11, index));
      this.#day = clampDay(this.#day, this.#year, this.#month);
    } else {
      const years = this.#getYearsArray();
      const yearIndex = Math.max(0, Math.min(years.length - 1, index));
      this.#year = years[yearIndex];
      this.#day = clampDay(this.#day, this.#year, this.#month);
    }

    this.#updateValue();
  }

  #updateValue(): void {
    const day = this.#day;
    const month = this.#month + 1;
    const year = this.#year;

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

  render() {
    this.#updateFromDate();
    this.#years = this.#getYearsArray();
    this.#days = this.#getDaysArray();

    const dayOffset = this.#getDayOffset();
    const monthOffset = this.#getMonthOffset();
    const yearOffset = this.#getYearOffset();

    const dayTransform = `translateY(-${dayOffset * ITEM_HEIGHT}px)`;
    const monthTransform = `translateY(-${monthOffset * ITEM_HEIGHT}px)`;
    const yearTransform = `translateY(-${yearOffset * ITEM_HEIGHT}px)`;

    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : ""}
      <div class="picker-container">
        <div
          class="picker-column picker-column--day"
          @click=${(e: MouseEvent) => this.#handleClick("day", e)}
          @pointerdown=${(e: PointerEvent) => this.#handlePointerDown("day", e)}
          @pointermove=${this.#handlePointerMove}
          @pointerup=${this.#handlePointerUp}
          @pointercancel=${this.#handlePointerUp}
          @wheel=${(e: WheelEvent) => this.#handleWheel("day", e)}
        >
          <div class="selection-indicator"></div>
          <ul class="picker-list" style="transform: ${dayTransform}">
            ${this.#days.map((day, i) => html`
              <li class="picker-item ${i === dayOffset ? "selected" : ""}" data-index="${i}">
                ${String(day).padStart(2, "0")}
              </li>
            `)}
          </ul>
        </div>
        <div
          class="picker-column picker-column--month"
          @click=${(e: MouseEvent) => this.#handleClick("month", e)}
          @pointerdown=${(e: PointerEvent) => this.#handlePointerDown("month", e)}
          @pointermove=${this.#handlePointerMove}
          @pointerup=${this.#handlePointerUp}
          @pointercancel=${this.#handlePointerUp}
          @wheel=${(e: WheelEvent) => this.#handleWheel("month", e)}
        >
          <div class="selection-indicator"></div>
          <ul class="picker-list" style="transform: ${monthTransform}">
            ${MONTHS.map((month, i) => html`
              <li class="picker-item ${i === monthOffset ? "selected" : ""}" data-index="${i}">
                ${month}
              </li>
            `)}
          </ul>
        </div>
        <div
          class="picker-column picker-column--year"
          @click=${(e: MouseEvent) => this.#handleClick("year", e)}
          @pointerdown=${(e: PointerEvent) => this.#handlePointerDown("year", e)}
          @pointermove=${this.#handlePointerMove}
          @pointerup=${this.#handlePointerUp}
          @pointercancel=${this.#handlePointerUp}
          @wheel=${(e: WheelEvent) => this.#handleWheel("year", e)}
        >
          <div class="selection-indicator"></div>
          <ul class="picker-list" style="transform: ${yearTransform}">
            ${this.#years.map((year, i) => html`
              <li class="picker-item ${i === yearOffset ? "selected" : ""}" data-index="${i}">
                ${year}
              </li>
            `)}
          </ul>
        </div>
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
