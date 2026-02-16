import { LitElement, html, css } from "lit";

const baseStyles = css`
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
    width: 40px;
    height: 40px;
  }

  .ring-dot {
    position: absolute;
    width: 4px;
    height: 4px;
    background: var(--metro-accent, #0078d4);
    border-radius: 2px;
    top: 50%;
    left: 50%;
    margin-top: -2px;
    margin-left: -2px;
    animation: ring-travel 2.4s linear infinite;
  }

  .ring-dot:nth-child(1) { animation-delay: 0s; }
  .ring-dot:nth-child(2) { animation-delay: 0.12s; }
  .ring-dot:nth-child(3) { animation-delay: 0.24s; }
  .ring-dot:nth-child(4) { animation-delay: 0.36s; }
  .ring-dot:nth-child(5) { animation-delay: 0.48s; }

  @keyframes ring-travel {
    0% {
      transform: rotate(0deg) translateY(-16px) scaleX(1);
      opacity: 0.2;
    }
    5% {
      opacity: 1;
    }
    20% {
      transform: rotate(72deg) translateY(-16px) scaleX(1);
    }
    40% {
      transform: rotate(144deg) translateY(-16px) scaleX(1);
    }
    50% {
      transform: rotate(180deg) translateY(-16px) scaleX(4);
    }
    60% {
      transform: rotate(216deg) translateY(-16px) scaleX(1);
    }
    80% {
      transform: rotate(288deg) translateY(-16px) scaleX(1);
    }
    95% {
      opacity: 1;
    }
    100% {
      transform: rotate(360deg) translateY(-16px) scaleX(1);
      opacity: 0.2;
    }
  }

  :host([size="small"]) .ring-container {
    width: 24px;
    height: 24px;
  }

  :host([size="small"]) .ring-dot {
    width: 3px;
    height: 3px;
    margin-top: -1.5px;
    margin-left: -1.5px;
  }

  @keyframes ring-travel-small {
    0% {
      transform: rotate(0deg) translateY(-10px) scaleX(1);
      opacity: 0.2;
    }
    5% {
      opacity: 1;
    }
    20% {
      transform: rotate(72deg) translateY(-10px) scaleX(1);
    }
    40% {
      transform: rotate(144deg) translateY(-10px) scaleX(1);
    }
    50% {
      transform: rotate(180deg) translateY(-10px) scaleX(4);
    }
    60% {
      transform: rotate(216deg) translateY(-10px) scaleX(1);
    }
    80% {
      transform: rotate(288deg) translateY(-10px) scaleX(1);
    }
    95% {
      opacity: 1;
    }
    100% {
      transform: rotate(360deg) translateY(-10px) scaleX(1);
      opacity: 0.2;
    }
  }

  :host([size="small"]) .ring-dot {
    animation: ring-travel-small 2.4s linear infinite;
  }

  :host([size="large"]) .ring-container {
    width: 60px;
    height: 60px;
  }

  :host([size="large"]) .ring-dot {
    width: 5px;
    height: 5px;
    margin-top: -2.5px;
    margin-left: -2.5px;
  }

  @keyframes ring-travel-large {
    0% {
      transform: rotate(0deg) translateY(-26px) scaleX(1);
      opacity: 0.2;
    }
    5% {
      opacity: 1;
    }
    20% {
      transform: rotate(72deg) translateY(-26px) scaleX(1);
    }
    40% {
      transform: rotate(144deg) translateY(-26px) scaleX(1);
    }
    50% {
      transform: rotate(180deg) translateY(-26px) scaleX(5);
    }
    60% {
      transform: rotate(216deg) translateY(-26px) scaleX(1);
    }
    80% {
      transform: rotate(288deg) translateY(-26px) scaleX(1);
    }
    95% {
      opacity: 1;
    }
    100% {
      transform: rotate(360deg) translateY(-26px) scaleX(1);
      opacity: 0.2;
    }
  }

  :host([size="large"]) .ring-dot {
    animation: ring-travel-large 2.4s linear infinite;
  }
`;

export class MetroProgressRing extends LitElement {
  static properties = {
    size: { type: String, reflect: true },
  };

  declare size: "small" | "normal" | "large";

  static styles = baseStyles;

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
