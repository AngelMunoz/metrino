import { LitElement, html, css } from "lit";
import "../../../src/components/navigation/pivot.ts";
import "../../../src/components/navigation/pivot-item.ts";
import "../../../src/components/navigation/hub.ts";
import "../../../src/components/navigation/hub-section.ts";
import "../../../src/components/navigation/split-view.ts";
import "../../../src/components/navigation/app-bar.ts";
import "../../../src/components/navigation/app-bar-button.ts";
import "../../../src/components/navigation/app-bar-separator.ts";
import "../../../src/components/navigation/app-bar-toggle-button.ts";
import "../../../src/components/navigation/panorama.ts";
import "../../../src/components/navigation/panorama-item.ts";
import "../../../src/components/buttons/button.ts";

export class PageComponentsNavigation extends LitElement {
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
    .api-table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--metro-font-size-small);
      margin: var(--metro-spacing-md) var(--metro-spacing-lg);
    }
    .api-table th,
    .api-table td {
      padding: var(--metro-spacing-sm) var(--metro-spacing-md);
      text-align: left;
      border-bottom: 1px solid var(--metro-border);
    }
    .api-table th {
      background: var(--metro-highlight);
      font-weight: 500;
    }
    .api-table code {
      font-family: "SF Mono", monospace;
      color: var(--metro-accent);
    }
    .split-view-demo {
      height: 200px;
      position: relative;
      border: 1px solid var(--metro-border);
    }
    metro-pivot {
      max-width: 600px;
    }
    metro-hub {
      max-width: 100%;
    }
  `;

  render() {
    return html`
      <h1 class="page-title">Navigation</h1>
      <p class="page-description">
        Metro navigation components provide patterns for moving between views, 
        organizing content, and accessing app-level features.
      </p>

      <div class="section">
        <h2 class="section-title">metro-pivot</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Pivot</div>
            <div class="component-desc">Tabbed navigation with large headers and sliding content</div>
          </div>
          <div class="component-demo">
            <metro-pivot>
              <metro-pivot-item header="First">
                <p style="padding: 16px">Content for the first pivot. Click headers to switch.</p>
              </metro-pivot-item>
              <metro-pivot-item header="Second">
                <p style="padding: 16px">Content for the second pivot item.</p>
              </metro-pivot-item>
              <metro-pivot-item header="Third">
                <p style="padding: 16px">Content for the third pivot item.</p>
              </metro-pivot-item>
            </metro-pivot>
          </div>
          <div class="code-block">
            <code>&lt;metro-pivot&gt;
  &lt;metro-pivot-item header="First"&gt;
    &lt;p&gt;First tab content&lt;/p&gt;
  &lt;/metro-pivot-item&gt;
  &lt;metro-pivot-item header="Second"&gt;
    &lt;p&gt;Second tab content&lt;/p&gt;
  &lt;/metro-pivot-item&gt;
&lt;/metro-pivot&gt;</code>
          </div>
        </div>

        <div class="component-card">
          <div class="component-header">
            <div class="component-name">API Reference</div>
          </div>
          <table class="api-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>selectedIndex</code></td>
                <td>number</td>
                <td>0</td>
                <td>Currently selected tab index</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-hub</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Hub</div>
            <div class="component-desc">Horizontally scrolling sections with parallax effect</div>
          </div>
          <div class="component-demo">
            <metro-hub title="Hub Demo" style="height: 150px;">
              <metro-hub-section header="Section One">
                <metro-button>Action 1</metro-button>
              </metro-hub-section>
              <metro-hub-section header="Section Two">
                <metro-button>Action 2</metro-button>
              </metro-hub-section>
              <metro-hub-section header="Section Three">
                <metro-button>Action 3</metro-button>
              </metro-hub-section>
            </metro-hub>
          </div>
          <div class="code-block">
            <code>&lt;metro-hub title="Hub Demo"&gt;
  &lt;metro-hub-section header="Section One"&gt;
    &lt;metro-button&gt;Action&lt;/metro-button&gt;
  &lt;/metro-hub-section&gt;
  &lt;metro-hub-section header="Section Two"&gt;
    ...
  &lt;/metro-hub-section&gt;
