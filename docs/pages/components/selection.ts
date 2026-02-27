import { LitElement, html, css } from "lit";
import "../../../src/components/selection/list-box.ts";
import "../../../src/components/selection/flip-view.ts";
import "../../../src/components/selection/semantic-zoom.ts";
import "../../../src/components/selection/grid-view.ts";
import "../../../src/components/selection/list-picker.ts";
import "../../../src/components/selection/list-view.ts";
import "../../../src/components/selection/long-list-selector.ts";
import "../../../src/components/selection/tree-view.ts";
import "../../../src/components/buttons/button.ts";
import "../../../src/components/primitives/icon.ts";

export class PageComponentsSelection extends LitElement {
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
    .list-item {
      padding: 8px 12px;
      cursor: pointer;
    }
    .list-item:hover {
      background: var(--metro-highlight-hover);
    }
    metro-list-box {
      max-height: 150px;
    }
    metro-flip-view {
      height: 150px;
      border: 1px solid var(--metro-border);
    }
    metro-semantic-zoom {
      height: 150px;
      border: 1px solid var(--metro-border);
    }
    metro-grid-view {
      font-family: var(--metro-font-family);
    }
    metro-list-view {
      font-family: var(--metro-font-family);
    }
    metro-long-list-selector {
      font-family: var(--metro-font-family);
    }
    metro-tree-view {
      font-family: var(--metro-font-family);
    }
  `;

  render() {
    return html`
      <h1 class="page-title">Selection</h1>
      <p class="page-description">
        Selection components let users choose from lists, grids, and other collections. 
        Many support virtualization for large datasets.
      </p>

