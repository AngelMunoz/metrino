import { LitElement, html, css } from "lit";

const accents = [
  { name: "blue", color: "#0078d4" },
  { name: "red", color: "#e51400" },
  { name: "orange", color: "#fa6800" },
  { name: "green", color: "#00a300" },
  { name: "teal", color: "#00aba9" },
  { name: "purple", color: "#a200ff" },
  { name: "magenta", color: "#d80073" },
  { name: "lime", color: "#a4c400" },
  { name: "brown", color: "#825a2c" },
  { name: "pink", color: "#f472d6" },
  { name: "mango", color: "#f09609" },
  { name: "cobalt", color: "#0050ef" },
  { name: "indigo", color: "#6a00ff" },
  { name: "violet", color: "#aa00ff" },
  { name: "crimson", color: "#a20025" },
  { name: "emerald", color: "#008a00" },
  { name: "mauve", color: "#765f89" },
  { name: "sienna", color: "#a0522d" },
  { name: "olive", color: "#6d8764" },
  { name: "steel", color: "#647687" },
  { name: "taupe", color: "#87794e" },
];

export class PageDesignColors extends LitElement {
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
    .accent-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: var(--metro-spacing-sm);
    }
    .accent-swatch {
      aspect-ratio: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform var(--metro-transition-fast) var(--metro-easing);
    }
    .accent-swatch:hover {
      transform: scale(1.05);
    }
    .accent-name {
      font-size: 10px;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      text-transform: capitalize;
    }
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
    .theme-demo {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--metro-spacing-lg);
      margin-bottom: var(--metro-spacing-lg);
    }
    .theme-box {
      padding: var(--metro-spacing-lg);
      border: 1px solid var(--metro-border);
    }
    .theme-box h4 {
      font-size: var(--metro-font-size-medium);
      margin-bottom: var(--metro-spacing-md);
    }
    .theme-box.dark {
      background: #000;
      color: #fff;
    }
    .theme-box.light {
      background: #fff;
      color: #1f1f1f;
    }
    @media (max-width: 600px) {
      .accent-grid {
        grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
      }
      .theme-demo {
        grid-template-columns: 1fr;
      }
    }
  `;

  render() {
    return html`
      <h1 class="page-title">Colors & Theming</h1>
      <p class="page-description">
        Metro uses a simple theming system built on CSS custom properties. 
        Choose from 21 accent colors and switch between light and dark themes.
      </p>

      <div class="section">
        <h2 class="section-title">Accent Colors</h2>
        <p style="margin-bottom: var(--metro-spacing-md); color: var(--metro-foreground-secondary);">
          Click a color to set it as the accent. Use the <code>accent</code> attribute on <code>body</code>.
        </p>
        <div class="accent-grid">
          ${accents.map(a => html`
            <div
              class="accent-swatch"
              style="background: ${a.color}"
              @click=${() => {
                document.body.setAttribute("accent", a.name);
                localStorage.setItem("metrino-accent", a.name);
              }}
            >
              <span class="accent-name">${a.name}</span>
            </div>
          `)}
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Theme Modes</h2>
        <p style="margin-bottom: var(--metro-spacing-md); color: var(--metro-foreground-secondary);">
          Metrino supports light and dark themes via the <code>data-theme</code> attribute.
        </p>
        <div class="theme-demo">
          <div class="theme-box dark">
            <h4>Dark Theme</h4>
            <p style="font-size: 12px; opacity: 0.7;">Default theme. Pure black background with white text.</p>
            <code style="font-size: 11px; color: #0078d4;">data-theme="dark"</code>
          </div>
          <div class="theme-box light">
            <h4>Light Theme</h4>
            <p style="font-size: 12px; opacity: 0.7;">White background with dark text.</p>
            <code style="font-size: 11px; color: #0078d4;">data-theme="light"</code>
          </div>
        </div>
        <div class="code-block">
          <code>&lt;body data-theme="dark" accent="purple"&gt;
  &lt;metro-button&gt;Click Me&lt;/metro-button&gt;
&lt;/body&gt;</code>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">CSS Custom Properties</h2>
        <table class="token-table">
          <thead>
            <tr>
              <th>Token</th>
              <th>Default (Dark)</th>
              <th>Default (Light)</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>--metro-accent</code></td>
              <td>#0078d4</td>
              <td>#0078d4</td>
              <td>Primary accent color</td>
            </tr>
            <tr>
              <td><code>--metro-background</code></td>
              <td>#000000</td>
              <td>#ffffff</td>
              <td>Page background</td>
            </tr>
            <tr>
              <td><code>--metro-foreground</code></td>
              <td>#ffffff</td>
              <td>#1f1f1f</td>
              <td>Primary text color</td>
            </tr>
            <tr>
              <td><code>--metro-foreground-secondary</code></td>
              <td>rgba(255,255,255,0.6)</td>
              <td>rgba(0,0,0,0.7)</td>
              <td>Secondary text</td>
            </tr>
            <tr>
              <td><code>--metro-border</code></td>
              <td>rgba(255,255,255,0.2)</td>
              <td>rgba(0,0,0,0.2)</td>
              <td>Border color</td>
            </tr>
            <tr>
              <td><code>--metro-highlight</code></td>
              <td>rgba(255,255,255,0.1)</td>
              <td>rgba(0,0,0,0.1)</td>
              <td>Highlight/background</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2 class="section-title">Custom Theming</h2>
        <p style="margin-bottom: var(--metro-spacing-md); color: var(--metro-foreground-secondary);">
          Override tokens in your CSS to customize the theme:
        </p>
        <div class="code-block">
          <code>:root {
  --metro-accent: #ff6b00;
  --metro-font-family: "Inter", system-ui, sans-serif;
}

.brand-theme {
  --metro-accent: #7c3aed;
  --metro-accent-light: #a78bfa;
  --metro-accent-dark: #5b21b6;
}</code>
        </div>
      </div>
    `;
  }
}

customElements.define("page-design-colors", PageDesignColors);
