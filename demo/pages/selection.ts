import { LitElement, html, css } from "lit";
import {
  baseTypography,
  scrollbarVisible,
  groupHeader,
} from "@src/styles/shared.ts";
import "../components/api-docs.ts";
import "@src/components/selection/list-box.ts";
import "@src/components/selection/list-view.ts";
import "@src/components/selection/grid-view.ts";
import "@src/components/selection/flip-view.ts";
import "@src/components/selection/tree-view.ts";
import "@src/components/selection/long-list-selector.ts";
import "@src/components/selection/semantic-zoom.ts";
import "@src/components/selection/list-picker.ts";
import "@src/components/buttons/button.ts";
import "@src/components/primitives/icon.ts";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function generateNames(count: number): { name: string; category: string }[] {
  const names = [
    "Alice",
    "Bob",
    "Charlie",
    "Diana",
    "Eve",
    "Frank",
    "Grace",
    "Henry",
    "Ivy",
    "Jack",
    "Kate",
    "Liam",
    "Mia",
    "Noah",
    "Olivia",
    "Paul",
    "Quinn",
    "Rose",
    "Sam",
    "Tina",
    "Uma",
    "Victor",
    "Wendy",
    "Xavier",
    "Yara",
    "Zack",
    "Adam",
    "Bella",
    "Chris",
    "Daisy",
  ];
  const result: { name: string; category: string }[] = [];
  for (let i = 0; i < count; i++) {
    const name = names[i % names.length] + " " + Math.floor(i / names.length);
    const category = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    result.push({ name, category });
  }
  return result;
}

function generateAlphabeticalNames(
  count: number,
): { name: string; category: string }[] {
  const names = [
    "Alice",
    "Aaron",
    "Adam",
    "Abigail",
    "Alexander",
    "Bella",
    "Bob",
    "Benjamin",
    "Brooke",
    "Brian",
    "Charlie",
    "Charlotte",
    "Chris",
    "Catherine",
    "Caleb",
    "Diana",
    "David",
    "Daniel",
    "Daisy",
    "Derek",
    "Eve",
    "Ethan",
    "Emma",
    "Edward",
    "Eleanor",
    "Frank",
    "Fiona",
    "Felix",
    "Faith",
    "Frederick",
    "Grace",
    "George",
    "Gemma",
    "Gabriel",
    "Georgia",
  ];
  const result: { name: string; category: string }[] = [];
  for (let i = 0; i < count; i++) {
    const name =
      names[i % names.length] + " " + (Math.floor(i / names.length) + 1);
    const category = name.charAt(0).toUpperCase();
    result.push({ name, category });
  }
  return result.sort((a, b) => a.name.localeCompare(b.name));
}

function generateGridItems(count: number): { name: string; color: string }[] {
  const colors = [
    "#0078d4",
    "#e51400",
    "#fa6800",
    "#00a300",
    "#a200ff",
    "#d80073",
  ];
  const names = ["Photo", "Music", "Video", "Document", "App", "Game"];
  const result: { name: string; color: string }[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      name: `${names[i % names.length]} ${i + 1}`,
      color: colors[i % colors.length],
    });
  }
  return result;
}

const FLIP_VIEW_ITEMS = [
  {
    content: html`<div
      style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;"
    >
      Welcome to Metro
    </div>`,
  },
  {
    content: html`<div
      style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;"
    >
      Beautiful Design
    </div>`,
  },
  {
    content: html`<div
      style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;"
    >
      Smooth Animations
    </div>`,
  },
  {
    content: html`<div
      style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px;"
    >
      Touch Optimized
    </div>`,
  },
];

const TREE_VIEW_ITEMS = [
  {
    id: "documents",
    label: "Documents",
    icon: "folder",
    children: [
      { id: "doc1", label: "Report.docx", icon: "file-document" },
      { id: "doc2", label: "Notes.txt", icon: "file-document" },
      {
        id: "work",
        label: "Work",
        icon: "folder",
        children: [
          { id: "doc3", label: "Project.pdf", icon: "file-pdf" },
          { id: "doc4", label: "Budget.xlsx", icon: "file-excel" },
        ],
      },
    ],
  },
  {
    id: "pictures",
    label: "Pictures",
    icon: "folder",
    children: [
      { id: "pic1", label: "Vacation.jpg", icon: "image" },
      { id: "pic2", label: "Family.png", icon: "image" },
    ],
  },
  {
    id: "music",
    label: "Music",
    icon: "folder",
    children: [
      { id: "song1", label: "Song.mp3", icon: "music" },
      { id: "song2", label: "Album", icon: "folder" },
    ],
  },
];

