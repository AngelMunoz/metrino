import { LitElement, html, css } from "lit";
import "../../../src/components/datetime/date-picker.ts";
import "../../../src/components/datetime/time-picker.ts";
import "../../../src/components/datetime/date-picker-roller.ts";
import "../../../src/components/datetime/time-picker-roller.ts";
import "../../../src/components/datetime/calendar.ts";
import "../../../src/components/datetime/calendar-date-picker.ts";

export class PageComponentsDatetime extends LitElement {
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
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
      <h1 class="page-title">Date & Time</h1>
      <p class="page-description">
        Date and time pickers follow Metro's clean aesthetic with both native browser 
        inputs and custom roller-style pickers inspired by Windows Phone.
      </p>

      <div class="section">
        <h2 class="section-title">Native Pickers</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <div class="demo-label">Date Picker</div>
            <metro-date-picker label="Select date"></metro-date-picker>
          </div>
          <div class="demo-item">
            <div class="demo-label">Time Picker</div>
            <metro-time-picker label="Select time"></metro-time-picker>
          </div>
        </div>
        <div class="code-block">
          <code>&lt;metro-date-picker label="Select date"&gt;&lt;/metro-date-picker&gt;
&lt;metro-time-picker label="Select time"&gt;&lt;/metro-time-picker&gt;</code>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Roller Pickers</h2>
        <p style="margin-bottom: var(--metro-spacing-lg); color: var(--metro-foreground-secondary);">
          Roller pickers provide a touch-friendly spinning wheel interface inspired by Windows Phone.
        </p>
        <div class="demo-grid">
          <div class="demo-item">
            <div class="demo-label">Date Roller</div>
            <metro-date-picker-roller label="Pick a date"></metro-date-picker-roller>
          </div>
          <div class="demo-item">
            <div class="demo-label">Time Roller (12h)</div>
            <metro-time-picker-roller hour-format="12" label="Pick time"></metro-time-picker-roller>
          </div>
          <div class="demo-item">
            <div class="demo-label">Time Roller (24h)</div>
            <metro-time-picker-roller hour-format="24" label="Pick time"></metro-time-picker-roller>
          </div>
        </div>
        <div class="code-block">
          <code>&lt;metro-date-picker-roller label="Pick a date"&gt;&lt;/metro-date-picker-roller&gt;

&lt;metro-time-picker-roller hour-format="12" label="Pick time"&gt;&lt;/metro-time-picker-roller&gt;
&lt;metro-time-picker-roller hour-format="24" label="Pick time"&gt;&lt;/metro-time-picker-roller&gt;</code>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-calendar</h2>
        <div class="demo-grid">
          <div class="demo-item" style="grid-column: span 2;">
            <div class="demo-label">Calendar</div>
            <metro-calendar></metro-calendar>
          </div>
        </div>
        <div class="code-block">
          <code>&lt;metro-calendar&gt;&lt;/metro-calendar&gt;</code>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-calendar-date-picker</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <div class="demo-label">Calendar Date Picker</div>
            <metro-calendar-date-picker placeholder="Select date..."></metro-calendar-date-picker>
          </div>
          <div class="demo-item">
            <div class="demo-label">With Format</div>
            <metro-calendar-date-picker format="MM/DD/YYYY" placeholder="Pick a date"></metro-calendar-date-picker>
          </div>
        </div>
        <div class="code-block">
          <code>&lt;metro-calendar-date-picker placeholder="Select date..."&gt;&lt;/metro-calendar-date-picker&gt;

&lt;metro-calendar-date-picker format="MM/DD/YYYY" placeholder="Pick a date"&gt;&lt;/metro-calendar-date-picker&gt;

&lt;metro-calendar-date-picker min-date="2024-01-01" max-date="2024-12-31"&gt;&lt;/metro-calendar-date-picker&gt;</code>
        </div>
      </div>
    `;
  }
}

customElements.define("page-components-datetime", PageComponentsDatetime);
