import { LitElement, html, css } from "lit";
import { reducedMotionBlanket } from "@src/styles/shared.ts";
import { pageStyles, SHOWCASE_COLUMNS } from "../styles/page.ts";
import "../components/api-docs.ts";
import { registerMetroGrid } from "@src/components/layout/grid.ts";
import { registerMetroButton } from "@src/components/buttons/button.ts";
import { registerMetroHyperlinkButton } from "@src/components/buttons/hyperlink-button.ts";
import { registerMetroRepeatButton } from "@src/components/buttons/repeat-button.ts";
import { registerMetroDropdownButton } from "@src/components/buttons/dropdown-button.ts";

registerMetroButton();
registerMetroHyperlinkButton();
registerMetroRepeatButton();
registerMetroDropdownButton();
registerMetroGrid();

export class MetrinoButtonsPage extends LitElement {
  static styles = [
    reducedMotionBlanket,
    pageStyles,
    css`
    .demo-container {
      padding: var(--metro-spacing-lg, 16px);
      background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
      margin-bottom: var(--metro-spacing-md, 12px);
      display: flex;
      flex-wrap: wrap;
      gap: var(--metro-spacing-md, 12px);
      align-items: center;
    }
    .demo-label {
      font-size: 12px;
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
      margin-right: var(--metro-spacing-sm, 8px);
    }
    .counter-display {
      font-size: 24px;
      font-weight: 200;
      color: var(--metro-accent, #0078d4);
      min-width: 60px;
      text-align: center;
    }
    .menu-item {
      display: flex;
      align-items: center;
      gap: var(--metro-spacing-sm, 8px);
      padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
      cursor: pointer;
      color: var(--metro-foreground, #ffffff);
      font-size: var(--metro-font-size-normal, 14px);
      transition: background-color var(--metro-transition-fast, 167ms)
        var(--metro-easing);
    }
    .menu-item:hover {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
    }
    .menu-item:active {
      background: var(--metro-accent, #0078d4);
    }
    .menu-divider {
      height: 1px;
      background: var(--metro-border, rgba(255, 255, 255, 0.2));
      margin: var(--metro-spacing-xs, 4px) 0;
    }
    `,
  ];

  static properties = {
    repeatCount: { state: true },
    dropdownOpen: { state: true },
  };

  declare repeatCount: number;
  declare dropdownOpen: boolean;

  constructor() {
    super();
    this.repeatCount = 0;
    this.dropdownOpen = false;
  }