export class MetrinoSelectionPage extends LitElement {
  static styles = [
    baseTypography,
    scrollbarVisible,
    groupHeader,
    css`
      :host {
        display: block;
        padding: var(--metro-spacing-xl, 24px);
        background: var(--metro-background, #1f1f1f);
        min-height: 100vh;
      }

      h1 {
        font-size: var(--metro-font-size-xxlarge, 42px);
        font-weight: 200;
        color: var(--metro-foreground, #ffffff);
        margin: 0 0 var(--metro-spacing-xl, 24px) 0;
      }

      h2 {
        font-size: 24px;
        font-weight: 200;
        color: var(--metro-foreground, #ffffff);
        margin: var(--metro-spacing-xl, 24px) 0 var(--metro-spacing-md, 12px) 0;
        border-bottom: 2px solid var(--metro-accent, #0078d4);
        padding-bottom: var(--metro-spacing-sm, 8px);
      }

      h3 {
        font-size: var(--metro-font-size-medium, 16px);
        font-weight: 600;
        color: var(--metro-accent, #0078d4);
        margin: var(--metro-spacing-lg, 16px) 0 var(--metro-spacing-sm, 8px) 0;
      }

      p {
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
        line-height: 1.6;
        margin: 0 0 var(--metro-spacing-md, 12px) 0;
      }

      .section {
        margin-bottom: var(--metro-spacing-xl, 24px);
      }

      .demo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--metro-spacing-lg, 16px);
      }

      .demo-card {
        background: var(--metro-surface, rgba(255, 255, 255, 0.05));
        border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
        padding: var(--metro-spacing-lg, 16px);
      }

      .controls {
        display: flex;
        gap: var(--metro-spacing-sm, 8px);
        flex-wrap: wrap;
        margin: var(--metro-spacing-md, 12px) 0;
      }

      metro-button {
        min-width: 100px;
      }

      .stats {
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
        font-family: monospace;
        font-size: var(--metro-font-size-small, 12px);
        color: var(--metro-accent, #0078d4);
        margin-top: var(--metro-spacing-sm, 8px);
      }

      .list-box-demo {
        height: 200px;
      }

      metro-list-view,
      metro-grid-view,
      metro-long-list-selector {
        border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
        background: var(--metro-background, #1f1f1f);
      }

      metro-list-view {
        height: 400px;
      }

      metro-grid-view {
        height: 400px;
      }

      metro-flip-view {
        height: 300px;
        border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }

      metro-tree-view {
        height: 300px;
        border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
        overflow: auto;
      }

      metro-long-list-selector {
        display: block;
        height: 400px;
      }

      .semantic-zoom-container {
        height: 300px;
        border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }

      .selection-info {
        margin-top: var(--metro-spacing-sm, 8px);
        padding: var(--metro-spacing-sm, 8px);
        background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
        font-size: var(--metro-font-size-small, 12px);
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
      }

      .badge {
        display: inline-block;
        background: var(--metro-accent, #0078d4);
        color: white;
        padding: 2px 8px;
        margin-left: var(--metro-spacing-sm, 8px);
        font-size: var(--metro-font-size-small, 12px);
      }
    `,
  ];

  static properties = {
    listBoxMode: { state: true },
    listViewItems: { state: true },
    gridViewItems: { state: true },
    listViewMode: { state: true },
    gridViewMode: { state: true },
    longListItems: { state: true },
    longListMode: { state: true },
    treeSelected: { state: true },
    renderedListViewCount: { state: true },
    renderedGridViewCount: { state: true },
    renderedLongListCount: { state: true },
    listBoxSelection: { state: true },
    listViewSelection: { state: true },
    gridViewSelection: { state: true },
    longListSelection: { state: true },
  };

