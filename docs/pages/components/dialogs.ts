import { LitElement, html, css } from "lit";
import "../../../src/components/dialogs/content-dialog.ts";
import "../../../src/components/dialogs/message-dialog.ts";
import "../../../src/components/dialogs/flyout.ts";
import "../../../src/components/dialogs/settings-flyout.ts";
import "../../../src/components/buttons/button.ts";

export class PageComponentsDialogs extends LitElement {
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
      gap: var(--metro-spacing-md);
      flex-wrap: wrap;
    }
    .code-block {
      background: var(--metro-highlight);
      padding: var(--metro-spacing-md);
      font-family: "SF Mono", "Fira Code", monospace;
      font-size: var(--metro-font-size-small);
      margin: var(--metro-spacing-md) var(--metro-spacing-lg);
      overflow-x: auto;
    }
  `;

  #showDialog(): void {
    const dialog = this.shadowRoot?.getElementById("demo-dialog") as HTMLElement & { show: () => void };
    dialog?.show?.();
  }

  #showMessage(): void {
    const dialog = this.shadowRoot?.getElementById("demo-message") as HTMLElement & { show: () => void };
    dialog?.show?.();
  }

  #showFlyout(e: Event): void {
    const flyout = this.shadowRoot?.getElementById("demo-flyout") as HTMLElement & { show: (el: Element) => void };
    flyout?.show?.(e.target as Element);
  }

  #showSettingsFlyout(): void {
    const flyout = this.shadowRoot?.getElementById("demo-settings-flyout") as HTMLElement & { show: () => void };
    flyout?.show?.();
  }

  render() {
    return html`
      <h1 class="page-title">Dialogs</h1>
      <p class="page-description">
        Dialog components display modal content, notifications, and temporary UI elements 
        that appear above the main application content.
      </p>

      <div class="section">
        <h2 class="section-title">metro-content-dialog</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Content Dialog</div>
            <div class="component-desc">Full-featured modal dialog with title and content area</div>
          </div>
          <div class="component-demo">
            <metro-button @click=${this.#showDialog}>Show Dialog</metro-button>
          </div>
          <div class="code-block">
            <code>&lt;metro-content-dialog id="dialog" title="Dialog Title"&gt;
  &lt;p&gt;Dialog content here&lt;/p&gt;
  &lt;metro-button slot="buttons" @click=\${() => dialog.open = false}&gt;Close&lt;/metro-button&gt;
&lt;/metro-content-dialog&gt;

&lt;metro-button @click=\${() => dialog.show()}&gt;Show&lt;/metro-button&gt;</code>
          </div>
        </div>

        <metro-content-dialog id="demo-dialog" title="Dialog Title">
          <p>This is the content of the dialog.</p>
          <p>You can put any content here.</p>
          <metro-button slot="buttons" @click=${() => {
            const d = this.shadowRoot?.getElementById("demo-dialog") as HTMLElement & { open: boolean };
            if (d) d.open = false;
          }}>Close</metro-button>
        </metro-content-dialog>
      </div>

      <div class="section">
        <h2 class="section-title">metro-message-dialog</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Message Dialog</div>
            <div class="component-desc">Simple message dialog for alerts and confirmations</div>
          </div>
          <div class="component-demo">
            <metro-button @click=${this.#showMessage}>Show Message</metro-button>
          </div>
          <div class="code-block">
            <code>&lt;metro-message-dialog id="msg" title="Message"&gt;
  &lt;p&gt;This is a simple message.&lt;/p&gt;
&lt;/metro-message-dialog&gt;</code>
          </div>
        </div>

        <metro-message-dialog id="demo-message" title="Message">
          <p>This is a simple message dialog.</p>
        </metro-message-dialog>
      </div>

      <div class="section">
        <h2 class="section-title">metro-flyout</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Flyout</div>
            <div class="component-desc">Lightweight popup that anchors to an element</div>
          </div>
          <div class="component-demo">
            <metro-button @click=${this.#showFlyout}>Show Flyout</metro-button>
          </div>
          <div class="code-block">
            <code>&lt;metro-flyout id="flyout"&gt;
  &lt;div style="padding: 16px"&gt;Flyout content&lt;/div&gt;
&lt;/metro-flyout&gt;

&lt;metro-button @click=\${() => flyout.show(target)}&gt;Show&lt;/metro-button&gt;</code>
          </div>
        </div>

        <metro-flyout id="demo-flyout">
          <div style="padding: 16px">
            <p>Flyout content</p>
            <metro-button @click=${() => {
              const f = this.shadowRoot?.getElementById("demo-flyout") as HTMLElement & { hide: () => void };
              f?.hide?.();
            }}>Close</metro-button>
          </div>
        </metro-flyout>
      </div>

      <div class="section">
        <h2 class="section-title">metro-settings-flyout</h2>
        
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Settings Flyout</div>
            <div class="component-desc">Full-height panel that slides in from the right for settings and navigation</div>
          </div>
          <div class="component-demo">
            <metro-button @click=${this.#showSettingsFlyout}>Show Settings Flyout</metro-button>
          </div>
          <div class="code-block">
            <code>&lt;metro-settings-flyout id="flyout" title="Settings"&gt;
  &lt;p&gt;Settings content here&lt;/p&gt;
&lt;/metro-settings-flyout&gt;

&lt;metro-button @click=\${() => flyout.show()}&gt;Open&lt;/metro-button&gt;</code>
          </div>
        </div>

        <metro-settings-flyout id="demo-settings-flyout" title="Settings">
          <p style="margin-bottom: 16px;">Configure your preferences here.</p>
          <p style="color: var(--metro-foreground-secondary); font-size: var(--metro-font-size-small);">
            Use width="wide" for a wider panel (646px instead of 346px).
          </p>
        </metro-settings-flyout>
      </div>

      <div class="section">
        <h2 class="section-title">Other Dialog Components</h2>
        <div class="component-card">
          <div class="component-header">
            <div class="component-name">Additional Components</div>
          </div>
          <div class="component-demo" style="display: block;">
            <ul style="color: var(--metro-foreground-secondary); font-size: var(--metro-font-size-small);">
              <li><strong>metro-toast</strong> - Brief notification that appears temporarily</li>
              <li><strong>metro-menu-flyout</strong> - Dropdown menu with items</li>
              <li><strong>metro-context-menu</strong> - Right-click/long-press menu</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("page-components-dialogs", PageComponentsDialogs);
