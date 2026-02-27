import { LitElement, html, css } from "lit";
import "../../../src/components/layout/stack-panel.ts";
import "../../../src/components/layout/grid.ts";
import "../../../src/components/layout/wrap-panel.ts";
import "../../../src/components/layout/scroll-viewer.ts";
import "../../../src/components/layout/canvas.ts";
import "../../../src/components/layout/tile-grid.ts";
import "../../../src/components/layout/viewbox.ts";
import "../../../src/components/layout/variable-sized-wrap-grid.ts";
import "../../../src/components/buttons/button.ts";

export class PageComponentsLayout extends LitElement {
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
    }
    .code-block {
      background: var(--metro-highlight);
      padding: var(--metro-spacing-md);
      font-family: "SF Mono", "Fira Code", monospace;
      font-size: var(--metro-font-size-small);
      margin: var(--metro-spacing-md) var(--metro-spacing-lg);
      overflow-x: auto;
    }
    .layout-demo {
      border: 1px dashed var(--metro-border);
      padding: var(--metro-spacing-sm);
    }
    metro-scroll-viewer {
      height: 100px;
      border: 1px solid var(--metro-border);
    }
  `;

  render() {
    return html`
      <h1 class="page-title">Layout</h1>
      <p class="page-description">
        Layout components arrange child elements in predictable patterns. 
        Use these panels to build responsive, consistent interfaces.
      </p>

      <div class="section">
        <h2 class="section-title">metro-stack-panel</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Stack Panel</div>
            <div class="component-desc">Arrange children in a single row or column</div>
          </div>
          <div class="component-demo">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--metro-spacing-lg);">
              <div>
                <p style="font-size: 12px; margin-bottom: 8px; color: var(--metro-foreground-secondary);">Vertical</p>
                <metro-stack-panel orientation="vertical" style="--metro-gap: 8px;" class="layout-demo">
                  <metro-button>Item 1</metro-button>
                  <metro-button>Item 2</metro-button>
                  <metro-button>Item 3</metro-button>
                </metro-stack-panel>
              </div>
              <div>
                <p style="font-size: 12px; margin-bottom: 8px; color: var(--metro-foreground-secondary);">Horizontal</p>
                <metro-stack-panel orientation="horizontal" style="--metro-gap: 8px;" class="layout-demo">
                  <metro-button>A</metro-button>
                  <metro-button>B</metro-button>
                  <metro-button>C</metro-button>
                </metro-stack-panel>
              </div>
            </div>
          </div>
          <div class="code-block">
            <code>&lt;metro-stack-panel orientation="vertical" style="--metro-gap: 8px"&gt;
  &lt;metro-button&gt;Item 1&lt;/metro-button&gt;
  &lt;metro-button&gt;Item 2&lt;/metro-button&gt;
&lt;/metro-stack-panel&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-grid</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Grid</div>
            <div class="component-desc">CSS Grid-based layout with explicit rows and columns</div>
          </div>
          <div class="component-demo">
            <metro-grid columns="1fr 1fr" rows="auto auto" style="--metro-gap: 8px;" class="layout-demo">
              <metro-button>1,1</metro-button>
              <metro-button>1,2</metro-button>
              <metro-button>2,1</metro-button>
              <metro-button>2,2</metro-button>
            </metro-grid>
          </div>
          <div class="code-block">
            <code>&lt;metro-grid columns="1fr 1fr 1fr" rows="auto auto"&gt;
  &lt;metro-button&gt;Cell 1&lt;/metro-button&gt;
  &lt;metro-button&gt;Cell 2&lt;/metro-button&gt;
  ...
&lt;/metro-grid&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-wrap-panel</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Wrap Panel</div>
            <div class="component-desc">Flow layout that wraps items to next line</div>
          </div>
          <div class="component-demo">
            <metro-wrap-panel style="gap: 8px; max-width: 400px;" class="layout-demo">
              <metro-button>One</metro-button>
              <metro-button>Two</metro-button>
              <metro-button>Three</metro-button>
              <metro-button>Four</metro-button>
              <metro-button>Five</metro-button>
            </metro-wrap-panel>
          </div>
          <div class="code-block">
            <code>&lt;metro-wrap-panel style="gap: 8px"&gt;
  &lt;metro-button&gt;One&lt;/metro-button&gt;
  &lt;metro-button&gt;Two&lt;/metro-button&gt;
  ...
&lt;/metro-wrap-panel&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-scroll-viewer</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Scroll Viewer</div>
            <div class="component-desc">Scrollable content container</div>
          </div>
          <div class="component-demo">
            <metro-scroll-viewer>
              <div style="padding: 16px">
                <p>Scrollable content area with vertical scrolling enabled.</p>
                <p>Line 2 of content.</p>
                <p>Line 3 of content.</p>
                <p>Line 4 of content.</p>
                <p>Line 5 of content.</p>
                <p>Line 6 of content.</p>
                <p>End of scrollable content.</p>
              </div>
            </metro-scroll-viewer>
          </div>
          <div class="code-block">
            <code>&lt;metro-scroll-viewer style="height: 100px"&gt;
  &lt;div&gt;Long content here...&lt;/div&gt;
