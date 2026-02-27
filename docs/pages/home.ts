import { LitElement, html, css } from "lit";
import "../../src/components/buttons/button.ts";
import "../../src/components/tiles/flip-tile.ts";
import "../../src/components/navigation/hub.ts";
import "../../src/components/navigation/hub-section.ts";
import "../../src/components/primitives/icon.ts";
import "../../src/components/layout/scroll-viewer.ts";

export class PageHome extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .hero {
      padding: var(--metro-spacing-xxl) 0 var(--metro-spacing-xl);
    }
    .hero-title {
      font-size: 56px;
      font-weight: 200;
      letter-spacing: -0.02em;
      margin-bottom: var(--metro-spacing-sm);
    }
    .hero-subtitle {
      font-size: 24px;
      font-weight: 300;
      color: var(--metro-foreground-secondary);
      margin-bottom: var(--metro-spacing-xl);
      max-width: 600px;
    }
    .section {
      margin-bottom: var(--metro-spacing-xxl);
    }
    .section-header {
      font-size: 42px;
      font-weight: 200;
      letter-spacing: -0.02em;
      margin-bottom: var(--metro-spacing-lg);
      color: var(--metro-accent);
    }
    .tiles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: var(--metro-spacing-sm);
      max-width: 900px;
    }
    .nav-tile {
      background: var(--metro-accent);
      padding: var(--metro-spacing-md);
      min-height: 90px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      transition: transform var(--metro-transition-fast) var(--metro-easing);
    }
    .nav-tile:hover {
      transform: scale(1.03);
    }
    .nav-tile:active {
      transform: scale(0.97);
    }
    .nav-tile.wide {
      grid-column: span 2;
    }
    .nav-tile h3 {
      font-size: 14px;
      font-weight: 400;
      margin-bottom: 2px;
      color: white;
    }
    .nav-tile p {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
    }
    .nav-tile metro-icon {
      margin-bottom: var(--metro-spacing-sm);
    }
    .quickstart {
      background: var(--metro-highlight);
      padding: var(--metro-spacing-xl);
      margin-bottom: var(--metro-spacing-xxl);
      max-width: 600px;
    }
    .quickstart h3 {
      font-size: 20px;
      font-weight: 300;
      margin-bottom: var(--metro-spacing-md);
    }
    .code-block {
      background: var(--metro-background);
      padding: var(--metro-spacing-md);
      margin-bottom: var(--metro-spacing-md);
      font-family: "SF Mono", "Fira Code", "Consolas", monospace;
      font-size: var(--metro-font-size-small);
      position: relative;
    }
    .code-block code {
      white-space: pre-wrap;
      word-break: break-word;
    }
    .copy-btn {
      position: absolute;
      top: var(--metro-spacing-sm);
      right: var(--metro-spacing-sm);
      padding: var(--metro-spacing-xs) var(--metro-spacing-sm);
      background: transparent;
      border: 1px solid var(--metro-border);
      color: var(--metro-foreground-secondary);
      cursor: pointer;
      font-size: var(--metro-font-size-small);
      font-family: inherit;
    }
    .copy-btn:hover {
      background: var(--metro-accent);
      border-color: var(--metro-accent);
      color: white;
    }
    .live-demo {
      display: flex;
      flex-wrap: wrap;
      gap: var(--metro-spacing-sm);
      margin-bottom: var(--metro-spacing-lg);
    }
    metro-hub {
      margin-bottom: var(--metro-spacing-xxl);
    }
    metro-hub-section {
      min-width: 300px;
      padding-right: var(--metro-spacing-xl);
    }
    @media (max-width: 600px) {
      .hero-title {
        font-size: 36px;
      }
      .hero-subtitle {
        font-size: 18px;
      }
      .tiles-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .nav-tile.wide {
        grid-column: span 2;
      }
      .section-header {
        font-size: 28px;
      }
    }
  `;

  #navigate(path: string): void {
    window.location.hash = path;
  }

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
      <div class="hero">
        <h1 class="hero-title">Metrino</h1>
        <p class="hero-subtitle">
          Metro Design System for the Web. Build beautiful, authentically digital interfaces.
        </p>
        <metro-button accent @click=${() => this.#navigate("components/buttons")}>
          Browse Components
        </metro-button>
      </div>

      <metro-hub title="Explore">
        <metro-hub-section header="Design">
          <div class="tiles-grid">
            <div class="nav-tile" @click=${() => this.#navigate("design/principles")} style="background: #0078d4">
              <metro-icon icon="info" size="large"></metro-icon>
              <h3>Principles</h3>
              <p>Content over chrome</p>
            </div>
            <div class="nav-tile" @click=${() => this.#navigate("design/colors")} style="background: #e51400">
              <metro-icon icon="tiles" size="large"></metro-icon>
              <h3>Colors</h3>
              <p>21 accent colors</p>
            </div>
            <div class="nav-tile wide" @click=${() => this.#navigate("design/typography")} style="background: #00a300">
              <metro-icon icon="document" size="large"></metro-icon>
              <h3>Typography</h3>
              <p>Type is the primary visual element</p>
            </div>
            <div class="nav-tile" @click=${() => this.#navigate("design/motion")} style="background: #a200ff">
              <metro-icon icon="play" size="large"></metro-icon>
              <h3>Motion</h3>
              <p>Fast, fluid, purposeful</p>
            </div>
          </div>
        </metro-hub-section>

        <metro-hub-section header="Components">
          <div class="tiles-grid">
            <div class="nav-tile" @click=${() => this.#navigate("components/buttons")} style="background: #fa6800">
              <metro-icon icon="add" size="large"></metro-icon>
              <h3>Buttons</h3>
            </div>
            <div class="nav-tile" @click=${() => this.#navigate("components/input")} style="background: #00aba9">
              <metro-icon icon="edit" size="large"></metro-icon>
              <h3>Input</h3>
            </div>
            <div class="nav-tile wide" @click=${() => this.#navigate("components/tiles")} style="background: #0078d4">
              <metro-icon icon="tiles" size="large"></metro-icon>
              <h3>Tiles</h3>
              <p>Live, flip, cycle, iconic</p>
            </div>
            <div class="nav-tile" @click=${() => this.#navigate("components/navigation")} style="background: #d80073">
              <metro-icon icon="forward" size="large"></metro-icon>
              <h3>Navigation</h3>
            </div>
            <div class="nav-tile" @click=${() => this.#navigate("components/selection")} style="background: #a4c400">
              <metro-icon icon="list" size="large"></metro-icon>
              <h3>Selection</h3>
            </div>
            <div class="nav-tile" @click=${() => this.#navigate("components/layout")} style="background: #6a00ff">
              <metro-icon icon="grid" size="large"></metro-icon>
              <h3>Layout</h3>
            </div>
            <div class="nav-tile" @click=${() => this.#navigate("components/progress")} style="background: #0050ef">
              <metro-icon icon="clock" size="large"></metro-icon>
              <h3>Progress</h3>
            </div>
            <div class="nav-tile" @click=${() => this.#navigate("components/primitives")} style="background: #825a2c">
              <metro-icon icon="folder" size="large"></metro-icon>
              <h3>Primitives</h3>
            </div>
            <div class="nav-tile" @click=${() => this.#navigate("components/dialogs")} style="background: #f09609">
              <metro-icon icon="message" size="large"></metro-icon>
              <h3>Dialogs</h3>
            </div>
            <div class="nav-tile" @click=${() => this.#navigate("components/datetime")} style="background: #765f89">
              <metro-icon icon="calendar" size="large"></metro-icon>
              <h3>Date & Time</h3>
            </div>
          </div>
        </metro-hub-section>

        <metro-hub-section header="Live Tiles">
          <p style="color: var(--metro-foreground-secondary); margin-bottom: var(--metro-spacing-md); max-width: 400px;">
            Click tiles to flip. Metro's iconic live tiles bring your UI to life with content at a glance.
          </p>
          <div class="live-demo">
            <metro-flip-tile size="medium">
              <div slot="front" style="display: flex; align-items: center; justify-content: center; font-size: 24px;">M</div>
              <div slot="back" style="display: flex; align-items: center; justify-content: center; font-size: 12px;">Metrino</div>
            </metro-flip-tile>
            <metro-flip-tile size="medium" style="--metro-accent: #e51400">
              <div slot="front" style="display: flex; align-items: center; justify-content: center;">
                <metro-icon icon="mail" size="large"></metro-icon>
              </div>
              <div slot="back" style="display: flex; align-items: center; justify-content: center; font-size: 12px;">Mail</div>
            </metro-flip-tile>
            <metro-flip-tile size="medium" style="--metro-accent: #00a300">
              <div slot="front" style="display: flex; align-items: center; justify-content: center;">
                <metro-icon icon="calendar" size="large"></metro-icon>
              </div>
              <div slot="back" style="display: flex; align-items: center; justify-content: center; font-size: 12px;">Calendar</div>
            </metro-flip-tile>
          </div>
        </metro-hub-section>

        <metro-hub-section header="Quick Start">
          <div class="quickstart">
            <h3>Install</h3>
            <div class="code-block">
              <code>npm install metrino lit</code>
              <button class="copy-btn" @click=${this.#copyCode}>Copy</button>
            </div>
            <h3>Use</h3>
            <div class="code-block">
              <code>import "metrino/styles.css";
import "metrino/button";

&lt;metro-button accent&gt;Click Me&lt;/metro-button&gt;</code>
              <button class="copy-btn" @click=${this.#copyCode}>Copy</button>
            </div>
          </div>
        </metro-hub-section>
      </metro-hub>
    `;
  }
}

customElements.define("page-home", PageHome);
