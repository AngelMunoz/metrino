import { LitElement, html, css } from "lit";
import "../../../src/components/input/text-box.ts";
import "../../../src/components/input/password-box.ts";
import "../../../src/components/input/number-box.ts";
import "../../../src/components/input/check-box.ts";
import "../../../src/components/input/radio-button.ts";
import "../../../src/components/input/toggle-switch.ts";
import "../../../src/components/input/slider.ts";
import "../../../src/components/input/rating.ts";
import "../../../src/components/input/combo-box.ts";
import "../../../src/components/input/auto-suggest-box.ts";
import "../../../src/components/input/rich-edit-box.ts";

export class MetrinoInputPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(--metro-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);
      color: var(--metro-foreground, #ffffff);
      background: var(--metro-background, #1f1f1f);
      padding: var(--metro-spacing-xl, 24px);
      min-height: 100vh;
    }
    .page-title {
      font-size: 42px;
      font-weight: 200;
      margin-bottom: var(--metro-spacing-xl, 24px);
      color: var(--metro-foreground, #ffffff);
    }
    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: var(--metro-spacing-xl, 32px);
    }
    .demo-card {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
      padding: var(--metro-spacing-lg, 24px);
      border: 2px solid transparent;
    }
    .demo-card:hover {
      border-color: var(--metro-border, rgba(255, 255, 255, 0.2));
    }
    .component-title {
      font-size: 24px;
      font-weight: 200;
      margin-bottom: var(--metro-spacing-md, 12px);
      color: var(--metro-foreground, #ffffff);
    }
    .component-desc {
      font-size: var(--metro-font-size-small, 12px);
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      margin-bottom: var(--metro-spacing-md, 12px);
    }
    .demo-area {
      margin-bottom: var(--metro-spacing-md, 12px);
    }
    .demo-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--metro-spacing-md, 12px);
      align-items: center;
      margin-bottom: var(--metro-spacing-sm, 8px);
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
    .code-snippet {
      background: var(--metro-background, #1f1f1f);
      padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
      font-family: "Consolas", "Monaco", monospace;
      font-size: var(--metro-font-size-small, 12px);
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.8));
      overflow-x: auto;
      border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.1));
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
  `;

  static properties = {
    textBoxValue: { state: true },
    passwordValue: { state: true },
    numberValue: { state: true },
    checkBoxChecked: { state: true },
    toggleOn: { state: true },
    sliderValue: { state: true },
    ratingValue: { state: true },
    comboValue: { state: true },
    autoSuggestValue: { state: true },
    richEditValue: { state: true },
  };

  declare textBoxValue: string;
  declare passwordValue: string;
  declare numberValue: number;
  declare checkBoxChecked: boolean;
  declare toggleOn: boolean;
  declare sliderValue: number;
  declare ratingValue: number;
  declare comboValue: string;
  declare autoSuggestValue: string;
  declare richEditValue: string;

  #comboBox: any;
  #autoSuggestBox: any;

  constructor() {
    super();
    this.textBoxValue = "";
    this.passwordValue = "";
    this.numberValue = 0;
    this.checkBoxChecked = false;
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
      this.#comboBox.setOptions(["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"]);
    }
    if (this.#autoSuggestBox) {
      this.#autoSuggestBox.setSuggestions([]);
    }
  }

  #handleAutoSuggestChange(e: CustomEvent): void {
    const text = e.detail.text;
    this.autoSuggestValue = text;
    
    const allSuggestions = [
      "Apple", "Banana", "Cherry", "Date", "Elderberry",
      "Fig", "Grape", "Honeydew", "Kiwi", "Lemon"
    ];
    
    const filtered = allSuggestions.filter(s => 
      s.toLowerCase().includes(text.toLowerCase())
    );
    
    if (this.#autoSuggestBox) {
      this.#autoSuggestBox.setSuggestions(filtered);
    }
  }

  render() {
    return html`
      <h1 class="page-title">Input Components</h1>
      <div class="demo-grid">
        <div class="demo-card">
          <h3 class="component-title">metro-text-box</h3>
          <p class="component-desc">Single-line text input with label, placeholder, and validation states.</p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-text-box
                  label="Username"
                  placeholder="Enter username"
                  .value=${this.textBoxValue}
                  @change=${(e: CustomEvent) => this.textBoxValue = e.detail.value}
                ></metro-text-box>
                <div class="value-display">Value: ${this.textBoxValue}</div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-text-box label="Disabled" placeholder="Cannot edit" disabled></metro-text-box>
              </div>
              <div class="demo-item">
                <metro-text-box label="Required" placeholder="Required field" required></metro-text-box>
              </div>
            </div>
          </div>
          <pre class="code-snippet">&lt;metro-text-box
  label="Username"
  placeholder="Enter username"
  required&gt;
