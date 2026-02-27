import { LitElement, html, css } from "lit";
import "../../../src/components/primitives/text-block.ts";
import "../../../src/components/primitives/icon.ts";
import "../../../src/components/primitives/expander.ts";
import "../../../src/components/primitives/info-bar.ts";
import "../../../src/components/primitives/person-picture.ts";
import "../../../src/components/primitives/border.ts";
import "../../../src/components/primitives/context-menu.ts";
import "../../../src/components/primitives/image.ts";
import "../../../src/components/primitives/media-element.ts";
import "../../../src/components/primitives/menu-flyout.ts";
import "../../../src/components/primitives/rich-text-block.ts";
import "../../../src/components/primitives/toast.ts";
import "../../../src/components/primitives/tooltip.ts";
import "../../../src/components/buttons/button.ts";

export class PageComponentsPrimitives extends LitElement {
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
      display: flex;
      flex-wrap: wrap;
      gap: var(--metro-spacing-md);
      align-items: center;
    }
    .code-block {
      background: var(--metro-highlight);
      padding: var(--metro-spacing-md);
      font-family: "SF Mono", "Fira Code", monospace;
      font-size: var(--metro-font-size-small);
      margin: var(--metro-spacing-md) var(--metro-spacing-lg);
      overflow-x: auto;
    }
    .icons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: var(--metro-spacing-sm);
    }
    .icon-sample {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--metro-spacing-sm);
      background: var(--metro-highlight);
    }
    .icon-sample span {
      font-size: 10px;
      color: var(--metro-foreground-secondary);
      margin-top: 4px;
    }
  `;

  render() {
    return html`
      <h1 class="page-title">Primitives</h1>
      <p class="page-description">
        Primitive components are building blocks for more complex UI. 
        They include text, icons, and basic structural elements.
      </p>

      <div class="section">
        <h2 class="section-title">metro-text-block</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Text Block</div>
            <div class="component-desc">Text with semantic formatting options</div>
          </div>
          <div class="component-demo">
            <metro-text-block>Normal</metro-text-block>
            <metro-text-block bold>Bold</metro-text-block>
            <metro-text-block italic>Italic</metro-text-block>
            <metro-text-block underline>Underline</metro-text-block>
            <metro-text-block strikethrough>Strikethrough</metro-text-block>
          </div>
          <div class="code-block">
            <code>&lt;metro-text-block bold&gt;Bold text&lt;/metro-text-block&gt;
&lt;metro-text-block italic&gt;Italic text&lt;/metro-text-block&gt;
&lt;metro-text-block underline&gt;Underlined text&lt;/metro-text-block&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-icon</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Icon</div>
            <div class="component-desc">80+ built-in icons from MDI</div>
          </div>
          <div class="component-demo" style="display: block;">
            <div class="icons-grid">
              <div class="icon-sample"><metro-icon icon="home" size="medium"></metro-icon><span>home</span></div>
              <div class="icon-sample"><metro-icon icon="settings" size="medium"></metro-icon><span>settings</span></div>
              <div class="icon-sample"><metro-icon icon="search" size="medium"></metro-icon><span>search</span></div>
              <div class="icon-sample"><metro-icon icon="mail" size="medium"></metro-icon><span>mail</span></div>
              <div class="icon-sample"><metro-icon icon="user" size="medium"></metro-icon><span>user</span></div>
              <div class="icon-sample"><metro-icon icon="calendar" size="medium"></metro-icon><span>calendar</span></div>
              <div class="icon-sample"><metro-icon icon="star" size="medium"></metro-icon><span>star</span></div>
              <div class="icon-sample"><metro-icon icon="heart" size="medium"></metro-icon><span>heart</span></div>
              <div class="icon-sample"><metro-icon icon="lock" size="medium"></metro-icon><span>lock</span></div>
              <div class="icon-sample"><metro-icon icon="play" size="medium"></metro-icon><span>play</span></div>
              <div class="icon-sample"><metro-icon icon="pause" size="medium"></metro-icon><span>pause</span></div>
              <div class="icon-sample"><metro-icon icon="warning" size="medium"></metro-icon><span>warning</span></div>
            </div>
          </div>
          <div class="code-block">
            <code>&lt;metro-icon icon="home" size="medium"&gt;&lt;/metro-icon&gt;

