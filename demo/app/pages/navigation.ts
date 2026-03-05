import { LitElement, html, css } from "lit";
import "../../../src/components/navigation/pivot.ts";
import "../../../src/components/navigation/pivot-item.ts";
import "../../../src/components/navigation/hub.ts";
import "../../../src/components/navigation/hub-section.ts";
import "../../../src/components/navigation/panorama.ts";
import "../../../src/components/navigation/panorama-item.ts";
import "../../../src/components/navigation/split-view.ts";
import "../../../src/components/navigation/app-bar.ts";
import "../../../src/components/navigation/app-bar-button.ts";
import "../../../src/components/navigation/app-bar-separator.ts";
import "../../../src/components/navigation/app-bar-toggle-button.ts";
import "../../../src/components/primitives/icon.ts";

export class MetrinoNavigationPage extends LitElement {
  static properties = {
    splitViewOpen: { state: true },
    splitViewMode: { state: true },
    appBarExpanded: { state: true },
  };

  declare splitViewOpen: boolean;
  declare splitViewMode: "overlay" | "inline" | "compact";
  declare appBarExpanded: boolean;

  static styles = css`
    :host {
      display: block;
      padding: var(--metro-spacing-xl, 24px);
      font-family: var(--metro-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);
      color: var(--metro-foreground, #ffffff);
      background: var(--metro-background, #1f1f1f);
      min-height: 100vh;
      box-sizing: border-box;
    }
    h1 {
      font-size: var(--metro-font-size-xxlarge, 42px);
      font-weight: 200;
      margin: 0 0 var(--metro-spacing-xl, 24px) 0;
    }
    h2 {
      font-size: 24px;
      font-weight: 200;
      color: var(--metro-accent, #0078d4);
      margin: var(--metro-spacing-xl, 24px) 0 var(--metro-spacing-md, 12px) 0;
      padding-bottom: var(--metro-spacing-xs, 4px);
      border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
    }
    .demo-section {
      margin-bottom: var(--metro-spacing-xl, 24px);
    }
    .demo-content {
      padding: var(--metro-spacing-md, 12px);
      background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      min-height: 100px;
    }
    .split-view-demo {
      height: 300px;
      border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      position: relative;
    }
    .split-view-controls {
      display: flex;
      gap: var(--metro-spacing-sm, 8px);
      margin-bottom: var(--metro-spacing-md, 12px);
    }
    .control-btn {
      padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
      background: transparent;
      border: 2px solid var(--metro-foreground, #ffffff);
      color: var(--metro-foreground, #ffffff);
      cursor: pointer;
      font-size: var(--metro-font-size-small, 12px);
      transition: background-color var(--metro-transition-fast, 167ms)
        var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
    }
    .control-btn:hover {
      background: var(--metro-foreground, #ffffff);
      color: var(--metro-background, #1f1f1f);
    }
    .control-btn.active {
      background: var(--metro-accent, #0078d4);
      border-color: var(--metro-accent, #0078d4);
    }
    .pane-content {
      padding: var(--metro-spacing-md, 12px);
    }
    .pane-item {
      padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
      cursor: pointer;
      transition: background-color var(--metro-transition-fast, 167ms)
        var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
    }
    .pane-item:hover {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
    }
    .main-content {
      padding: var(--metro-spacing-lg, 16px);
    }
    metro-pivot {
      background: rgba(0, 0, 0, 0.3);
      padding: var(--metro-spacing-md, 12px);
    }
    metro-hub {
      background: rgba(0, 0, 0, 0.3);
      padding: var(--metro-spacing-md, 12px);
    }
    .hub-card {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      padding: var(--metro-spacing-md, 12px);
      min-height: 150px;
    }
    metro-panorama {
      height: 300px;
      border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
    }
    .panorama-card {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-size: var(--metro-font-size-medium, 16px);
    }
    .app-bar-demo {
      position: relative;
      height: 200px;
      border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      margin-bottom: 80px;
    }
    .app-bar-controls {
      display: flex;
      gap: var(--metro-spacing-sm, 8px);
      margin-bottom: var(--metro-spacing-md, 12px);
    }
    .demo-app-bar {
      position: absolute;
    }
  `;

