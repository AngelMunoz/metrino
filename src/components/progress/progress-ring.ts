import { LitElement, html, css } from "lit";

export class MetroProgressRing extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  declare size: "small" | "normal" | "large";

  static styles = css`
    :host {
      display: inline-block;
    }

    .progress-ring {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .ring-container {
      position: relative;
      width: 20px;
      height: 20px;
    }

    .ring-dot {
      position: absolute;
      width: 2px;
      height: 2px;
      background: var(--metro-accent, #0078d4);
      border-radius: 50%;
      top: 50%;
      left: 50%;
      margin-left: -1px;
      margin-top: -1px;
      animation: orbit-small 3s cubic-bezier(0.7, 0.0, 0.3, 1.0) infinite;
    }

    /*
     * Windows 8 Metro progress ring: 5 dots orbit independently.
     * ease-in-out causes dots to accelerate through the top and
     * decelerate at the bottom, creating the signature
     * clumping/spreading "comet tail" effect.
     * Staggered delays space the dots apart.
     */
    .ring-dot:nth-child(1) { animation-delay: 0s; }
    .ring-dot:nth-child(2) { animation-delay: -0.20s; }
    .ring-dot:nth-child(3) { animation-delay: -0.40s; }
    .ring-dot:nth-child(4) { animation-delay: -0.60s; }
    .ring-dot:nth-child(5) { animation-delay: -0.80s; }

    /* Small size orbit - radius 9px */
    @keyframes orbit-small {
      0%   { transform: rotate(0deg) translateY(-9px); opacity: 1; }
      50%  { transform: rotate(180deg) translateY(-9px); opacity: 1; }
      100% { transform: rotate(360deg) translateY(-9px); opacity: 1; }
    }

    /* Normal size - 32px */
    :host([size="normal"]) .ring-container {
      width: 32px;
      height: 32px;
    }
    :host([size="normal"]) .ring-dot {
      width: 3px;
      height: 3px;
      margin-left: -1.5px;
      margin-top: -1.5px;
      animation-name: orbit-normal;
      animation-timing-function: cubic-bezier(0.7, 0.0, 0.3, 1.0);
    }

    /* Normal orbit - radius 14px */
    @keyframes orbit-normal {
      0%   { transform: rotate(0deg) translateY(-14px); opacity: 1; }
      50%  { transform: rotate(180deg) translateY(-14px); opacity: 1; }
      100% { transform: rotate(360deg) translateY(-14px); opacity: 1; }
    }

    /* Large size - 48px */
    :host([size="large"]) .ring-container {
      width: 48px;
      height: 48px;
    }
    :host([size="large"]) .ring-dot {
      width: 4px;
      height: 4px;
      margin-left: -2px;
      margin-top: -2px;
      animation-name: orbit-large;
      animation-timing-function: cubic-bezier(0.7, 0.0, 0.3, 1.0);
    }

    /* Large orbit - radius 21px */
    @keyframes orbit-large {
      0%   { transform: rotate(0deg) translateY(-21px); opacity: 1; }
      50%  { transform: rotate(180deg) translateY(-21px); opacity: 1; }
      100% { transform: rotate(360deg) translateY(-21px); opacity: 1; }
    }
  `;

  constructor() {
    super();
    this.size = "normal";
  }

  render() {
    return html`
      <div class="progress-ring">
        <div class="ring-container">
          <div class="ring-dot"></div>
          <div class="ring-dot"></div>
          <div class="ring-dot"></div>
          <div class="ring-dot"></div>
          <div class="ring-dot"></div>
        </div>
      </div>
    `;
  }
}

customElements.define("metro-progress-ring", MetroProgressRing);

declare global {
  interface HTMLElementTagNameMap {
    "metro-progress-ring": MetroProgressRing;
  }
}
