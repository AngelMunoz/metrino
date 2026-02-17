import { LitElement, html, css, type PropertyValues } from "lit";
import { baseTypography, formLabel, pickerRollerBase } from "../../styles/shared.ts";

const HOURS_12 = ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

const ITEM_HEIGHT = 40;

function parseTimeValue(value: string, hourFormat: "12" | "24"): { hour: number; minute: number; period: number } {
  const now = new Date();
  const defaultResult = {
    hour: hourFormat === "12" ? now.getHours() % 12 || 12 : now.getHours(),
    minute: now.getMinutes(),
    period: now.getHours() >= 12 ? 1 : 0,
  };

  if (!value) return defaultResult;

  try {
    const [time, period] = value.split(" ");
    const [hourStr, minuteStr] = time.split(":");
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (hourFormat === "12" && period) {
      return {
        hour: hour % 12 || 12,
        minute,
        period: period.toUpperCase() === "PM" ? 1 : 0,
      };
    }

    return {
      hour: hourFormat === "12" ? hour % 12 || 12 : hour,
      minute,
      period: 0,
    };
  } catch {
    return defaultResult;
  }
}

export class MetroTimePickerRoller extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
    name: { type: String, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    hourFormat: { type: String, attribute: "hour-format" },
  };

  declare value: string;
  declare label: string;
  declare name: string;
  declare required: boolean;
  declare disabled: boolean;
  declare hourFormat: "12" | "24";

  static styles = [
    baseTypography,
    formLabel,
    pickerRollerBase,
    css`
      :host {
        display: inline-block;
        min-width: max-content;
      }
      .picker-column--hour {
        width: 50px;
      }
      .picker-column--minute {
        width: 50px;
      }
      .picker-column--period {
        width: 50px;
      }
      .picker-list.dragging {
        transition: none;
      }
      .picker-item:hover {
        color: var(--metro-foreground, #ffffff);
      }
      .separator {
        display: flex;
        align-items: center;
        font-size: var(--metro-font-size-medium, 16px);
        color: var(--metro-foreground, #ffffff);
        font-weight: 600;
        padding: 0 2px;
      }
    `,
  ];

  #internals: ElementInternals;
  #hourOffset = 0;
  #minuteOffset = 0;
  #periodOffset = 0;

  #dragState: {
    column: "hour" | "minute" | "period" | null;
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
    this.hourFormat = "12";
    this.#internals = this.attachInternals();
  }

  #getHours(): string[] {
    return this.hourFormat === "12" ? HOURS_12 : HOURS_24;
  }

  #updateOffsetsFromValue(): void {
    const { hour, minute, period } = parseTimeValue(this.value, this.hourFormat);
    const hours = this.#getHours();
    this.#hourOffset = hours.indexOf(String(this.hourFormat === "12" ? hour : String(hour).padStart(2, "0")));
    if (this.#hourOffset < 0) this.#hourOffset = 0;
    this.#minuteOffset = minute;
    this.#periodOffset = period;
  }

  #handlePointerDown(column: "hour" | "minute" | "period", e: PointerEvent): void {
    if (this.disabled) return;
    const target = e.target as HTMLElement;
    const columnEl = target.closest(".picker-column") as HTMLElement;
    if (!columnEl) return;

    const list = columnEl.querySelector(".picker-list") as HTMLElement;
    list.classList.add("dragging");

    const offset = column === "hour" ? this.#hourOffset :
                   column === "minute" ? this.#minuteOffset :
                   this.#periodOffset;

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

    const maxOffset = this.#dragState.column === "hour" ? this.#getHours().length - 1 :
                      this.#dragState.column === "minute" ? 59 : 1;

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

    if (this.#dragState.column === "hour") {
      this.#hourOffset = this.#dragState.currentOffset;
    } else if (this.#dragState.column === "minute") {
      this.#minuteOffset = this.#dragState.currentOffset;
    } else {
      this.#periodOffset = this.#dragState.currentOffset;
    }

    this.#updateValue();
    this.#dragState = { column: null, startY: 0, startOffset: 0, currentOffset: 0 };
  }

  #handleWheel(column: "hour" | "minute" | "period", e: WheelEvent): void {
    if (this.disabled) return;
    e.preventDefault();

    const delta = e.deltaY > 0 ? 1 : -1;
    const maxOffset = column === "hour" ? this.#getHours().length - 1 :
                      column === "minute" ? 59 : 1;

    if (column === "hour") {
      this.#hourOffset = Math.max(0, Math.min(maxOffset, this.#hourOffset + delta));
    } else if (column === "minute") {
      this.#minuteOffset = Math.max(0, Math.min(maxOffset, this.#minuteOffset + delta));
    } else {
      this.#periodOffset = Math.max(0, Math.min(maxOffset, this.#periodOffset + delta));
    }

    this.#updateValue();
  }

  #updateDragTransform(): void {
    if (!this.#dragState.column) return;

    const columnClass = this.#dragState.column === "hour" ? "picker-column--hour" :
                        this.#dragState.column === "minute" ? "picker-column--minute" :
                        "picker-column--period";

    const columnEl = this.shadowRoot?.querySelector(`.${columnClass}`) as HTMLElement;
    const list = columnEl?.querySelector(".picker-list") as HTMLElement;
    if (list) {
      list.style.transform = `translateY(-${this.#dragState.currentOffset * ITEM_HEIGHT}px)`;
    }
  }

  #handleClick(column: "hour" | "minute" | "period", e: MouseEvent): void {
    if (this.disabled || this.#dragState.column) return;

    const target = e.target as HTMLElement;
    if (!target.classList.contains("picker-item")) return;

    const index = parseInt(target.dataset.index || "0", 10);
    const maxOffset = column === "hour" ? this.#getHours().length - 1 :
                      column === "minute" ? 59 : 1;
    const clampedIndex = Math.max(0, Math.min(maxOffset, index));

    if (column === "hour") {
      this.#hourOffset = clampedIndex;
    } else if (column === "minute") {
      this.#minuteOffset = clampedIndex;
    } else {
      this.#periodOffset = clampedIndex;
    }

    this.#updateValue();
  }

  #updateValue(): void {
    const hours = this.#getHours();
    const hour = hours[this.#hourOffset];
    const minute = MINUTES[this.#minuteOffset];

    if (this.hourFormat === "12") {
      const period = PERIODS[this.#periodOffset];
      this.value = `${hour}:${minute} ${period}`;
    } else {
      this.value = `${hour}:${minute}`;
    }

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
    this.#updateOffsetsFromValue();
    const hours = this.#getHours();

    const hourTransform = `translateY(-${this.#hourOffset * ITEM_HEIGHT}px)`;
    const minuteTransform = `translateY(-${this.#minuteOffset * ITEM_HEIGHT}px)`;
    const periodTransform = `translateY(-${this.#periodOffset * ITEM_HEIGHT}px)`;

    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : ""}
      <div class="picker-container">
        <div
          class="picker-column picker-column--hour"
          @click=${(e: MouseEvent) => this.#handleClick("hour", e)}
          @pointerdown=${(e: PointerEvent) => this.#handlePointerDown("hour", e)}
          @pointermove=${this.#handlePointerMove}
          @pointerup=${this.#handlePointerUp}
          @pointercancel=${this.#handlePointerUp}
          @wheel=${(e: WheelEvent) => this.#handleWheel("hour", e)}
        >
          <div class="selection-indicator"></div>
          <ul class="picker-list" style="transform: ${hourTransform}">
            ${hours.map((hour, i) => html`
              <li class="picker-item ${i === this.#hourOffset ? "selected" : ""}" data-index="${i}">
                ${hour}
              </li>
            `)}
          </ul>
        </div>
        <span class="separator">:</span>
        <div
          class="picker-column picker-column--minute"
          @click=${(e: MouseEvent) => this.#handleClick("minute", e)}
          @pointerdown=${(e: PointerEvent) => this.#handlePointerDown("minute", e)}
          @pointermove=${this.#handlePointerMove}
          @pointerup=${this.#handlePointerUp}
          @pointercancel=${this.#handlePointerUp}
          @wheel=${(e: WheelEvent) => this.#handleWheel("minute", e)}
        >
          <div class="selection-indicator"></div>
          <ul class="picker-list" style="transform: ${minuteTransform}">
            ${MINUTES.map((minute, i) => html`
              <li class="picker-item ${i === this.#minuteOffset ? "selected" : ""}" data-index="${i}">
                ${minute}
              </li>
            `)}
          </ul>
        </div>
        ${this.hourFormat === "12"
          ? html`
            <div
              class="picker-column picker-column--period"
              @click=${(e: MouseEvent) => this.#handleClick("period", e)}
              @pointerdown=${(e: PointerEvent) => this.#handlePointerDown("period", e)}
              @pointermove=${this.#handlePointerMove}
              @pointerup=${this.#handlePointerUp}
              @pointercancel=${this.#handlePointerUp}
              @wheel=${(e: WheelEvent) => this.#handleWheel("period", e)}
            >
              <div class="selection-indicator"></div>
              <ul class="picker-list" style="transform: ${periodTransform}">
                ${PERIODS.map((period, i) => html`
                  <li class="picker-item ${i === this.#periodOffset ? "selected" : ""}" data-index="${i}">
                    ${period}
                  </li>
                `)}
              </ul>
            </div>
          `
          : ""}
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
    const now = new Date();
    const hour = this.hourFormat === "12"
      ? String(now.getHours() % 12 || 12)
      : String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const period = now.getHours() >= 12 ? "PM" : "AM";

    this.value = this.hourFormat === "12"
      ? `${hour}:${minute} ${period}`
      : `${hour}:${minute}`;
    this.#updateFormValue();
  }
}

customElements.define("metro-time-picker-roller", MetroTimePickerRoller);

declare global {
  interface HTMLElementTagNameMap {
    "metro-time-picker-roller": MetroTimePickerRoller;
  }
}
