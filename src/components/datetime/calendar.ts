import { LitElement, html, css, type PropertyValues } from "lit";
import { baseTypography } from "../../styles/shared.ts";

export class MetroCalendar extends LitElement {
  static properties = {
    selectedDate: { type: String, attribute: "selected-date", reflect: true },
    minDate: { type: String, attribute: "min-date", reflect: true },
    maxDate: { type: String, attribute: "max-date", reflect: true },
    displayDate: { type: String, attribute: "display-date", reflect: true },
    firstDayOfWeek: { type: Number, attribute: "first-day-of-week", reflect: true },
  };

  declare selectedDate: string;
  declare minDate: string;
  declare maxDate: string;
  declare displayDate: string;
  declare firstDayOfWeek: number;

  static styles = [
    baseTypography,
    css`
      :host {
        display: block;
        background: var(--metro-background, #1f1f1f);
        color: var(--metro-foreground, #ffffff);
        user-select: none;
      }
      .calendar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--metro-spacing-md, 12px);
        border-bottom: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }
      .month-year {
        font-size: var(--metro-font-size-medium, 16px);
        font-weight: 600;
      }
      .nav-buttons {
        display: flex;
        gap: var(--metro-spacing-xs, 4px);
      }
      .nav-btn {
        background: transparent;
        border: none;
        color: var(--metro-foreground, #ffffff);
        cursor: pointer;
        padding: var(--metro-spacing-sm, 8px);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .nav-btn:hover {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      .nav-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .weekday-header {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        text-align: center;
        font-size: var(--metro-font-size-small, 12px);
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        padding: var(--metro-spacing-sm, 8px) 0;
      }
      .weekday {
        padding: var(--metro-spacing-xs, 4px);
      }
      .days-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 2px;
        padding: var(--metro-spacing-xs, 4px);
      }
      .day {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 40px;
        cursor: pointer;
        font-size: var(--metro-font-size-normal, 14px);
        transition: background-color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        background: transparent;
        border: none;
        color: var(--metro-foreground, #ffffff);
        width: 100%;
      }
      .day:hover:not(.disabled):not(.selected) {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      }
      .day.other-month {
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.4));
      }
      .day.today {
        border: 2px solid var(--metro-accent, #0078d4);
      }
      .day.selected {
        background: var(--metro-accent, #0078d4);
      }
      .day.disabled {
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.3));
        cursor: not-allowed;
        pointer-events: none;
      }
    `,
  ];

  #currentYear: number;
  #currentMonth: number;