Sizes: small, normal, medium, large, xlarge</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-expander</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Expander</div>
            <div class="component-desc">Collapsible content panel</div>
          </div>
          <div class="component-demo" style="display: block;">
            <metro-expander title="Click to expand" style="margin-bottom: 8px">
              <p style="padding: 8px">Hidden content revealed when expanded.</p>
            </metro-expander>
            <metro-expander title="Already expanded" expanded>
              <p style="padding: 8px">This content is visible by default.</p>
            </metro-expander>
          </div>
          <div class="code-block">
            <code>&lt;metro-expander title="Click to expand"&gt;
  &lt;p&gt;Hidden content&lt;/p&gt;
&lt;/metro-expander&gt;

&lt;metro-expander title="Expanded" expanded&gt;
  &lt;p&gt;Visible content&lt;/p&gt;
&lt;/metro-expander&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-info-bar</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Info Bar</div>
            <div class="component-desc">Status messages with severity levels</div>
          </div>
          <div class="component-demo" style="display: block;">
            <metro-info-bar severity="informational" style="margin-bottom: 8px">This is an informational message.</metro-info-bar>
            <metro-info-bar severity="success" style="margin-bottom: 8px">Operation completed successfully.</metro-info-bar>
            <metro-info-bar severity="warning" style="margin-bottom: 8px">Please review this warning.</metro-info-bar>
            <metro-info-bar severity="error">An error has occurred.</metro-info-bar>
          </div>
          <div class="code-block">
            <code>&lt;metro-info-bar severity="informational"&gt;Info message&lt;/metro-info-bar&gt;
&lt;metro-info-bar severity="success"&gt;Success!&lt;/metro-info-bar&gt;
&lt;metro-info-bar severity="warning"&gt;Warning&lt;/metro-info-bar&gt;
&lt;metro-info-bar severity="error"&gt;Error!&lt;/metro-info-bar&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-person-picture</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Person Picture</div>
            <div class="component-desc">Avatar with initials or presence indicator</div>
          </div>
          <div class="component-demo">
            <metro-person-picture display-name="John Doe"></metro-person-picture>
            <metro-person-picture initials="AB"></metro-person-picture>
            <metro-person-picture display-name="Jane Smith" presence="available"></metro-person-picture>
            <metro-person-picture display-name="Bob Wilson" presence="away"></metro-person-picture>
            <metro-person-picture display-name="Alice Brown" presence="busy"></metro-person-picture>
            <metro-person-picture display-name="Charlie Davis" presence="offline"></metro-person-picture>
          </div>
          <div class="code-block">
            <code>&lt;metro-person-picture display-name="John Doe"&gt;&lt;/metro-person-picture&gt;
&lt;metro-person-picture initials="AB"&gt;&lt;/metro-person-picture&gt;
&lt;metro-person-picture display-name="Jane" presence="available"&gt;&lt;/metro-person-picture&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-border</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Border</div>
            <div class="component-desc">Configurable border container with customizable thickness, color, and radius</div>
          </div>
          <div class="component-demo" style="display: block;">
            <metro-border border-thickness="2" corner-radius="0" style="margin-bottom: 8px;">
              <div style="padding: 16px;">Default border</div>
            </metro-border>
            <metro-border border-thickness="4" border-color="var(--metro-accent)" corner-radius="8" style="margin-bottom: 8px;">
              <div style="padding: 16px;">Accent border with rounded corners</div>
            </metro-border>
            <metro-border border-thickness="1,4,1,4" background="var(--metro-highlight)">
              <div style="padding: 16px;">Asymmetric border with background</div>
            </metro-border>
          </div>
          <div class="code-block">
            <code>&lt;metro-border border-thickness="2" corner-radius="0"&gt;Content&lt;/metro-border&gt;
