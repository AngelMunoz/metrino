import { LitElement, html, css } from "lit";
import { reducedMotionBlanket } from "@src/styles/shared.ts";
import { pageStyles, SHOWCASE_COLUMNS } from "../styles/page.ts";
import "../components/api-docs.ts";
import { registerMetroGrid } from "@src/components/layout/grid.ts";
import { registerMetroProgressBar } from "@src/components/progress/progress-bar.ts";
import { registerMetroProgressRing } from "@src/components/progress/progress-ring.ts";
import { registerMetroSlider } from "@src/components/input/slider.ts";
import { registerMetroButton } from "@src/components/buttons/button.ts";

registerMetroProgressBar();
registerMetroProgressRing();
registerMetroSlider();
registerMetroButton();
registerMetroGrid();

export class MetrinoProgressPage extends LitElement {
  static styles = [
    reducedMotionBlanket,
    pageStyles,
    css`
    .controls {
      display: flex;
      gap: var(--metro-spacing-sm, 8px);
      margin-bottom: var(--metro-spacing-md, 12px);
      flex-wrap: wrap;
    }

    .label {
      font-size: var(--metro-font-size-small, 12px);
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      margin-bottom: var(--metro-spacing-xs, 4px);
    }

    .slider-container {
      margin: var(--metro-spacing-md, 12px) 0;
    }

    .ring-row {
      display: flex;
      align-items: center;
      gap: var(--metro-spacing-xl, 24px);
      padding: var(--metro-spacing-md, 12px);
      background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
      padding: var(--metro-spacing-lg, 16px);
    }

    .ring-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--metro-spacing-sm, 8px);
    }

    .progress-value {
      font-size: var(--metro-font-size-medium, 16px);
      font-weight: 600;
      color: var(--metro-accent, #0078d4);
      margin-bottom: var(--metro-spacing-xs, 4px);
    }
    `,
  ];

  static properties = {
    progressValue: { state: true },
    isAnimating: { state: true },
  };

  declare progressValue: number;
  declare isAnimating: boolean;

  #animationTimer: number | null = null;

  constructor() {
    super();
    this.progressValue = 0;
    this.isAnimating = false;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#stopAnimation();
  }

  #handleSliderChange(e: CustomEvent): void {
    this.progressValue = e.detail.value;
  }

  #startAnimation(): void {
    this.isAnimating = true;
    this.#animationTimer = window.setInterval(() => {
      this.progressValue = (this.progressValue + 1) % 101;
    }, 50);
  }

  #stopAnimation(): void {
    this.isAnimating = false;
    if (this.#animationTimer !== null) {
      clearInterval(this.#animationTimer);
      this.#animationTimer = null;
    }
  }

  #resetProgress(): void {
    this.#stopAnimation();
    this.progressValue = 0;
  }

  render() {
    return html`
      <h1 class="page-title">Progress Components</h1>

      <metro-grid class="demo-grid" columns=${SHOWCASE_COLUMNS}>
      <div class="demo-card">
        <h2 class="component-title">Progress Bar - Determinate</h2>
        <div class="progress-value">${this.progressValue}%</div>
        <metro-progress-bar
          .value=${this.progressValue}
          showLabel
        ></metro-progress-bar>

        <div class="slider-container">
          <div class="label">Control Progress</div>
          <metro-slider
            .value=${this.progressValue}
            min="0"
            max="100"
            step="1"
            @change=${this.#handleSliderChange}
          ></metro-slider>
        </div>

        <div class="controls">
          <metro-button
            @click=${this.#startAnimation}
            ?disabled=${this.isAnimating}
          >
            Start Animation
          </metro-button>
          <metro-button
            @click=${this.#stopAnimation}
            ?disabled=${!this.isAnimating}
          >
            Stop Animation
          </metro-button>
          <metro-button @click=${this.#resetProgress}> Reset </metro-button>
        </div>

        <pre class="code-snippet">&lt;metro-progress-bar value="${this.progressValue}" showLabel&gt;&lt;/metro-progress-bar&gt;</pre>
        <api-docs component="MetroProgressBar"></api-docs>
      </div>

      <div class="demo-card">
        <h2 class="component-title">Progress Bar - Indeterminate</h2>
        <metro-progress-bar indeterminate></metro-progress-bar>

        <pre class="code-snippet">&lt;metro-progress-bar indeterminate&gt;&lt;/metro-progress-bar&gt;</pre>
      </div>

      <div class="demo-card">
        <h2 class="component-title">Progress Ring - All Sizes</h2>
        <div class="ring-row">
          <div class="ring-item">
            <metro-progress-ring size="small"></metro-progress-ring>
            <div class="label">Small</div>
          </div>
          <div class="ring-item">
            <metro-progress-ring size="normal"></metro-progress-ring>
            <div class="label">Normal</div>
          </div>
          <div class="ring-item">
            <metro-progress-ring size="large"></metro-progress-ring>
            <div class="label">Large</div>
          </div>
        </div>

        <pre class="code-snippet">&lt;metro-progress-ring size="small"&gt;&lt;/metro-progress-ring&gt;
&lt;metro-progress-ring size="normal"&gt;&lt;/metro-progress-ring&gt;
&lt;metro-progress-ring size="large"&gt;&lt;/metro-progress-ring&gt;</pre>
        <api-docs component="MetroProgressRing"></api-docs>
      </div>

      <div class="demo-card">
        <h2 class="component-title">API Reference</h2>
        <pre class="code-snippet"><strong>MetroProgressBar</strong>
Properties:
- value: number (0-100, default: 0)
- maximum: number (default: 100)
- indeterminate: boolean (default: false)
- showLabel: boolean (default: false)

<strong>MetroProgressRing</strong>
Properties:
- size: "small" | "normal" | "large" (default: "normal")</pre>
      </div>
      </metro-grid>
    `;
  }
}

customElements.define("metrino-progress-page", MetrinoProgressPage);
