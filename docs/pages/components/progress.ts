import { LitElement, html, css } from "lit";
import "../../../src/components/progress/progress-bar.ts";
import "../../../src/components/progress/progress-ring.ts";

export class PageComponentsProgress extends LitElement {
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
      display: grid;
      gap: var(--metro-spacing-lg);
    }
    .code-block {
      background: var(--metro-highlight);
      padding: var(--metro-spacing-md);
      font-family: "SF Mono", "Fira Code", monospace;
      font-size: var(--metro-font-size-small);
      margin: var(--metro-spacing-md) var(--metro-spacing-lg);
      overflow-x: auto;
    }
    .demo-row {
      display: flex;
      align-items: center;
      gap: var(--metro-spacing-lg);
      flex-wrap: wrap;
    }
  `;

  render() {
    return html`
      <h1 class="page-title">Progress</h1>
      <p class="page-description">
        Progress indicators show the status of ongoing operations, whether 
        determinate (known progress) or indeterminate (unknown duration).
      </p>

      <div class="section">
        <h2 class="section-title">metro-progress-bar</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Progress Bar</div>
            <div class="component-desc">Linear progress indicator</div>
          </div>
          <div class="component-demo">
            <div>
              <p style="font-size: 12px; margin-bottom: 8px; color: var(--metro-foreground-secondary);">Determinate</p>
              <metro-progress-bar value="65" maximum="100" show-label></metro-progress-bar>
            </div>
            <div>
              <p style="font-size: 12px; margin-bottom: 8px; color: var(--metro-foreground-secondary);">Indeterminate</p>
              <metro-progress-bar indeterminate></metro-progress-bar>
            </div>
          </div>
          <div class="code-block">
            <code>&lt;metro-progress-bar value="65" maximum="100" show-label&gt;&lt;/metro-progress-bar&gt;
&lt;metro-progress-bar indeterminate&gt;&lt;/metro-progress-bar&gt;</code>
          </div>
        </div>

        <div class="component-card">
          <div class="component-header">
            <div class="component-name">API Reference</div>
          </div>
          <div style="padding: var(--metro-spacing-lg);">
            <table style="width: 100%; font-size: var(--metro-font-size-small); border-collapse: collapse;">
              <tr style="border-bottom: 1px solid var(--metro-border);">
                <th style="text-align: left; padding: 8px;">Attribute</th>
                <th style="text-align: left; padding: 8px;">Type</th>
                <th style="text-align: left; padding: 8px;">Default</th>
                <th style="text-align: left; padding: 8px;">Description</th>
              </tr>
              <tr style="border-bottom: 1px solid var(--metro-border);">
                <td style="padding: 8px;"><code style="color: var(--metro-accent);">value</code></td>
                <td style="padding: 8px;">number</td>
                <td style="padding: 8px;">0</td>
                <td style="padding: 8px;">Current progress value</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--metro-border);">
                <td style="padding: 8px;"><code style="color: var(--metro-accent);">maximum</code></td>
                <td style="padding: 8px;">number</td>
                <td style="padding: 8px;">100</td>
                <td style="padding: 8px;">Maximum value</td>
              </tr>
              <tr style="border-bottom: 1px solid var(--metro-border);">
                <td style="padding: 8px;"><code style="color: var(--metro-accent);">indeterminate</code></td>
                <td style="padding: 8px;">boolean</td>
                <td style="padding: 8px;">false</td>
                <td style="padding: 8px;">Show indeterminate animation</td>
              </tr>
              <tr>
                <td style="padding: 8px;"><code style="color: var(--metro-accent);">show-label</code></td>
                <td style="padding: 8px;">boolean</td>
                <td style="padding: 8px;">false</td>
                <td style="padding: 8px;">Show percentage label</td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-progress-ring</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Progress Ring</div>
            <div class="component-desc">Circular indeterminate progress indicator</div>
          </div>
          <div class="component-demo">
            <div class="demo-row">
              <div>
                <p style="font-size: 12px; margin-bottom: 8px; color: var(--metro-foreground-secondary);">Small</p>
                <metro-progress-ring size="small"></metro-progress-ring>
              </div>
              <div>
                <p style="font-size: 12px; margin-bottom: 8px; color: var(--metro-foreground-secondary);">Normal</p>
                <metro-progress-ring size="normal"></metro-progress-ring>
              </div>
              <div>
                <p style="font-size: 12px; margin-bottom: 8px; color: var(--metro-foreground-secondary);">Large</p>
                <metro-progress-ring size="large"></metro-progress-ring>
              </div>
            </div>
          </div>
          <div class="code-block">
            <code>&lt;metro-progress-ring size="small"&gt;&lt;/metro-progress-ring&gt;
&lt;metro-progress-ring size="normal"&gt;&lt;/metro-progress-ring&gt;
&lt;metro-progress-ring size="large"&gt;&lt;/metro-progress-ring&gt;</code>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("page-components-progress", PageComponentsProgress);