  #handleRepeatClick(): void {
    this.repeatCount++;
  }

  #handleRepeatReset(): void {
    this.repeatCount = 0;
  }

  render() {
    return html`
      <h1 class="page-title">Buttons</h1>
      <p class="page-description">
        Metro-style button components with hover effects, pressed states, and
        optional accent coloring. All buttons support keyboard navigation and
        screen readers.
      </p>

      <metro-grid class="demo-grid" columns=${SHOWCASE_COLUMNS}>
      <div class="demo-card">
        <h2 class="component-title">metro-button</h2>
        <p class="component-desc">
          Standard push button with border outline. Hover inverts colors.
          Supports accent variant and disabled state.
        </p>
        <div class="demo-container">
          <span class="demo-label">Default:</span>
          <metro-button>Button</metro-button>
          <span class="demo-label">Accent:</span>
          <metro-button accent>Accent</metro-button>
          <span class="demo-label">Disabled:</span>
          <metro-button disabled>Disabled</metro-button>
        </div>
        <pre
          class="code-snippet"
        ><code>&lt;metro-button&gt;Button&lt;/metro-button&gt;
&lt;metro-button accent&gt;Accent&lt;/metro-button&gt;
&lt;metro-button disabled&gt;Disabled&lt;/metro-button&gt;</code></pre>
        <api-docs component="MetroButton"></api-docs>
      </div>

      <div class="demo-card">
        <h2 class="component-title">metro-hyperlink-button</h2>
        <p class="component-desc">
          Link-styled button for navigation. Renders as a link when href is
          provided, otherwise as a button.
        </p>
        <p class="component-desc">
          Hyperlinks sit naturally inside text: to learn more, read the
          <metro-hyperlink-button href="#/buttons"
            >documentation</metro-hyperlink-button
          >
          or go back to the
          <metro-hyperlink-button href="#/home">start page</metro-hyperlink-button>.
        </p>
        <div class="demo-container">
          <span class="demo-label">With href:</span>
          <metro-hyperlink-button href="#/buttons"
            >Navigate</metro-hyperlink-button
          >
          <span class="demo-label">Button mode:</span>
          <metro-hyperlink-button>Action</metro-hyperlink-button>
          <span class="demo-label">Disabled:</span>
          <metro-hyperlink-button disabled
            >Disabled Link</metro-hyperlink-button
          >
        </div>
        <pre
          class="code-snippet"
        ><code>&lt;metro-hyperlink-button href="#/buttons"&gt;Navigate&lt;/metro-hyperlink-button&gt;
&lt;metro-hyperlink-button&gt;Action&lt;/metro-hyperlink-button&gt;
&lt;metro-hyperlink-button disabled&gt;Disabled Link&lt;/metro-hyperlink-button&gt;</code></pre>
        <api-docs component="MetroHyperlinkButton"></api-docs>
      </div>

      <div class="demo-card">
        <h2 class="component-title">metro-repeat-button</h2>
        <p class="component-desc">
          Button that fires click events repeatedly while pressed. Configurable
          delay and interval. Hold the button to see continuous clicks.
        </p>
        <div class="demo-container">
          <span class="demo-label">Hold to repeat:</span>
          <metro-repeat-button @click=${this.#handleRepeatClick}
            >Click Me</metro-repeat-button
          >
          <span class="counter-display">${this.repeatCount}</span>
          <metro-button @click=${this.#handleRepeatReset}>Reset</metro-button>
        </div>
        <pre
          class="code-snippet"
        ><code>&lt;metro-repeat-button @click=\${handleClick}&gt;Click Me&lt;/metro-repeat-button&gt;

&lt;script&gt;
let count = 0;
function handleClick() {
  count++;
  console.log('Clicked', count, 'times');
}
&lt;/script&gt;</code></pre>
        <api-docs component="MetroRepeatButton"></api-docs>
      </div>

      <div class="demo-card">
        <h2 class="component-title">metro-dropdown-button</h2>
        <p class="component-desc">
          Button with dropdown menu. Supports top/bottom placement. Menu items
          are slotted for flexibility.
        </p>
        <div class="demo-container">
          <span class="demo-label">Bottom placement:</span>
          <metro-dropdown-button label="Options" placement="bottom">
            <div class="menu-item" role="menuitem">Edit</div>
            <div class="menu-item" role="menuitem">Copy</div>
            <div class="menu-item" role="menuitem">Paste</div>
            <div class="menu-divider"></div>
            <div class="menu-item" role="menuitem">Delete</div>
          </metro-dropdown-button>
          <span class="demo-label">Top placement:</span>
          <metro-dropdown-button label="Actions" placement="top">
            <div class="menu-item" role="menuitem">Undo</div>
            <div class="menu-item" role="menuitem">Redo</div>
            <div class="menu-divider"></div>
            <div class="menu-item" role="menuitem">Clear All</div>
          </metro-dropdown-button>
          <span class="demo-label">Disabled:</span>
          <metro-dropdown-button label="Disabled" disabled>
            <div class="menu-item" role="menuitem">Item</div>
          </metro-dropdown-button>
        </div>
        <pre
          class="code-snippet"
        ><code>&lt;metro-dropdown-button label="Options" placement="bottom"&gt;
  &lt;div class="menu-item" role="menuitem"&gt;Edit&lt;/div&gt;
  &lt;div class="menu-item" role="menuitem"&gt;Copy&lt;/div&gt;
  &lt;div class="menu-item" role="menuitem"&gt;Paste&lt;/div&gt;
  &lt;div class="menu-divider"&gt;&lt;/div&gt;
  &lt;div class="menu-item" role="menuitem"&gt;Delete&lt;/div&gt;
&lt;/metro-dropdown-button&gt;

&lt;metro-dropdown-button label="Actions" placement="top"&gt;
  ...
&lt;/metro-dropdown-button&gt;

&lt;metro-dropdown-button label="Disabled" disabled&gt;
  ...
&lt;/metro-dropdown-button&gt;</code></pre>
        <api-docs component="MetroDropdownButton"></api-docs>
      </div>

      <div class="demo-card">
        <h2 class="component-title">Button States</h2>
        <p class="component-desc">
          Visual demonstration of button hover and pressed states. Hover over
          buttons to see color inversion, click and hold to see pressed state.
        </p>
        <div class="demo-container">
          <metro-button>Hover Me</metro-button>
          <metro-button accent>Accent Hover</metro-button>
          <metro-repeat-button accent>Repeat Button</metro-repeat-button>
        </div>
        <pre
          class="code-snippet"
        ><code>/* Button states are handled automatically */
/* Default: transparent bg, white border */
/* Hover: white bg, text inverts */
/* Pressed: slightly dimmed */
/* Disabled: 40% opacity, no pointer events */</code></pre>
      </div>
      </metro-grid>
    `;
  }
}

customElements.define("metrino-buttons-page", MetrinoButtonsPage);

declare global {
  interface HTMLElementTagNameMap {
    "metrino-buttons-page": MetrinoButtonsPage;
  }
}
