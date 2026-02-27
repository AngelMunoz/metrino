import { LitElement, html, css } from "lit";
import "../../../src/components/buttons/button.ts";

export class PageDesignMotion extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .page-title {
      font-size: var(--metro-font-size-xxlarge, 42px);
      font-weight: 200;
      letter-spacing: -0.02em;
      margin-bottom: var(--metro-spacing-md);
    }
    .page-description {
      font-size: var(--metro-font-size-medium, 16px);
      color: var(--metro-foreground-secondary);
      margin-bottom: var(--metro-spacing-xxl);
      max-width: 800px;
    }
    .section {
      margin-bottom: var(--metro-spacing-xxl);
    }
    .section-title {
      font-size: var(--metro-font-size-xlarge, 28px);
      font-weight: 200;
      margin-bottom: var(--metro-spacing-lg);
      padding-bottom: var(--metro-spacing-sm);
      border-bottom: 2px solid var(--metro-accent);
      display: inline-block;
    }
    .timing-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--metro-spacing-md);
      margin-bottom: var(--metro-spacing-xl);
    }
    .timing-card {
      background: var(--metro-highlight);
      padding: var(--metro-spacing-lg);
      text-align: center;
    }
    .timing-value {
      font-size: var(--metro-font-size-xxlarge);
      font-weight: 200;
      color: var(--metro-accent);
    }
    .timing-label {
      font-size: var(--metro-font-size-medium);
      margin-top: var(--metro-spacing-sm);
    }
    .timing-usage {
      font-size: var(--metro-font-size-small);
      color: var(--metro-foreground-secondary);
      margin-top: var(--metro-spacing-xs);
    }
    .easing-demo {
      background: var(--metro-highlight);
      padding: var(--metro-spacing-lg);
      margin-bottom: var(--metro-spacing-lg);
    }
    .easing-bar {
      height: 4px;
      background: var(--metro-accent);
      width: 0;
      transition: width 500ms cubic-bezier(0.1, 0.9, 0.2, 1);
    }
    .easing-bar.running {
      width: 100%;
    }
    .code-block {
      background: var(--metro-background);
      padding: var(--metro-spacing-md);
      font-family: "SF Mono", "Fira Code", monospace;
      font-size: var(--metro-font-size-small);
      margin: var(--metro-spacing-md) 0;
    }
    .animation-demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--metro-spacing-md);
    }
    .animation-demo {
      background: var(--metro-highlight);
      padding: var(--metro-spacing-lg);
    }
    .animation-demo h4 {
      font-size: var(--metro-font-size-medium);
      margin-bottom: var(--metro-spacing-sm);
    }
    .animation-demo p {
      font-size: var(--metro-font-size-small);
      color: var(--metro-foreground-secondary);
      margin-bottom: var(--metro-spacing-md);
    }
    .animation-target {
      background: var(--metro-accent);
      color: white;
      padding: var(--metro-spacing-md);
      text-align: center;
      font-size: var(--metro-font-size-small);
    }
    @keyframes demo-fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes demo-slide-up {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes demo-turnstile {
      from { opacity: 0; transform: perspective(500px) rotateY(10deg); }
      to { opacity: 1; transform: perspective(500px) rotateY(0); }
    }
    .animate-fade { animation: demo-fade var(--metro-transition-normal) var(--metro-easing) forwards; }
    .animate-slide { animation: demo-slide-up var(--metro-transition-slow) var(--metro-easing) forwards; }
    .animate-turnstile { animation: demo-turnstile 450ms var(--metro-easing) forwards; }
    @media (max-width: 600px) {
      .timing-grid {
        grid-template-columns: 1fr;
      }
    }
  `;

  #playAnimation(targetClass: string): void {
    const targets = this.shadowRoot?.querySelectorAll(`.${targetClass}`);
    targets?.forEach(el => {
      el.classList.remove('animate-fade', 'animate-slide', 'animate-turnstile');
      void (el as HTMLElement).offsetWidth;
      el.classList.add(targetClass.replace('demo-', 'animate-'));
    });
  }

  #playEasing(): void {
    const bar = this.shadowRoot?.querySelector('.easing-bar');
    if (bar) {
      bar.classList.remove('running');
      void (bar as HTMLElement).offsetWidth;
      bar.classList.add('running');
    }
  }

  render() {
    return html`
      <h1 class="page-title">Motion & Animation</h1>
      <p class="page-description">
        Motion in Metro is fast, fluid, and purposeful. Animations guide users 
        through the interface and provide feedback on their actions.
      </p>

      <div class="section">
        <h2 class="section-title">Timing</h2>
        <p style="margin-bottom: var(--metro-spacing-lg); color: var(--metro-foreground-secondary);">
          Metro uses three standard durations for all animations.
        </p>
        <div class="timing-grid">
          <div class="timing-card">
            <div class="timing-value">167ms</div>
            <div class="timing-label">Fast</div>
            <div class="timing-usage">Hover states, small UI changes</div>
          </div>
          <div class="timing-card">
            <div class="timing-value">250ms</div>
            <div class="timing-label">Normal</div>
            <div class="timing-usage">Standard transitions, panel opens</div>
          </div>
          <div class="timing-card">
            <div class="timing-value">333ms</div>
            <div class="timing-label">Slow</div>
            <div class="timing-usage">Page transitions, tile animations</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Easing</h2>
        <p style="margin-bottom: var(--metro-spacing-md); color: var(--metro-foreground-secondary);">
          Metro uses a custom easing curve that creates snappy, responsive animations.
        </p>
        <div class="easing-demo">
          <p style="margin-bottom: var(--metro-spacing-md);">
            <code style="font-family: monospace; color: var(--metro-accent);">
              cubic-bezier(0.1, 0.9, 0.2, 1)
            </code>
          </p>
          <metro-button @click=${this.#playEasing}>Play Easing</metro-button>
          <div style="margin-top: var(--metro-spacing-md);">
            <div class="easing-bar"></div>
          </div>
        </div>
        <div class="code-block">
          <code>--metro-transition-fast: 167ms;
--metro-transition-normal: 250ms;
--metro-transition-slow: 333ms;
--metro-easing: cubic-bezier(0.1, 0.9, 0.2, 1);</code>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Animation Types</h2>
        <div class="animation-demo-grid">
          <div class="animation-demo">
            <h4>Fade In</h4>
            <p>Simple opacity transition for subtle entrances.</p>
            <metro-button @click=${() => this.#playAnimation('demo-fade')}>Play</metro-button>
            <div class="animation-target demo-fade" style="margin-top: var(--metro-spacing-md);">
              Faded in
            </div>
          </div>
          <div class="animation-demo">
            <h4>Slide Up</h4>
            <p>Content enters from below with fade.</p>
            <metro-button @click=${() => this.#playAnimation('demo-slide')}>Play</metro-button>
            <div class="animation-target demo-slide" style="margin-top: var(--metro-spacing-md);">
              Slid up
            </div>
          </div>
          <div class="animation-demo">
            <h4>Turnstile</h4>
            <p>3D rotation for page transitions.</p>
            <metro-button @click=${() => this.#playAnimation('demo-turnstile')}>Play</metro-button>
            <div class="animation-target demo-turnstile" style="margin-top: var(--metro-spacing-md);">
              Turnstile
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">CSS Classes</h2>
        <p style="margin-bottom: var(--metro-spacing-md); color: var(--metro-foreground-secondary);">
          Apply these classes to animate elements. Import animations.css to use them.
        </p>
        <div class="code-block">
          <code>/* Import animations */
@import "metrino/styles.css";

/* Use animation classes */
&lt;div class="metro-animate-fade-in"&gt;...&lt;/div&gt;
&lt;div class="metro-animate-slide-up"&gt;...&lt;/div&gt;
&lt;div class="metro-animate-turnstile-in"&gt;...&lt;/div&gt;

/* Stagger children */
&lt;div class="metro-entrance-stagger"&gt;
  &lt;div&gt;Item 1&lt;/div&gt;
  &lt;div&gt;Item 2&lt;/div&gt;
  &lt;div&gt;Item 3&lt;/div&gt;
&lt;/div&gt;</code>
        </div>
      </div>
    `;
  }
}

customElements.define("page-design-motion", PageDesignMotion);
