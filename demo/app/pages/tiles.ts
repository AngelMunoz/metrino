import { LitElement, html, css } from "lit";
import "../../../src/components/tiles/flip-tile.ts";
import "../../../src/components/tiles/cycle-tile.ts";
import "../../../src/components/tiles/iconic-tile.ts";
import "../../../src/components/tiles/live-tile.ts";
import "../../../src/components/layout/tile-grid.ts";
import "../../../src/components/input/slider.ts";
import "../../../src/components/buttons/button.ts";

export class MetrinoTilesPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--metro-spacing-xl, 24px);
      font-family: var(--metro-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);
      color: var(--metro-foreground, #ffffff);
      background: var(--metro-background, #1f1f1f);
      min-height: 100vh;
      max-width: 1400px;
      margin: 0 auto;
    }

    h1 {
      font-size: var(--metro-font-size-xxlarge, 42px);
      font-weight: 200;
      margin-bottom: var(--metro-spacing-xl, 24px);
    }

    h2 {
      font-size: 24px;
      font-weight: 200;
      margin-top: var(--metro-spacing-xl, 24px);
      margin-bottom: var(--metro-spacing-md, 12px);
      color: var(--metro-accent, #0078d4);
    }

    h3 {
      font-size: var(--metro-font-size-medium, 16px);
      font-weight: 400;
      margin-top: var(--metro-spacing-lg, 16px);
      margin-bottom: var(--metro-spacing-sm, 8px);
    }

    .section {
      margin-bottom: var(--metro-spacing-xl, 24px);
    }

    .tile-row {
      display: flex;
      gap: var(--metro-spacing-sm, 8px);
      margin-bottom: var(--metro-spacing-md, 12px);
      flex-wrap: wrap;
      align-items: flex-start;
    }

    .controls {
      display: flex;
      gap: var(--metro-spacing-sm, 8px);
      margin-bottom: var(--metro-spacing-md, 12px);
      flex-wrap: wrap;
      align-items: center;
    }

    .label {
      font-size: var(--metro-font-size-small, 12px);
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      margin-bottom: var(--metro-spacing-xs, 4px);
    }

    .code-example {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
      padding: var(--metro-spacing-md, 12px);
      margin-top: var(--metro-spacing-md, 12px);
      font-family: "Courier New", monospace;
      font-size: var(--metro-font-size-small, 12px);
      overflow-x: auto;
      border-left: 3px solid var(--metro-accent, #0078d4);
      white-space: pre;
    }

    .slider-container {
      min-width: 200px;
    }

    metro-flip-tile {
      display: inline-block;
    }

    metro-flip-tile div {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      font-size: var(--metro-font-size-large, 20px);
    }

    metro-flip-tile[size="small"] div {
      font-size: var(--metro-font-size-normal, 14px);
    }

    metro-iconic-tile {
      display: inline-block;
    }

    metro-live-tile {
      display: inline-block;
    }

    metro-tile-grid {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.02));
    }

    .flip-front {
      background: #0078d4;
    }

    .flip-back {
      background: #1f1f1f;
    }
  `;

  static properties = {
    cycleInterval: { state: true },
    flipTileFlipped: { state: true },
    liveTileCount: { state: true },
  };

  #cycleTile: Element | null = null;
  #liveTile: Element | null = null;

  declare cycleInterval: number;
  declare flipTileFlipped: boolean;
  declare liveTileCount: number;

  constructor() {
    super();
    this.cycleInterval = 3000;
    this.flipTileFlipped = false;
    this.liveTileCount = 0;
  }

  firstUpdated(): void {
    this.#cycleTile = this.shadowRoot?.querySelector("#cycle-tile-demo") || null;
    this.#liveTile = this.shadowRoot?.querySelector("#live-tile-demo") || null;
    this.#setupLiveTile();
  }

  #setupLiveTile(): void {
    if (this.#liveTile) {
      (this.#liveTile as any).setItems([
        { title: "New Message", message: "Hello from Metro!" },
        { title: "Update Available", message: "Version 2.0 ready" },
        { title: "Reminder", message: "Meeting at 3 PM" },
      ]);
    }
  }

  #toggleFlipTile(): void {
    this.flipTileFlipped = !this.flipTileFlipped;
    const flipTile = this.shadowRoot?.querySelector("#flip-tile-medium");
    if (flipTile) {
      (flipTile as any).flipped = this.flipTileFlipped;
    }
  }

  #handleCycleIntervalChange(e: CustomEvent): void {
    this.cycleInterval = e.detail.value;
    if (this.#cycleTile) {
      (this.#cycleTile as any).interval = this.cycleInterval;
    }
  }

  #updateLiveTile(): void {
    this.liveTileCount++;
    if (this.#liveTile) {
      const items = [
        { title: `Count: ${this.liveTileCount}`, message: "Live update!" },
        { title: "Weather", message: `${Math.floor(Math.random() * 30 + 50)}°F` },
        { title: "Email", message: `${Math.floor(Math.random() * 10)} new messages` },
      ];
      (this.#liveTile as any).setItems(items);
    }
  }

  #resetLiveTile(): void {
    this.liveTileCount = 0;
    this.#setupLiveTile();
  }

  render() {
    return html`
      <h1>Tile Components</h1>

      <div class="section">
        <h2>Flip Tile - All Sizes</h2>
        <p class="label">Click tiles to flip them (3D rotation with perspective: 1000px)</p>
        
        <div class="tile-row">
          <metro-flip-tile size="small">
            <div slot="front">S</div>
            <div slot="back">Back</div>
          </metro-flip-tile>
          
          <metro-flip-tile id="flip-tile-medium" size="medium">
            <div slot="front">Medium</div>
            <div slot="back">Flipped!</div>
          </metro-flip-tile>
          
          <metro-flip-tile size="wide">
            <div slot="front">Wide Tile</div>
            <div slot="back">Wide Back</div>
          </metro-flip-tile>
          
          <metro-flip-tile size="large">
            <div slot="front">Large</div>
            <div slot="back">Large Back</div>
          </metro-flip-tile>
        </div>

        <div class="controls">
          <metro-button @click=${this.#toggleFlipTile}>
            Toggle Medium Tile
          </metro-button>
        </div>

        <div class="code-example">
&lt;metro-flip-tile size="medium" ?flipped=${this.flipTileFlipped}&gt;
  &lt;div slot="front"&gt;Front Content&lt;/div&gt;
  &lt;div slot="back"&gt;Back Content&lt;/div&gt;
&lt;/metro-flip-tile&gt;

Properties:
- size: "small" | "medium" | "wide" | "large"
- flipped: boolean
Events:
- @flipped: { detail: { flipped: boolean } }</div>
      </div>

      <div class="section">
        <h2>Cycle Tile - Auto-Cycling Content</h2>
        <div class="tile-row">
          <metro-cycle-tile
            id="cycle-tile-demo"
            size="medium"
            .interval=${this.cycleInterval}
          >
            <div slot="front" style="display:flex;align-items:center;justify-content:center;height:100%;color:white;">
              Base
            </div>
            <div slot="cycle" style="display:flex;align-items:center;justify-content:center;height:100%;">
              Item 1
            </div>
            <div slot="cycle" style="display:flex;align-items:center;justify-content:center;height:100%;">
              Item 2
            </div>
            <div slot="cycle" style="display:flex;align-items:center;justify-content:center;height:100%;">
              Item 3
            </div>
          </metro-cycle-tile>
        </div>

        <div class="controls">
          <div class="slider-container">
            <div class="label">Cycle Interval: ${this.cycleInterval}ms</div>
            <metro-slider
              .value=${this.cycleInterval}
              min="500"
              max="10000"
              step="100"
              @change=${this.#handleCycleIntervalChange}
            ></metro-slider>
          </div>
        </div>

        <div class="code-example">
&lt;metro-cycle-tile size="medium" interval="${this.cycleInterval}"&gt;
  &lt;div slot="front"&gt;Base Content&lt;/div&gt;
  &lt;div slot="cycle"&gt;Item 1&lt;/div&gt;
  &lt;div slot="cycle"&gt;Item 2&lt;/div&gt;
  &lt;div slot="cycle"&gt;Item 3&lt;/div&gt;
&lt;/metro-cycle-tile&gt;

Properties:
- size: "medium" | "wide"
- interval: number (default: 3000)</div>
      </div>

      <div class="section">
        <h2>Iconic Tile - Icon, Title, Count, Badge</h2>
        <div class="tile-row">
          <metro-iconic-tile
            size="small"
            icon="mail"
            count="3"
          ></metro-iconic-tile>
          
          <metro-iconic-tile
            size="medium"
            icon="calendar"
            title="Calendar"
            count="12"
            badge="New"
          ></metro-iconic-tile>
          
          <metro-iconic-tile
            size="large"
            icon="people"
            title="Contacts"
            count="147"
            badge="3"
          ></metro-iconic-tile>
        </div>

        <div class="code-example">
&lt;metro-iconic-tile
  size="medium"
  icon="calendar"
  title="Calendar"
  count="12"
  badge="New"
&gt;&lt;/metro-iconic-tile&gt;

Properties:
- size: "small" | "medium" | "large"
- icon: string
- title: string
- count: number
- badge: string</div>
      </div>

      <div class="section">
        <h2>Live Tile - Imperative API</h2>
        <div class="tile-row">
          <metro-live-tile
            id="live-tile-demo"
            size="medium"
            .count=${this.liveTileCount}
          ></metro-live-tile>
        </div>

        <div class="controls">
          <metro-button @click=${this.#updateLiveTile}>
            Update Content
          </metro-button>
          <metro-button @click=${this.#resetLiveTile}>
            Reset
          </metro-button>
        </div>

        <div class="code-example">
const tile = document.querySelector('#live-tile');
tile.setItems([
  { title: "New Message", message: "Hello!" },
  { title: "Update", message: "Version 2.0" },
]);

Methods:
- setItems(items: LiveTileItem[]): void

Properties:
- size: "small" | "medium" | "wide" | "large"
- count: number
- badge: string
- interval: number (0 = random 6-10s)</div>
      </div>

      <div class="section">
        <h2>Tile Grid - 4-Column Layout</h2>
        <metro-tile-grid columns="4">
          <metro-flip-tile size="small">
            <div slot="front">1</div>
            <div slot="back">Back</div>
          </metro-flip-tile>
          
          <metro-flip-tile size="small">
            <div slot="front">2</div>
            <div slot="back">Back</div>
          </metro-flip-tile>
          
          <metro-flip-tile size="small">
            <div slot="front">3</div>
            <div slot="back">Back</div>
          </metro-flip-tile>
          
          <metro-flip-tile size="small">
            <div slot="front">4</div>
            <div slot="back">Back</div>
          </metro-flip-tile>
          
          <metro-iconic-tile size="medium" icon="mail" title="Mail" count="5"></metro-iconic-tile>
          
          <metro-iconic-tile size="medium" icon="message" title="Messages" count="23"></metro-iconic-tile>
          
          <metro-flip-tile size="wide">
            <div slot="front">Wide Tile</div>
            <div slot="back">Flipped</div>
          </metro-flip-tile>
          
          <metro-flip-tile size="large">
            <div slot="front">Large</div>
            <div slot="back">Back</div>
          </metro-flip-tile>
          
          <metro-flip-tile size="small">
            <div slot="front">5</div>
            <div slot="back">Back</div>
          </metro-flip-tile>
          
          <metro-flip-tile size="small">
            <div slot="front">6</div>
            <div slot="back">Back</div>
          </metro-flip-tile>
        </metro-tile-grid>

        <div class="code-example">
&lt;metro-tile-grid columns="4"&gt;
  &lt;!-- Tiles auto-layout based on size --&gt;
  &lt;metro-flip-tile size="small"&gt;...&lt;/metro-flip-tile&gt;
  &lt;metro-flip-tile size="medium"&gt;...&lt;/metro-flip-tile&gt;
  &lt;metro-flip-tile size="wide"&gt;...&lt;/metro-flip-tile&gt;
  &lt;metro-flip-tile size="large"&gt;...&lt;/metro-flip-tile&gt;
&lt;/metro-tile-grid&gt;

Properties:
- columns: number (default: 4)

Tile Sizes (70px unit + 8px gap):
- small:  70x70   (1x1 grid cells)
- medium: 150x150 (2x2 grid cells)
- wide:   310x150 (4x2 grid cells)
- large:  310x310 (4x4 grid cells)</div>
      </div>
    `;
  }
}

customElements.define("metrino-tiles-page", MetrinoTilesPage);
