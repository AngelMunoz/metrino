import { LitElement, html, css } from "lit";
import "../../../src/components/dialogs/content-dialog.ts";
import "../../../src/components/dialogs/message-dialog.ts";
import "../../../src/components/dialogs/flyout.ts";
import "../../../src/components/dialogs/settings-flyout.ts";
import "../../../src/components/primitives/toast.ts";
import "../../../src/components/primitives/menu-flyout.ts";
import "../../../src/components/buttons/button.ts";
import "../../../src/components/primitives/icon.ts";
import "../../../src/components/input/toggle-switch.ts";

export class MetrinoDialogsPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--metro-spacing-xl, 24px);
      background: var(--metro-background, #1f1f1f);
      min-height: 100vh;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      font-size: var(--metro-font-size-xxlarge, 42px);
      font-weight: 200;
      color: var(--metro-foreground, #ffffff);
      margin: 0 0 var(--metro-spacing-xl, 24px);
    }
    h2 {
      font-size: 24px;
      font-weight: 200;
      color: var(--metro-foreground, #ffffff);
      margin: var(--metro-spacing-xl, 24px) 0 var(--metro-spacing-md, 12px);
      border-bottom: 2px solid var(--metro-accent, #0078d4);
      padding-bottom: var(--metro-spacing-sm, 8px);
    }
    .section {
      margin-bottom: var(--metro-spacing-xl, 24px);
    }
    .demo-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--metro-spacing-md, 12px);
      align-items: center;
      margin-bottom: var(--metro-spacing-md, 12px);
    }
    .description {
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      margin-bottom: var(--metro-spacing-md, 12px);
      font-size: var(--metro-font-size-normal, 14px);
    }
    metro-button {
      min-width: 160px;
    }
    .flyout-content {
      padding: var(--metro-spacing-lg, 16px);
      min-width: 200px;
    }
    .flyout-content h4 {
      margin: 0 0 var(--metro-spacing-sm, 8px);
      font-size: var(--metro-font-size-normal, 14px);
      font-weight: 600;
      color: var(--metro-foreground, #ffffff);
    }
    .flyout-content p {
      margin: 0;
      font-size: var(--metro-font-size-small, 12px);
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
    }
    .menu-item {
      display: flex;
      align-items: center;
      gap: var(--metro-spacing-sm, 8px);
      padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
      cursor: pointer;
      color: var(--metro-foreground, #ffffff);
      font-size: var(--metro-font-size-normal, 14px);
    }
    .menu-item:hover {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
    }
    .menu-divider {
      height: 1px;
      background: var(--metro-border, rgba(255, 255, 255, 0.2));
      margin: var(--metro-spacing-xs, 4px) 0;
    }
    .settings-content {
      padding: var(--metro-spacing-md, 12px) 0;
    }
    .settings-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--metro-spacing-md, 12px) 0;
      border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.1));
    }
    .settings-item label {
      color: var(--metro-foreground, #ffffff);
      font-size: var(--metro-font-size-normal, 14px);
    }
    .dialog-content {
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
    }
    .dialog-buttons {
      display: flex;
      gap: var(--metro-spacing-sm, 8px);
    }
  `;

  static properties = {};

  constructor() {
    super();
  }

  render() {
    return html`
      <h1>Dialogs</h1>

      <section class="section">
        <h2>metro-content-dialog</h2>
        <p class="description">
          A modal dialog with customizable content area and button slot. Supports light dismiss (click outside to close) and animated open/close with turnstile effect.
        </p>
        <div class="demo-row">
          <metro-button @click=${this.#openContentDialog}>Open Content Dialog</metro-button>
        </div>
        <metro-content-dialog id="content-dialog" title="Content Dialog">
          <div class="dialog-content">
            <p>This is a content dialog with a slot for any content you want to display.</p>
            <p>You can put forms, lists, or any other components here.</p>
          </div>
          <div slot="buttons" class="dialog-buttons">
            <metro-button @click=${this.#closeContentDialog}>Cancel</metro-button>
            <metro-button accent @click=${this.#closeContentDialog}>OK</metro-button>
          </div>
        </metro-content-dialog>
      </section>

      <section class="section">
        <h2>metro-message-dialog</h2>
        <p class="description">
          A simple alert dialog for displaying messages to the user. Click outside to dismiss.
        </p>
        <div class="demo-row">
          <metro-button @click=${this.#openMessageDialog}>Show Message Dialog</metro-button>
        </div>
        <metro-message-dialog id="message-dialog" title="Information">
          <p>This is a simple message dialog. It's useful for alerts, confirmations, and brief messages.</p>
          <div slot="buttons" class="dialog-buttons">
            <metro-button accent @click=${this.#closeMessageDialog}>OK</metro-button>
          </div>
        </metro-message-dialog>
      </section>

      <section class="section">
        <h2>metro-flyout</h2>
        <p class="description">
          A contextual popup positioned relative to a target element. Supports different placements (top, bottom, left, right) and light dismiss.
        </p>
        <div class="demo-row">
          <metro-button id="flyout-top-btn" @click=${(e: Event) => this.#openFlyout(e, "top")}>Flyout Top</metro-button>
          <metro-button id="flyout-bottom-btn" @click=${(e: Event) => this.#openFlyout(e, "bottom")}>Flyout Bottom</metro-button>
          <metro-button id="flyout-left-btn" @click=${(e: Event) => this.#openFlyout(e, "left")}>Flyout Left</metro-button>
          <metro-button id="flyout-right-btn" @click=${(e: Event) => this.#openFlyout(e, "right")}>Flyout Right</metro-button>
        </div>
        <metro-flyout id="demo-flyout" placement="bottom">
          <div class="flyout-content">
            <h4>Flyout Title</h4>
            <p>This is a flyout with contextual content. Click outside to close.</p>
          </div>
        </metro-flyout>
      </section>

      <section class="section">
        <h2>metro-settings-flyout</h2>
        <p class="description">
          A side panel that slides in from the right. Useful for settings, forms, or detailed content.
        </p>
        <div class="demo-row">
          <metro-button @click=${this.#openSettingsFlyout}>Open Settings</metro-button>
          <metro-button @click=${this.#openWideSettingsFlyout}>Open Wide Settings</metro-button>
        </div>
        <metro-settings-flyout id="settings-flyout" title="Settings">
          <div class="settings-content">
            <div class="settings-item">
              <label>Notifications</label>
              <metro-toggle-switch checked></metro-toggle-switch>
            </div>
            <div class="settings-item">
              <label>Dark Mode</label>
              <metro-toggle-switch checked></metro-toggle-switch>
            </div>
            <div class="settings-item">
              <label>Auto-update</label>
              <metro-toggle-switch></metro-toggle-switch>
            </div>
          </div>
        </metro-settings-flyout>
      </section>

      <section class="section">
        <h2>metro-toast</h2>
        <p class="description">
          Non-intrusive notifications that appear at the top of the screen. Supports different severities and auto-dismiss with configurable duration.
        </p>
        <div class="demo-row">
          <metro-button @click=${() => this.#showToast("informational")}>Info Toast</metro-button>
          <metro-button @click=${() => this.#showToast("success")}>Success Toast</metro-button>
          <metro-button @click=${() => this.#showToast("warning")}>Warning Toast</metro-button>
          <metro-button @click=${() => this.#showToast("error")}>Error Toast</metro-button>
        </div>
        <div class="demo-row">
          <metro-button @click=${() => this.#showLongToast()}>Long Duration (5s)</metro-button>
          <metro-button @click=${() => this.#showPersistentToast()}>Persistent (no auto-dismiss)</metro-button>
          <metro-button @click=${this.#clearAllToasts}>Clear All</metro-button>
        </div>
        <metro-toast id="page-toast"></metro-toast>
      </section>

      <section class="section">
        <h2>metro-menu-flyout</h2>
        <p class="description">
          A dropdown menu that appears below a button. Useful for context menus and action lists.
        </p>
        <div class="demo-row">
          <metro-button id="menu-flyout-btn" @click=${this.#openMenuFlyout}>Open Menu</metro-button>
        </div>
        <metro-menu-flyout id="demo-menu-flyout">
          <div class="menu-item"><metro-icon icon="add" size="normal"></metro-icon> New Item</div>
          <div class="menu-item"><metro-icon icon="folder" size="normal"></metro-icon> Open Folder</div>
          <div class="menu-item"><metro-icon icon="save" size="normal"></metro-icon> Save</div>
          <div class="menu-divider"></div>
          <div class="menu-item"><metro-icon icon="settings" size="normal"></metro-icon> Settings</div>
          <div class="menu-item"><metro-icon icon="help" size="normal"></metro-icon> Help</div>
        </metro-menu-flyout>
      </section>
    `;
  }

  #openContentDialog(): void {
    const dialog = this.shadowRoot?.querySelector("#content-dialog") as HTMLElement & { show: () => void };
    dialog?.show();
  }

  #closeContentDialog(): void {
    const dialog = this.shadowRoot?.querySelector("#content-dialog") as HTMLElement & { hide: () => void };
    dialog?.hide();
  }

  #openMessageDialog(): void {
    const dialog = this.shadowRoot?.querySelector("#message-dialog") as HTMLElement & { show: () => void };
    dialog?.show();
  }

  #closeMessageDialog(): void {
    const dialog = this.shadowRoot?.querySelector("#message-dialog") as HTMLElement & { hide: () => void };
    dialog?.hide();
  }

  #openFlyout(e: Event, placement: string): void {
    const flyout = this.shadowRoot?.querySelector("#demo-flyout") as HTMLElement & { 
      show: (target: Element) => void,
      placement: string 
    };
    if (flyout) {
      flyout.placement = placement as "top" | "bottom" | "left" | "right";
      flyout.show(e.target as Element);
    }
  }

  #openSettingsFlyout(): void {
    const flyout = this.shadowRoot?.querySelector("#settings-flyout") as HTMLElement & { 
      show: () => void,
      width: string 
    };
    if (flyout) {
      flyout.width = "narrow";
      flyout.show();
    }
  }

  #openWideSettingsFlyout(): void {
    const flyout = this.shadowRoot?.querySelector("#settings-flyout") as HTMLElement & { 
      show: () => void,
      width: string 
    };
    if (flyout) {
      flyout.width = "wide";
      flyout.show();
    }
  }

  #showToast(severity: "informational" | "success" | "warning" | "error"): void {
    const toast = this.shadowRoot?.querySelector("#page-toast") as HTMLElement & { 
      show: (options: { title?: string; message: string; severity?: string; duration?: number }) => string 
    };
    const titles: Record<string, string> = {
      informational: "Information",
      success: "Success",
      warning: "Warning",
      error: "Error"
    };
    toast?.show({
      title: titles[severity],
      message: `This is a ${severity} toast notification.`,
      severity,
      duration: 3000
    });
  }

  #showLongToast(): void {
    const toast = this.shadowRoot?.querySelector("#page-toast") as HTMLElement & { 
      show: (options: { title?: string; message: string; severity?: string; duration?: number }) => string 
    };
    toast?.show({
      title: "Long Duration",
      message: "This toast will stay for 5 seconds.",
      severity: "informational",
      duration: 5000
    });
  }

  #showPersistentToast(): void {
    const toast = this.shadowRoot?.querySelector("#page-toast") as HTMLElement & { 
      show: (options: { title?: string; message: string; severity?: string; duration?: number }) => string 
    };
    toast?.show({
      title: "Persistent",
      message: "This toast will not auto-dismiss. Click X to close.",
      severity: "warning",
      duration: 0
    });
  }

  #clearAllToasts(): void {
    const toast = this.shadowRoot?.querySelector("#page-toast") as HTMLElement & { clearAll: () => void };
    toast?.clearAll();
  }

  #openMenuFlyout(e: Event): void {
    const menuFlyout = this.shadowRoot?.querySelector("#demo-menu-flyout") as HTMLElement & { 
      show: (target: Element) => void 
    };
    menuFlyout?.show(e.target as Element);
  }
}

customElements.define("metrino-dialogs-page", MetrinoDialogsPage);
