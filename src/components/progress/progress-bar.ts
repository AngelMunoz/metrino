import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

export class MetroProgressBar extends LitElement {
  static properties = {
    value: { type: Number, reflect: true },
    maximum: { type: Number },
    indeterminate: { type: Boolean, reflect: true },
    showLabel: { type: Boolean },
  };

  declare value: number;
  declare maximum: number;
  declare indeterminate: boolean;
  declare showLabel: boolean;

  static styles = [
    baseTypography,
    css`
      :host {
        display: block;
      }

      .progress-container.determinate {
        width: 100%;
        height: 4px;
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        position: relative;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        background: var(--metro-accent, #0078d4);
        transition: width var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }

      .progress-container.indeterminate {
        width: 100%;
        height: 4px;
        background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
        position: relative;
        overflow: hidden;
      }

      /*
       * Windows 8 Metro indeterminate progress bar:
       * 5 small dots travel left-to-right, accelerating in the center
       * and decelerating at the edges before fading out and reappearing.
       */
      .indeterminate-dot {
        position: absolute;
        top: 0;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: var(--metro-accent, #0078d4);
        animation: dot-flow 2.4s cubic-bezier(0.7, 0.0, 0.3, 1.0) infinite;
      }

      .indeterminate-dot:nth-child(1) { animation-delay: 0s; }
      .indeterminate-dot:nth-child(2) { animation-delay: 0.22s; }
      .indeterminate-dot:nth-child(3) { animation-delay: 0.44s; }
      .indeterminate-dot:nth-child(4) { animation-delay: 0.66s; }
      .indeterminate-dot:nth-child(5) { animation-delay: 0.88s; }

      @keyframes dot-flow {
        0% {
          left: -2%;
          opacity: 0;
        }
        5% {
          opacity: 1;
        }
        50% {
          opacity: 1;
        }
        95% {
          opacity: 1;
        }
        100% {
          left: 100%;
          opacity: 0;
        }
      }

      .progress-label {
        font-size: var(--metro-font-size-small, 12px);
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        margin-top: var(--metro-spacing-xs, 4px);
        text-align: center;
      }
    `,
  ];

  constructor() {
    super();
    this.value = 0;
    this.maximum = 100;
    this.indeterminate = false;
    this.showLabel = false;
  }

  render() {
    const percent = this.indeterminate ? 0 : Math.min((this.value / this.maximum) * 100, 100);

    return html`
      ${this.indeterminate
        ? html`
          <div class="progress-container indeterminate" role="progressbar" aria-busy="true">
            <div class="indeterminate-dot"></div>
            <div class="indeterminate-dot"></div>
            <div class="indeterminate-dot"></div>
            <div class="indeterminate-dot"></div>
            <div class="indeterminate-dot"></div>
          </div>
        `
        : html`
          <div
            class="progress-container determinate"
            role="progressbar"
            aria-valuenow="${this.value}"
            aria-valuemax="${this.maximum}"
          >
            <div class="progress-fill" style="width: ${percent}%"></div>
          </div>
          ${this.showLabel ? html`<div class="progress-label">${Math.round(percent)}%</div>` : ""}
        `
      }
    `;
  }
}

customElements.define("metro-progress-bar", MetroProgressBar);

declare global {
  interface HTMLElementTagNameMap {
    "metro-progress-bar": MetroProgressBar;
  }
}