&lt;/metro-hub&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-split-view</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Split View</div>
            <div class="component-desc">Slide-out navigation panel with three display modes</div>
          </div>
          <div class="component-demo">
            <p style="margin-bottom: var(--metro-spacing-md); color: var(--metro-foreground-secondary);">
              Display modes: <strong>overlay</strong> (slides over), <strong>inline</strong> (pushes content), 
              <strong>compact</strong> (always shows 48px strip)
            </p>
            <div class="split-view-demo">
              <metro-split-view id="split-demo" display-mode="compact" open>
                <nav slot="pane" style="padding: 16px">Pane Content</nav>
                <div style="padding: 16px">
                  <p>Main content area.</p>
                  <metro-button onclick="document.getElementById('split-demo').toggle()">Toggle Pane</metro-button>
                </div>
              </metro-split-view>
            </div>
          </div>
          <div class="code-block">
            <code>&lt;metro-split-view display-mode="compact" open&gt;
  &lt;nav slot="pane"&gt;Navigation&lt;/nav&gt;
  &lt;div&gt;Main Content&lt;/div&gt;
&lt;/metro-split-view&gt;</code>
          </div>
        </div>

        <div class="component-card">
          <div class="component-header">
            <div class="component-name">API Reference</div>
          </div>
          <table class="api-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>display-mode</code></td>
                <td>string</td>
                <td>"overlay"</td>
                <td>overlay | inline | compact</td>
              </tr>
              <tr>
                <td><code>open</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Whether pane is open</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-app-bar</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">App Bar</div>
            <div class="component-desc">Toolbar for commands and navigation, usually at bottom</div>
          </div>
          <div class="component-demo">
            <p style="margin-bottom: var(--metro-spacing-md); color: var(--metro-foreground-secondary);">
              See the app bar at the bottom of this page for a live example.
            </p>
            <metro-app-bar placement="bottom" style="position: relative;">
              <span slot="content" style="font-size: 14px;">Content area</span>
              <metro-app-bar-button icon="home" label="Home"></metro-app-bar-button>
              <metro-app-bar-button icon="settings" label="Settings"></metro-app-bar-button>
            </metro-app-bar>
          </div>
          <div class="code-block">
            <code>&lt;metro-app-bar placement="bottom"&gt;
  &lt;span slot="content"&gt;Title&lt;/span&gt;
  &lt;metro-app-bar-button icon="home" label="Home"&gt;&lt;/metro-app-bar-button&gt;
  &lt;metro-app-bar-button icon="settings" label="Settings" slot="menu"&gt;&lt;/metro-app-bar-button&gt;
&lt;/metro-app-bar&gt;</code>
          </div>
        </div>

        <div class="component-card">
          <div class="component-header">
            <div class="component-name">API Reference</div>
          </div>
          <table class="api-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>placement</code></td>
                <td>string</td>
                <td>"bottom"</td>
                <td>top | bottom</td>
              </tr>
              <tr>
                <td><code>open</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Whether bar is visible</td>
              </tr>
              <tr>
                <td><code>sticky</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Keep bar visible when open</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-app-bar-separator</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">App Bar Separator</div>
            <div class="component-desc">Vertical divider for grouping app bar commands</div>
          </div>
          <div class="component-demo">
            <metro-app-bar placement="bottom" style="position: relative;">
              <metro-app-bar-button icon="home" label="Home"></metro-app-bar-button>
              <metro-app-bar-separator></metro-app-bar-separator>
              <metro-app-bar-button icon="settings" label="Settings"></metro-app-bar-button>
            </metro-app-bar>
          </div>
          <div class="code-block">
            <code>&lt;metro-app-bar&gt;
  &lt;metro-app-bar-button icon="home" label="Home"&gt;&lt;/metro-app-bar-button&gt;
  &lt;metro-app-bar-separator&gt;&lt;/metro-app-bar-separator&gt;
  &lt;metro-app-bar-button icon="settings" label="Settings"&gt;&lt;/metro-app-bar-button&gt;
