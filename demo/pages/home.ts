import { LitElement, html, css } from "lit";
import { animationStyles } from "@src/utils/animations.ts";
import { navigateToComponent } from "../router/index.ts";
import "../components/api-docs.ts";
import "@src/styles/tokens.css";
import "@src/styles/typography.css";
import "@src/styles/animations.css";
import "@src/components/navigation/hub.ts";
import "@src/components/navigation/hub-section.ts";
import "@src/components/layout/stack-panel.ts";
import "@src/components/primitives/text-block.ts";

const ALL_CATEGORIES = [
  { id: "buttons", title: "Buttons" },
  { id: "input", title: "Input" },
  { id: "navigation", title: "Navigation" },
  { id: "dialogs", title: "Dialogs" },
  { id: "selection", title: "Selection" },
  { id: "tiles", title: "Tiles" },
  { id: "layout", title: "Layout" },
  { id: "datetime", title: "Date & Time" },
  { id: "progress", title: "Progress" },
  { id: "primitives", title: "Primitives" },
  { id: "animations", title: "Animations" },
];

const ALL_COMPONENTS: Record<string, Array<{ name: string; desc: string }>> = {
  buttons: [
    { name: "metro-button", desc: "Standard push button with accent" },
    { name: "metro-hyperlink-button", desc: "Link-style navigation" },
    { name: "metro-repeat-button", desc: "Hold-to-repeat action" },
    { name: "metro-dropdown-button", desc: "Menu popup trigger" },
  ],
  input: [
    { name: "metro-text-box", desc: "Single-line text input" },
    { name: "metro-password-box", desc: "Secure input with reveal" },
    { name: "metro-number-box", desc: "Numeric with spinners" },
    { name: "metro-check-box", desc: "Boolean selection" },
    { name: "metro-radio-button", desc: "Mutually exclusive choice" },
    { name: "metro-toggle-switch", desc: "On/off sliding switch" },
    { name: "metro-slider", desc: "Range value selector" },
    { name: "metro-rating", desc: "Star rating control" },
    { name: "metro-combo-box", desc: "Dropdown selection" },
    { name: "metro-auto-suggest-box", desc: "Search with suggestions" },
    { name: "metro-rich-edit-box", desc: "Rich text editor" },
  ],
  navigation: [
    { name: "metro-pivot", desc: "Tab-based navigation" },
    { name: "metro-pivot-item", desc: "Pivot tab content" },
    { name: "metro-hub", desc: "Horizontal section grouping" },
    { name: "metro-hub-section", desc: "Hub content section" },
    { name: "metro-panorama", desc: "Full-screen scrolling view" },
    { name: "metro-panorama-item", desc: "Panorama panel" },
    { name: "metro-split-view", desc: "Collapsible sidebar" },
    { name: "metro-app-bar", desc: "Bottom command bar" },
    { name: "metro-app-bar-button", desc: "Circular icon button" },
    { name: "metro-app-bar-separator", desc: "Visual divider" },
    { name: "metro-app-bar-toggle-button", desc: "Checkable command" },
  ],
  dialogs: [
    { name: "metro-content-dialog", desc: "Custom modal content" },
    { name: "metro-message-dialog", desc: "Alert or confirmation" },
    { name: "metro-flyout", desc: "Contextual popup" },
    { name: "metro-settings-flyout", desc: "Settings panel" },
    { name: "metro-toast", desc: "Notification banner" },
    { name: "metro-menu-flyout", desc: "Menu commands popup" },
  ],
  selection: [
    { name: "metro-list-box", desc: "Selectable item list" },
    { name: "metro-list-view", desc: "Rich item display" },
    { name: "metro-grid-view", desc: "Tiled item layout" },
    { name: "metro-flip-view", desc: "Carousel navigation" },
    { name: "metro-tree-view", desc: "Hierarchical list" },
    { name: "metro-long-list-selector", desc: "Virtualized long list" },
    { name: "metro-semantic-zoom", desc: "Zoomed overview" },
    { name: "metro-list-picker", desc: "Inline selection" },
  ],
  tiles: [
    { name: "metro-live-tile", desc: "Animated content updates" },
    { name: "metro-flip-tile", desc: "3D rotation effect" },
    { name: "metro-cycle-tile", desc: "Rotating content" },
    { name: "metro-iconic-tile", desc: "Icon with counter" },
    { name: "metro-tile-grid", desc: "Responsive tile layout" },
  ],
  layout: [
    { name: "metro-stack-panel", desc: "Vertical/horizontal stack" },
    { name: "metro-grid", desc: "CSS Grid container" },
    { name: "metro-wrap-panel", desc: "Flowing wrap layout" },
    { name: "metro-scroll-viewer", desc: "Scrollable container" },
    { name: "metro-viewbox", desc: "Scalable content" },
    { name: "metro-canvas", desc: "Absolute positioning" },
    { name: "metro-tile-grid", desc: "Metro tile layout" },
    { name: "metro-variable-sized-wrap-grid", desc: "Mixed-size flow" },
  ],
  datetime: [
    { name: "metro-date-picker", desc: "Calendar date selection" },
    { name: "metro-time-picker", desc: "Time selection" },
    { name: "metro-calendar", desc: "Month view display" },
    { name: "metro-calendar-date-picker", desc: "Inline calendar" },
    { name: "metro-date-picker-roller", desc: "Roller style picker" },
    { name: "metro-time-picker-roller", desc: "Roller time selector" },
  ],
  progress: [
    { name: "metro-progress-bar", desc: "Determinate progress" },
    { name: "metro-progress-ring", desc: "Indeterminate spinner" },
  ],
  primitives: [
    { name: "metro-icon", desc: "Material Design icons" },
    { name: "metro-text-block", desc: "Typography element" },
    { name: "metro-border", desc: "Styled container" },
    { name: "metro-image", desc: "Image display" },
    { name: "metro-person-picture", desc: "Contact avatar" },
    { name: "metro-expander", desc: "Collapsible section" },
    { name: "metro-info-bar", desc: "Informational banner" },
    { name: "metro-tooltip", desc: "Hover information" },
    { name: "metro-toast", desc: "Notification" },
    { name: "metro-context-menu", desc: "Right-click menu" },
    { name: "metro-menu-flyout", desc: "Popup menu" },
    { name: "metro-rich-text-block", desc: "Formatted text" },
    { name: "metro-media-element", desc: "Audio/video player" },
  ],
  animations: [
    { name: "metro-turnstile", desc: "Page entrance animation" },
    { name: "metro-continuum", desc: "Navigation transition" },
  ],
};

