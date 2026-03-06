import { LitElement, html, css } from "lit";
import "../components/api-docs.ts";
import "@src/components/progress/progress-bar.ts";
import "@src/components/progress/progress-ring.ts";
import "@src/components/input/slider.ts";
import "@src/components/buttons/button.ts";

export class MetrinoProgressPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--metro-spacing-xl, 24px);
      font-family: var(
        --metro-font-family,
        system-ui,
        -apple-system,
        "Segoe UI",
        sans-serif
      );
      color: var(--metro-foreground, #ffffff);
      background: var(--metro-background, #1f1f1f);
      min-height: 100vh;
      max-width: 1200px;
      margin: 0 auto;
    }

    h1 {
      font-size: var(--metro-font-size-xxlarge, 42px);
      font-weight: 200;
      margin-bottom: var(--metro-spacing-xl, 24px);
    }

    h2 {
      font-size: 24px;
      font-weight: 200;
      margin-top: var(--metro-spacing-xl, 24px);
      margin-bottom: var(--metro-spacing-md, 12px);
      color: var(--metro-accent, #0078d4);
    }

    .section {
      margin-bottom: var(--metro-spacing-xl, 24px);
    }

    .demo-row {
      display: flex;
      gap: var(--metro-spacing-lg, 16px);
      margin-bottom: var(--metro-spacing-md, 12px);
      flex-wrap: wrap;
    }

    .demo-item {
      flex: 1;
      min-width: 200px;
    }

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

    .code-example {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
      padding: var(--metro-spacing-md, 12px);
      margin-top: var(--metro-spacing-md, 12px);
      font-family: "Courier New", monospace;
      font-size: var(--metro-font-size-small, 12px);
      overflow-x: auto;
      border-left: 3px solid var(--metro-accent, #0078d4);
    }

    .progress-value {
      font-size: var(--metro-font-size-medium, 16px);
      font-weight: 600;
      color: var(--metro-accent, #0078d4);
      margin-bottom: var(--metro-spacing-xs, 4px);
    }
  `;

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
      <h1>Progress Components</h1>

      <div class="section">
        <h2>Progress Bar - Determinate</h2>
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

        <div class="code-example">
          &lt;metro-progress-bar value="${this.progressValue}"
          showLabel&gt;&lt;/metro-progress-bar&gt;
        </div>
        <api-docs component="MetroProgressBar"></api-docs>
      </div>

      <div class="section">
        <h2>Progress Bar - Indeterminate</h2>
        <metro-progress-bar indeterminate></metro-progress-bar>

        <div class="code-example">
          &lt;metro-progress-bar indeterminate&gt;&lt;/metro-progress-bar&gt;
        </div>
      </div>

      <div class="section">
        <h2>Progress Ring - All Sizes</h2>
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

        <div class="code-example">
          &lt;metro-progress-ring
          size="small"&gt;&lt;/metro-progress-ring&gt;<br />
          &lt;metro-progress-ring
          size="normal"&gt;&lt;/metro-progress-ring&gt;<br />
          &lt;metro-progress-ring size="large"&gt;&lt;/metro-progress-ring&gt;
        </div>
        <api-docs component="MetroProgressRing"></api-docs>
      </div>

      <div class="section">
        <h2>API Reference</h2>
        <div class="code-example">
          <strong>MetroProgressBar</strong><br />
          Properties:<br />
          - value: number (0-100, default: 0)<br />
          - maximum: number (default: 100)<br />
          - indeterminate: boolean (default: false)<br />
          - showLabel: boolean (default: false)<br /><br />
          <strong>MetroProgressRing</strong><br />
          Properties:<br />
          - size: "small" | "normal" | "large" (default: "normal")
        </div>
      </div>
    `;
  }
}

customElements.define("metrino-progress-page", MetrinoProgressPage);
