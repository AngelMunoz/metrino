import { LitElement, html, css } from "lit";
import { baseTypography, closeButton } from "../../styles/shared.ts";
import "./icon.ts";

const severityIconMap: Record<string, string> = {
  informational: "info",
  success: "success",
  warning: "warning",
  error: "error",
};

export class MetroInfoBar extends LitElement {
  static properties = {
    severity: { type: String, reflect: true },
    title: { type: String, reflect: true },
    closable: { type: Boolean, reflect: true },
  };

  declare severity: "informational" | "success" | "warning" | "error";
  declare title: string;
  declare closable: boolean;

  static styles = [
    baseTypography,
    closeButton,
    css`
      :host {
        display: block;
      }
      .info-bar {
        display: flex;
        align-items: center;
        gap: var(--metro-spacing-md, 12px);
        padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        border-left: 4px solid
          var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
      }
      .info-bar.informational {
        border-left-color: var(--metro-accent, #0078d4);
      }
      .info-bar.success {
        border-left-color: #00a300;
      }
      .info-bar.warning {
        border-left-color: #f09609;
      }
      .info-bar.error {
        border-left-color: #e51400;
      }
      .info-icon {
        font-size: 20px;
        flex-shrink: 0;
      }
      .info-content {
        flex: 1;
      }
      .info-title {
        font-size: var(--metro-font-size-normal, 14px);
        font-weight: 600;
        color: var(--metro-foreground, #ffffff);
        margin-bottom: 2px;
      }
      .info-message {
        font-size: var(--metro-font-size-small, 12px);
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      }
      .close-btn {
        font-size: 16px;
      }
    `,
  ];

  constructor() {
    super();
    this.severity = "informational";
    this.title = "";
    this.closable = true;
  }

  render() {
    return html`
      <div class="info-bar ${this.severity}" role="alert">
        <metro-icon
          class="info-icon"
          icon=${severityIconMap[this.severity]}
          size="large"
        ></metro-icon>
        <div class="info-content">
          ${this.title ? html`<div class="info-title">${this.title}</div>` : ""}
          <div class="info-message"><slot></slot></div>
        </div>
        ${this.closable
          ? html`<button
              class="close-btn"
              @click=${this.#close}
              aria-label="Close"
            >
              <metro-icon icon="close" size="normal"></metro-icon>
            </button>`
          : ""}
      </div>
    `;
  }

  #close(): void {
    this.dispatchEvent(new CustomEvent("close", { bubbles: true }));
    this.remove();
  }
}

customElements.define("metro-info-bar", MetroInfoBar);

declare global {
  interface HTMLElementTagNameMap {
    "metro-info-bar": MetroInfoBar;
  }
}
