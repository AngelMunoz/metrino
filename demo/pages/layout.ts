import { LitElement, html, css } from "lit";
import "../components/api-docs.ts";
import "@src/components/layout/stack-panel.ts";
import "@src/components/layout/grid.ts";
import "@src/components/layout/wrap-panel.ts";
import "@src/components/layout/scroll-viewer.ts";
import "@src/components/layout/viewbox.ts";
import "@src/components/layout/canvas.ts";
import "@src/components/layout/tile-grid.ts";
import "@src/components/layout/variable-sized-wrap-grid.ts";

export class MetrinoLayoutPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--metro-spacing-xl, 24px);
      font-family: var(
        --metro-font-family,
        system-ui,
        -apple-system,
        "Segoe UI",
        sans-serif
      );
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
    .demo-box {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      padding: var(--metro-spacing-md, 12px);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60px;
      min-width: 60px;
      font-size: var(--metro-font-size-small, 12px);
      color: var(--metro-foreground, #ffffff);
      border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      box-sizing: border-box;
    }
    .demo-box.accent {
      background: var(--metro-accent, #0078d4);
    }
    metro-stack-panel {
      --metro-gap: var(--metro-spacing-sm, 8px);
    }
    metro-grid {
      --metro-gap: var(--metro-spacing-sm, 8px);
    }
    .scroll-content {
      min-width: 1000px;
      display: flex;
      gap: var(--metro-spacing-md, 12px);
      padding: var(--metro-spacing-sm, 8px);
    }
    .canvas-container {
      height: 200px;
      border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
    }
    .canvas-item {
      background: var(--metro-accent, #0078d4);
      padding: var(--metro-spacing-sm, 8px);
      color: white;
      font-size: var(--metro-font-size-small, 12px);
    }
    .viewbox-demo {
      width: 100%;
      height: 200px;
      border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
    }
    .viewbox-content {
      width: 400px;
      height: 200px;
      background: linear-gradient(
        135deg,
        var(--metro-accent, #0078d4),
        #429ce3
      );
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--metro-font-size-large, 20px);
    }
    metro-tile-grid {
      background: rgba(0, 0, 0, 0.3);
    }
    .tile-demo {
      background: var(--metro-accent, #0078d4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--metro-font-size-small, 12px);
      width: 100%;
      height: 100%;
      box-sizing: border-box;
    }
    .grid-item {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.15));
      padding: var(--metro-spacing-sm, 8px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--metro-font-size-small, 12px);
      box-sizing: border-box;
    }
    .grid-item.span-2 {
      background: var(--metro-accent, #0078d4);
    }
    .scroll-viewer-demo {
      height: 150px;
      border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
    }
  `;

  render() {
    return html`
      <h1>Layout Components</h1>

      <div class="demo-section">
        <h2>metro-stack-panel (vertical)</h2>
        <metro-stack-panel orientation="vertical">
          <div class="demo-box">Item 1</div>
          <div class="demo-box">Item 2</div>
          <div class="demo-box">Item 3</div>
        </metro-stack-panel>
        <api-docs component="MetroStackPanel"></api-docs>
      </div>

      <div class="demo-section">
        <h2>metro-stack-panel (horizontal)</h2>
        <metro-stack-panel orientation="horizontal">
          <div class="demo-box">Item 1</div>
          <div class="demo-box">Item 2</div>
          <div class="demo-box">Item 3</div>
        </metro-stack-panel>
        <api-docs component="MetroStackPanel"></api-docs>
      </div>

      <div class="demo-section">
        <h2>metro-grid (custom rows/columns)</h2>
        <metro-grid rows="auto auto" columns="1fr 2fr 1fr">
          <div class="demo-box">1,1</div>
          <div class="demo-box accent">1,2 (2fr)</div>
          <div class="demo-box">1,3</div>
          <div class="demo-box">2,1</div>
          <div class="demo-box accent">2,2 (2fr)</div>
          <div class="demo-box">2,3</div>
        </metro-grid>
        <api-docs component="MetroGrid"></api-docs>
      </div>

      <div class="demo-section">
        <h2>metro-wrap-panel</h2>
        <metro-wrap-panel orientation="horizontal" style="max-width: 400px;">
          ${[1, 2, 3, 4, 5, 6, 7, 8].map(
            (i) =>
              html`<div class="demo-box" style="width: 80px;">Item ${i}</div>`,
          )}
        </metro-wrap-panel>
        <api-docs component="MetroWrapPanel"></api-docs>
      </div>

      <div class="demo-section">
        <h2>metro-scroll-viewer (with touch physics)</h2>
        <p>
          Scrollable content with inertia scrolling. Use mouse wheel or touch
          gestures to feel the physics.
        </p>
        <metro-scroll-viewer
          scroll-orientation="horizontal"
          scrollbar-mode="auto"
          touch-physics
          class="scroll-viewer-demo"
        >
          <div class="scroll-content">
            ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
              (i) =>
                html`<div class="demo-box" style="min-width: 120px;">
                  Content ${i}
                </div>`,
            )}
          </div>
        </metro-scroll-viewer>
        <api-docs component="MetroScrollViewer"></api-docs>
      </div>

      <div class="demo-section">
        <h2>metro-viewbox (content scaling)</h2>
        <metro-viewbox stretch="uniform" class="viewbox-demo">
          <div class="viewbox-content">Scaled Content</div>
        </metro-viewbox>
        <api-docs component="MetroViewbox"></api-docs>
      </div>

      <div class="demo-section">
        <h2>metro-canvas (absolute positioning)</h2>
        <metro-canvas class="canvas-container">
          <div class="canvas-item" style="top: 20px; left: 20px;">
            Positioned (20, 20)
          </div>
          <div class="canvas-item" style="top: 80px; left: 150px;">
            Positioned (150, 80)
          </div>
          <div class="canvas-item" style="top: 40px; right: 40px;">
            Right: 40px
          </div>
          <div class="canvas-item" style="bottom: 20px; left: 50%;">
            Center bottom
          </div>
        </metro-canvas>
        <api-docs component="MetroCanvas"></api-docs>
      </div>

      <div class="demo-section">
        <h2>metro-tile-grid (tile-specific grid)</h2>
        <metro-tile-grid columns="6">
          <div class="tile-demo" data-size="small">1x1</div>
          <div class="tile-demo" data-size="medium">2x2</div>
          <div class="tile-demo" data-size="small">1x1</div>
          <div class="tile-demo" data-size="small">1x1</div>
          <div class="tile-demo" data-size="medium">2x2</div>
          <div class="tile-demo" data-size="small">1x1</div>
        </metro-tile-grid>
        <api-docs component="MetroTileGrid"></api-docs>
      </div>

      <div class="demo-section">
        <h2>metro-variable-sized-wrap-grid (data-row-span, data-col-span)</h2>
        <metro-variable-sized-wrap-grid
          orientation="horizontal"
          item-width="60"
          item-height="60"
          maximum-rows-or-columns="6"
        >
          <div class="grid-item" data-row-span="1" data-col-span="1">1x1</div>
          <div class="grid-item span-2" data-row-span="2" data-col-span="2">
            2x2
          </div>
          <div class="grid-item" data-row-span="1" data-col-span="1">1x1</div>
          <div class="grid-item" data-row-span="1" data-col-span="1">1x1</div>
          <div class="grid-item span-2" data-row-span="1" data-col-span="3">
            1x3
          </div>
          <div class="grid-item" data-row-span="1" data-col-span="1">1x1</div>
          <div class="grid-item" data-row-span="1" data-col-span="1">1x1</div>
          <div class="grid-item span-2" data-row-span="2" data-col-span="1">
            2x1
          </div>
          <div class="grid-item" data-row-span="1" data-col-span="1">1x1</div>
          <div class="grid-item" data-row-span="1" data-col-span="1">1x1</div>
        </metro-variable-sized-wrap-grid>
        <api-docs component="MetroVariableSizedWrapGrid"></api-docs>
      </div>
    `;
  }
}

customElements.define("metrino-layout-page", MetrinoLayoutPage);
