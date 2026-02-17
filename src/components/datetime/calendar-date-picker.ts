import { LitElement, html, css, type PropertyValues } from "lit";
import { inputBase, dropdownAnimation } from "../../styles/shared.ts";
import "../primitives/icon.ts";
import "./calendar.ts";

export class MetroCalendarDatePicker extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: String, reflect: true },
    minDate: { type: String, attribute: "min-date", reflect: true },
    maxDate: { type: String, attribute: "max-date", reflect: true },
    placeholder: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    format: { type: String, reflect: true },
    name: { type: String, reflect: true },
    open: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare minDate: string;
  declare maxDate: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare format: string;
  declare name: string;
  declare open: boolean;

  static styles = [
    inputBase,
    dropdownAnimation,
    css`
      :host {
        position: relative;
      }
      .picker-container {
        position: relative;
      }
      .picker-input {
        padding-right: 40px;
        cursor: pointer;
      }
      .picker-icon {
        position: absolute;
        right: var(--metro-spacing-md, 12px);
        top: 50%;
        transform: translateY(-50%);
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
        pointer-events: none;
        transition: transform var(--metro-transition-fast, 167ms) ease-out;
      }
      :host([open]) .picker-icon {
        transform: translateY(-50%) rotate(180deg);
      }
      .dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 100;
        display: none;
        animation: dropdownEnter var(--metro-transition-fast, 167ms) ease-out;
      }
      :host([open]) .dropdown {
        display: block;
      }
      .placeholder {
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
      }
    `,
  ];

  #internals: ElementInternals;
  #formatter: Intl.DateTimeFormat;

  constructor() {
    super();
    this.value = "";
    this.minDate = "";
    this.maxDate = "";
    this.placeholder = "Select date...";
    this.disabled = false;
    this.format = "YYYY-MM-DD";
    this.name = "";
    this.open = false;
    this.#internals = this.attachInternals();
    this.#formatter = new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  render() {
    return html`
      <div class="picker-container">
        <input
          class="picker-input"
          type="text"
          .value=${this.#getDisplayValue()}
          placeholder=${this.placeholder}
          ?disabled=${this.disabled}
          readonly
          @click=${this.#toggle}
          @keydown=${this.#handleKeydown}
        />
        <metro-icon class="picker-icon" icon="chevron-down" size="small"></metro-icon>
      </div>
      <div class="dropdown">
        <metro-calendar
          .selectedDate=${this.value}
          .minDate=${this.minDate}
          .maxDate=${this.maxDate}
          .displayDate=${this.value || this.#getTodayISO()}
          @dateselected=${this.#handleDateSelected}
        ></metro-calendar>
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

  #getTodayISO(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  #getDisplayValue(): string {
    if (!this.value) return "";
    const date = this.#parseDate(this.value);
    if (!date) return this.value;
    return this.#formatDate(date);
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

  #formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const iso = `${year}-${month}-${day}`;

    if (this.format === "YYYY-MM-DD") {
      return iso;
    }

    if (this.format === "MM/DD/YYYY") {
      return `${month}/${day}/${year}`;
    }

    if (this.format === "DD/MM/YYYY") {
      return `${day}/${month}/${year}`;
    }

    if (this.format === "DD.MM.YYYY") {
      return `${day}.${month}.${year}`;
    }

    try {
      return this.#formatter.format(date);
    } catch {
      return iso;
    }
  }

  #toggle(): void {
    if (this.disabled) return;
    this.open = !this.open;
  }

  #handleDateSelected(e: CustomEvent<{ date: Date; value: string }>): void {
    this.value = e.detail.value;
    this.open = false;
    this.#updateFormValue();

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: this.value, date: e.detail.date },
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
    }
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
    this.#updateFormValue();
  }
}

customElements.define("metro-calendar-date-picker", MetroCalendarDatePicker);

declare global {
  interface HTMLElementTagNameMap {
    "metro-calendar-date-picker": MetroCalendarDatePicker;
  }
}