  declare listBoxMode: "single" | "multiple" | "extended";
  declare listViewItems: { name: string; category: string }[];
  declare gridViewItems: { name: string; color: string }[];
  declare listViewMode: "none" | "single" | "multiple" | "extended";
  declare gridViewMode: "none" | "single" | "multiple" | "extended";
  declare longListItems: { name: string; category: string }[];
  declare longListMode: "none" | "single" | "multiple";
  declare treeSelected: string;
  declare renderedListViewCount: number;
  declare renderedGridViewCount: number;
  declare renderedLongListCount: number;
  declare listBoxSelection: string;
  declare listViewSelection: string;
  declare gridViewSelection: string;
  declare longListSelection: string;

  constructor() {
    super();
    this.listBoxMode = "single";
    this.listViewItems = generateNames(1000);
    this.gridViewItems = generateGridItems(500);
    this.listViewMode = "none";
    this.gridViewMode = "none";
    this.longListItems = generateAlphabeticalNames(10000);
    this.longListMode = "none";
    this.treeSelected = "";
    this.renderedListViewCount = 0;
    this.renderedGridViewCount = 0;
    this.renderedLongListCount = 0;
    this.listBoxSelection = "None";
    this.listViewSelection = "None";
    this.gridViewSelection = "None";
    this.longListSelection = "None";
  }