&lt;/metro-text-box&gt;</pre>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-password-box</h3>
          <p class="component-desc">Password input with reveal toggle button for showing/hiding the password.</p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-password-box
                  label="Password"
                  placeholder="Enter password"
                  .value=${this.passwordValue}
                  @change=${(e: CustomEvent) => this.passwordValue = e.detail.value}
                ></metro-password-box>
                <div class="value-display">Value: ${"*".repeat(this.passwordValue.length)}</div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-password-box label="Disabled" disabled></metro-password-box>
              </div>
            </div>
          </div>
          <pre class="code-snippet">&lt;metro-password-box
  label="Password"
  placeholder="Enter password"&gt;
&lt;/metro-password-box&gt;</pre>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-number-box</h3>
          <p class="component-desc">Numeric input with spin buttons for increment/decrement. Supports min, max, and step.</p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-number-box
                  label="Quantity"
                  .value=${this.numberValue}
                  min="0"
                  max="100"
                  step="5"
                  @change=${(e: CustomEvent) => this.numberValue = e.detail.value}
                ></metro-number-box>
                <div class="value-display">Value: ${this.numberValue}</div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-number-box label="Disabled" disabled value="0"></metro-number-box>
              </div>
            </div>
          </div>
          <pre class="code-snippet">&lt;metro-number-box
  label="Quantity"
  min="0"
  max="100"
  step="5"&gt;
&lt;/metro-number-box&gt;</pre>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-check-box</h3>
          <p class="component-desc">Checkbox control for boolean selections with checked, unchecked, and disabled states.</p>
          <div class="demo-area">
            <div class="demo-row">
              <metro-check-box
                .checked=${this.checkBoxChecked}
                @change=${(e: CustomEvent) => this.checkBoxChecked = e.detail.checked}
              >Checked: ${this.checkBoxChecked}</metro-check-box>
            </div>
            <div class="demo-row">
              <metro-check-box checked>Pre-checked</metro-check-box>
              <metro-check-box disabled>Disabled</metro-check-box>
            </div>
          </div>
          <pre class="code-snippet">&lt;metro-check-box checked&gt;
  Label text
&lt;/metro-check-box&gt;</pre>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-radio-button</h3>
          <p class="component-desc">Radio button group for mutually exclusive selections. Use same name attribute to group.</p>
          <div class="demo-area">
            <div class="radio-group">
              <metro-radio-button name="demo-radio" value="option1">Option 1</metro-radio-button>
              <metro-radio-button name="demo-radio" value="option2">Option 2</metro-radio-button>
              <metro-radio-button name="demo-radio" value="option3">Option 3</metro-radio-button>
            </div>
            <div class="demo-row" style="margin-top: 12px;">
              <metro-radio-button name="disabled-radio" disabled>Disabled option</metro-radio-button>
            </div>
          </div>
          <pre class="code-snippet">&lt;metro-radio-button name="group" value="opt1"&gt;
  Option 1
&lt;/metro-radio-button&gt;
&lt;metro-radio-button name="group" value="opt2"&gt;
  Option 2
&lt;/metro-radio-button&gt;</pre>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-toggle-switch</h3>
          <p class="component-desc">Toggle switch for on/off settings with animated thumb transition.</p>
          <div class="demo-area">
            <div class="demo-row">
              <metro-toggle-switch
                .on=${this.toggleOn}
                @change=${(e: CustomEvent) => this.toggleOn = e.detail.on}
              >${this.toggleOn ? "ON" : "OFF"}</metro-toggle-switch>
            </div>
            <div class="demo-row">
              <metro-toggle-switch on>Enabled</metro-toggle-switch>
              <metro-toggle-switch disabled>Disabled</metro-toggle-switch>
            </div>
          </div>
          <pre class="code-snippet">&lt;metro-toggle-switch on&gt;
  Enable feature
