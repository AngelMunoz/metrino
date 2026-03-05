import { LitElement, html, css } from "lit";
import { animationStyles } from "../../../src/utils/animations";
import "../../../src/styles/tokens.css";
import "../../../src/styles/typography.css";
import "../../../src/styles/animations.css";
import "../../../src/components/tiles/flip-tile.ts";
import "../../../src/components/tiles/cycle-tile.ts";
import "../../../src/components/tiles/iconic-tile.ts";
import "../../../src/components/tiles/live-tile.ts";
import "../../../src/components/layout/tile-grid.ts";
import "../../../src/components/navigation/hub.ts";
import "../../../src/components/navigation/hub-section.ts";
import "../../../src/components/selection/semantic-zoom.ts";

export class MetrinoHome extends LitElement {
  static styles = [
    animationStyles,
    css`
      :host {
        display: block;
        background: var(--metro-background, #1f1f1f);
        min-height: 100vh;
        font-family: var(--metro-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);
        color: var(--metro-foreground, #fff);
      }
      .hero {
        padding: var(--metro-spacing-xl, 24px) var(--metro-spacing-lg, 16px);
        margin-bottom: var(--metro-spacing-xl, 24px);
      }
      .hero-title {
        font-size: 56px;
        font-weight: 200;
        color: var(--metro-foreground, #fff);
        margin: 0 0 var(--metro-spacing-sm, 8px) 0;
        line-height: 1.1;
      }
      .hero-subtitle {
        font-size: 20px;
        font-weight: 300;
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
        margin: 0;
        max-width: 600px;
        line-height: 1.4;
      }
      .section {
        margin-bottom: var(--metro-spacing-xl, 24px);
      }
      .section-title {
        font-size: 24px;
        font-weight: 200;
        color: var(--metro-foreground, #fff);
        margin: 0 0 var(--metro-spacing-md, 12px) 0;
        padding: 0 var(--metro-spacing-lg, 16px);
      }
      .tile-grid-wrapper {
        padding: 0 var(--metro-spacing-lg, 16px);
      }
      metro-tile-grid {
        max-width: 100%;
      }
      metro-flip-tile,
      metro-cycle-tile,
      metro-iconic-tile,
      metro-live-tile {
        opacity: 0;
      }
      metro-flip-tile.metro-turnstile-feather,
      metro-cycle-tile.metro-turnstile-feather,
      metro-iconic-tile.metro-turnstile-feather,
      metro-live-tile.metro-turnstile-feather {
        animation: metro-turnstile-in 450ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
      }
      .flip-front,
      .flip-back {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        padding: var(--metro-spacing-md, 12px);
        box-sizing: border-box;
      }
      .flip-front {
        font-size: 24px;
        font-weight: 300;
      }
      .flip-back {
        font-family: var(--metro-font-family-monospace, monospace);
        font-size: 11px;
        text-align: left;
        background: var(--metro-background-alt, #2d2d2d);
        white-space: pre;
        overflow: hidden;
        color: var(--metro-foreground, #fff);
      }
      .cycle-content-inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        text-align: center;
        color: var(--metro-foreground, #fff);
      }
      .cycle-icon {
        font-size: 36px;
        margin-bottom: var(--metro-spacing-sm, 8px);
      }
      .cycle-label {
        font-size: 14px;
        font-weight: 300;
      }
      .hub-section-content {
        display: flex;
        flex-direction: column;
        gap: var(--metro-spacing-sm, 8px);
      }
      .hub-item {
        padding: var(--metro-spacing-md, 12px);
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        cursor: pointer;
        transition: background var(--metro-transition-fast, 167ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .hub-item:hover {
        background: var(--metro-accent, #0078d4);
      }
      .hub-item-title {
        font-size: 14px;
        font-weight: 400;
        margin: 0 0 var(--metro-spacing-xs, 4px) 0;
        color: var(--metro-foreground, #fff);
      }
      .hub-item-desc {
        font-size: 12px;
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        margin: 0;
      }
      .zoom-wrapper {
        position: relative;
        min-height: 400px;
      }
      .zoomed-in-content,
      .zoomed-out-content {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: var(--metro-spacing-md, 12px);
        padding: var(--metro-spacing-lg, 16px);
        position: relative;
        width: 100%;
      }
      .zoom-section-card {
        padding: var(--metro-spacing-md, 12px);
        background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
        cursor: pointer;
        transition: background var(--metro-transition-fast, 167ms)
          var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        text-align: center;
      }
      .zoom-section-card:hover {
        background: var(--metro-accent, #0078d4);
      }
      .zoom-section-title {
        font-size: 14px;
        font-weight: 300;
        margin: 0;
        color: var(--metro-foreground, #fff);
      }
    `,
  ];

  static properties = {
    _animateTiles: { state: true },
  };

  declare _animateTiles: boolean;

  #liveTilesInitialized = false;

  constructor() {
    super();
    this._animateTiles = false;
  }

  firstUpdated(): void {
    requestAnimationFrame(() => {
      this._animateTiles = true;
      this.#animateTilesIn();
      this.#initLiveTiles();
    });
  }

