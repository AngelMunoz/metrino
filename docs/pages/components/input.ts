import { LitElement, html, css } from "lit";
import "../../../src/components/input/text-box.ts";
import "../../../src/components/input/password-box.ts";
import "../../../src/components/input/number-box.ts";
import "../../../src/components/input/check-box.ts";
import "../../../src/components/input/radio-button.ts";
import "../../../src/components/input/toggle-switch.ts";
import "../../../src/components/input/slider.ts";
import "../../../src/components/input/rating.ts";
import "../../../src/components/input/auto-suggest-box.ts";
import "../../../src/components/input/combo-box.ts";
import "../../../src/components/input/rich-edit-box.ts";

export class PageComponentsInput extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .page-title {
      font-size: var(--metro-font-size-xxlarge, 42px);
      font-weight: 200;
      letter-spacing: -0.02em;
      margin-bottom: var(--metro-spacing-md);
    }
    .page-description {
      font-size: var(--metro-font-size-medium, 16px);
      color: var(--metro-foreground-secondary);
      margin-bottom: var(--metro-spacing-xxl);
      max-width: 800px;
    }
    .section {
      margin-bottom: var(--metro-spacing-xxl);
    }
    .section-title {
      font-size: var(--metro-font-size-xlarge, 28px);
      font-weight: 200;
      margin-bottom: var(--metro-spacing-lg);
      padding-bottom: var(--metro-spacing-sm);
      border-bottom: 2px solid var(--metro-accent);
      display: inline-block;
    }
    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--metro-spacing-lg);
    }
    .demo-item {
      padding: var(--metro-spacing-lg);
      background: var(--metro-highlight);
    }
    .demo-label {
      font-size: var(--metro-font-size-small);
      color: var(--metro-foreground-secondary);
      margin-bottom: var(--metro-spacing-sm);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .code-block {
      background: var(--metro-background);
      padding: var(--metro-spacing-md);
      font-family: "SF Mono", "Fira Code", monospace;
      font-size: var(--metro-font-size-small);
      margin-top: var(--metro-spacing-lg);
      overflow-x: auto;
    }
  `;

  render() {
    return html`
      <h1 class="page-title">Input</h1>
      <p class="page-description">
        Input components collect user data through text fields, selections, 
        toggles, and other form controls styled in the Metro aesthetic.
      </p>

      <div class="section">
        <h2 class="section-title">Text Input</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <div class="demo-label">Text Box</div>
            <metro-text-box placeholder="Enter text..."></metro-text-box>
          </div>
          <div class="demo-item">
            <div class="demo-label">With Label</div>
            <metro-text-box label="Username" placeholder="Your name"></metro-text-box>
          </div>
          <div class="demo-item">
            <div class="demo-label">Disabled</div>
            <metro-text-box value="Disabled" disabled></metro-text-box>
          </div>
          <div class="demo-item">
            <div class="demo-label">Password Box</div>
            <metro-password-box label="Password" placeholder="Enter password"></metro-password-box>
          </div>
          <div class="demo-item">
            <div class="demo-label">Number Box</div>
            <metro-number-box label="Quantity" value="1" min="0" max="100"></metro-number-box>
          </div>
        </div>
        <div class="code-block">
          <code>&lt;metro-text-box label="Name" placeholder="Enter name"&gt;&lt;/metro-text-box&gt;
&lt;metro-password-box label="Password"&gt;&lt;/metro-password-box&gt;
&lt;metro-number-box label="Count" value="1" min="0" max="100"&gt;&lt;/metro-number-box&gt;</code>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Selection Controls</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <div class="demo-label">Check Box</div>
            <metro-check-box>Unchecked</metro-check-box>
            <metro-check-box checked>Checked</metro-check-box>
            <metro-check-box disabled>Disabled</metro-check-box>
          </div>
          <div class="demo-item">
            <div class="demo-label">Radio Buttons</div>
            <metro-radio-button name="demo-radio" value="1" checked>Option 1</metro-radio-button>
            <metro-radio-button name="demo-radio" value="2">Option 2</metro-radio-button>
            <metro-radio-button name="demo-radio" value="3">Option 3</metro-radio-button>
          </div>
          <div class="demo-item">
            <div class="demo-label">Toggle Switch</div>
            <metro-toggle-switch>Off</metro-toggle-switch>
            <metro-toggle-switch on style="margin-top: 8px">On</metro-toggle-switch>
            <metro-toggle-switch disabled style="margin-top: 8px">Disabled</metro-toggle-switch>
          </div>
        </div>
        <div class="code-block">
          <code>&lt;metro-check-box checked&gt;Checked&lt;/metro-check-box&gt;

&lt;metro-radio-button name="group" value="1" checked&gt;Option 1&lt;/metro-radio-button&gt;
&lt;metro-radio-button name="group" value="2"&gt;Option 2&lt;/metro-radio-button&gt;

&lt;metro-toggle-switch on&gt;Enabled&lt;/metro-toggle-switch&gt;</code>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Slider & Rating</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <div class="demo-label">Slider</div>
            <metro-slider value="50" min="0" max="100"></metro-slider>
            <metro-slider disabled value="30" style="margin-top: 12px"></metro-slider>
          </div>
          <div class="demo-item">
            <div class="demo-label">Rating</div>
            <metro-rating value="3" max="5"></metro-rating>
          </div>
        </div>
        <div class="code-block">
          <code>&lt;metro-slider value="50" min="0" max="100"&gt;&lt;/metro-slider&gt;
&lt;metro-rating value="3" max="5"&gt;&lt;/metro-rating&gt;</code>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Auto-complete</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <div class="demo-label">Auto Suggest Box</div>
            <metro-auto-suggest-box id="demo-suggest" placeholder="Type to search..."></metro-auto-suggest-box>
          </div>
          <div class="demo-item">
            <div class="demo-label">Combo Box</div>
            <metro-combo-box id="demo-combo" placeholder="Select an option..."></metro-combo-box>
          </div>
        </div>
        <div class="code-block">
          <code>&lt;metro-auto-suggest-box placeholder="Type to search..."&gt;&lt;/metro-auto-suggest-box&gt;
&lt;metro-combo-box placeholder="Select..."&gt;&lt;/metro-combo-box&gt;</code>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Rich Text</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <div class="demo-label">Rich Edit Box</div>
            <metro-rich-edit-box label="Description" placeholder="Enter rich text..."></metro-rich-edit-box>
          </div>
          <div class="demo-item">
            <div class="demo-label">Disabled</div>
            <metro-rich-edit-box label="Read Only" value="&lt;b&gt;Bold&lt;/b&gt; and &lt;i&gt;italic&lt;/i&gt;" disabled></metro-rich-edit-box>
          </div>
        </div>
        <div class="code-block">
          <code>&lt;metro-rich-edit-box label="Content" placeholder="Enter text..."&gt;&lt;/metro-rich-edit-box&gt;
&lt;metro-rich-edit-box disabled&gt;&lt;/metro-rich-edit-box&gt;</code>
        </div>
      </div>
    `;
  }
}

customElements.define("page-components-input", PageComponentsInput);
