import { LitElement, html, css } from "lit";
import { reducedMotionBlanket } from "@src/styles/shared.ts";
import { pageStyles, SHOWCASE_COLUMNS } from "../styles/page.ts";
import "../components/api-docs.ts";
import { registerMetroDatePicker } from "@src/components/datetime/date-picker.ts";
import { registerMetroTimePicker } from "@src/components/datetime/time-picker.ts";
import { registerMetroDatePickerRoller } from "@src/components/datetime/date-picker-roller.ts";
import { registerMetroTimePickerRoller } from "@src/components/datetime/time-picker-roller.ts";
import { registerMetroCalendar } from "@src/components/datetime/calendar.ts";
import { registerMetroCalendarDatePicker } from "@src/components/datetime/calendar-date-picker.ts";
import { registerMetroGrid } from "@src/components/layout/grid.ts";

registerMetroDatePicker();
registerMetroTimePicker();
registerMetroDatePickerRoller();
registerMetroTimePickerRoller();
registerMetroCalendar();
registerMetroCalendarDatePicker();
registerMetroGrid();

export class MetrinoDatetimePage extends LitElement {
  static styles = [
    reducedMotionBlanket,
    pageStyles,
    css`
    .demo-area {
      margin-bottom: var(--metro-spacing-md, 12px);
    }
    /* Pickers align to the top of the row, not its vertical center. */
    .demo-row {
      align-items: flex-start;
    }
    .demo-item {
      flex: 1;
      min-width: 150px;
    }
    .demo-item label {
      display: block;
      font-size: var(--metro-font-size-small, 12px);
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      margin-bottom: var(--metro-spacing-xs, 4px);
    }
    .value-display {
      font-size: var(--metro-font-size-small, 12px);
      color: var(--metro-accent, #0078d4);
      margin-top: var(--metro-spacing-xs, 4px);
    }
    metro-date-picker,
    metro-time-picker,
    metro-calendar-date-picker {
      max-width: 280px;
    }
    metro-date-picker-roller,
    metro-time-picker-roller {
      max-width: max-content;
    }
    metro-calendar {
      max-width: 320px;
    }
    .calendar-value {
      font-size: var(--metro-font-size-small, 12px);
      color: var(--metro-accent, #0078d4);
      margin-top: var(--metro-spacing-sm, 8px);
    }
    `,
  ];

  static properties = {
    dateValue: { state: true },
    timeValue: { state: true },
    rollerDateValue: { state: true },
    rollerTime12Value: { state: true },
    rollerTime24Value: { state: true },
    calendarValue: { state: true },
    calendarPickerValue: { state: true },
  };

  declare dateValue: string;
  declare timeValue: string;
  declare rollerDateValue: string;
  declare rollerTime12Value: string;
  declare rollerTime24Value: string;
  declare calendarValue: string;
  declare calendarPickerValue: string;

  constructor() {
    super();
    this.dateValue = "";
    this.timeValue = "";
    this.rollerDateValue = "";
    this.rollerTime12Value = "";
    this.rollerTime24Value = "";
    this.calendarValue = "";
    this.calendarPickerValue = "";
  }

