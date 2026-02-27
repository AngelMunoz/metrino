import { LitElement, html, css } from "lit";
import "../../src/styles/tokens.css";
import "../../src/styles/typography.css";
import "../../src/styles/animations.css";
import "../styles.css";

import "../../src/components/navigation/pivot.ts";
import "../../src/components/navigation/pivot-item.ts";
import "../../src/components/navigation/app-bar.ts";
import "../../src/components/navigation/app-bar-button.ts";
import "../../src/components/buttons/button.ts";
import "../../src/components/primitives/icon.ts";

import "./router.ts";

export class DocsApp extends LitElement {
  static properties = {
    theme: { state: true },
    accent: { state: true },
  };

  declare theme: string;
  declare accent: string;

  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }
    .metro-shell {
      min-height: 100vh;
      padding-bottom: 72px;
    }
    .metro-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--metro-spacing-md) var(--metro-spacing-xl);
      position: relative;
    }
    .metro-logo {
      display: flex;
      align-items: center;
      gap: var(--metro-spacing-md);
      text-decoration: none;
      color: var(--metro-foreground);
      cursor: pointer;
    }
    .metro-logo-tile {
      width: 48px;
      height: 48px;
      background: var(--metro-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 200;
      color: white;
    }
    .metro-logo-text {
      font-size: 42px;
      font-weight: 200;
      letter-spacing: -0.02em;
    }
    .metro-controls {
      display: flex;
      align-items: center;
      gap: var(--metro-spacing-md);
    }
    .metro-accent-bar {
      display: flex;
      gap: 2px;
    }
    .accent-dot {
      width: 20px;
      height: 20px;
      border: none;
      cursor: pointer;
      padding: 0;
    }
    .accent-dot:hover,
    .accent-dot.active {
      outline: 2px solid var(--metro-foreground);
      outline-offset: 1px;
    }
    .theme-buttons {
      display: flex;
      border: 1px solid var(--metro-border);
    }
    .theme-btn {
      padding: 6px 16px;
      background: transparent;
      border: none;
      color: var(--metro-foreground-secondary);
      cursor: pointer;
      font-size: var(--metro-font-size-small);
      font-family: inherit;
    }
    .theme-btn:hover {
      background: var(--metro-highlight);
      color: var(--metro-foreground);
    }
    .theme-btn.active {
      background: var(--metro-accent);
      color: white;
    }
    .metro-content {
      padding: 0 var(--metro-spacing-xl);
      max-width: 100%;
      overflow-x: hidden;
    }
    metro-app-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
    }
    @media (max-width: 768px) {
      .metro-header {
        padding: var(--metro-spacing-sm) var(--metro-spacing-md);
      }
      .metro-logo-text {
        font-size: 28px;
      }
      .metro-accent-bar {
        display: none;
      }
      .metro-content {
        padding: 0 var(--metro-spacing-md);
      }
    }
  `;

  #accents = [
    { name: "blue", color: "#0078d4" },
    { name: "red", color: "#e51400" },
    { name: "orange", color: "#fa6800" },
    { name: "green", color: "#00a300" },
    { name: "purple", color: "#a200ff" },
    { name: "teal", color: "#00aba9" },
    { name: "magenta", color: "#d80073" },
    { name: "lime", color: "#a4c400" },
  ];

  constructor() {
    super();
    this.theme = "dark";
    this.accent = "blue";
  }

  connectedCallback(): void {
    super.connectedCallback();
    const savedTheme = localStorage.getItem("metrino-theme") || "dark";
    const savedAccent = localStorage.getItem("metrino-accent") || "blue";
    this.theme = savedTheme;
    this.accent = savedAccent;
    this.#applyTheme();
    window.addEventListener("hashchange", () => this.requestUpdate());
  }

  #applyTheme(): void {
    document.body.dataset.theme = this.theme;
    if (this.accent !== "blue") {
      document.body.setAttribute("accent", this.accent);
    } else {
      document.body.removeAttribute("accent");
    }
  }

  #setTheme(theme: string): void {
    this.theme = theme;
    localStorage.setItem("metrino-theme", theme);
    this.#applyTheme();
  }

  #setAccent(accent: string): void {
    this.accent = accent;
    localStorage.setItem("metrino-accent", accent);
    this.#applyTheme();
  }

  #navigate(path: string): void {
    window.location.hash = path;
  }

  #goBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.#navigate("");
    }
  }

  render() {
    return html`
      <div class="metro-shell">
        <header class="metro-header">
          <div class="metro-logo" @click=${() => this.#navigate("")}>
            <div class="metro-logo-tile">M</div>
            <span class="metro-logo-text">Metrino</span>
          </div>
          <div class="metro-controls">
            <div class="metro-accent-bar">
              ${this.#accents.map(a => html`
                <button
                  class="accent-dot ${this.accent === a.name ? "active" : ""}"
                  style="background: ${a.color}"
                  @click=${() => this.#setAccent(a.name)}
                  title=${a.name}
                ></button>
              `)}
            </div>
            <div class="theme-buttons">
              <button
                class="theme-btn ${this.theme === "dark" ? "active" : ""}"
                @click=${() => this.#setTheme("dark")}
              >Dark</button>
              <button
                class="theme-btn ${this.theme === "light" ? "active" : ""}"
                @click=${() => this.#setTheme("light")}
              >Light</button>
            </div>
          </div>
        </header>

        <main class="metro-content">
          <docs-router></docs-router>
        </main>

        <metro-app-bar placement="bottom">
          <metro-app-bar-button
            icon="back"
            label="Back"
            @click=${() => this.#goBack()}
          ></metro-app-bar-button>
          <metro-app-bar-button
            icon="home"
            label="Home"
            @click=${() => this.#navigate("")}
          ></metro-app-bar-button>
          <metro-app-bar-button
            icon="tiles"
            label="Design"
            @click=${() => this.#navigate("design/principles")}
          ></metro-app-bar-button>
          <metro-app-bar-button
            icon="list"
            label="Components"
            @click=${() => this.#navigate("components/buttons")}
          ></metro-app-bar-button>
        </metro-app-bar>
      </div>
    `;
  }
}

customElements.define("docs-app", DocsApp);