  #animateTilesIn(): void {
    const tiles = this.renderRoot.querySelectorAll(
      "metro-flip-tile, metro-cycle-tile, metro-iconic-tile, metro-live-tile",
    );
    tiles.forEach((tile, index) => {
      setTimeout(() => {
        tile.classList.add("metro-turnstile-feather");
      }, index * 80);
    });
  }

  #initLiveTiles(): void {
    if (this.#liveTilesInitialized) return;
    this.#liveTilesInitialized = true;

    const liveTile1 = this.renderRoot.querySelector("#live-tile-1") as InstanceType<
      typeof import("../../../src/components/tiles/live-tile").MetroLiveTile
    > | null;
    const liveTile2 = this.renderRoot.querySelector("#live-tile-2") as InstanceType<
      typeof import("../../../src/components/tiles/live-tile").MetroLiveTile
    > | null;

    if (liveTile1 && typeof liveTile1.setItems === "function") {
      liveTile1.setItems([
        { title: "Animations", message: "Smooth Metro-style transitions" },
        { title: "Turnstile", message: "Page entrance animations" },
        { title: "Continuum", message: "Content navigation effects" },
      ]);
    }

    if (liveTile2 && typeof liveTile2.setItems === "function") {
      liveTile2.setItems([
        { title: "Progress Ring", message: "Indeterminate spinner" },
        { title: "Progress Bar", message: "Determinate progress" },
        { title: "Loading", message: "Async state indicators" },
      ]);
    }
  }

  #handleTileClick(section: string): void {
    window.location.hash = `/${section}`;
  }

  render() {
    return html`
      <div class="metro-animate-turnstile-in">
        <section class="hero">
          <h1 class="hero-title">Metrino</h1>
          <p class="hero-subtitle">
            A Lit Web Component library implementing the Windows Phone / Windows 8 Metro design
            system. Modern, flat, content-first components.
          </p>
        </section>

        <section class="section">
          <h2 class="section-title">Live Tiles</h2>
          <div class="tile-grid-wrapper">
            <metro-tile-grid columns="4">
              <metro-flip-tile size="wide" @click=${() => this.#handleTileClick("get-started")}>
                <div slot="front" class="flip-front">
                  <span>Get Started</span>
                </div>
                <div slot="back" class="flip-back">
                  npm install metrino import 'metrino'; &lt;metro-button&gt; Click Me
                  &lt;/metro-button&gt;
                </div>
              </metro-flip-tile>

              <metro-flip-tile size="wide" @click=${() => this.#handleTileClick("buttons")}>
                <div slot="front" class="flip-front">
                  <span>Components</span>
                </div>
                <div slot="back" class="flip-back">
                  &lt;metro-button accent&gt; Accent &lt;/metro-button&gt; &lt;metro-flip-tile
                  size="large"&gt; ... &lt;/metro-flip-tile&gt;
                </div>
              </metro-flip-tile>

              <metro-cycle-tile size="medium" @click=${() => this.#handleTileClick("buttons")}>
                <div slot="cycle" class="cycle-content-inner">
                  <div class="cycle-icon">
                    <metro-icon icon="info" size="large"></metro-icon>
                  </div>
                  <div class="cycle-label">Buttons</div>
                </div>
                <div slot="cycle" class="cycle-content-inner">
                  <div class="cycle-icon">
                    <metro-icon icon="edit" size="large"></metro-icon>
                  </div>
                  <div class="cycle-label">Inputs</div>
                </div>
              </metro-cycle-tile>

              <metro-cycle-tile size="medium" @click=${() => this.#handleTileClick("tiles")}>
                <div slot="cycle" class="cycle-content-inner">
                  <div class="cycle-icon">
                    <metro-icon icon="grid" size="large"></metro-icon>
                  </div>
                  <div class="cycle-label">Tiles</div>
                </div>
                <div slot="cycle" class="cycle-content-inner">
                  <div class="cycle-icon">
                    <metro-icon icon="list" size="large"></metro-icon>
                  </div>
                  <div class="cycle-label">Layout</div>
                </div>
              </metro-cycle-tile>

              <metro-live-tile
                size="wide"
                @click=${() => this.#handleTileClick("animations")}
                id="live-tile-1"
              >
              </metro-live-tile>

              <metro-live-tile
                size="wide"
                @click=${() => this.#handleTileClick("progress")}
                id="live-tile-2"
              >
              </metro-live-tile>
            </metro-tile-grid>
          </div>
        </section>

        <section class="section">
          <metro-hub title="Explore">
            <metro-hub-section header="Buttons">
              <div class="hub-section-content">
                <div class="hub-item" @click=${() => this.#handleTileClick("buttons")}>
                  <p class="hub-item-title">metro-button</p>
                  <p class="hub-item-desc">Standard push button</p>
                </div>
                <div class="hub-item" @click=${() => this.#handleTileClick("buttons")}>
                  <p class="hub-item-title">metro-hyperlink-button</p>
                  <p class="hub-item-desc">Navigation button</p>
                </div>
                <div class="hub-item" @click=${() => this.#handleTileClick("buttons")}>
                  <p class="hub-item-title">metro-repeat-button</p>
                  <p class="hub-item-desc">Continuous fire button</p>
                </div>
                <div class="hub-item" @click=${() => this.#handleTileClick("buttons")}>
                  <p class="hub-item-title">metro-dropdown-button</p>
                  <p class="hub-item-desc">Menu dropdown button</p>
                </div>
              </div>
            </metro-hub-section>

            <metro-hub-section header="Input">
              <div class="hub-section-content">
                <div class="hub-item" @click=${() => this.#handleTileClick("input")}>
                  <p class="hub-item-title">metro-text-box</p>
                  <p class="hub-item-desc">Text input field</p>
                </div>
                <div class="hub-item" @click=${() => this.#handleTileClick("input")}>
                  <p class="hub-item-title">metro-check-box</p>
                  <p class="hub-item-desc">Boolean toggle</p>
                </div>
                <div class="hub-item" @click=${() => this.#handleTileClick("input")}>
                  <p class="hub-item-title">metro-slider</p>
                  <p class="hub-item-desc">Range selector</p>
                </div>
              </div>
            </metro-hub-section>

            <metro-hub-section header="Tiles">
              <div class="hub-section-content">
                <div class="hub-item" @click=${() => this.#handleTileClick("tiles")}>
                  <p class="hub-item-title">metro-live-tile</p>
                  <p class="hub-item-desc">Animated content tile</p>
                </div>
                <div class="hub-item" @click=${() => this.#handleTileClick("tiles")}>
                  <p class="hub-item-title">metro-flip-tile</p>
                  <p class="hub-item-desc">3D flipping tile</p>
                </div>
                <div class="hub-item" @click=${() => this.#handleTileClick("tiles")}>
                  <p class="hub-item-title">metro-cycle-tile</p>
                  <p class="hub-item-desc">Cycling content tile</p>
                </div>
              </div>
            </metro-hub-section>

            <metro-hub-section header="Layout">
              <div class="hub-section-content">
                <div class="hub-item" @click=${() => this.#handleTileClick("layout")}>
                  <p class="hub-item-title">metro-grid</p>
                  <p class="hub-item-desc">CSS Grid container</p>
                </div>
                <div class="hub-item" @click=${() => this.#handleTileClick("layout")}>
                  <p class="hub-item-title">metro-stack-panel</p>
                  <p class="hub-item-desc">Flex stack container</p>
                </div>
                <div class="hub-item" @click=${() => this.#handleTileClick("layout")}>
                  <p class="hub-item-title">metro-scroll-viewer</p>
                  <p class="hub-item-desc">Scrollable container</p>
                </div>
              </div>
            </metro-hub-section>
          </metro-hub>
        </section>

        <section class="section">
          <h2 class="section-title">Semantic Zoom</h2>
          <p
            class="hero-subtitle"
            style="padding: 0 var(--metro-spacing-lg, 16px); margin-bottom: var(--metro-spacing-md, 12px);"
          >
            Use pinch gesture or Ctrl+scroll to zoom between views
          </p>
          <metro-semantic-zoom style="height: 200px;">
            <div slot="zoomed-in">
              <div class="zoomed-in-content">
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("buttons")}>
                  <p class="zoom-section-title">Buttons</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("input")}>
                  <p class="zoom-section-title">Input</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("datetime")}>
                  <p class="zoom-section-title">Date & Time</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("progress")}>
                  <p class="zoom-section-title">Progress</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("tiles")}>
                  <p class="zoom-section-title">Tiles</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("layout")}>
                  <p class="zoom-section-title">Layout</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("navigation")}>
                  <p class="zoom-section-title">Navigation</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("selection")}>
                  <p class="zoom-section-title">Selection</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("primitives")}>
                  <p class="zoom-section-title">Primitives</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("dialogs")}>
                  <p class="zoom-section-title">Dialogs</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("animations")}>
                  <p class="zoom-section-title">Animations</p>
                </div>
              </div>
            </div>
            <div slot="zoomed-out">
              <div class="zoomed-out-content">
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("buttons")}>
                  <p class="zoom-section-title">BTN</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("input")}>
                  <p class="zoom-section-title">IN</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("datetime")}>
                  <p class="zoom-section-title">DT</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("progress")}>
                  <p class="zoom-section-title">PRG</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("tiles")}>
                  <p class="zoom-section-title">TIL</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("layout")}>
                  <p class="zoom-section-title">LAY</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("navigation")}>
                  <p class="zoom-section-title">NAV</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("selection")}>
                  <p class="zoom-section-title">SEL</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("primitives")}>
                  <p class="zoom-section-title">PRM</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("dialogs")}>
                  <p class="zoom-section-title">DLG</p>
                </div>
                <div class="zoom-section-card" @click=${() => this.#handleTileClick("animations")}>
                  <p class="zoom-section-title">ANI</p>
                </div>
              </div>
            </div>
          </metro-semantic-zoom>
        </section>
      </div>
    `;
  }
}

customElements.define("metrino-home", MetrinoHome);

declare global {
  interface HTMLElementTagNameMap {
    "metrino-home": MetrinoHome;
  }
}