&lt;metro-border border-thickness="4" border-color="var(--metro-accent)" corner-radius="8"&gt;Rounded&lt;/metro-border&gt;
&lt;metro-border border-thickness="1,4,1,4" background="var(--metro-highlight)"&gt;Asymmetric&lt;/metro-border&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-context-menu</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Context Menu</div>
            <div class="component-desc">Right-click/long-press menu triggered on target element</div>
          </div>
          <div class="component-demo" style="display: block;">
            <metro-border border-thickness="1" style="padding: 24px; text-align: center;" id="context-target">
              Long-press here (500ms) to show context menu
            </metro-border>
            <metro-context-menu target="#context-target" delay="500">
              <div slot="item">Edit</div>
              <div slot="item">Copy</div>
              <div slot="item">Delete</div>
            </metro-context-menu>
          </div>
          <div class="code-block">
            <code>&lt;div id="my-target"&gt;Long-press me&lt;/div&gt;
&lt;metro-context-menu target="#my-target" delay="500"&gt;
  &lt;div slot="item"&gt;Edit&lt;/div&gt;
  &lt;div slot="item"&gt;Copy&lt;/div&gt;
  &lt;div slot="item"&gt;Delete&lt;/div&gt;
&lt;/metro-context-menu&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-image</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Image</div>
            <div class="component-desc">Image with placeholder, fallback, and stretch modes</div>
          </div>
          <div class="component-demo">
            <metro-image src="https://picsum.photos/150/100" alt="Random image" style="width: 150px; height: 100px;"></metro-image>
            <metro-image src="invalid-url" fallback="Image failed" stretch="uniform" style="width: 150px; height: 100px;"></metro-image>
            <metro-image src="https://picsum.photos/100/150" alt="Cover" stretch="uniformToFill" style="width: 100px; height: 100px;"></metro-image>
          </div>
          <div class="code-block">
            <code>&lt;metro-image src="image.jpg" alt="Description" stretch="uniform"&gt;&lt;/metro-image&gt;

Stretch modes: none, fill, uniform, uniformToFill</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-media-element</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Media Element</div>
            <div class="component-desc">Audio and video player with native controls</div>
          </div>
          <div class="component-demo" style="display: block;">
            <metro-media-element
              type="video"
              src="https://www.w3schools.com/html/mov_bbb.mp4"
              controls
              style="max-width: 400px;"
            ></metro-media-element>
          </div>
          <div class="code-block">
            <code>&lt;metro-media-element type="video" src="video.mp4" controls&gt;&lt;/metro-media-element&gt;
&lt;metro-media-element type="audio" src="audio.mp3" controls autoplay&gt;&lt;/metro-media-element&gt;

Attributes: autoplay, controls, muted, loop, poster (video only)</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-menu-flyout</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Menu Flyout</div>
            <div class="component-desc">Dropdown menu positioned relative to a target element</div>
          </div>
          <div class="component-demo" style="display: block;">
            <metro-button id="flyout-btn" onclick="document.querySelector('#demo-flyout').show(this)">Show Menu</metro-button>
            <metro-menu-flyout id="demo-flyout">
              <div class="menu-item">New File</div>
              <div class="menu-item">Open...</div>
              <div class="menu-divider"></div>
              <div class="menu-item">Save</div>
            </metro-menu-flyout>
          </div>
          <div class="code-block">
            <code>&lt;button onclick="flyout.show(this)"&gt;Menu&lt;/button&gt;
