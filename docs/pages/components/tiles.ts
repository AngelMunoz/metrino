import { LitElement, html, css } from "lit";
import "../../../src/components/tiles/flip-tile.ts";
import "../../../src/components/tiles/iconic-tile.ts";
import "../../../src/components/tiles/cycle-tile.ts";
import "../../../src/components/tiles/live-tile.ts";
import "../../../src/components/primitives/icon.ts";

export class PageComponentsTiles extends LitElement {
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
      gap: var(--metro-spacing-sm);
      align-items: flex-start;
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
    .size-reference {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--metro-spacing-md);
      margin-bottom: var(--metro-spacing-lg);
    }
    .size-box {
      padding: var(--metro-spacing-md);
      background: var(--metro-highlight);
      text-align: center;
    }
    .size-label {
      font-size: var(--metro-font-size-small);
      font-weight: 500;
      margin-bottom: var(--metro-spacing-xs);
    }
    .size-value {
      font-size: var(--metro-font-size-small);
      color: var(--metro-foreground-secondary);
    }
    @media (max-width: 600px) {
      .size-reference {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `;

  #copyCode(e: Event): void {
    const btn = e.target as HTMLButtonElement;
    const code = btn.previousElementSibling as HTMLElement;
    navigator.clipboard.writeText(code.textContent || "").then(() => {
      btn.textContent = "Copied!";
      setTimeout(() => btn.textContent = "Copy", 2000);
    });
  }

  render() {
    return html`
      <h1 class="page-title">Tiles</h1>
      <p class="page-description">
        Tiles are the signature element of Metro design. They're not just icons—they're 
        windows into app content that can flip, cycle, and display live information.
      </p>

      <div class="section">
        <h2 class="section-title">Tile Sizes</h2>
        <div class="size-reference">
          <div class="size-box">
            <div class="size-label">Small</div>
            <div class="size-value">70×70px</div>
          </div>
          <div class="size-box">
            <div class="size-label">Medium</div>
            <div class="size-value">150×150px</div>
          </div>
          <div class="size-box">
            <div class="size-label">Wide</div>
            <div class="size-value">310×150px</div>
          </div>
          <div class="size-box">
            <div class="size-label">Large</div>
            <div class="size-value">310×310px</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-flip-tile</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Flip Tile</div>
            <div class="component-desc">Tile that flips between front and back content on click</div>
          </div>
          <div class="component-demo">
            <metro-flip-tile size="small">
              <div slot="front" style="display: flex; align-items: center; justify-content: center; font-size: 10px;">S</div>
              <div slot="back" style="display: flex; align-items: center; justify-content: center; font-size: 10px;">Back</div>
            </metro-flip-tile>
            <metro-flip-tile size="medium">
              <div slot="front" style="display: flex; align-items: center; justify-content: center;">Medium</div>
              <div slot="back" style="display: flex; align-items: center; justify-content: center;">Back Side</div>
            </metro-flip-tile>
            <metro-flip-tile size="wide">
              <div slot="front" style="display: flex; align-items: center; justify-content: center;">Wide Tile</div>
              <div slot="back" style="display: flex; align-items: center; justify-content: center;">Flipped Content</div>
            </metro-flip-tile>
          </div>
          <div class="component-demo">
            <metro-flip-tile size="large" style="--metro-accent: #00a300">
              <div slot="front" style="display: flex; align-items: center; justify-content: center;">Large Tile</div>
              <div slot="back" style="display: flex; align-items: center; justify-content: center;">Back Content</div>
            </metro-flip-tile>
          </div>
          <div class="code-block">
            <code>&lt;metro-flip-tile size="medium"&gt;
  &lt;div slot="front"&gt;Front Content&lt;/div&gt;
  &lt;div slot="back"&gt;Back Content&lt;/div&gt;
&lt;/metro-flip-tile&gt;

&lt;metro-flip-tile size="wide" style="--metro-accent: #00a300"&gt;
  &lt;div slot="front"&gt;Custom Color&lt;/div&gt;
  &lt;div slot="back"&gt;Info&lt;/div&gt;
&lt;/metro-flip-tile&gt;</code>
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
                <td><code>size</code></td>
                <td>string</td>
                <td>"medium"</td>
                <td>small | medium | wide | large</td>
              </tr>
              <tr>
                <td><code>flipped</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Controls flip state</td>
              </tr>
            </tbody>
          </table>
          <table class="api-table">
            <thead>
              <tr>
                <th>Slot</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>front</code></td>
                <td>Content shown on front face</td>
              </tr>
              <tr>
                <td><code>back</code></td>
                <td>Content shown on back face</td>
              </tr>
            </tbody>
          </table>
          <table class="api-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Detail</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>flipped</code></td>
                <td>{" flipped": boolean}</td>
                <td>Fired when tile flips</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-iconic-tile</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Iconic Tile</div>
            <div class="component-desc">Tile with icon, title, and optional count/badge</div>
          </div>
          <div class="component-demo">
            <metro-iconic-tile size="small" icon="mail"></metro-iconic-tile>
            <metro-iconic-tile size="medium" icon="mail" title="Mail" count="12"></metro-iconic-tile>
            <metro-iconic-tile size="medium" icon="message" title="Messages" badge="!" style="--metro-accent: #e51400"></metro-iconic-tile>
            <metro-iconic-tile size="large" icon="calendar" title="Calendar" count="3" style="--metro-accent: #00a300"></metro-iconic-tile>
          </div>
          <div class="code-block">
            <code>&lt;metro-iconic-tile size="medium" icon="mail" title="Mail" count="12"&gt;
&lt;/metro-iconic-tile&gt;

&lt;metro-iconic-tile size="medium" icon="message" title="Messages" badge="!"&gt;
&lt;/metro-iconic-tile&gt;</code>
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
                <td><code>size</code></td>
                <td>string</td>
                <td>"medium"</td>
                <td>small | medium | large</td>
              </tr>
              <tr>
                <td><code>icon</code></td>
                <td>string</td>
                <td>-</td>
                <td>Icon name from the icon set</td>
              </tr>
              <tr>
                <td><code>title</code></td>
                <td>string</td>
                <td>-</td>
                <td>Title text below icon</td>
              </tr>
              <tr>
                <td><code>count</code></td>
                <td>number</td>
                <td>-</td>
                <td>Numeric count badge</td>
              </tr>
              <tr>
                <td><code>badge</code></td>
                <td>string</td>
                <td>-</td>
                <td>Text badge (e.g., "!")</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-cycle-tile</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Cycle Tile</div>
            <div class="component-desc">Tile that cycles through multiple content slides</div>
          </div>
          <div class="component-demo">
            <metro-cycle-tile size="medium">
              <div slot="front" style="padding: 8px">Front</div>
              <div slot="cycle" style="padding: 8px">Slide 1</div>
              <div slot="cycle" style="padding: 8px">Slide 2</div>
              <div slot="cycle" style="padding: 8px">Slide 3</div>
            </metro-cycle-tile>
            <metro-cycle-tile size="wide" style="--metro-accent: #a200ff">
              <div slot="front" style="padding: 8px">Wide Cycle</div>
              <div slot="cycle" style="padding: 8px">Content A</div>
              <div slot="cycle" style="padding: 8px">Content B</div>
            </metro-cycle-tile>
          </div>
          <div class="code-block">
            <code>&lt;metro-cycle-tile size="medium"&gt;
  &lt;div slot="front"&gt;Front&lt;/div&gt;
  &lt;div slot="cycle"&gt;Slide 1&lt;/div&gt;
  &lt;div slot="cycle"&gt;Slide 2&lt;/div&gt;
  &lt;div slot="cycle"&gt;Slide 3&lt;/div&gt;
&lt;/metro-cycle-tile&gt;</code>
            <button class="copy-btn" @click=${this.#copyCode}>Copy</button>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-live-tile</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Live Tile</div>
            <div class="component-desc">Tile that displays live notification-style content</div>
          </div>
          <div class="component-demo">
            <metro-live-tile size="medium" count="5">
              <metro-icon slot="icon" icon="mail" size="large"></metro-icon>
            </metro-live-tile>
            <metro-live-tile size="medium" badge="!" style="--metro-accent: #e51400">
              <metro-icon slot="icon" icon="warning" size="large"></metro-icon>
            </metro-live-tile>
            <metro-live-tile size="wide" count="42" style="--metro-accent: #00a300">
              <metro-icon slot="icon" icon="message" size="large"></metro-icon>
            </metro-live-tile>
          </div>
          <div class="code-block">
            <code>&lt;metro-live-tile size="medium" count="5"&gt;
  &lt;metro-icon slot="icon" icon="mail" size="large"&gt;&lt;/metro-icon&gt;
&lt;/metro-live-tile&gt;</code>
            <button class="copy-btn" @click=${this.#copyCode}>Copy</button>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("page-components-tiles", PageComponentsTiles);
