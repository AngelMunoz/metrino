import { LitElement, html, css } from "lit";
import { navigate } from "../router";
import {
  themeState,
  accentState,
  setTheme,
  setAccent,
  type Theme,
  type AccentColor,
} from "../state";
import "@src/components/navigation/app-bar.ts";
import "@src/components/navigation/app-bar-button.ts";
import "@src/components/navigation/app-bar-separator.ts";
import "@src/components/primitives/icon.ts";
import { iconMap } from "../../src/components/primitives/icon";

const ACCENT_COLORS: { name: AccentColor; hex: string }[] = [
  { name: "blue", hex: "#0078d4" },
  { name: "red", hex: "#e51400" },
  { name: "orange", hex: "#fa6800" },
  { name: "green", hex: "#00a300" },
  { name: "teal", hex: "#00aba9" },
  { name: "purple", hex: "#a200ff" },
  { name: "magenta", hex: "#d80073" },
  { name: "lime", hex: "#a4c400" },
  { name: "brown", hex: "#825a2c" },
  { name: "pink", hex: "#f472d6" },
  { name: "mango", hex: "#f09609" },
  { name: "cobalt", hex: "#0050ef" },
  { name: "indigo", hex: "#6a00ff" },
  { name: "violet", hex: "#aa00ff" },
  { name: "crimson", hex: "#a20025" },
  { name: "emerald", hex: "#008a00" },
  { name: "mauve", hex: "#765f89" },
  { name: "sienna", hex: "#a0522d" },
  { name: "olive", hex: "#6d8764" },
  { name: "steel", hex: "#647687" },
  { name: "taupe", hex: "#87794e" },
];

type Section = {
  id: string;
  title: string;
  icon: keyof typeof iconMap;
  description: string;
};

const SECTIONS: Section[] = [
  {
    id: "buttons",
    title: "Buttons",
    icon: "menu",
    description: "Button controls",
  },
  {
    id: "input",
    title: "Input",
    icon: "contact-info",
    description: "Form inputs",
  },
  {
    id: "datetime",
    title: "Date & Time",
    icon: "calendar",
    description: "Date/time pickers",
  },
  {
    id: "progress",
    title: "Progress",
    icon: "clock",
    description: "Progress indicators",
  },
  {
    id: "tiles",
    title: "Tiles",
    icon: "grid",
    description: "Live tiles",
  },
  {
    id: "layout",
    title: "Layout",
    icon: "list",
    description: "Layout containers",
  },
  {
    id: "navigation",
    title: "Navigation",
    icon: "info",
    description: "Navigation components",
  },
  {
    id: "selection",
    title: "Selection",
    icon: "check",
    description: "Selection controls",
  },
  {
    id: "primitives",
    title: "Primitives",
    icon: "tag",
    description: "Basic elements",
  },
  {
    id: "dialogs",
    title: "Dialogs",
    icon: "folder",
    description: "Dialogs & overlays",
  },
  {
    id: "animations",
    title: "Animations",
    icon: "move",
    description: "Motion & transitions",
  },
];

export class MetrinoAppShell extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-container {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .theme-controls {
      position: fixed;
      top: var(--metro-spacing-lg, 16px);
      right: var(--metro-spacing-lg, 16px);
      display: flex;
      gap: var(--metro-spacing-sm, 8px);
      z-index: 1000;
    }