&lt;/metro-toggle-switch&gt;</pre>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-slider</h3>
          <p class="component-desc">Range slider for selecting numeric values within a range.</p>
          <div class="demo-area">
            <div class="demo-item">
              <metro-slider
                .value=${this.sliderValue}
                min="0"
                max="100"
                @change=${(e: CustomEvent) => this.sliderValue = e.detail.value}
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
          <pre class="code-snippet">&lt;metro-slider
  min="0"
  max="100"
  value="50"&gt;
&lt;/metro-slider&gt;</pre>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-rating</h3>
          <p class="component-desc">Interactive star rating control for collecting user feedback.</p>
          <div class="demo-area">
            <div class="demo-row">
              <metro-rating
                .value=${this.ratingValue}
                max="5"
                @change=${(e: CustomEvent) => this.ratingValue = e.detail.value}
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
          <pre class="code-snippet">&lt;metro-rating
  max="5"
  value="3"&gt;
&lt;/metro-rating&gt;</pre>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-combo-box</h3>
          <p class="component-desc">Dropdown combo box for selecting from a list of predefined options.</p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-combo-box
                  id="demo-combo"
                  placeholder="Select an option..."
                  .value=${this.comboValue}
                  @selectionchanged=${(e: CustomEvent) => this.comboValue = e.detail.selectedValue}
                ></metro-combo-box>
                <div class="value-display">Selected: ${this.comboValue || "None"}</div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-combo-box placeholder="Disabled" disabled></metro-combo-box>
              </div>
            </div>
          </div>
          <pre class="code-snippet">&lt;metro-combo-box
  placeholder="Select..."&gt;
&lt;/metro-combo-box&gt;
&lt;script&gt;
  combo.setOptions(["A", "B", "C"]);
&lt;/script&gt;</pre>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-auto-suggest-box</h3>
          <p class="component-desc">Search input with dynamic suggestions that filter as you type.</p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item">
                <metro-auto-suggest-box
                  id="demo-autosuggest"
                  placeholder="Search fruits..."
                  .value=${this.autoSuggestValue}
                  @textchanged=${this.#handleAutoSuggestChange}
                  @suggestionchosen=${(e: CustomEvent) => this.autoSuggestValue = e.detail.selectedValue}
                ></metro-auto-suggest-box>
                <div class="value-display">Search: ${this.autoSuggestValue || "Type to search..."}</div>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item">
                <metro-auto-suggest-box placeholder="Disabled" disabled></metro-auto-suggest-box>
              </div>
            </div>
          </div>
          <pre class="code-snippet">&lt;metro-auto-suggest-box
  placeholder="Search..."
  @textchanged=\${handleSearch}&gt;
&lt;/metro-auto-suggest-box&gt;</pre>
        </div>

        <div class="demo-card">
          <h3 class="component-title">metro-rich-edit-box</h3>
          <p class="component-desc">Rich text editor with formatting toolbar for bold, italic, underline, and strikethrough.</p>
          <div class="demo-area">
            <div class="demo-row">
              <div class="demo-item" style="min-width: 100%;">
                <metro-rich-edit-box
                  label="Rich Text Editor"
                  placeholder="Start typing..."
                  .value=${this.richEditValue}
                  @change=${(e: CustomEvent) => this.richEditValue = e.detail.value}
                ></metro-rich-edit-box>
              </div>
            </div>
            <div class="demo-row">
              <div class="demo-item" style="min-width: 100%;">
                <metro-rich-edit-box label="Disabled" disabled placeholder="Cannot edit"></metro-rich-edit-box>
              </div>
            </div>
          </div>
          <pre class="code-snippet">&lt;metro-rich-edit-box
  label="Editor"
  placeholder="Start typing..."&gt;
&lt;/metro-rich-edit-box&gt;</pre>
        </div>
      </div>
    `;
  }
}

customElements.define("metrino-input-page", MetrinoInputPage);