&lt;/metro-scroll-viewer&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-canvas</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Canvas</div>
            <div class="component-desc">Absolute positioning container for pixel-perfect layouts</div>
          </div>
          <div class="component-demo">
            <metro-canvas class="layout-demo" style="height: 120px; position: relative;">
              <metro-button style="position: absolute; top: 10px; left: 10px;">Top Left</metro-button>
              <metro-button style="position: absolute; bottom: 10px; right: 10px;">Bottom Right</metro-button>
              <metro-button style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">Center</metro-button>
            </metro-canvas>
          </div>
          <div class="code-block">
            <code>&lt;metro-canvas style="height: 200px"&gt;
  &lt;div style="position: absolute; top: 10px; left: 10px"&gt;...&lt;/div&gt;
  &lt;div style="position: absolute; bottom: 20px; right: 20px"&gt;...&lt;/div&gt;
&lt;/metro-canvas&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-tile-grid</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Tile Grid</div>
            <div class="component-desc">Grid optimized for Metro tile sizes (small, medium, wide, large)</div>
          </div>
          <div class="component-demo">
            <p style="font-size: 12px; margin-bottom: 8px; color: var(--metro-foreground-secondary);">columns="4"</p>
            <metro-tile-grid columns="4" class="layout-demo" style="display: grid;">
              <div style="background: var(--metro-accent); grid-column: span 1; grid-row: span 1; min-height: 70px; display: flex; align-items: center; justify-content: center;">Small</div>
              <div style="background: var(--metro-accent); opacity: 0.8; grid-column: span 2; grid-row: span 2; min-height: 150px; display: flex; align-items: center; justify-content: center;">Medium</div>
              <div style="background: var(--metro-accent); opacity: 0.6; grid-column: span 4; grid-row: span 2; min-height: 150px; display: flex; align-items: center; justify-content: center;">Wide</div>
            </metro-tile-grid>
          </div>
          <div class="code-block">
            <code>&lt;metro-tile-grid columns="4"&gt;
  &lt;metro-flip-tile size="small"&gt;...&lt;/metro-flip-tile&gt;
  &lt;metro-flip-tile size="medium"&gt;...&lt;/metro-flip-tile&gt;
  &lt;metro-flip-tile size="wide"&gt;...&lt;/metro-flip-tile&gt;
  &lt;metro-flip-tile size="large"&gt;...&lt;/metro-flip-tile&gt;
&lt;/metro-tile-grid&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-viewbox</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Viewbox</div>
            <div class="component-desc">Scale content proportionally to fit container</div>
          </div>
          <div class="component-demo">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--metro-spacing-lg);">
              <div>
                <p style="font-size: 12px; margin-bottom: 8px; color: var(--metro-foreground-secondary);">stretch="uniform"</p>
                <metro-viewbox stretch="uniform" class="layout-demo" style="height: 100px;">
                  <div style="width: 200px; height: 100px; background: var(--metro-accent); display: flex; align-items: center; justify-content: center;">Content</div>
                </metro-viewbox>
              </div>
              <div>
                <p style="font-size: 12px; margin-bottom: 8px; color: var(--metro-foreground-secondary);">stretch="fill"</p>
                <metro-viewbox stretch="fill" class="layout-demo" style="height: 100px;">
                  <div style="width: 200px; height: 100px; background: var(--metro-accent); opacity: 0.7; display: flex; align-items: center; justify-content: center;">Content</div>
                </metro-viewbox>
              </div>
            </div>
          </div>
          <div class="code-block">
            <code>&lt;metro-viewbox stretch="uniform" stretch-direction="both"&gt;
  &lt;div style="width: 400px; height: 200px"&gt;...&lt;/div&gt;
&lt;/metro-viewbox&gt;

<!-- stretch: none | fill | uniform | uniformToFill -->
<!-- stretch-direction: upOnly | downOnly | both --&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-variable-sized-wrap-grid</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Variable Sized Wrap Grid</div>
            <div class="component-desc">Wrap grid with customizable cell sizes and item spanning</div>
          </div>
          <div class="component-demo">
            <p style="font-size: 12px; margin-bottom: 8px; color: var(--metro-foreground-secondary);">orientation="horizontal" item-width="60" item-height="60"</p>
            <metro-variable-sized-wrap-grid 
              orientation="horizontal" 
              item-width="60" 
              item-height="60" 
              maximum-rows-or-columns="4"
              class="layout-demo" 
              style="gap: 4px;">
              <div style="background: var(--metro-accent); display: flex; align-items: center; justify-content: center;">1x1</div>
              <div style="background: var(--metro-accent); opacity: 0.8; display: flex; align-items: center; justify-content: center;">1x1</div>
              <div data-col-span="2" data-row-span="2" style="background: var(--metro-accent); opacity: 0.6; display: flex; align-items: center; justify-content: center;">2x2</div>
              <div style="background: var(--metro-accent); opacity: 0.9; display: flex; align-items: center; justify-content: center;">1x1</div>
              <div data-col-span="2" style="background: var(--metro-accent); opacity: 0.7; display: flex; align-items: center; justify-content: center;">2x1</div>
            </metro-variable-sized-wrap-grid>
          </div>
          <div class="code-block">
            <code>&lt;metro-variable-sized-wrap-grid
  orientation="horizontal"
  item-width="60"
  item-height="60"
  maximum-rows-or-columns="4"&gt;
  &lt;div&gt;1x1&lt;/div&gt;
  &lt;div data-col-span="2" data-row-span="2"&gt;2x2&lt;/div&gt;
  &lt;div data-col-span="3"&gt;3x1&lt;/div&gt;
&lt;/metro-variable-sized-wrap-grid&gt;</code>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("page-components-layout", PageComponentsLayout);
