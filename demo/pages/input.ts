import { LitElement, html, css } from "lit";
import { reducedMotionBlanket } from "@src/styles/shared.ts";
import { pageStyles, SHOWCASE_COLUMNS } from "../styles/page.ts";
import "../components/api-docs.ts";
import { registerMetroTextBox } from "@src/components/input/text-box.ts";
import { registerMetroPasswordBox } from "@src/components/input/password-box.ts";
import { registerMetroNumberBox } from "@src/components/input/number-box.ts";
import { registerMetroCheckBox } from "@src/components/input/check-box.ts";
import { registerMetroRadioButton } from "@src/components/input/radio-button.ts";
import { registerMetroToggleSwitch } from "@src/components/input/toggle-switch.ts";
import { registerMetroSlider } from "@src/components/input/slider.ts";
import { registerMetroRating } from "@src/components/input/rating.ts";
import { registerMetroComboBox } from "@src/components/input/combo-box.ts";
import { registerMetroAutoSuggestBox } from "@src/components/input/auto-suggest-box.ts";
import { registerMetroRichEditBox } from "@src/components/input/rich-edit-box.ts";
import { registerMetroDatePicker } from "@src/components/datetime/date-picker.ts";
import { registerMetroTimePicker } from "@src/components/datetime/time-picker.ts";
import { registerMetroCalendarDatePicker } from "@src/components/datetime/calendar-date-picker.ts";
import { registerMetroDatePickerRoller } from "@src/components/datetime/date-picker-roller.ts";
import { registerMetroTimePickerRoller } from "@src/components/datetime/time-picker-roller.ts";
import { registerMetroGrid } from "@src/components/layout/grid.ts";

registerMetroTextBox();
registerMetroPasswordBox();
registerMetroNumberBox();
registerMetroCheckBox();
registerMetroRadioButton();
registerMetroToggleSwitch();
registerMetroSlider();
registerMetroRating();
registerMetroComboBox();
registerMetroAutoSuggestBox();
registerMetroRichEditBox();
registerMetroDatePicker();
registerMetroTimePicker();
registerMetroCalendarDatePicker();
registerMetroDatePickerRoller();
registerMetroTimePickerRoller();
registerMetroGrid();

export class MetrinoInputPage extends LitElement {
  static styles = [
    reducedMotionBlanket,
    pageStyles,
    css`
    .demo-area {
      margin-bottom: var(--metro-spacing-md, 12px);
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
    metro-text-box,
    metro-password-box,
    metro-number-box,
    metro-combo-box,
    metro-auto-suggest-box,
    metro-rich-edit-box {
      max-width: 280px;
    }
    metro-slider {
      max-width: 200px;
    }
    .radio-group {
      display: flex;
      flex-direction: column;
      gap: var(--metro-spacing-sm, 8px);
    }
    .validation-forms {
      display: flex;
      flex-direction: column;
      gap: var(--metro-spacing-md, 12px);
    }
    .validation-form {
      display: flex;
      flex-direction: column;
      gap: var(--metro-spacing-sm, 8px);
      padding: var(--metro-spacing-sm, 8px);
      border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.1));
    }
    .form-title {
      margin: 0;
      font-size: var(--metro-font-size-small, 12px);
      font-weight: 600;
    }
    .form-buttons {
      display: flex;
      gap: var(--metro-spacing-sm, 8px);
    }
    .form-buttons button {
      font: inherit;
      padding: 6px 18px;
      cursor: pointer;
      background: transparent;
      color: var(--metro-foreground, #ffffff);
      border: 1px solid var(--metro-accent, #0078d4);
    }
    .form-buttons button[type="submit"] {
      background: var(--metro-accent, #0078d4);
      color: #ffffff;
    }
    .form-outcome {
      font-size: var(--metro-font-size-small, 12px);
      color: var(--metro-accent, #0078d4);
    }
    metro-date-picker,
    metro-time-picker,
    metro-calendar-date-picker {
      max-width: 280px;
    }
    `,
  ];

