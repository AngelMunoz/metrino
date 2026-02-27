import { LitElement, html, css } from "lit";
import "../../../src/components/buttons/button.ts";
import "../../../src/components/buttons/hyperlink-button.ts";
import "../../../src/components/buttons/repeat-button.ts";
import "../../../src/components/buttons/dropdown-button.ts";

export class PageComponentsButtons extends LitElement {
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
    .component-card {
      border: 1px solid var(--metro-border);
      margin-bottom: var(--metro-spacing-lg);
    }
    .component-header {
      padding: var(--metro-spacing-md) var(--metro-spacing-lg);
      background: var(--metro-highlight);
      border-bottom: 1px solid var(--metro-border);
    }
    .component-name {
      font-size: var(--metro-font-size-medium);
      font-weight: 500;
    }
    .component-desc {
      font-size: var(--metro-font-size-small);
      color: var(--metro-foreground-secondary);
      margin-top: var(--metro-spacing-xs);
    }
    .component-demo {
      padding: var(--metro-spacing-lg);
      display: flex;
      flex-wrap: wrap;
      gap: var(--metro-spacing-md);
      align-items: center;
    }
    .code-block {
      background: var(--metro-highlight);
      padding: var(--metro-spacing-md);
      font-family: "SF Mono", "Fira Code", monospace;
      font-size: var(--metro-font-size-small);
      margin: var(--metro-spacing-md) var(--metro-spacing-lg);
      position: relative;
      overflow-x: auto;
    }
    .copy-btn {
      position: absolute;
      top: var(--metro-spacing-sm);
      right: var(--metro-spacing-sm);
      padding: 2px 8px;
      background: transparent;
      border: 1px solid var(--metro-border);
      color: var(--metro-foreground-secondary);
      cursor: pointer;
      font-size: 11px;
      font-family: inherit;
    }
    .copy-btn:hover {
      background: var(--metro-accent);
      border-color: var(--metro-accent);
      color: white;
    }
    .api-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--metro-font-size-small);
      margin: var(--metro-spacing-md) var(--metro-spacing-lg);
    }
    .api-table th,
    .api-table td {
      padding: var(--metro-spacing-sm) var(--metro-spacing-md);
      text-align: left;
      border-bottom: 1px solid var(--metro-border);
    }
    .api-table th {
      background: var(--metro-highlight);
      font-weight: 500;
    }
    .api-table code {
      font-family: "SF Mono", monospace;
      color: var(--metro-accent);
    }
    .demo-label {
      font-size: var(--metro-font-size-small);
      color: var(--metro-foreground-secondary);
      margin-bottom: var(--metro-spacing-sm);
      width: 100%;
    }
  `;

  #repeatCount = 0;

  #copyCode(e: Event): void {
    const btn = e.target as HTMLButtonElement;
    const code = btn.previousElementSibling as HTMLElement;
    navigator.clipboard.writeText(code.textContent || "").then(() => {
      btn.textContent = "Copied!";
      setTimeout(() => btn.textContent = "Copy", 2000);
    });
  }

  #incrementRepeat(): void {
    this.#repeatCount++;
    const counter = this.shadowRoot?.getElementById("repeat-counter");
    if (counter) counter.textContent = String(this.#repeatCount);
  }

  render() {
    return html`
      <h1 class="page-title">Buttons</h1>
      <p class="page-description">
        Metro buttons are flat, bordered controls with a characteristic tilt effect on hover.
        They support accent colors, disabled states, and repeat click functionality.
      </p>

      <div class="section">
        <h2 class="section-title">metro-button</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Standard Button</div>
            <div class="component-desc">Basic button with border and hover effect</div>
          </div>
          <div class="component-demo">
            <metro-button>Default</metro-button>
            <metro-button accent>Accent</metro-button>
            <metro-button disabled>Disabled</metro-button>
          </div>
          <div class="code-block">
            <code>&lt;metro-button&gt;Default&lt;/metro-button&gt;
&lt;metro-button accent&gt;Accent&lt;/metro-button&gt;
&lt;metro-button disabled&gt;Disabled&lt;/metro-button&gt;</code>
            <button class="copy-btn" @click=${this.#copyCode}>Copy</button>
          </div>
        </div>

        <div class="component-card">
          <div class="component-header">
            <div class="component-name">API Reference</div>
          </div>
          <table class="api-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>disabled</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Disables the button</td>
              </tr>
              <tr>
                <td><code>accent</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Shows button with accent color background</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-hyperlink-button</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Hyperlink Button</div>
            <div class="component-desc">Button styled as a hyperlink with accent color</div>
          </div>
          <div class="component-demo">
            <metro-hyperlink-button>Plain Link</metro-hyperlink-button>
            <metro-hyperlink-button href="https://example.com" target="_blank">
              External Link
            </metro-hyperlink-button>
            <metro-hyperlink-button disabled>Disabled</metro-hyperlink-button>
          </div>
          <div class="code-block">
            <code>&lt;metro-hyperlink-button&gt;Plain Link&lt;/metro-hyperlink-button&gt;
&lt;metro-hyperlink-button href="https://example.com" target="_blank"&gt;
  External Link
&lt;/metro-hyperlink-button&gt;
&lt;metro-hyperlink-button disabled&gt;Disabled&lt;/metro-hyperlink-button&gt;</code>
            <button class="copy-btn" @click=${this.#copyCode}>Copy</button>
          </div>
        </div>

        <div class="component-card">
          <div class="component-header">
            <div class="component-name">API Reference</div>
          </div>
          <table class="api-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>href</code></td>
                <td>string</td>
                <td>-</td>
                <td>URL to navigate to</td>
              </tr>
              <tr>
                <td><code>target</code></td>
                <td>string</td>
                <td>-</td>
                <td>Link target (_blank, _self, etc.)</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Disables the link</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-repeat-button</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Repeat Button</div>
            <div class="component-desc">Fires click events repeatedly while held down</div>
          </div>
          <div class="component-demo">
            <metro-repeat-button @click=${this.#incrementRepeat}>Hold Me</metro-repeat-button>
            <span style="margin-left: 16px; font-size: 14px;">
              Clicks: <strong id="repeat-counter">0</strong>
            </span>
          </div>
          <div class="code-block">
            <code>&lt;metro-repeat-button id="repeat-btn"&gt;Hold Me&lt;/metro-repeat-button&gt;

&lt;script&gt;
let count = 0;
document.getElementById('repeat-btn').addEventListener('click', () => {
  count++;
  console.log('Click count:', count);
});
&lt;/script&gt;</code>
            <button class="copy-btn" @click=${this.#copyCode}>Copy</button>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-dropdown-button</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Dropdown Button</div>
            <div class="component-desc">Button with expandable menu content</div>
          </div>
          <div class="component-demo">
            <metro-dropdown-button label="Select Option">
              <div style="padding: 8px; cursor: pointer; white-space: nowrap;">Option 1</div>
              <div style="padding: 8px; cursor: pointer; white-space: nowrap;">Option 2</div>
              <div style="padding: 8px; cursor: pointer; white-space: nowrap;">Option 3</div>
            </metro-dropdown-button>
          </div>
          <div class="code-block">
            <code>&lt;metro-dropdown-button label="Select Option"&gt;
  &lt;div&gt;Option 1&lt;/div&gt;
  &lt;div&gt;Option 2&lt;/div&gt;
  &lt;div&gt;Option 3&lt;/div&gt;
&lt;/metro-dropdown-button&gt;</code>
            <button class="copy-btn" @click=${this.#copyCode}>Copy</button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("page-components-buttons", PageComponentsButtons);