&lt;metro-menu-flyout id="flyout"&gt;
  &lt;div class="menu-item"&gt;New File&lt;/div&gt;
  &lt;div class="menu-item"&gt;Open...&lt;/div&gt;
  &lt;div class="menu-divider"&gt;&lt;/div&gt;
  &lt;div class="menu-item"&gt;Save&lt;/div&gt;
&lt;/metro-menu-flyout&gt;</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-rich-text-block</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Rich Text Block</div>
            <div class="component-desc">HTML content with text trimming and line clamping</div>
          </div>
          <div class="component-demo" style="display: block;">
            <metro-rich-text-block content="&lt;b&gt;Bold&lt;/b&gt; and &lt;i&gt;italic&lt;/i&gt; text" style="margin-bottom: 12px;"></metro-rich-text-block>
            <metro-rich-text-block text-trimming="ellipsis" max-lines="2" style="max-width: 200px;">
              This is a long text that will be truncated with ellipsis after two lines when it exceeds the container width.
            </metro-rich-text-block>
          </div>
          <div class="code-block">
            <code>&lt;metro-rich-text-block content="&lt;b&gt;Bold&lt;/b&gt; and &lt;i&gt;italic&lt;/i&gt;"&gt;&lt;/metro-rich-text-block&gt;
&lt;metro-rich-text-block text-trimming="ellipsis" max-lines="2"&gt;Long text...&lt;/metro-rich-text-block&gt;

Text trimming: none, clip, ellipsis</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-toast</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Toast</div>
            <div class="component-desc">Temporary notification with severity levels</div>
          </div>
          <div class="component-demo">
            <metro-button onclick="showToast({title: 'Info', message: 'Informational toast', severity: 'informational'})">Info</metro-button>
            <metro-button onclick="showToast({title: 'Done', message: 'Operation successful', severity: 'success'})">Success</metro-button>
            <metro-button onclick="showToast({title: 'Warning', message: 'Please review', severity: 'warning'})">Warning</metro-button>
            <metro-button onclick="showToast({title: 'Error', message: 'Something went wrong', severity: 'error'})">Error</metro-button>
          </div>
          <div class="code-block">
            <code>import { showToast } from "./components/primitives/toast.ts";

showToast({
  title: "Success",
  message: "Operation completed",
  severity: "success",
  duration: 3000
});

Severities: informational, success, warning, error</code>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">metro-tooltip</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Tooltip</div>
            <div class="component-desc">Contextual tooltip with placement options</div>
          </div>
          <div class="component-demo">
            <metro-button onmouseenter="document.querySelector('#tt-top').show(this)" onmouseleave="document.querySelector('#tt-top').hide()">Top</metro-button>
            <metro-tooltip id="tt-top" text="Tooltip on top" placement="top"></metro-tooltip>
            <metro-button onmouseenter="document.querySelector('#tt-bottom').show(this)" onmouseleave="document.querySelector('#tt-bottom').hide()">Bottom</metro-button>
            <metro-tooltip id="tt-bottom" text="Tooltip below" placement="bottom"></metro-tooltip>
            <metro-button onmouseenter="document.querySelector('#tt-left').show(this)" onmouseleave="document.querySelector('#tt-left').hide()">Left</metro-button>
            <metro-tooltip id="tt-left" text="Tooltip left" placement="left"></metro-tooltip>
            <metro-button onmouseenter="document.querySelector('#tt-right').show(this)" onmouseleave="document.querySelector('#tt-right').hide()">Right</metro-button>
            <metro-tooltip id="tt-right" text="Tooltip right" placement="right"></metro-tooltip>
          </div>
          <div class="code-block">
            <code>&lt;button onmouseenter="tooltip.show(this)" onmouseleave="tooltip.hide()"&gt;Hover&lt;/button&gt;
&lt;metro-tooltip id="tooltip" text="Helpful text" placement="top"&gt;&lt;/metro-tooltip&gt;

Placements: top, bottom, left, right</code>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("page-components-primitives", PageComponentsPrimitives);