  static properties = {
    textBoxValue: { state: true },
    passwordValue: { state: true },
    numberValue: { state: true },
    checkBoxChecked: { state: true },
    toggleOn: { state: true },
    sliderValue: { state: true },
    ratingValue: { state: true },
    radioValue: { state: true },
    comboValue: { state: true },
    autoSuggestValue: { state: true },
    richEditValue: { state: true },
  };

  declare textBoxValue: string;
  declare passwordValue: string;
  declare numberValue: number;
  declare checkBoxChecked: boolean;
  declare radioValue: string;
  declare toggleOn: boolean;
  declare sliderValue: number;
  declare ratingValue: number;
  declare comboValue: string;
  declare autoSuggestValue: string;
  declare richEditValue: string;

  #comboBox: any;
  #autoSuggestBox: any;
  #formComboBox: any;
  #formAutoSuggestBox: any;

  constructor() {
    super();
    this.textBoxValue = "";
    this.passwordValue = "";
    this.numberValue = 0;
    this.checkBoxChecked = false;
    this.radioValue = "";
    this.toggleOn = false;
    this.sliderValue = 50;
    this.ratingValue = 3;
    this.comboValue = "";
    this.autoSuggestValue = "";
    this.richEditValue = "";
  }

  firstUpdated(): void {
    this.#comboBox = this.shadowRoot?.querySelector("#demo-combo");
    this.#autoSuggestBox = this.shadowRoot?.querySelector("#demo-autosuggest");

    if (this.#comboBox) {
      this.#comboBox.setOptions([
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4",
        "Option 5",
      ]);
    }
    if (this.#autoSuggestBox) {
      this.#autoSuggestBox.setSuggestions([]);
    }

    this.#formComboBox = this.shadowRoot?.querySelector("#form-combo");
    this.#formAutoSuggestBox =
      this.shadowRoot?.querySelector("#form-suggest");

    if (this.#formComboBox) {
      this.#formComboBox.setOptions(["Option 1", "Option 2", "Option 3"]);
    }
    if (this.#formAutoSuggestBox) {
      this.#formAutoSuggestBox.setSuggestions([
        "Apple",
        "Banana",
        "Cherry",
        "Date",
        "Elderberry",
        "Fig",
        "Grape",
        "Honeydew",
        "Kiwi",
        "Lemon",
      ]);
    }
  }

  #handleAutoSuggestChange(e: CustomEvent): void {
    const text = e.detail.text;
    this.autoSuggestValue = text;

    const allSuggestions = [
      "Apple",
      "Banana",
      "Cherry",
      "Date",
      "Elderberry",
      "Fig",
      "Grape",
      "Honeydew",
      "Kiwi",
      "Lemon",
    ];

    const filtered = allSuggestions.filter((s) =>
      s.toLowerCase().includes(text.toLowerCase()),
    );

    if (this.#autoSuggestBox) {
      this.#autoSuggestBox.setSuggestions(filtered);
    }
  }

  #handleFormSuggestChange(e: CustomEvent): void {
    const text = e.detail.text;

    const allSuggestions = [
      "Apple",
      "Banana",
      "Cherry",
      "Date",
      "Elderberry",
      "Fig",
      "Grape",
      "Honeydew",
      "Kiwi",
      "Lemon",
    ];

    const filtered = allSuggestions.filter((s) =>
      s.toLowerCase().includes(text.toLowerCase()),
    );

    if (this.#formAutoSuggestBox) {
      this.#formAutoSuggestBox.setSuggestions(filtered);
    }
  }

  #handleValidationSubmit(e: SubmitEvent): void {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const outcome = form.querySelector("[data-outcome]");
    const entries = [...new FormData(form).entries()]
      .map(([key, value]) => `${key}=${value}`)
      .join(", ");
    if (outcome) {
      outcome.textContent = entries ? `Submitted: ${entries}` : "Submitted";
    }
  }

  #handleValidationReset(e: Event): void {
    const form = e.target as HTMLFormElement;
    const outcome = form.querySelector("[data-outcome]");
    if (outcome) {
      outcome.textContent = "Not submitted";
    }
  }

  render() {
    return html`
      <h1 class="page-title">Input Components</h1>
      <metro-grid class="demo-grid" columns=${SHOWCASE_COLUMNS}>
        <div class="demo-card">
          <h3 class="component-title">metro-text-box</h3>
          <p class="component-desc">
            Single-line text input with label, placeholder, and validation
            states.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-text-box
                  label="Username"
                  placeholder="Enter username"
                  .value=${this.textBoxValue}
                  @change=${(e: CustomEvent) =>
                    (this.textBoxValue = e.detail.value)}
                ></metro-text-box>
                <div class="value-display">Value: ${this.textBoxValue}</div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-text-box
                  label="Disabled"
                  placeholder="Cannot edit"
                  disabled
                ></metro-text-box>
              </div>
              <div class="demo-item">
                <metro-text-box
                  label="Required"
                  placeholder="Required field"
                  required
                ></metro-text-box>
              </div>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-text-box
  label="Username"
  placeholder="Enter username"
  required&gt;
&lt;/metro-text-box&gt;</pre
          >
          <api-docs component="MetroTextBox"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-password-box</h3>
          <p class="component-desc">
            Password input with reveal toggle button for showing/hiding the
            password.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-password-box
                  label="Password"
                  placeholder="Enter password"
                  .value=${this.passwordValue}
                  @change=${(e: CustomEvent) =>
                    (this.passwordValue = e.detail.value)}
                ></metro-password-box>
                <div class="value-display">
                  Value: ${"*".repeat(this.passwordValue.length)}
                </div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-password-box
                  label="Disabled"
                  disabled
                ></metro-password-box>
              </div>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-password-box
  label="Password"
  placeholder="Enter password"&gt;
&lt;/metro-password-box&gt;</pre
          >
          <api-docs component="MetroPasswordBox"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-number-box</h3>
          <p class="component-desc">
            Numeric input with spin buttons for increment/decrement. Supports
            min, max, and step.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-number-box
                  label="Quantity"
                  .value=${this.numberValue}
                  min="0"
                  max="100"
                  step="5"
                  @change=${(e: CustomEvent) =>
                    (this.numberValue = e.detail.value)}
                ></metro-number-box>
                <div class="value-display">Value: ${this.numberValue}</div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-number-box
                  label="Disabled"
                  disabled
                  value="0"
                ></metro-number-box>
              </div>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-number-box
  label="Quantity"
  min="0"
  max="100"
  step="5"&gt;
&lt;/metro-number-box&gt;</pre
          >
          <api-docs component="MetroNumberBox"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-check-box</h3>
          <p class="component-desc">
            Checkbox control for boolean selections with checked, unchecked, and
            disabled states.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <metro-check-box
                .checked=${this.checkBoxChecked}
                @change=${(e: CustomEvent) =>
                  (this.checkBoxChecked = e.detail.checked)}
                >Checked: ${this.checkBoxChecked}</metro-check-box
              >
            </div>
            <div class="demo-row">
              <metro-check-box checked>Pre-checked</metro-check-box>
              <metro-check-box disabled>Disabled</metro-check-box>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-check-box checked&gt;
  Label text
&lt;/metro-check-box&gt;</pre
          >
          <api-docs component="MetroCheckBox"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-radio-button</h3>
          <p class="component-desc">
            Radio button group for mutually exclusive selections. Use same name
            attribute to group.
          </p>
          <div class="demo-area">
            <div class="radio-group">
              <metro-radio-button
                name="demo-radio"
                value="option1"
                @change=${(e: CustomEvent) =>
                  (this.radioValue = e.detail.value)}
                >Option 1</metro-radio-button
              >
              <metro-radio-button
                name="demo-radio"
                value="option2"
                @change=${(e: CustomEvent) =>
                  (this.radioValue = e.detail.value)}
                >Option 2</metro-radio-button
              >
              <metro-radio-button
                name="demo-radio"
                value="option3"
                @change=${(e: CustomEvent) =>
                  (this.radioValue = e.detail.value)}
                >Option 3</metro-radio-button
              >
            </div>
            <div class="value-display" id="radio-value">
              Selected: ${this.radioValue || "None"}
            </div>
            <div class="demo-row" style="margin-top: 12px;">
              <metro-radio-button name="disabled-radio" disabled
                >Disabled option</metro-radio-button
              >
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-radio-button name="group" value="opt1"&gt;
  Option 1
&lt;/metro-radio-button&gt;
&lt;metro-radio-button name="group" value="opt2"&gt;
  Option 2
&lt;/metro-radio-button&gt;</pre
          >
          <api-docs component="MetroRadioButton"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-toggle-switch</h3>
          <p class="component-desc">
            Toggle switch for on/off settings with animated thumb transition.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <metro-toggle-switch
                .on=${this.toggleOn}
                @change=${(e: CustomEvent) => (this.toggleOn = e.detail.on)}
                >${this.toggleOn ? "ON" : "OFF"}</metro-toggle-switch
              >
            </div>
            <div class="demo-row">
              <metro-toggle-switch on>Enabled</metro-toggle-switch>
              <metro-toggle-switch disabled>Disabled</metro-toggle-switch>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-toggle-switch on&gt;
  Enable feature
&lt;/metro-toggle-switch&gt;</pre
          >
          <api-docs component="MetroToggleSwitch"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-slider</h3>
          <p class="component-desc">
            Range slider for selecting numeric values within a range.
          </p>
          <div class="demo-area">
            <div class="demo-item">
              <metro-slider
                .value=${this.sliderValue}
                min="0"
                max="100"
                @change=${(e: CustomEvent) =>
                  (this.sliderValue = e.detail.value)}
              ></metro-slider>
              <div class="value-display">Value: ${this.sliderValue}</div>
            </div>
            <div class="demo-row" style="margin-top: 12px;">
              <div class="demo-item">
                <metro-slider disabled value="25"></metro-slider>
                <div class="value-display">Disabled slider</div>
              </div>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-slider
  min="0"
  max="100"
  value="50"&gt;
&lt;/metro-slider&gt;</pre
          >
          <api-docs component="MetroSlider"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-rating</h3>
          <p class="component-desc">
            Interactive star rating control for collecting user feedback.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <metro-rating
                .value=${this.ratingValue}
                max="5"
                @change=${(e: CustomEvent) =>
                  (this.ratingValue = e.detail.value)}
              ></metro-rating>
              <span class="value-display">${this.ratingValue} / 5 stars</span>
            </div>
            <div class="demo-row">
              <metro-rating value="4" readonly></metro-rating>
              <span class="value-display">Readonly</span>
            </div>
            <div class="demo-row">
              <metro-rating disabled value="3"></metro-rating>
              <span class="value-display">Disabled</span>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-rating
  max="5"
  value="3"&gt;
&lt;/metro-rating&gt;</pre
          >
          <api-docs component="MetroRating"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-combo-box</h3>
          <p class="component-desc">
            Dropdown combo box for selecting from a list of predefined options.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-combo-box
                  id="demo-combo"
                  placeholder="Select an option..."
                  .value=${this.comboValue}
                  @selectionchanged=${(e: CustomEvent) =>
                    (this.comboValue = e.detail.selectedValue)}
                ></metro-combo-box>
                <div class="value-display">
                  Selected: ${this.comboValue || "None"}
                </div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-combo-box
                  placeholder="Disabled"
                  disabled
                ></metro-combo-box>
              </div>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-combo-box
  placeholder="Select..."&gt;
&lt;/metro-combo-box&gt;
&lt;script&gt;
  combo.setOptions(["A", "B", "C"]);
&lt;/script&gt;</pre
          >
          <api-docs component="MetroComboBox"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-auto-suggest-box</h3>
          <p class="component-desc">
            Search input with dynamic suggestions that filter as you type.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-auto-suggest-box
                  id="demo-autosuggest"
                  placeholder="Search fruits..."
                  .value=${this.autoSuggestValue}
                  @textchanged=${this.#handleAutoSuggestChange}
                  @suggestionchosen=${(e: CustomEvent) =>
                    (this.autoSuggestValue = e.detail.selectedValue)}
                ></metro-auto-suggest-box>
                <div class="value-display">
                  Search: ${this.autoSuggestValue || "Type to search..."}
                </div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-auto-suggest-box
                  placeholder="Disabled"
                  disabled
                ></metro-auto-suggest-box>
              </div>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-auto-suggest-box
  placeholder="Search..."
  @textchanged=\${handleSearch}&gt;
&lt;/metro-auto-suggest-box&gt;</pre
          >
          <api-docs component="MetroAutoSuggestBox"></api-docs>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-rich-edit-box</h3>
          <p class="component-desc">
            Rich text editor with formatting toolbar for bold, italic,
            underline, and strikethrough.
          </p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item" style="min-width: 100%;">
                <metro-rich-edit-box
                  label="Rich Text Editor"
                  placeholder="Start typing..."
                  .value=${this.richEditValue}
                  @change=${(e: CustomEvent) =>
                    (this.richEditValue = e.detail.value)}
                ></metro-rich-edit-box>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item" style="min-width: 100%;">
                <metro-rich-edit-box
                  label="Disabled"
                  disabled
                  placeholder="Cannot edit"
                ></metro-rich-edit-box>
              </div>
            </div>
          </div>
          <pre class="code-snippet">
&lt;metro-rich-edit-box
  label="Editor"
  placeholder="Start typing..."&gt;
&lt;/metro-rich-edit-box&gt;</pre
          >
          <api-docs component="MetroRichEditBox"></api-docs>
        </div>

        <div class="demo-card wide">
          <h3 class="component-title">Form validation</h3>
          <p class="component-desc">
            Each mini-form below is a real form: submit goes through only when
            every control is valid, and the outcome line echoes the submitted
            values. A blocked submit fires invalid on the offending control
            and leaves the outcome untouched.
          </p>
          <div class="demo-area validation-forms">
            <form
              id="form-text"
              class="validation-form"
              @submit=${this.#handleValidationSubmit}
              @reset=${this.#handleValidationReset}
            >
              <p class="form-title">Required text and password</p>
              <metro-text-box
                name="username"
                label="Login name"
                placeholder="Required"
                required
              ></metro-text-box>
              <metro-password-box
                name="password"
                label="Password"
                placeholder="Required"
                required
              ></metro-password-box>
              <div class="form-buttons">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
              </div>
              <div class="form-outcome" data-outcome>Not submitted</div>
            </form>
            <form
              id="form-number"
              class="validation-form"
              @submit=${this.#handleValidationSubmit}
              @reset=${this.#handleValidationReset}
            >
              <p class="form-title">Number range, step, and required</p>
              <metro-number-box
                name="count"
                label="Count (0-10)"
                min="0"
                max="10"
                step="1"
              ></metro-number-box>
              <metro-number-box
                name="needed"
                label="Needed (required)"
                required
              ></metro-number-box>
              <div class="form-buttons">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
              </div>
              <div class="form-outcome" data-outcome>Not submitted</div>
            </form>
            <form
              id="form-checkable"
              class="validation-form"
              @submit=${this.#handleValidationSubmit}
              @reset=${this.#handleValidationReset}
            >
              <p class="form-title">Required checkables</p>
              <metro-check-box name="agree" required
                >Agree to the terms</metro-check-box
              >
              <metro-toggle-switch name="notify" required
                >Get alerts</metro-toggle-switch
              >
              <div class="form-buttons">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
              </div>
              <div class="form-outcome" data-outcome>Not submitted</div>
            </form>
            <form
              id="form-radio"
              class="validation-form"
              @submit=${this.#handleValidationSubmit}
              @reset=${this.#handleValidationReset}
            >
              <p class="form-title">Required radio group</p>
              <metro-radio-button name="plan" value="a" required
                >Basic</metro-radio-button
              >
              <metro-radio-button name="plan" value="b"
                >Pro</metro-radio-button
              >
              <metro-radio-button name="plan" value="c"
                >Team</metro-radio-button
              >
              <div class="form-buttons">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
              </div>
              <div class="form-outcome" data-outcome>Not submitted</div>
            </form>
            <form
              id="form-radio-other"
              class="validation-form"
              @submit=${this.#handleValidationSubmit}
              @reset=${this.#handleValidationReset}
            >
              <p class="form-title">Second form, same radio name</p>
              <metro-radio-button name="plan" value="x"
                >Other A</metro-radio-button
              >
              <metro-radio-button name="plan" value="y"
                >Other B</metro-radio-button
              >
              <div class="form-buttons">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
              </div>
              <div class="form-outcome" data-outcome>Not submitted</div>
            </form>
            <form
              id="form-choice"
              class="validation-form"
              @submit=${this.#handleValidationSubmit}
              @reset=${this.#handleValidationReset}
            >
              <p class="form-title">Slider and required rating</p>
              <metro-slider
                name="volume"
                min="0"
                max="100"
                value="50"
              ></metro-slider>
              <metro-rating name="stars" max="5" required></metro-rating>
              <div class="form-buttons">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
              </div>
              <div class="form-outcome" data-outcome>Not submitted</div>
            </form>
            <form
              id="form-pick"
              class="validation-form"
              @submit=${this.#handleValidationSubmit}
              @reset=${this.#handleValidationReset}
            >
              <p class="form-title">Required combo and auto-suggest</p>
              <metro-combo-box
                id="form-combo"
                name="choice"
                placeholder="Choose an option..."
                required
              ></metro-combo-box>
              <metro-auto-suggest-box
                id="form-suggest"
                name="fruit"
                placeholder="Type a fruit..."
                required
                @textchanged=${this.#handleFormSuggestChange}
              ></metro-auto-suggest-box>
              <div class="form-buttons">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
              </div>
              <div class="form-outcome" data-outcome>Not submitted</div>
            </form>
            <form
              id="form-rich"
              class="validation-form"
              @submit=${this.#handleValidationSubmit}
              @reset=${this.#handleValidationReset}
            >
              <p class="form-title">Required rich text</p>
              <metro-rich-edit-box
                name="bio"
                label="Bio"
                placeholder="Tell us about yourself..."
                required
              ></metro-rich-edit-box>
              <div class="form-buttons">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
              </div>
              <div class="form-outcome" data-outcome>Not submitted</div>
            </form>
            <form
              id="form-datetime"
              class="validation-form"
              @submit=${this.#handleValidationSubmit}
              @reset=${this.#handleValidationReset}
            >
              <p class="form-title">Required date and time</p>
              <metro-date-picker
                name="day"
                label="Day"
                required
              ></metro-date-picker>
              <metro-time-picker
                name="alarm"
                label="Alarm"
                required
              ></metro-time-picker>
              <div class="form-buttons">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
              </div>
              <div class="form-outcome" data-outcome>Not submitted</div>
            </form>
            <form
              id="form-calendar"
              class="validation-form"
              @submit=${this.#handleValidationSubmit}
              @reset=${this.#handleValidationReset}
            >
              <p class="form-title">Calendar date with min/max bounds</p>
              <metro-calendar-date-picker
                name="holiday"
                placeholder="Pick a date..."
                required
                min-date="2020-01-01"
                max-date="2030-12-31"
              ></metro-calendar-date-picker>
              <div class="form-buttons">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
              </div>
              <div class="form-outcome" data-outcome>Not submitted</div>
            </form>
            <form
              id="form-roller"
              class="validation-form"
              @submit=${this.#handleValidationSubmit}
              @reset=${this.#handleValidationReset}
            >
              <p class="form-title">Required roller pickers</p>
              <metro-date-picker-roller
                name="rolled"
                label="Rolled date"
                required
                min-year="2000"
                max-year="2030"
              ></metro-date-picker-roller>
              <metro-time-picker-roller
                name="shift"
                label="Shift start"
                hour-format="12"
                required
              ></metro-time-picker-roller>
              <div class="form-buttons">
                <button type="submit">Submit</button>
                <button type="reset">Reset</button>
              </div>
              <div class="form-outcome" data-outcome>Not submitted</div>
            </form>
          </div>
          <pre class="code-snippet">
&lt;form id="form-text"&gt;
  &lt;metro-text-box name="username" required&gt;
  &lt;/metro-text-box&gt;
  &lt;button type="submit"&gt;Submit&lt;/button&gt;
&lt;/form&gt;</pre
          >
        </div>
      </metro-grid>
    `;
  }
}

customElements.define("metrino-input-page", MetrinoInputPage);