  constructor() {
    super();
    this.splitViewOpen = false;
    this.splitViewMode = "overlay";
    this.appBarExpanded = false;
  }

  render() {
    return html`
      <h1>Navigation Components</h1>

      <div class="demo-section">
        <h2>metro-pivot (tab navigation with animated transitions)</h2>
        <metro-pivot>
          <metro-pivot-item header="First">
            <div class="demo-content">
              <p>Content for the first pivot section. Click the headers to switch tabs.</p>
            </div>
          </metro-pivot-item>
          <metro-pivot-item header="Second">
            <div class="demo-content">
              <p>Content for the second pivot section. Notice the smooth transition animation.</p>
            </div>
          </metro-pivot-item>
          <metro-pivot-item header="Third">
            <div class="demo-content">
              <p>Content for the third pivot section. Metro design uses large typography.</p>
            </div>
          </metro-pivot-item>
          <metro-pivot-item header="Fourth">
            <div class="demo-content">
              <p>Content for the fourth pivot section. Each section can contain any content.</p>
            </div>
          </metro-pivot-item>
        </metro-pivot>
      </div>

      <div class="demo-section">
        <h2>metro-hub (horizontal scrolling sections)</h2>
        <metro-hub title="Hub Title">
          <metro-hub-section header="Section 1">
            <div class="hub-card">
              Hub sections scroll horizontally. Each section can contain different content.
            </div>
          </metro-hub-section>
          <metro-hub-section header="Section 2">
            <div class="hub-card">Section headers are clickable and show hover effects.</div>
          </metro-hub-section>
          <metro-hub-section header="Section 3">
            <div class="hub-card">The hub is ideal for browsing content categories.</div>
          </metro-hub-section>
          <metro-hub-section header="Section 4">
            <div class="hub-card">Each section can have variable width content.</div>
          </metro-hub-section>
        </metro-hub>
      </div>

      <div class="demo-section">
        <h2>metro-panorama (parallax background effect)</h2>
        <metro-panorama
          title="Panorama"
          background-image="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%230078d4'/%3E%3Cstop offset='100%25' style='stop-color:%23429ce3'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill='url(%23g)' width='1920' height='1080'/%3E%3C/svg%3E"
        >
          <metro-panorama-item header="Item One">
            <div class="panorama-card">
              <p>Panorama items snap when scrolling. The background has a parallax effect.</p>
            </div>
          </metro-panorama-item>
          <metro-panorama-item header="Item Two">
            <div class="panorama-card">
              <p>Touch physics provide inertia and momentum scrolling.</p>
            </div>
          </metro-panorama-item>
          <metro-panorama-item header="Item Three">
            <div class="panorama-card">
              <p>Each item takes up 85% of the viewport width for peek preview.</p>
            </div>
          </metro-panorama-item>
        </metro-panorama>
      </div>

      <div class="demo-section">
        <h2>metro-split-view (overlay, inline, compact modes)</h2>
        <div class="split-view-controls">
          <button
            class="control-btn ${this.splitViewMode === "overlay" ? "active" : ""}"
            @click=${() => this.#setSplitViewMode("overlay")}
          >
            Overlay
          </button>
          <button
            class="control-btn ${this.splitViewMode === "inline" ? "active" : ""}"
            @click=${() => this.#setSplitViewMode("inline")}
          >
            Inline
          </button>
          <button
            class="control-btn ${this.splitViewMode === "compact" ? "active" : ""}"
            @click=${() => this.#setSplitViewMode("compact")}
          >
            Compact
          </button>
          <button class="control-btn" @click=${this.#toggleSplitView}>
            ${this.splitViewOpen ? "Close" : "Open"} Pane
          </button>
        </div>
        <metro-split-view
          class="split-view-demo"
          ?open=${this.splitViewOpen}
          display-mode=${this.splitViewMode}
        >
          <div slot="pane" class="pane-content">
            <div class="pane-item">Navigation Item 1</div>
            <div class="pane-item">Navigation Item 2</div>
            <div class="pane-item">Navigation Item 3</div>
            <div class="pane-item">Navigation Item 4</div>
          </div>
          <div class="main-content">
            <h3>Split View Demo</h3>
            <p>Current mode: <strong>${this.splitViewMode}</strong></p>
            <p>
              ${this.splitViewMode === "overlay"
                ? "Overlay mode: Pane slides over content with backdrop."
                : this.splitViewMode === "inline"
                  ? "Inline mode: Pane pushes content to the side."
                  : "Compact mode: Shows collapsed icons, expands to full pane."}
            </p>
          </div>
        </metro-split-view>
      </div>

      <div class="demo-section">
        <h2>metro-app-bar (bottom bar, expandable)</h2>
        <div class="app-bar-controls">
          <button class="control-btn" @click=${this.#toggleAppBar}>
            ${this.appBarExpanded ? "Collapse" : "Expand"} App Bar
          </button>
        </div>
        <div class="app-bar-demo">
          <metro-app-bar class="demo-app-bar" ?expanded=${this.appBarExpanded}>
            <metro-app-bar-button icon="save" label="Save" slot="menu"></metro-app-bar-button>
            <metro-app-bar-button icon="edit" label="Edit" slot="menu"></metro-app-bar-button>
            <metro-app-bar-separator slot="menu" visible></metro-app-bar-separator>
            <metro-app-bar-button icon="delete" label="Delete" slot="menu"></metro-app-bar-button>
            <metro-app-bar-button icon="refresh" label="Refresh"></metro-app-bar-button>
            <metro-app-bar-separator visible></metro-app-bar-separator>
            <metro-app-bar-toggle-button
              icon="pin"
              label="Pin"
              @change=${(e: CustomEvent) => console.log("Pin toggled:", e.detail.checked)}
            ></metro-app-bar-toggle-button>
            <metro-app-bar-button icon="settings" label="Settings"></metro-app-bar-button>
          </metro-app-bar>
        </div>
      </div>

      <div class="demo-section">
        <h2>metro-app-bar-button (circular icon button)</h2>
        <div style="display: flex; gap: var(--metro-spacing-md, 12px); align-items: center;">
          <metro-app-bar-button icon="home" label="Home" data-expanded></metro-app-bar-button>
          <metro-app-bar-button icon="search" label="Search" data-expanded></metro-app-bar-button>
          <metro-app-bar-button icon="user" label="Profile" data-expanded></metro-app-bar-button>
        </div>
      </div>

      <div class="demo-section">
        <h2>metro-app-bar-separator</h2>
        <div style="display: flex; gap: var(--metro-spacing-sm, 8px); align-items: center;">
          <metro-app-bar-button icon="add"></metro-app-bar-button>
          <metro-app-bar-separator visible></metro-app-bar-separator>
          <metro-app-bar-button icon="remove"></metro-app-bar-button>
          <metro-app-bar-separator visible></metro-app-bar-separator>
          <metro-app-bar-button icon="refresh"></metro-app-bar-button>
        </div>
      </div>

      <div class="demo-section">
        <h2>metro-app-bar-toggle-button</h2>
        <div style="display: flex; gap: var(--metro-spacing-md, 12px); align-items: center;">
          <metro-app-bar-toggle-button
            icon="star"
            label="Favorite"
            data-expanded
            @change=${(e: CustomEvent) => console.log("Favorite:", e.detail.checked)}
          ></metro-app-bar-toggle-button>
          <metro-app-bar-toggle-button
            icon="bookmark"
            label="Bookmark"
            data-expanded
            checked
            @change=${(e: CustomEvent) => console.log("Bookmark:", e.detail.checked)}
          ></metro-app-bar-toggle-button>
          <metro-app-bar-toggle-button
            icon="bell"
            label="Notifications"
            data-expanded
            @change=${(e: CustomEvent) => console.log("Notifications:", e.detail.checked)}
          ></metro-app-bar-toggle-button>
        </div>
      </div>
    `;
  }

  #setSplitViewMode(mode: "overlay" | "inline" | "compact"): void {
    this.splitViewMode = mode;
    if (mode !== "overlay") {
      this.splitViewOpen = true;
    }
  }

  #toggleSplitView(): void {
    this.splitViewOpen = !this.splitViewOpen;
  }

  #toggleAppBar(): void {
    this.appBarExpanded = !this.appBarExpanded;
  }
}

customElements.define("metrino-navigation-page", MetrinoNavigationPage);
