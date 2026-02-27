import { LitElement, html, css } from "lit";

export class PageDesignTypography extends LitElement {
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
    .type-sample {
      padding: var(--metro-spacing-lg);
      background: var(--metro-highlight);
      margin-bottom: var(--metro-spacing-md);
    }
    .type-label {
      font-size: var(--metro-font-size-small, 12px);
      color: var(--metro-foreground-secondary);
      margin-bottom: var(--metro-spacing-sm);
      display: flex;
      justify-content: space-between;
    }
    .type-label code {
      font-family: "SF Mono", monospace;
      color: var(--metro-accent);
    }
    .display { font-size: 56px; font-weight: 200; letter-spacing: -0.02em; line-height: 1.1; }
    .title { font-size: 42px; font-weight: 200; letter-spacing: -0.02em; line-height: 1.1; }
    .subtitle { font-size: 20px; font-weight: 300; letter-spacing: 0.02em; line-height: 1.2; }
    .header { font-size: 28px; font-weight: 300; letter-spacing: 0.02em; line-height: 1.2; }
    .subheader { font-size: 26px; font-weight: 300; letter-spacing: 0.02em; line-height: 1.2; }
    .body { font-size: 15px; font-weight: 400; letter-spacing: 0.02em; line-height: 1.4; }
    .caption { font-size: 12px; font-weight: 400; letter-spacing: 0.02em; line-height: 1.3; }
    .badge { font-size: 11px; font-weight: 700; letter-spacing: 0.05em; line-height: 1.2; text-transform: uppercase; }
    
    .token-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--metro-font-size-small);
    }
    .token-table th,
    .token-table td {
      padding: var(--metro-spacing-sm) var(--metro-spacing-md);
      text-align: left;
      border-bottom: 1px solid var(--metro-border);
    }
    .token-table th {
      background: var(--metro-highlight);
      font-weight: 500;
    }
    .token-table code {
      font-family: "SF Mono", "Fira Code", monospace;
      color: var(--metro-accent);
    }
    .code-block {
      background: var(--metro-highlight);
      padding: var(--metro-spacing-md);
      font-family: "SF Mono", "Fira Code", monospace;
      font-size: var(--metro-font-size-small);
      margin-bottom: var(--metro-spacing-md);
    }
    .guidelines {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--metro-spacing-md);
    }
    .guideline {
      padding: var(--metro-spacing-lg);
      background: var(--metro-highlight);
    }
    .guideline h4 {
      font-size: var(--metro-font-size-medium);
      font-weight: 500;
      margin-bottom: var(--metro-spacing-sm);
    }
    .guideline p {
      font-size: var(--metro-font-size-small);
      color: var(--metro-foreground-secondary);
    }
  `;

  render() {
    return html`
      <h1 class="page-title">Typography</h1>
      <p class="page-description">
        Typography is the primary visual element in Metro design. Use large, 
        light-weight type for headlines and clean, readable text for body content.
      </p>

      <div class="section">
        <h2 class="section-title">Type Scale</h2>
        
        <div class="type-sample">
          <div class="type-label">
            <span>Display</span>
            <code>56px / weight: 200</code>
          </div>
          <div class="display">Display Heading</div>
        </div>

        <div class="type-sample">
          <div class="type-label">
            <span>Title</span>
            <code>42px / weight: 200</code>
          </div>
          <div class="title">Title Heading</div>
        </div>

        <div class="type-sample">
          <div class="type-label">
            <span>Header</span>
            <code>28px / weight: 300</code>
          </div>
          <div class="header">Header Text</div>
        </div>

        <div class="type-sample">
          <div class="type-label">
            <span>Subheader</span>
            <code>26px / weight: 300</code>
          </div>
          <div class="subheader">Subheader Text</div>
        </div>

        <div class="type-sample">
          <div class="type-label">
            <span>Subtitle</span>
            <code>20px / weight: 300</code>
          </div>
          <div class="subtitle">Subtitle Text</div>
        </div>

        <div class="type-sample">
          <div class="type-label">
            <span>Body</span>
            <code>15px / weight: 400</code>
          </div>
          <div class="body">Body text is used for readable content. It should be comfortable to read at normal distances and provide sufficient contrast against the background.</div>
        </div>

        <div class="type-sample">
          <div class="type-label">
            <span>Caption</span>
            <code>12px / weight: 400</code>
          </div>
          <div class="caption">Caption text for secondary information</div>
        </div>

        <div class="type-sample">
          <div class="type-label">
            <span>Badge</span>
            <code>11px / weight: 700</code>
          </div>
          <div class="badge">Badge Text</div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">CSS Tokens</h2>
        <table class="token-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Value</th>
              <th>Usage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--metro-font-family</code></td>
              <td>system-ui, Segoe UI, sans-serif</td>
              <td>Base font stack</td>
            </tr>
            <tr>
              <td><code>--metro-font-size-small</code></td>
              <td>12px</td>
              <td>Captions, badges</td>
            </tr>
            <tr>
              <td><code>--metro-font-size-normal</code></td>
              <td>14px</td>
              <td>Default text</td>
            </tr>
            <tr>
              <td><code>--metro-font-size-medium</code></td>
              <td>16px</td>
              <td>Emphasized text</td>
            </tr>
            <tr>
              <td><code>--metro-font-size-large</code></td>
              <td>20px</td>
              <td>Subtitles</td>
            </tr>
            <tr>
              <td><code>--metro-font-size-xlarge</code></td>
              <td>28px</td>
              <td>Headers</td>
            </tr>
            <tr>
              <td><code>--metro-font-size-xxlarge</code></td>
              <td>42px</td>
              <td>Titles</td>
            </tr>
            <tr>
              <td><code>--metro-font-size-hero</code></td>
              <td>56px</td>
              <td>Display text</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2 class="section-title">Guidelines</h2>
        <div class="guidelines">
          <div class="guideline">
            <h4>Use Light Weights</h4>
            <p>Metro uses light (200-300) weights for large text. This creates an elegant, modern feel.</p>
          </div>
          <div class="guideline">
            <h4>Generous Letter Spacing</h4>
            <p>Use 0.02em letter-spacing for body text. For badges, use 0.05em with uppercase.</p>
          </div>
          <div class="guideline">
            <h4>Tight Line Heights</h4>
            <p>Headlines use 1.1-1.2 line-height. Body text uses 1.4 for readability.</p>
          </div>
          <div class="guideline">
            <h4>Negative Tracking for Display</h4>
            <p>Large display text benefits from -0.02em letter-spacing for tighter character spacing.</p>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-text-block</h2>
        <p style="margin-bottom: var(--metro-spacing-md); color: var(--metro-foreground-secondary);">
          Use the text-block component for styled text with semantic formatting options.
        </p>
        <div class="code-block">
          <code>&lt;metro-text-block bold&gt;Bold text&lt;/metro-text-block&gt;
&lt;metro-text-block italic&gt;Italic text&lt;/metro-text-block&gt;
&lt;metro-text-block underline&gt;Underlined text&lt;/metro-text-block&gt;</code>
        </div>
      </div>
    `;
  }
}

customElements.define("page-design-typography", PageDesignTypography);
