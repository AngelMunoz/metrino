import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: block;
    font-family: var(--metro-font-family, system-ui, -apple-system, sans-serif);
  }

  .progress-container.determinate {
    width: 100%;
    height: 4px;
    background: var(--metro-highlight, rgba(255,255,255,0.1));
    position: relative;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    background: var(--metro-accent, #0078d4);
    transition: width var(--metro-transition-fast, 167ms) ease-out;
  }

  .progress-container.indeterminate {
    width: 100%;
    height: 4px;
    position: relative;
    overflow: hidden;
  }

  .indeterminate-dots {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .indeterminate-dot {
    position: absolute;
    width: 4px;
    height: 4px;
    background: var(--metro-accent, #0078d4);
    border-radius: 2px;
    top: 0;
    animation: indeterminate-travel 2.4s linear infinite;
  }

  .indeterminate-dot:nth-child(1) { animation-delay: 0s; }
  .indeterminate-dot:nth-child(2) { animation-delay: 0.12s; }
  .indeterminate-dot:nth-child(3) { animation-delay: 0.24s; }
  .indeterminate-dot:nth-child(4) { animation-delay: 0.36s; }
  .indeterminate-dot:nth-child(5) { animation-delay: 0.48s; }

  @keyframes indeterminate-travel {
    0% {
      left: 0%;
      width: 4px;
      opacity: 0.2;
    }
    5% {
      opacity: 1;
    }
    20% {
      left: 20%;
      width: 4px;
    }
    40% {
      left: 40%;
      width: 4px;
    }
    50% {
      left: 50%;
      width: 16px;
    }
    60% {
      left: 60%;
      width: 4px;
    }
    80% {
      left: 80%;
      width: 4px;
    }
    95% {
      opacity: 1;
    }
    100% {
      left: 100%;
      width: 4px;
      opacity: 0.2;
    }
  }

  .progress-label {
    font-size: var(--metro-font-size-small, 12px);
    color: var(--metro-foreground-secondary, rgba(255,255,255,0.7));
    margin-top: var(--metro-spacing-xs, 4px);
    text-align: center;
  }
`;

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

  static styles = baseStyles;

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
            <div class="indeterminate-dots">
              <div class="indeterminate-dot"></div>
              <div class="indeterminate-dot"></div>
              <div class="indeterminate-dot"></div>
              <div class="indeterminate-dot"></div>
              <div class="indeterminate-dot"></div>
            </div>
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
