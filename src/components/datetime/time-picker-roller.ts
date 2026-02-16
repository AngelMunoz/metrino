import { LitElement, html, css, type PropertyValues } from "lit";

const HOURS_12 = ["12", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
const HOURS_24 = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

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
  .separator {
    display: flex;
    align-items: center;
    font-size: var(--metro-font-size-medium, 16px);
    color: var(--metro-foreground, #ffffff);
    font-weight: 600;
  }
  .label {
    display: block;
    margin-bottom: var(--metro-spacing-xs, 4px);
    font-size: var(--metro-font-size-small, 12px);
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
  }
`;

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

  static styles = baseStyles;

  #internals: ElementInternals;
  #hourOffset = 0;
  #minuteOffset = 0;
  #periodOffset = 0;

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

  #parseValue(): { hour: number; minute: number; period: number } {
    const now = new Date();
    const defaultResult = {
      hour: this.hourFormat === "12" ? now.getHours() % 12 || 12 : now.getHours(),
      minute: now.getMinutes(),
      period: now.getHours() >= 12 ? 1 : 0,
    };

    if (!this.value) return defaultResult;

    try {
      const [time, period] = this.value.split(" ");
      const [hourStr, minuteStr] = time.split(":");
      let hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (this.hourFormat === "12" && period) {
        return {
          hour: hour % 12 || 12,
          minute,
          period: period.toUpperCase() === "PM" ? 1 : 0,
        };
      }

      return {
        hour: this.hourFormat === "12" ? hour % 12 || 12 : hour,
        minute,
        period: 0,
      };
    } catch {
      return defaultResult;
    }
  }

  #updateOffsetsFromValue(): void {
    const { hour, minute, period } = this.#parseValue();
    const hours = this.hourFormat === "12" ? HOURS_12 : HOURS_24;
    this.#hourOffset = hours.indexOf(String(this.hourFormat === "12" ? hour : String(hour).padStart(2, "0")));
    if (this.#hourOffset < 0) this.#hourOffset = 0;
    this.#minuteOffset = minute;
    this.#periodOffset = period;
  }

  render() {
    this.#updateOffsetsFromValue();
    const hours = this.hourFormat === "12" ? HOURS_12 : HOURS_24;

    const hourTransform = `translateY(calc(-50% + ${this.#hourOffset * 40}px))`;
    const minuteTransform = `translateY(calc(-50% + ${this.#minuteOffset * 40}px))`;
    const periodTransform = `translateY(calc(-50% + ${this.#periodOffset * 40}px))`;

    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : ""}
      <div class="picker-container">
        <div class="picker-column" @click=${this.#handleHourClick}>
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
        <div class="picker-column" @click=${this.#handleMinuteClick}>
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
            <div class="picker-column" @click=${this.#handlePeriodClick}>
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

  #handleHourClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains("picker-item")) {
      const index = parseInt(target.dataset.index || "0", 10);
      this.#hourOffset = index;
      this.#updateValue();
    }
  }

  #handleMinuteClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains("picker-item")) {
      const index = parseInt(target.dataset.index || "0", 10);
      this.#minuteOffset = index;
      this.#updateValue();
    }
  }

  #handlePeriodClick(e: MouseEvent): void {
    const target = e.target as HTMLElement;
    if (target.classList.contains("picker-item")) {
      const index = parseInt(target.dataset.index || "0", 10);
      this.#periodOffset = index;
      this.#updateValue();
    }
  }

  #updateValue(): void {
    const hours = this.hourFormat === "12" ? HOURS_12 : HOURS_24;
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