      <div class="section">
        <h2 class="section-title">metro-list-box</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">List Box</div>
            <div class="component-desc">Selectable list with single, multiple, or extended selection modes</div>
          </div>
          <div class="component-demo">
            <p style="margin-bottom: var(--metro-spacing-sm); font-size: var(--metro-font-size-small);">
              Selection modes: <strong>single</strong>, <strong>multiple</strong>, <strong>extended</strong>
            </p>
            <metro-list-box selection-mode="single" style="max-width: 200px;">
              <div class="list-item">Apple</div>
              <div class="list-item">Banana</div>
              <div class="list-item">Cherry</div>
              <div class="list-item">Date</div>
            </metro-list-box>
          </div>
          <div class="code-block">
            <code>&lt;metro-list-box selection-mode="single"&gt;
  &lt;div&gt;Apple&lt;/div&gt;
  &lt;div&gt;Banana&lt;/div&gt;
  &lt;div&gt;Cherry&lt;/div&gt;
&lt;/metro-list-box&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-flip-view</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Flip View</div>
            <div class="component-desc">Swipeable carousel for browsing items</div>
          </div>
          <div class="component-demo">
            <metro-flip-view>
              <div style="padding: 24px; background: var(--metro-accent); height: 100%; display: flex; align-items: center; justify-content: center;">
                <span style="color: white;">Slide 1</span>
              </div>
              <div style="padding: 24px; background: #e51400; height: 100%; display: flex; align-items: center; justify-content: center;">
                <span style="color: white;">Slide 2</span>
              </div>
              <div style="padding: 24px; background: #00a300; height: 100%; display: flex; align-items: center; justify-content: center;">
                <span style="color: white;">Slide 3</span>
              </div>
            </metro-flip-view>
          </div>
          <div class="code-block">
            <code>&lt;metro-flip-view&gt;
  &lt;div&gt;Slide 1&lt;/div&gt;
  &lt;div&gt;Slide 2&lt;/div&gt;
  &lt;div&gt;Slide 3&lt;/div&gt;
&lt;/metro-flip-view&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-semantic-zoom</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Semantic Zoom</div>
            <div class="component-desc">Zoom between detailed and grouped views (Ctrl+wheel or pinch)</div>
          </div>
          <div class="component-demo">
            <metro-semantic-zoom>
              <div slot="zoomed-in" style="padding: 16px">
                <h4>Zoomed In View</h4>
                <p style="font-size: 12px; color: var(--metro-foreground-secondary);">Detailed individual items</p>
              </div>
              <div slot="zoomed-out" style="padding: 16px">
                <h4>Zoomed Out View</h4>
                <p style="font-size: 12px; color: var(--metro-foreground-secondary);">Grouped overview</p>
              </div>
            </metro-semantic-zoom>
          </div>
          <div class="code-block">
            <code>&lt;metro-semantic-zoom&gt;
  &lt;div slot="zoomed-in"&gt;Detailed View&lt;/div&gt;
  &lt;div slot="zoomed-out"&gt;Grouped View&lt;/div&gt;
&lt;/metro-semantic-zoom&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-grid-view</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Grid View</div>
            <div class="component-desc">Virtualized grid for large collections with grouping and selection</div>
          </div>
          <div class="component-demo">
            <metro-grid-view
              .items=${[
                { name: "Photo 1" },
                { name: "Photo 2" },
                { name: "Photo 3" },
                { name: "Photo 4" },
                { name: "Photo 5" },
                { name: "Photo 6" },
              ]}
              item-width="100"
              item-height="100"
              selection-mode="single"
              style="height: 220px; border: 1px solid var(--metro-border);"
            ></metro-grid-view>
          </div>
          <div class="code-block">
            <code>&lt;metro-grid-view
  .items=${"{{ items }}"}
  item-width="100"
  item-height="100"
  selection-mode="single"
&gt;
&lt;/metro-grid-view&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-list-picker</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">List Picker</div>
            <div class="component-desc">Modal bottom sheet for single selection from a list</div>
          </div>
          <div class="component-demo">
            <metro-button @click=${() => {
              const picker = document.querySelector("#demo-picker") as HTMLElement & { show: () => void };
              picker?.show();
            }}>Open Picker</metro-button>
            <metro-list-picker
              id="demo-picker"
              title="Select an option"
              .items=${["Option A", "Option B", "Option C", "Option D"]}
            ></metro-list-picker>
          </div>
          <div class="code-block">
            <code>&lt;metro-button onclick="picker.show()"&gt;Open&lt;/metro-button&gt;
&lt;metro-list-picker
  id="picker"
  title="Select an option"
  .items=${"{{ ['A', 'B', 'C'] }}"}
&gt;&lt;/metro-list-picker&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-list-view</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">List View</div>
            <div class="component-desc">Virtualized vertical list with grouping and cross-slide selection</div>
          </div>
          <div class="component-demo">
            <metro-list-view
              .items=${[
                { label: "Contact 1", group: "A" },
                { label: "Contact 2", group: "A" },
                { label: "Contact 3", group: "B" },
                { label: "Contact 4", group: "B" },
                { label: "Contact 5", group: "C" },
              ]}
              group-key="group"
              selection-mode="single"
              style="height: 200px; border: 1px solid var(--metro-border);"
            ></metro-list-view>
          </div>
          <div class="code-block">
            <code>&lt;metro-list-view
  .items=${"{{ items }}"}
  group-key="category"
  selection-mode="multiple"
&gt;&lt;/metro-list-view&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-long-list-selector</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Long List Selector</div>
            <div class="component-desc">High-performance virtualized list with A-Z jump list for navigation</div>
          </div>
          <div class="component-demo">
            <metro-long-list-selector
              .items=${[
                { name: "Alice", category: "A" },
                { name: "Anna", category: "A" },
                { name: "Bob", category: "B" },
                { name: "Charlie", category: "C" },
                { name: "David", category: "D" },
              ]}
              group-key="category"
              display-member="name"
              show-jump-list
              style="height: 200px; border: 1px solid var(--metro-border);"
            ></metro-long-list-selector>
          </div>
          <div class="code-block">
            <code>&lt;metro-long-list-selector
  .items=${"{{ contacts }}"}
  group-key="category"
  display-member="name"
  show-jump-list
&gt;&lt;/metro-long-list-selector&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-tree-view</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Tree View</div>
            <div class="component-desc">Hierarchical tree with expand/collapse and selection</div>
          </div>
          <div class="component-demo">
            <metro-tree-view
              .items=${[
                {
                  id: "folder1",
                  label: "Documents",
                  icon: "folder",
                  expanded: true,
                  children: [
                    { id: "file1", label: "Resume.pdf", icon: "file" },
                    { id: "file2", label: "Notes.txt", icon: "file" },
                  ],
                },
                {
                  id: "folder2",
                  label: "Pictures",
                  icon: "folder",
                  children: [
                    { id: "pic1", label: "Photo.jpg", icon: "file" },
                  ],
                },
              ]}
              selection-mode="single"
              style="height: 200px; border: 1px solid var(--metro-border);"
            ></metro-tree-view>
          </div>
          <div class="code-block">
            <code>&lt;metro-tree-view
  .items=${"{{ treeItems }}"}
  selection-mode="single"
&gt;&lt;/metro-tree-view&gt;</code>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("page-components-selection", PageComponentsSelection);
