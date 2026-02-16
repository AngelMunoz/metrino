import { LitElement, html, css, type PropertyValues } from "lit";
import { focusRing, pressState, disabledState } from "../../styles/shared.ts";
import {
  updateAriaDisabled,
  setupButtonRole,
  createButtonHandlers,
  bindButtonEvents,
  unbindButtonEvents,
  type ButtonEventHandlers,
} from "./shared.ts";

export class MetroButton extends LitElement {
  static properties = {
    disabled: { type: Boolean, reflect: true },
    accent: { type: String, reflect: true },
  };

  declare disabled: boolean;
  declare accent: string | undefined;

  static styles = [
    focusRing,
    pressState,
    disabledState,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(
          --metro-font-family,
          "Segoe UI",
          system-ui,
          sans-serif
        );
        font-size: var(--metro-font-size-normal, 14px);
        font-weight: 400;
        letter-spacing: 0.02em;
        padding: 10px 22px;
        min-width: 120px;
        min-height: 40px;
        border: 2px solid var(--metro-foreground, #fff);
        background: transparent;
        color: var(--metro-foreground, #fff);
        cursor: pointer;
        text-align: center;
        user-select: none;
        box-sizing: border-box;
        transition:
          background-color var(--metro-transition-fast, 167ms) ease-out,
          border-color var(--metro-transition-fast, 167ms) ease-out;
      }

      :host(:hover) {
        background: var(--metro-foreground, #fff);
        color: var(--metro-background, #1f1f1f);
      }

      :host([accent]) {
        background: var(--metro-accent, #0078d4);
        border-color: var(--metro-accent, #0078d4);
        color: #fff;
      }

      :host([accent]:hover) {
        background: var(--metro-accent-light, #429ce3);
        border-color: var(--metro-accent-light, #429ce3);
        color: #fff;
      }

      :host([accent].pressed) {
        background: var(--metro-accent-dark, #005a9e);
        border-color: var(--metro-accent-dark, #005a9e);
        color: #fff;
      }

      :host(.pressed) {
        background: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
        border-color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
        color: var(--metro-background, #1f1f1f);
      }
    `,
  ];

  #handlers: ButtonEventHandlers;

  constructor() {
    super();
    this.disabled = false;
    this.#handlers = createButtonHandlers(this);
  }

  render() {
    return html`<slot></slot>`;
  }

  connectedCallback(): void {
    super.connectedCallback();
    setupButtonRole(this, this.disabled);
    bindButtonEvents(this, this.#handlers);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    unbindButtonEvents(this, this.#handlers);
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("disabled")) {
      updateAriaDisabled(this, this.disabled);
    }
  }
}

customElements.define("metro-button", MetroButton);

declare global {
  interface HTMLElementTagNameMap {
    "metro-button": MetroButton;
  }
}