  constructor() {
    super();
    this.selectedDate = "";
    this.minDate = "";
    this.maxDate = "";
    this.displayDate = "";
    this.firstDayOfWeek = 0;
    const now = new Date();
    this.#currentYear = now.getFullYear();
    this.#currentMonth = now.getMonth();
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("displayDate") && this.displayDate) {
      const date = this.#parseDate(this.displayDate);
      if (date) {
        this.#currentYear = date.getFullYear();
        this.#currentMonth = date.getMonth();
      }
    }
  }

  #parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length !== 3) return null;
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(year, month, day);
  }

  #formatDate(year: number, month: number, day: number): string {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  }

  #getWeekdays(): string[] {
    const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const rotated: string[] = [];
    for (let i = 0; i < 7; i++) {
      rotated.push(weekdays[(i + this.firstDayOfWeek) % 7]);
    }
    return rotated;
  }

  #getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  #getFirstDayOfMonth(year: number, month: number): number {
    return (new Date(year, month, 1).getDay() - this.firstDayOfWeek + 7) % 7;
  }

  #getDays(): Array<{ day: number; month: number; year: number; isCurrentMonth: boolean }> {
    const days: Array<{ day: number; month: number; year: number; isCurrentMonth: boolean }> = [];
    const daysInMonth = this.#getDaysInMonth(this.#currentYear, this.#currentMonth);
    const firstDay = this.#getFirstDayOfMonth(this.#currentYear, this.#currentMonth);
    const prevMonth = this.#currentMonth === 0 ? 11 : this.#currentMonth - 1;
    const prevYear = this.#currentMonth === 0 ? this.#currentYear - 1 : this.#currentYear;
    const daysInPrevMonth = this.#getDaysInMonth(prevYear, prevMonth);
    const nextMonth = this.#currentMonth === 11 ? 0 : this.#currentMonth + 1;
    const nextYear = this.#currentMonth === 11 ? this.#currentYear + 1 : this.#currentYear;

    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        month: this.#currentMonth,
        year: this.#currentYear,
        isCurrentMonth: true,
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
    }

    return days;
  }

  #isToday(year: number, month: number, day: number): boolean {
    const today = new Date();
    return (
      today.getFullYear() === year &&
      today.getMonth() === month &&
      today.getDate() === day
    );
  }

  #isSelected(year: number, month: number, day: number): boolean {
    if (!this.selectedDate) return false;
    const dateStr = this.#formatDate(year, month, day);
    return dateStr === this.selectedDate;
  }

  #isDisabled(year: number, month: number, day: number): boolean {
    const dateStr = this.#formatDate(year, month, day);
    if (this.minDate && dateStr < this.minDate) return true;
    if (this.maxDate && dateStr > this.maxDate) return true;
    return false;
  }

  #isPrevMonthDisabled(): boolean {
    if (!this.minDate) return false;
    const minDate = this.#parseDate(this.minDate);
    if (!minDate) return false;
    const prevMonth = this.#currentMonth === 0 ? 11 : this.#currentMonth - 1;
    const prevYear = this.#currentMonth === 0 ? this.#currentYear - 1 : this.#currentYear;
    const lastDayOfPrevMonth = new Date(prevYear, prevMonth + 1, 0);
    return lastDayOfPrevMonth < minDate;
  }

  #isNextMonthDisabled(): boolean {
    if (!this.maxDate) return false;
    const maxDate = this.#parseDate(this.maxDate);
    if (!maxDate) return false;
    const nextMonth = this.#currentMonth === 11 ? 0 : this.#currentMonth + 1;
    const nextYear = this.#currentMonth === 11 ? this.#currentYear + 1 : this.#currentYear;
    const firstDayOfNextMonth = new Date(nextYear, nextMonth, 1);
    return firstDayOfNextMonth > maxDate;
  }

  #handlePrevMonth(): void {
    if (this.#currentMonth === 0) {
      this.#currentYear--;
      this.#currentMonth = 11;
    } else {
      this.#currentMonth--;
    }
    this.#emitDisplayMonthChanged();
    this.requestUpdate();
  }

  #handleNextMonth(): void {
    if (this.#currentMonth === 11) {
      this.#currentYear++;
      this.#currentMonth = 0;
    } else {
      this.#currentMonth++;
    }
    this.#emitDisplayMonthChanged();
    this.requestUpdate();
  }

  #handleDayClick(year: number, month: number, day: number): void {
    const dateStr = this.#formatDate(year, month, day);
    this.selectedDate = dateStr;
    const date = new Date(year, month, day);
    this.dispatchEvent(
      new CustomEvent("dateselected", {
        detail: { date, value: dateStr },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #emitDisplayMonthChanged(): void {
    this.dispatchEvent(
      new CustomEvent("displaymonthchanged", {
        detail: { year: this.#currentYear, month: this.#currentMonth },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #getMonthName(month: number): string {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    return months[month];
  }

  render() {
    const days = this.#getDays();
    const weekdays = this.#getWeekdays();

    return html`
      <div class="calendar-header">
        <span class="month-year">${this.#getMonthName(this.#currentMonth)} ${this.#currentYear}</span>
        <div class="nav-buttons">
          <button
            class="nav-btn"
            @click=${this.#handlePrevMonth}
            ?disabled=${this.#isPrevMonthDisabled()}
            aria-label="Previous month"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M10.44 2.44l.62.62-4.94 4.94 4.94 4.94-.62.62L5.5 8l4.94-5.56z"/>
            </svg>
          </button>
          <button
            class="nav-btn"
            @click=${this.#handleNextMonth}
            ?disabled=${this.#isNextMonthDisabled()}
            aria-label="Next month"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.56 13.56l-.62-.62L9.88 8 4.94 3.06l.62-.62L10.5 8l-4.94 5.56z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="weekday-header">
        ${weekdays.map((day) => html`<div class="weekday">${day}</div>`)}
      </div>
      <div class="days-grid">
        ${days.map((d) => {
          const isToday = this.#isToday(d.year, d.month, d.day);
          const isSelected = this.#isSelected(d.year, d.month, d.day);
          const isDisabled = this.#isDisabled(d.year, d.month, d.day);
          const classes = [
            "day",
            !d.isCurrentMonth ? "other-month" : "",
            isToday ? "today" : "",
            isSelected ? "selected" : "",
            isDisabled ? "disabled" : "",
          ].filter(Boolean).join(" ");

          return html`
            <button
              class="${classes}"
              @click=${() => this.#handleDayClick(d.year, d.month, d.day)}
              ?disabled=${isDisabled}
              aria-label="${this.#formatDate(d.year, d.month, d.day)}"
            >
              ${d.day}
            </button>
          `;
        })}
      </div>
    `;
  }
}

customElements.define("metro-calendar", MetroCalendar);

declare global {
  interface HTMLElementTagNameMap {
    "metro-calendar": MetroCalendar;
  }
}