    .theme-btn {
      padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
      border: 2px solid var(--metro-foreground, #fff);
      background: transparent;
      color: var(--metro-foreground, #fff);
      cursor: pointer;
      font-size: var(--metro-font-size-small, 12px);
      transition: background var(--metro-transition-fast, 167ms)
        var(--metro-easing);
    }

    .theme-btn:hover {
      background: var(--metro-foreground, #fff);
      color: var(--metro-background, #1f1f1f);
    }

    .theme-btn.active {
      background: var(--metro-accent, #0078d4);
      border-color: var(--metro-accent, #0078d4);
    }

    .settings-btn {
      padding: var(--metro-spacing-sm, 8px);
      border: 2px solid var(--metro-foreground, #fff);
      background: transparent;
      color: var(--metro-foreground, #fff);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .settings-btn:hover {
      background: var(--metro-foreground, #fff);
      color: var(--metro-background, #1f1f1f);
    }

    .settings-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 320px;
      height: 100vh;
      background: var(--metro-background, #1f1f1f);
      border-left: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      transform: translateX(100%);
      transition: transform var(--metro-transition-normal, 250ms)
        var(--metro-easing);
      z-index: 1001;
      padding: var(--metro-spacing-lg, 16px);
      overflow-y: auto;
    }

    .settings-panel.open {
      transform: translateX(0);
    }

    .settings-title {
      font-size: var(--metro-font-size-large, 20px);
      font-weight: 300;
      margin-bottom: var(--metro-spacing-lg, 16px);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--metro-foreground, #fff);
      cursor: pointer;
      padding: var(--metro-spacing-sm, 8px);
      font-size: 24px;
      line-height: 1;
    }

    .settings-section {
      margin-bottom: var(--metro-spacing-xl, 24px);
    }

    .settings-label {
      font-size: var(--metro-font-size-small, 12px);
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: var(--metro-spacing-sm, 8px);
    }

    .accent-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: var(--metro-spacing-xs, 4px);
    }

    .accent-swatch {
      width: 100%;
      aspect-ratio: 1;
      border: none;
      cursor: pointer;
      transition: transform var(--metro-transition-fast, 167ms)
        var(--metro-easing);
    }

    .accent-swatch:hover {
      transform: scale(1.1);
    }

    .accent-swatch.active {
      outline: 2px solid var(--metro-foreground, #fff);
      outline-offset: 2px;
    }

    .theme-toggle {
      display: flex;
      gap: var(--metro-spacing-sm, 8px);
    }

    .content-wrapper {
      flex: 1;
      padding: var(--metro-spacing-xl, 24px);
      padding-bottom: 100px;
    }

    slot {
      display: block;
    }
  `;

  static properties = {
    settingsOpen: { state: true },
    currentTheme: { state: true },
    currentAccent: { state: true },
  };

  declare settingsOpen: boolean;
  declare currentTheme: Theme;
  declare currentAccent: AccentColor;

  #unsubscribeTheme?: () => void;
  #unsubscribeAccent?: () => void;

  constructor() {
    super();
    this.settingsOpen = false;
    this.currentTheme = themeState.get();
    this.currentAccent = accentState.get();
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.#unsubscribeTheme = themeState.subscribe((t) => {
      this.currentTheme = t;
    });
    this.#unsubscribeAccent = accentState.subscribe((a) => {
      this.currentAccent = a;
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unsubscribeTheme?.();
    this.#unsubscribeAccent?.();
  }

  #toggleSettings(): void {
    this.settingsOpen = !this.settingsOpen;
  }

  #handleThemeChange(theme: Theme): void {
    setTheme(theme);
  }

  #handleAccentChange(accent: AccentColor): void {
    setAccent(accent);
  }

  #handleBack(): void {
    window.history.back();
  }

  render() {
    return html`
      <div class="app-container">
        <div class="theme-controls">
          <button
            class="theme-btn ${this.currentTheme === "dark" ? "active" : ""}"
            @click=${() => this.#handleThemeChange("dark")}
          >
            Dark
          </button>
          <button
            class="theme-btn ${this.currentTheme === "light" ? "active" : ""}"
            @click=${() => this.#handleThemeChange("light")}
          >
            Light
          </button>
          <button class="settings-btn" @click=${this.#toggleSettings}>
            <metro-icon icon="settings" size="normal"></metro-icon>
          </button>
        </div>

        <div class="settings-panel ${this.settingsOpen ? "open" : ""}">
          <div class="settings-title">
            <span>Settings</span>
            <button class="close-btn" @click=${this.#toggleSettings}>
              &times;
            </button>
          </div>

          <div class="settings-section">
            <div class="settings-label">Theme</div>
            <div class="theme-toggle">
              <button
                class="theme-btn ${this.currentTheme === "light"
                  ? "active"
                  : ""}"
                @click=${() => this.#handleThemeChange("light")}
              >
                Light
              </button>
              <button
                class="theme-btn ${this.currentTheme === "dark"
                  ? "active"
                  : ""}"
                @click=${() => this.#handleThemeChange("dark")}
              >
                Dark
              </button>
            </div>
          </div>

          <div class="settings-section">
            <div class="settings-label">Accent Color</div>
            <div class="accent-grid">
              ${ACCENT_COLORS.map(
                ({ name, hex }) => html`
                  <button
                    class="accent-swatch ${this.currentAccent === name
                      ? "active"
                      : ""}"
                    style="background: ${hex}"
                    @click=${() => this.#handleAccentChange(name)}
                    title=${name}
                  ></button>
                `,
              )}
            </div>
          </div>
        </div>

        <div class="content-wrapper">
          <slot></slot>
        </div>

        <metro-app-bar>
          <metro-app-bar-button
            icon="back"
            label="Back"
            @click=${this.#handleBack}
          ></metro-app-bar-button>
          <metro-app-bar-button
            icon="home"
            label="Home"
            @click=${() => navigate("/")}
          ></metro-app-bar-button>
          ${SECTIONS.slice(0, 4).map(
            (s) => html`
              <metro-app-bar-button
                icon=${s.icon}
                label=${s.title}
                @click=${() => navigate(`/${s.id}`)}
              ></metro-app-bar-button>
            `,
          )}
          <metro-app-bar-separator
            slot="menu"
            visible
          ></metro-app-bar-separator>
          ${SECTIONS.slice(4).map(
            (s) => html`
              <metro-app-bar-button
                slot="menu"
                icon=${s.icon}
                label=${s.title}
                @click=${() => navigate(`/${s.id}`)}
              ></metro-app-bar-button>
            `,
          )}
        </metro-app-bar>
      </div>
    `;
  }
}

customElements.define("metrino-app-shell", MetrinoAppShell);