&lt;/metro-app-bar&gt;</code>
          </div>
        </div>

        <div class="component-card">
          <div class="component-header">
            <div class="component-name">API Reference</div>
          </div>
          <table class="api-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>visible</code></td>
                <td>boolean</td>
                <td>true</td>
                <td>Whether separator is displayed</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-app-bar-toggle-button</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">App Bar Toggle Button</div>
            <div class="component-desc">Checkable button with circle indicator for on/off states</div>
          </div>
          <div class="component-demo">
            <metro-app-bar placement="bottom" style="position: relative;">
              <metro-app-bar-toggle-button icon="star" label="Favorite" checked></metro-app-bar-toggle-button>
              <metro-app-bar-toggle-button icon="pin" label="Pin"></metro-app-bar-toggle-button>
            </metro-app-bar>
          </div>
          <div class="code-block">
            <code>&lt;metro-app-bar-toggle-button icon="star" label="Favorite" checked&gt;
&lt;/metro-app-bar-toggle-button&gt;</code>
          </div>
        </div>

        <div class="component-card">
          <div class="component-header">
            <div class="component-name">API Reference</div>
          </div>
          <table class="api-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>icon</code></td>
                <td>string</td>
                <td>""</td>
                <td>Icon name to display</td>
              </tr>
              <tr>
                <td><code>label</code></td>
                <td>string</td>
                <td>""</td>
                <td>Text label shown when expanded</td>
              </tr>
              <tr>
                <td><code>checked</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Whether button is checked</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Whether button is disabled</td>
              </tr>
              <tr>
                <td><code>menu-item</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Display as menu item style</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-panorama</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Panorama</div>
            <div class="component-desc">Full-screen horizontally scrolling sections with parallax background</div>
          </div>
          <div class="component-demo">
            <metro-panorama title="Panorama Demo" style="height: 200px; border: 1px solid var(--metro-border);">
              <metro-panorama-item header="First Section">
                <p>Content for section one.</p>
              </metro-panorama-item>
              <metro-panorama-item header="Second Section">
                <p>Content for section two.</p>
              </metro-panorama-item>
              <metro-panorama-item header="Third Section">
                <p>Content for section three.</p>
              </metro-panorama-item>
            </metro-panorama>
          </div>
          <div class="code-block">
            <code>&lt;metro-panorama title="Panorama" background-image="/bg.jpg"&gt;
  &lt;metro-panorama-item header="Section One"&gt;
    &lt;p&gt;Content here&lt;/p&gt;
  &lt;/metro-panorama-item&gt;
  &lt;metro-panorama-item header="Section Two"&gt;
    ...
  &lt;/metro-panorama-item&gt;
&lt;/metro-panorama&gt;</code>
          </div>
        </div>

        <div class="component-card">
          <div class="component-header">
            <div class="component-name">API Reference</div>
          </div>
          <table class="api-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>title</code></td>
                <td>string</td>
                <td>""</td>
                <td>Title displayed above sections</td>
              </tr>
              <tr>
                <td><code>background-image</code></td>
                <td>string</td>
                <td>""</td>
                <td>URL for parallax background image</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-panorama-item</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Panorama Item</div>
            <div class="component-desc">Individual section within a panorama control</div>
          </div>
          <div class="component-demo">
            <p style="color: var(--metro-foreground-secondary); margin-bottom: var(--metro-spacing-md);">
              See panorama example above. Each item takes 85% width with snap scrolling.
            </p>
          </div>
          <div class="code-block">
            <code>&lt;metro-panorama-item header="Section Title"&gt;
  &lt;!-- Your content here --&gt;
&lt;/metro-panorama-item&gt;</code>
          </div>
        </div>

        <div class="component-card">
          <div class="component-header">
            <div class="component-name">API Reference</div>
          </div>
          <table class="api-table">
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>header</code></td>
                <td>string</td>
                <td>""</td>
                <td>Section header text</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

customElements.define("page-components-navigation", PageComponentsNavigation);