  #handleListBoxSelection(e: CustomEvent): void {
    const detail = e.detail;
    this.listBoxSelection = detail.selectedValues?.join(", ") || "None";
  }

  #handleListViewSelection(e: CustomEvent): void {
    const detail = e.detail;
    const lv = this.shadowRoot?.querySelector("metro-list-view");
    this.renderedListViewCount =
      lv?.shadowRoot?.querySelectorAll(".list-item").length || 0;
    this.listViewSelection = detail.selectedIndices?.length
      ? `Items: ${detail.selectedIndices.join(", ")}`
      : "None";
  }

  #handleGridViewSelection(e: CustomEvent): void {
    const detail = e.detail;
    const gv = this.shadowRoot?.querySelector("metro-grid-view");
    this.renderedGridViewCount =
      gv?.shadowRoot?.querySelectorAll(".grid-item").length || 0;
    this.gridViewSelection = detail.selectedIndices?.length
      ? `Items: ${detail.selectedIndices.join(", ")}`
      : "None";
  }

  #handleLongListSelection(e: CustomEvent): void {
    const detail = e.detail;
    const ll = this.shadowRoot?.querySelector("metro-long-list-selector");
    this.renderedLongListCount =
      ll?.shadowRoot?.querySelectorAll(".list-item").length || 0;
    this.longListSelection = detail.selectedIndices?.length
      ? `Items: ${detail.selectedIndices.slice(0, 5).join(", ")}${detail.selectedIndices.length > 5 ? "..." : ""}`
      : "None";
  }

  #handleTreeSelection(e: CustomEvent): void {
    this.treeSelected = e.detail.selectedId || "None";
  }

  #showListPicker(): void {
    const picker = this.shadowRoot?.querySelector(
      "metro-list-picker",
    ) as HTMLElement & { show: () => void };
    picker?.show();
  }

  #handleListPickerChange(e: CustomEvent): void {
    console.log("List Picker selected:", e.detail);
  }

  render() {
    return html`
      <h1>Selection Components</h1>
      <p>
        Metro-style selection components with virtualization, cross-slide
        gestures, semantic zoom, and jump list navigation. All virtualized
        components render only visible items for optimal performance.
      </p>

      <div class="section">
        <h2>metro-list-box</h2>
        <p>
          Classic list box with single, multiple, and extended selection modes.
          Use Ctrl+Click for extended mode.
        </p>

        <div class="controls">
          <metro-button
            @click=${() => {
              this.listBoxMode = "single";
            }}
          >
            Single
          </metro-button>
          <metro-button
            @click=${() => {
              this.listBoxMode = "multiple";
            }}
          >
            Multiple
          </metro-button>
          <metro-button
            @click=${() => {
              this.listBoxMode = "extended";
            }}
          >
            Extended
          </metro-button>
        </div>

        <div class="demo-grid">
          <div class="demo-card">
            <h3>
              Selection Mode: ${this.listBoxMode}<span class="badge"
                >${this.listBoxMode}</span
              >
            </h3>
            <metro-list-box
              class="list-box-demo"
              selection-mode=${this.listBoxMode}
              @selectionchanged=${this.#handleListBoxSelection}
            >
              <div class="list-item" data-value="item1">
                Item 1 - First Option
              </div>
              <div class="list-item" data-value="item2">
                Item 2 - Second Option
              </div>
              <div class="list-item" data-value="item3">
                Item 3 - Third Option
              </div>
              <div class="list-item" data-value="item4">
                Item 4 - Fourth Option
              </div>
              <div class="list-item" data-value="item5">
                Item 5 - Fifth Option
              </div>
              <div class="list-item" data-value="item6">
                Item 6 - Sixth Option
              </div>
            </metro-list-box>
            <div class="selection-info">Selected: ${this.listBoxSelection}</div>
          </div>

          <div class="demo-card">
            <h3>Features</h3>
            <ul
              style="color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7)); margin: 0; padding-left: 20px; line-height: 1.8;"
            >
              <li>Single selection (click to select)</li>
              <li>Multiple selection (toggle on click)</li>
              <li>Extended selection (Ctrl+Click, Shift+Click)</li>
              <li>Keyboard navigation (Arrow keys, Enter)</li>
              <li>Form-associated for integration</li>
            </ul>
          </div>
        </div>
        <api-docs component="MetroListBox"></api-docs>
      </div>

      <div class="section">
        <h2>metro-list-view</h2>
        <p>
          Virtualized list view with 1,000+ items. Only visible items are
          rendered (check stats below). Supports grouping, cross-slide gestures,
          and keyboard navigation.
        </p>

        <div class="controls">
          <metro-button
            @click=${() => {
              this.listViewMode = "none";
            }}
          >
            No Selection
          </metro-button>
          <metro-button
            @click=${() => {
              this.listViewMode = "single";
            }}
          >
            Single
          </metro-button>
          <metro-button
            @click=${() => {
              this.listViewMode = "multiple";
            }}
          >
            Multiple
          </metro-button>
          <metro-button
            @click=${() => {
              this.listViewMode = "extended";
            }}
          >
            Extended
          </metro-button>
        </div>

        <metro-list-view
          .items=${this.listViewItems}
          item-height="44"
          selection-mode=${this.listViewMode}
          group-key="category"
          display-member="name"
          group-header-height="32"
          @selectionchange=${this.#handleListViewSelection}
        ></metro-list-view>

        <div class="stats">
          Total Items: 1,000 | Rendered Items: ~${this.renderedListViewCount} |
          Selection: ${this.listViewSelection}
        </div>
        <api-docs component="MetroListView"></api-docs>
      </div>

      <div class="section">
        <h2>metro-grid-view</h2>
        <p>
          Virtualized grid view with 500 items. Supports responsive columns,
          grouping, and selection with cross-slide gestures.
        </p>

        <div class="controls">
          <metro-button
            @click=${() => {
              this.gridViewMode = "none";
            }}
          >
            No Selection
          </metro-button>
          <metro-button
            @click=${() => {
              this.gridViewMode = "single";
            }}
          >
            Single
          </metro-button>
          <metro-button
            @click=${() => {
              this.gridViewMode = "multiple";
            }}
          >
            Multiple
          </metro-button>
          <metro-button
            @click=${() => {
              this.gridViewMode = "extended";
            }}
          >
            Extended
          </metro-button>
        </div>

        <metro-grid-view
          .items=${this.gridViewItems}
          item-width="120"
          item-height="120"
          selection-mode=${this.gridViewMode}
          display-member="name"
          @selectionchange=${this.#handleGridViewSelection}
        ></metro-grid-view>

        <div class="stats">
          Total Items: 500 | Rendered Items: ~${this.renderedGridViewCount} |
          Selection: ${this.gridViewSelection}
        </div>
        <api-docs component="MetroGridView"></api-docs>
      </div>

      <div class="section">
        <h2>metro-flip-view</h2>
        <p>
          Swipeable carousel with touch gestures and navigation controls. Drag
          or use arrow buttons to navigate.
        </p>

        <metro-flip-view
          .items=${FLIP_VIEW_ITEMS}
          show-nav
          show-indicators
        ></metro-flip-view>
        <api-docs component="MetroFlipView"></api-docs>
      </div>

      <div class="section">
        <h2>metro-tree-view</h2>
        <p>
          Hierarchical tree view with expand/collapse functionality. Click
          folders to expand, use keyboard arrows to navigate.
        </p>

        <metro-tree-view
          .items=${TREE_VIEW_ITEMS}
          selection-mode="single"
          .selected=${this.treeSelected}
          @selectionchange=${this.#handleTreeSelection}
        ></metro-tree-view>

        <div class="selection-info">
          Selected Node: ${this.treeSelected || "None"}
        </div>
        <api-docs component="MetroTreeView"></api-docs>
      </div>

      <div class="section">
        <h2>metro-long-list-selector</h2>
        <p>
          Virtualized long list with 10,000 items grouped alphabetically.
          Features jump list sidebar for quick navigation. Try scrolling and
          clicking letters on the right.
        </p>

        <div class="controls">
          <metro-button
            @click=${() => {
              this.longListMode = "none";
            }}
          >
            No Selection
          </metro-button>
          <metro-button
            @click=${() => {
              this.longListMode = "single";
            }}
          >
            Single
          </metro-button>
          <metro-button
            @click=${() => {
              this.longListMode = "multiple";
            }}
          >
            Multiple
          </metro-button>
        </div>

        <metro-long-list-selector
          .items=${this.longListItems}
          group-key="category"
          display-member="name"
          selection-mode=${this.longListMode}
          show-jump-list
          max-height="400px"
          @selectionchange=${this.#handleLongListSelection}
        ></metro-long-list-selector>

        <div class="stats">
          Total Items: 10,000 | Rendered Items: ~${this.renderedLongListCount} |
          Selection: ${this.longListSelection}
        </div>
        <api-docs component="MetroLongListSelector"></api-docs>
      </div>

      <div class="section">
        <h2>metro-semantic-zoom</h2>
        <p>
          Zoom between two views using pinch gesture or Ctrl+Scroll. Click the
          button or use touch gestures to toggle views.
        </p>

        <div class="semantic-zoom-container">
          <metro-semantic-zoom>
            <metro-list-view
              slot="zoomed-in"
              .items=${this.listViewItems.slice(0, 50)}
              item-height="44"
              selection-mode="none"
              display-member="name"
            ></metro-list-view>
            <metro-grid-view
              slot="zoomed-out"
              .items=${this.gridViewItems.slice(0, 50)}
              item-width="100"
              item-height="100"
              selection-mode="none"
              display-member="name"
            ></metro-grid-view>
          </metro-semantic-zoom>
        </div>
        <api-docs component="MetroSemanticZoom"></api-docs>
      </div>

      <div class="section">
        <h2>metro-list-picker</h2>
        <p>
          Modal picker dialog for selecting items from a list. Click the button
          to open the picker.
        </p>

        <metro-button @click=${this.#showListPicker}>
          Open List Picker
        </metro-button>

        <metro-list-picker
          title="Choose an Option"
          .items=${[
            { label: "Option 1", value: "opt1", icon: "star" },
            { label: "Option 2", value: "opt2", icon: "heart" },
            { label: "Option 3", value: "opt3", icon: "music" },
            { label: "Option 4", value: "opt4", icon: "camera" },
            { label: "Option 5", value: "opt5", icon: "gamepad-variant" },
          ]}
          @change=${this.#handleListPickerChange}
        ></metro-list-picker>
        <api-docs component="MetroListPicker"></api-docs>
      </div>

      <div class="section">
        <h2>Performance Stats</h2>
        <div class="demo-card">
          <h3>Virtualization Performance</h3>
          <p>
            All list components use windowing/virtualization to render only
            visible items:
          </p>
          <ul
            style="color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7)); margin: 0; padding-left: 20px; line-height: 1.8;"
          >
            <li>
              <strong>metro-list-view:</strong> 1,000 items → ~15 items rendered
              at any time
            </li>
            <li>
              <strong>metro-grid-view:</strong> 500 items → ~20-30 items
              rendered depending on viewport
            </li>
            <li>
              <strong>metro-long-list-selector:</strong> 10,000 items → ~15
              items rendered with jump list navigation
            </li>
          </ul>
        </div>
      </div>
    `;
  }
}

customElements.define("metrino-selection-page", MetrinoSelectionPage);
