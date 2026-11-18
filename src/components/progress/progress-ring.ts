import { LitElement, html, css } from "lit";
import { reducedMotionBlanket } from "../../styles/shared.ts";
import { animationKeyframes } from "../../utils/animations.ts";

export class MetroProgressRing extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  declare size: "small" | "normal" | "large";

  // The orbit keyframes are the shared ones in `styles/animations.css`, adopted here so
  // their names resolve inside this shadow tree. Radius per size: 9px, 14px, 21px.
  static styles = [
    reducedMotionBlanket,
    animationKeyframes,
    css`
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
        animation: metro-ring-orbit-small 3s cubic-bezier(0.7, 0, 0.3, 1) infinite;
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
        animation-name: metro-ring-orbit-normal;
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
        animation-name: metro-ring-orbit-large;
      }
    `,
  ];

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

export function registerMetroProgressRing(): void {
  if (!customElements.get("metro-progress-ring")) {
    customElements.define("metro-progress-ring", MetroProgressRing);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-progress-ring": MetroProgressRing;
  }
}