export class MetrinoHome extends LitElement {
  static styles = [
    animationStyles,
    css`
      :host {
        display: block;
        background: var(--metro-background, #1f1f1f);
        min-height: 100vh;
        font-family: var(
          --metro-font-family,
          system-ui,
          -apple-system,
          "Segoe UI",
          sans-serif
        );
        color: var(--metro-foreground, #fff);
        padding-bottom: 100px;
      }

      .header {
        padding: var(--metro-spacing-xl, 48px) var(--metro-spacing-xl, 48px)
          var(--metro-spacing-lg, 24px);
      }

      .title {
        font-size: 72px;
        font-weight: 200;
        color: var(--metro-foreground, #fff);
        margin: 0;
        line-height: 1;
        letter-spacing: -2px;
      }

      .subtitle {
        font-size: 24px;
        font-weight: 300;
        color: var(--metro-accent, #0078d4);
        margin: var(--metro-spacing-sm, 8px) 0 0 0;
      }

      .get-started {
        display: inline-flex;
        align-items: center;
        gap: var(--metro-spacing-sm, 8px);
        margin-top: var(--metro-spacing-lg, 24px);
        padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 24px);
        background: var(--metro-accent, #0078d4);
        color: var(--metro-foreground, #fff);
        font-size: 16px;
        font-weight: 400;
        text-transform: uppercase;
        letter-spacing: 1px;
        cursor: pointer;
        border: none;
        transition: all var(--metro-transition-fast, 167ms) var(--metro-easing);
      }

      .get-started:hover {
        background: var(--metro-foreground, #fff);
        color: var(--metro-background, #1f1f1f);
      }

      .hub-container {
        margin-top: var(--metro-spacing-xl, 48px);
      }

      .hub-title {
        font-size: 42px;
        font-weight: 200;
        color: var(--metro-foreground, #fff);
        margin: 0 0 var(--metro-spacing-lg, 24px) var(--metro-spacing-xl, 48px);
      }

      .hub-section-content {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 280px;
      }

      .hub-item {
        padding: var(--metro-spacing-md, 16px) var(--metro-spacing-lg, 20px);
        background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
        cursor: pointer;
        transition: all var(--metro-transition-fast, 167ms) var(--metro-easing);
        border-left: 4px solid transparent;
      }

      .hub-item:hover {
        background: var(--metro-accent, #0078d4);
        border-left-color: var(--metro-foreground, #fff);
      }

      .hub-item-name {
        font-size: 16px;
        font-weight: 400;
        color: var(--metro-foreground, #fff);
        margin: 0;
        font-family: "Consolas", "Monaco", monospace;
      }

      .hub-item-desc {
        font-size: 13px;
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        margin: 4px 0 0 0;
      }

      .hub-item:hover .hub-item-desc {
        color: rgba(255, 255, 255, 0.9);
      }

      metro-hub {
        --hub-background: transparent;
      }

      metro-hub-section::part(header) {
        font-size: 24px;
        font-weight: 300;
        color: var(--metro-foreground, #fff);
        padding: var(--metro-spacing-md, 16px) var(--metro-spacing-lg, 24px);
        background: var(--metro-highlight, rgba(255, 255, 255, 0.03));
        border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.1));
        text-transform: none;
        letter-spacing: 0;
      }

      metro-hub-section::part(header):hover {
        color: var(--metro-accent, #0078d4);
      }
    `,
  ];

  #navigate(path: string, componentId?: string) {
    if (componentId) {
      navigateToComponent(path, componentId);
    } else {
      window.location.hash = `/${path}`;
    }
  }

  render() {
    return html`
      <div class="metro-animate-turnstile-in">
        <header class="header">
          <h1 class="title">Metrino</h1>
          <p class="subtitle">Metro Design Language For The Web</p>
          <button class="get-started" @click=${() => this.#navigate("buttons")}>
            <span><metro-icon icon="bookmark"></metro-icon></span>
            <span>Explore Documentation</span>
            <span>→</span>
          </button>
        </header>

        <div class="hub-container">
          <h2 class="hub-title">All Components</h2>

          <metro-hub title="Components">
            ${ALL_CATEGORIES.map(
              (cat) => html`
                <metro-hub-section header="${cat.title}">
                  <div class="hub-section-content">
                    ${ALL_COMPONENTS[cat.id]?.map(
                      (comp) => html`
                        <div
                          class="hub-item"
                          @click=${() => this.#navigate(cat.id, comp.name)}
                        >
                          <p class="hub-item-name">${comp.name}</p>
                          <p class="hub-item-desc">${comp.desc}</p>
                        </div>
                      `,
                    )}
                  </div>
                </metro-hub-section>
              `,
            )}
          </metro-hub>
        </div>
      </div>
    `;
  }
}

customElements.define("metrino-home", MetrinoHome);