  #formatDateForDisplay(dateStr: string): string {
    if (!dateStr) return "None";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[parseInt(parts[1], 10) - 1] || parts[1];
    return `${month} ${parts[2]}, ${parts[0]}`;
  }

  render() {
    return html`
      <h1 class="page-title">Datetime Components</h1>
      <metro-grid class="demo-grid" columns=${SHOWCASE_COLUMNS}>
        <div class="demo-card">
          <h3 class="component-title">metro-date-picker</h3>
          <p class="component-desc">
            Native HTML5 date input for selecting dates using the browser's
            built-in picker.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-date-picker
                  label="Select Date"
                  .value=${this.dateValue}
                  @change=${(e: CustomEvent) =>
                    (this.dateValue = e.detail.value)}
                ></metro-date-picker>
                <div class="value-display">
                  Selected: ${this.#formatDateForDisplay(this.dateValue)}
                </div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-date-picker
                  label="Required"
                  required
                ></metro-date-picker>
              </div>
              <div class="demo-item">
                <metro-date-picker
                  label="Disabled"
                  disabled
                ></metro-date-picker>
              </div>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-date-picker
  label="Select Date"
  required&gt;
&lt;/metro-date-picker&gt;</pre
          >
          <api-docs component="MetroDatePicker"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-time-picker</h3>
          <p class="component-desc">
            Native HTML5 time input for selecting times using the browser's
            built-in picker.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-time-picker
                  label="Select Time"
                  .value=${this.timeValue}
                  @change=${(e: CustomEvent) =>
                    (this.timeValue = e.detail.value)}
                ></metro-time-picker>
                <div class="value-display">
                  Selected: ${this.timeValue || "None"}
                </div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-time-picker
                  label="Required"
                  required
                ></metro-time-picker>
              </div>
              <div class="demo-item">
                <metro-time-picker
                  label="Disabled"
                  disabled
                ></metro-time-picker>
              </div>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-time-picker
  label="Select Time"
  required&gt;
&lt;/metro-time-picker&gt;</pre
          >
          <api-docs component="MetroTimePicker"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-date-picker-roller</h3>
          <p class="component-desc">
            Metro-style roller picker for selecting dates by dragging or
            scrolling. Supports configurable year range.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-date-picker-roller
                  label="Select Date"
                  min-year="2000"
                  max-year="2030"
                  .value=${this.rollerDateValue}
                  @change=${(e: CustomEvent) =>
                    (this.rollerDateValue = e.detail.value)}
                ></metro-date-picker-roller>
                <div class="value-display">
                  Selected: ${this.#formatDateForDisplay(this.rollerDateValue)}
                </div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-date-picker-roller
                  label="Disabled"
                  disabled
                ></metro-date-picker-roller>
              </div>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-date-picker-roller
  label="Select Date"
  min-year="2000"
  max-year="2030"&gt;
&lt;/metro-date-picker-roller&gt;</pre
          >
          <api-docs component="MetroDatePickerRoller"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-time-picker-roller (12h)</h3>
          <p class="component-desc">
            Metro-style roller picker for selecting time in 12-hour format with
            AM/PM selector.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-time-picker-roller
                  label="Select Time (12h)"
                  hour-format="12"
                  .value=${this.rollerTime12Value}
                  @change=${(e: CustomEvent) =>
                    (this.rollerTime12Value = e.detail.value)}
                ></metro-time-picker-roller>
                <div class="value-display">
                  Selected: ${this.rollerTime12Value || "None"}
                </div>
              </div>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-time-picker-roller
  label="Select Time"
  hour-format="12"&gt;
&lt;/metro-time-picker-roller&gt;</pre
          >
          <api-docs component="MetroTimePickerRoller"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-time-picker-roller (24h)</h3>
          <p class="component-desc">
            Metro-style roller picker for selecting time in 24-hour format
            without AM/PM.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-time-picker-roller
                  label="Select Time (24h)"
                  hour-format="24"
                  .value=${this.rollerTime24Value}
                  @change=${(e: CustomEvent) =>
                    (this.rollerTime24Value = e.detail.value)}
                ></metro-time-picker-roller>
                <div class="value-display">
                  Selected: ${this.rollerTime24Value || "None"}
                </div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-time-picker-roller
                  label="Disabled"
                  disabled
                  hour-format="24"
                ></metro-time-picker-roller>
              </div>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-time-picker-roller
  label="Select Time"
  hour-format="24"&gt;
&lt;/metro-time-picker-roller&gt;</pre
          >
          <api-docs component="MetroTimePickerRoller"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-calendar</h3>
          <p class="component-desc">
            Full calendar grid component with month navigation and date
            selection. Supports min/max date constraints.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-calendar
                  .selectedDate=${this.calendarValue}
                  @dateselected=${(e: CustomEvent) =>
                    (this.calendarValue = e.detail.value)}
                ></metro-calendar>
                <div class="calendar-value">
                  Selected: ${this.#formatDateForDisplay(this.calendarValue)}
                </div>
              </div>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-calendar
  selected-date="2025-01-15"
  min-date="2025-01-01"
  max-date="2025-12-31"
  @dateselected=\${handleDateSelected}&gt;
&lt;/metro-calendar&gt;</pre
          >
          <api-docs component="MetroCalendar"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-calendar-date-picker</h3>
          <p class="component-desc">
            Input field with dropdown calendar for date selection. Combines text
            input with calendar popup.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-calendar-date-picker
                  placeholder="Select a date..."
                  .value=${this.calendarPickerValue}
                  format="MM/DD/YYYY"
                  @change=${(e: CustomEvent) =>
                    (this.calendarPickerValue = e.detail.value)}
                ></metro-calendar-date-picker>
                <div class="value-display">
                  Selected:
                  ${this.#formatDateForDisplay(this.calendarPickerValue)}
                </div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-calendar-date-picker
                  placeholder="With min/max"
                  min-date="2025-01-01"
                  max-date="2025-12-31"
                ></metro-calendar-date-picker>
              </div>
              <div class="demo-item">
                <metro-calendar-date-picker
                  placeholder="Disabled"
                  disabled
                ></metro-calendar-date-picker>
              </div>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-calendar-date-picker
  placeholder="Select date..."
  format="MM/DD/YYYY"
  min-date="2025-01-01"
  max-date="2025-12-31"&gt;
&lt;/metro-calendar-date-picker&gt;</pre
          >
          <api-docs component="MetroCalendarDatePicker"></api-docs>
        </div>
      </metro-grid>
    `;
  }
}

customElements.define("metrino-datetime-page", MetrinoDatetimePage);
