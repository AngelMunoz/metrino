import { LitElement, html, css } from "lit";
import type { CSSResultGroup, HTMLTemplateResult } from "lit";

type AnimationType =
  | "metro-animate-fade-in"
  | "metro-animate-fade-out"
  | "metro-animate-slide-up"
  | "metro-animate-slide-left"
  | "metro-animate-slide-right"
  | "metro-animate-slide-down"
  | "metro-animate-tile-flip"
  | "metro-animate-progress-ring"
  | "metro-entrance-stagger"
  | "metro-animate-turnstile-in"
  | "metro-animate-turnstile-out"
  | "metro-animate-continuum-enter"
  | "metro-animate-continuum-exit"
  | "metro-turnstile-feather"
  | "metro-theme-transition";

interface AnimationOption {
  value: AnimationType;
  label: string;
  category: string;
}

const ANIMATION_OPTIONS: AnimationOption[] = [
  { value: "metro-animate-fade-in", label: "Fade In", category: "Fade" },
  { value: "metro-animate-fade-out", label: "Fade Out", category: "Fade" },
  { value: "metro-animate-slide-up", label: "Slide Up", category: "Slide" },
  { value: "metro-animate-slide-down", label: "Slide Down", category: "Slide" },
  { value: "metro-animate-slide-left", label: "Slide Left", category: "Slide" },
  { value: "metro-animate-slide-right", label: "Slide Right", category: "Slide" },
  { value: "metro-animate-tile-flip", label: "Tile Flip", category: "3D" },
  { value: "metro-animate-progress-ring", label: "Progress Ring Spin", category: "Motion" },
  { value: "metro-entrance-stagger", label: "Entrance Stagger", category: "Entrance" },
  { value: "metro-animate-turnstile-in", label: "Turnstile In", category: "3D" },
  { value: "metro-animate-turnstile-out", label: "Turnstile Out", category: "3D" },
  { value: "metro-animate-continuum-enter", label: "Continuum Enter", category: "Entrance" },
  { value: "metro-animate-continuum-exit", label: "Continuum Exit", category: "Exit" },
  { value: "metro-turnstile-feather", label: "Turnstile Feather", category: "3D" },
  { value: "metro-theme-transition", label: "Theme Wipe", category: "Transition" },
];

type EasingType = "metro-easing" | "linear" | "ease-in" | "ease-out";

const EASING_OPTIONS: { value: EasingType; label: string }[] = [
  { value: "metro-easing", label: "Metro (cubic-bezier(0.1, 0.9, 0.2, 1))" },
  { value: "linear", label: "Linear" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
];

export class MetrinoAnimationsPage extends LitElement {
  static styles: CSSResultGroup = css`
    :host {
      display: block;
      font-family: var(--metro-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);
      background: var(--metro-background, #1f1f1f);
      color: var(--metro-foreground, #ffffff);
      padding: var(--metro-spacing-xl, 24px);
      min-height: 100vh;
    }

    .page-title {
      font-size: 42px;
      font-weight: 200;
      margin: 0 0 var(--metro-spacing-xl, 24px) 0;
      letter-spacing: -0.5px;
      color: var(--metro-foreground, #ffffff);
    }

    .content-grid {
      display: grid;
      grid-template-columns: 320px 1fr;
      gap: var(--metro-spacing-xl, 24px);
    }

    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
    }

    .controls-panel {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
      padding: 20px;
      border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.1));
    }

    .control-group {
      margin-bottom: var(--metro-spacing-lg, 20px);
    }

    .control-label {
      display: block;
      font-size: var(--metro-font-size-small, 12px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: var(--metro-spacing-sm, 8px);
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
    }

    select {
      width: 100%;
      padding: var(--metro-spacing-sm, 10px) var(--metro-spacing-md, 12px);
      background: var(--metro-background-alt, rgba(0, 0, 0, 0.3));
      border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      color: var(--metro-foreground, #ffffff);
      font-size: var(--metro-font-size-normal, 14px);
      cursor: pointer;
    }

    select:focus {
      outline: none;
      border-color: var(--metro-accent, #0078d4);
    }

    .slider-container {
      display: flex;
      align-items: center;
      gap: var(--metro-spacing-md, 12px);
    }

    input[type="range"] {
      flex: 1;
      height: 4px;
      background: var(--metro-border, rgba(255, 255, 255, 0.2));
      border: none;
      cursor: pointer;
      -webkit-appearance: none;
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 16px;
      height: 16px;
      background: var(--metro-accent, #0078d4);
      cursor: pointer;
    }

    .duration-value {
      min-width: 60px;
      text-align: right;
      font-size: var(--metro-font-size-normal, 14px);
      font-weight: 600;
    }

    .toggle-container {
      display: flex;
      align-items: center;
      gap: var(--metro-spacing-md, 12px);
    }

    .toggle {
      width: 44px;
      height: 22px;
      background: var(--metro-border, rgba(255, 255, 255, 0.2));
      cursor: pointer;
      position: relative;
      transition: background var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
    }

    .toggle.active {
      background: var(--metro-accent, #0078d4);
    }

    .toggle::after {
      content: "";
      position: absolute;
      width: 18px;
      height: 18px;
      background: var(--metro-foreground, #ffffff);
      top: 2px;
      left: 2px;
      transition: transform var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
    }

    .toggle.active::after {
      transform: translateX(22px);
    }

    .play-button {
      width: 100%;
      padding: var(--metro-spacing-md, 14px);
      background: var(--metro-accent, #0078d4);
      color: var(--metro-foreground, #ffffff);
      border: none;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 1px;
      transition: background var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
    }

    .play-button:hover {
      background: #005a9e;
    }

    .play-button:active {
      background: #004578;
    }

    .preview-area {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
      border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.1));
      min-height: 500px;
      display: flex;
      flex-direction: column;
    }

    .preview-header {
      padding: var(--metro-spacing-md, 16px) var(--metro-spacing-lg, 20px);
      background: var(--metro-background-alt, rgba(0, 0, 0, 0.2));
      border-bottom: 2px solid var(--metro-border, rgba(255, 255, 255, 0.1));
      font-size: var(--metro-font-size-normal, 14px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .preview-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      perspective: 1000px;
    }

    .animation-target {
      width: 120px;
      height: 120px;
      background: var(--metro-accent, #0078d4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      color: #ffffff;
      transform-style: preserve-3d;
      backface-visibility: hidden;
    }

    .animation-target.animate-fade-in {
      animation: fadeIn var(--duration, 250ms) var(--easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
    }

    .animation-target.animate-fade-out {
      animation: fadeOut var(--duration, 250ms) var(--easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
    }

    .animation-target.animate-slide-up {
      animation: slideUp var(--duration, 250ms) var(--easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
    }

    .animation-target.animate-slide-down {
      animation: slideDown var(--duration, 250ms) var(--easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
    }

    .animation-target.animate-slide-left {
      animation: slideLeft var(--duration, 250ms) var(--easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
    }

    .animation-target.animate-slide-right {
      animation: slideRight var(--duration, 250ms) var(--easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
    }

    .animation-target.animate-tile-flip {
      animation: tileFlip var(--duration, 333ms) var(--easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
    }

    .animation-target.animate-progress-ring {
      animation: progressRingSpin var(--duration, 167ms) linear infinite;
      border-radius: 50%;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top-color: var(--metro-accent, #0078d4);
      background: transparent;
    }

    .animation-target.animate-turnstile-in {
      animation: turnstileIn var(--duration, 333ms) var(--easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
    }

    .animation-target.animate-turnstile-out {
      animation: turnstileOut var(--duration, 333ms) var(--easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
    }

    .animation-target.animate-continuum-enter {
      animation: continuumEnter var(--duration, 333ms) var(--easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
    }

    .animation-target.animate-continuum-exit {
      animation: continuumExit var(--duration, 333ms) var(--easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
    }

    .animation-target.animate-turnstile-feather {
      animation: turnstileFeather var(--duration, 333ms) var(--easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
    }

    .animation-target.animate-theme-transition {
      animation: themeWipe var(--duration, 333ms) var(--easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeOut {
      from { opacity: 1; }
      to { opacity: 0; }
    }

    @keyframes slideUp {
      from { transform: translateY(100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes slideDown {
      from { transform: translateY(-100px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes slideLeft {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @keyframes slideRight {
      from { transform: translateX(-100px); opacity: 0; }
      to { translateX(0); opacity: 1; }
    }

    @keyframes tileFlip {
      0% { transform: rotateY(0deg); }
      100% { transform: rotateY(180deg); }
    }

    @keyframes progressRingSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes turnstileIn {
      from { transform: rotateY(-90deg); opacity: 0; }
      to { transform: rotateY(0deg); opacity: 1; }
    }

    @keyframes turnstileOut {
      from { transform: rotateY(0deg); opacity: 1; }
      to { transform: rotateY(90deg); opacity: 0; }
    }

    @keyframes continuumEnter {
      from { transform: scale(0.8) rotateY(-15deg); opacity: 0; }
      to { transform: scale(1) rotateY(0deg); opacity: 1; }
    }

    @keyframes continuumExit {
      from { transform: scale(1) rotateY(0deg); opacity: 1; }
      to { transform: scale(0.8) rotateY(15deg); opacity: 0; }
    }

    @keyframes turnstileFeather {
      0% { transform: rotateY(0deg); }
      25% { transform: rotateY(10deg); }
      50% { transform: rotateY(-5deg); }
      75% { transform: rotateY(3deg); }
      100% { transform: rotateY(0deg); }
    }

    @keyframes themeWipe {
      from {
        clip-path: circle(0% at 50% 50%);
        background: var(--metro-accent, #0078d4);
      }
      to {
        clip-path: circle(150% at 50% 50%);
        background: var(--metro-accent, #0078d4);
      }
    }

    .stagger-items {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      width: 100%;
      max-width: 400px;
    }

    .stagger-item {
      height: 80px;
      background: var(--metro-accent, #0078d4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #ffffff;
      opacity: 0;
    }

    .stagger-item.animate {
      animation: staggerIn var(--duration, 250ms) var(--easing, cubic-bezier(0.1, 0.9, 0.2, 1)) forwards;
    }

    .stagger-item:nth-child(1).animate { animation-delay: 0ms; }
    .stagger-item:nth-child(2).animate { animation-delay: 50ms; }
    .stagger-item:nth-child(3).animate { animation-delay: 90ms; }
    .stagger-item:nth-child(4).animate { animation-delay: 125ms; }
    .stagger-item:nth-child(5).animate { animation-delay: 155ms; }
    .stagger-item:nth-child(6).animate { animation-delay: 180ms; }
    .stagger-item:nth-child(7).animate { animation-delay: 200ms; }
    .stagger-item:nth-child(8).animate { animation-delay: 220ms; }
    .stagger-item:nth-child(9).animate { animation-delay: 240ms; }

    @keyframes staggerIn {
      from {
        transform: translateY(30px) scale(0.9);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }

    .category-section {
      margin-bottom: 32px;
    }

    .category-title {
      font-size: 24px;
      font-weight: 200;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--metro-accent, #0078d4);
    }

    .animation-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px;
    }

    .animation-card {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
      padding: var(--metro-spacing-md, 16px);
      cursor: pointer;
      transition: background var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      border: 2px solid transparent;
    }

    .animation-card:hover {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      border-color: var(--metro-accent, #0078d4);
    }

    .animation-card-name {
      font-size: var(--metro-font-size-normal, 14px);
      font-weight: 600;
      margin-bottom: var(--metro-spacing-xs, 4px);
    }

    .animation-card-code {
      font-size: 11px;
      font-family: 'Consolas', 'Monaco', monospace;
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
    }
  `;

  static properties = {
    selectedAnimation: { type: String },
    duration: { type: Number },
    easing: { type: String },
    staggerEnabled: { type: Boolean },
    isPlaying: { type: Boolean },
  };

  declare selectedAnimation: AnimationType;
  declare duration: number;
  declare easing: EasingType;
  declare staggerEnabled: boolean;
  declare isPlaying: boolean;

  constructor() {
    super();
    this.selectedAnimation = "metro-animate-fade-in";
    this.duration = 250;
    this.easing = "metro-easing";
    this.staggerEnabled = false;
    this.isPlaying = false;
  }

  #handleAnimationChange(e: Event): void {
    const target = e.target as HTMLSelectElement;
    this.selectedAnimation = target.value as AnimationType;
    this.isPlaying = false;
  }

  #handleDurationChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.duration = parseInt(target.value, 10);
  }

  #handleEasingChange(e: Event): void {
    const target = e.target as HTMLSelectElement;
    this.easing = target.value as EasingType;
  }

  #handleStaggerToggle(): void {
    this.staggerEnabled = !this.staggerEnabled;
  }

  #handlePlay(): void {
    this.isPlaying = false;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.isPlaying = true;
      });
    });
  }

  #getEasingValue(): string {
    switch (this.easing) {
      case "metro-easing":
        return "cubic-bezier(0.1, 0.9, 0.2, 1)";
      case "linear":
        return "linear";
      case "ease-in":
        return "ease-in";
      case "ease-out":
        return "ease-out";
      default:
        return "cubic-bezier(0.1, 0.9, 0.2, 1)";
    }
  }

  #getAnimationClass(): string {
    const animationMap: Record<AnimationType, string> = {
      "metro-animate-fade-in": "animate-fade-in",
      "metro-animate-fade-out": "animate-fade-out",
      "metro-animate-slide-up": "animate-slide-up",
      "metro-animate-slide-down": "animate-slide-down",
      "metro-animate-slide-left": "animate-slide-left",
      "metro-animate-slide-right": "animate-slide-right",
      "metro-animate-tile-flip": "animate-tile-flip",
      "metro-animate-progress-ring": "animate-progress-ring",
      "metro-entrance-stagger": "",
      "metro-animate-turnstile-in": "animate-turnstile-in",
      "metro-animate-turnstile-out": "animate-turnstile-out",
      "metro-animate-continuum-enter": "animate-continuum-enter",
      "metro-animate-continuum-exit": "animate-continuum-exit",
      "metro-turnstile-feather": "animate-turnstile-feather",
      "metro-theme-transition": "animate-theme-transition",
    };
    return animationMap[this.selectedAnimation] || "";
  }

  #renderPreviewContent(): HTMLTemplateResult {
    if (this.selectedAnimation === "metro-entrance-stagger" && this.isPlaying) {
      return html`
        <div class="stagger-items">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(
            (num) => html`
              <div
                class="stagger-item animate"
                style="--duration: ${this.duration}ms; --easing: ${this.#getEasingValue()};"
              >
                ${num}
              </div>
            `,
          )}
        </div>
      `;
    }

    const animationClass = this.isPlaying ? this.#getAnimationClass() : "";

    return html`
      <div
        class="animation-target ${animationClass}"
        style="--duration: ${this.duration}ms; --easing: ${this.#getEasingValue()};"
      >
        ${this.selectedAnimation === "metro-animate-progress-ring" ? "" : "A"}
      </div>
    `;
  }

  #renderControls(): HTMLTemplateResult {
    const isEntranceAnimation = this.selectedAnimation === "metro-entrance-stagger";

    return html`
      <div class="controls-panel">
        <div class="control-group">
          <label class="control-label">Animation Type</label>
          <select @change=${this.#handleAnimationChange}>
            ${ANIMATION_OPTIONS.map(
              (opt) => html`
                <option value=${opt.value} ?selected=${opt.value === this.selectedAnimation}>
                  ${opt.label}
                </option>
              `,
            )}
          </select>
        </div>

        <div class="control-group">
          <label class="control-label">Duration</label>
          <div class="slider-container">
            <input
              type="range"
              min="167"
              max="1000"
              .value=${String(this.duration)}
              @input=${this.#handleDurationChange}
            />
            <span class="duration-value">${this.duration}ms</span>
          </div>
        </div>

        <div class="control-group">
          <label class="control-label">Easing</label>
          <select @change=${this.#handleEasingChange}>
            ${EASING_OPTIONS.map(
              (opt) => html`
                <option value=${opt.value} ?selected=${opt.value === this.easing}>
                  ${opt.label}
                </option>
              `,
            )}
          </select>
        </div>

        ${isEntranceAnimation
          ? html`
              <div class="control-group">
                <label class="control-label">Stagger</label>
                <div class="toggle-container">
                  <div
                    class="toggle ${this.staggerEnabled ? "active" : ""}"
                    @click=${this.#handleStaggerToggle}
                  ></div>
                  <span>${this.staggerEnabled ? "Enabled" : "Disabled"}</span>
                </div>
              </div>
            `
          : null}

        <button class="play-button" @click=${this.#handlePlay}>▶ Play Animation</button>
      </div>
    `;
  }

  #renderAnimationGallery(): HTMLTemplateResult {
    const categories = [...new Set(ANIMATION_OPTIONS.map((opt) => opt.category))];

    return html`
      <div class="gallery-section" style="margin-top: 40px;">
        <h2 style="font-size: 24px; font-weight: 200; margin-bottom: 24px;">Animation Gallery</h2>
        ${categories.map(
          (category) => html`
            <div class="category-section">
              <h3 class="category-title">${category}</h3>
              <div class="animation-grid">
                ${ANIMATION_OPTIONS.filter((opt) => opt.category === category).map(
                  (animation) => html`
                    <div
                      class="animation-card"
                      @click=${() => {
                        this.selectedAnimation = animation.value;
                        this.isPlaying = false;
                      }}
                    >
                      <div class="animation-card-name">${animation.label}</div>
                      <div class="animation-card-code">${animation.value}</div>
                    </div>
                  `,
                )}
              </div>
            </div>
          `,
        )}
      </div>
    `;
  }

  render(): HTMLTemplateResult {
    return html`
      <h1 class="page-title">Animations</h1>

      <div class="content-grid">
        ${this.#renderControls()}

        <div class="preview-area">
          <div class="preview-header">
            Preview:
            ${ANIMATION_OPTIONS.find((opt) => opt.value === this.selectedAnimation)?.label || ""}
          </div>
          <div class="preview-content">${this.#renderPreviewContent()}</div>
        </div>
      </div>

      ${this.#renderAnimationGallery()}
    `;
  }
}

customElements.define("metrino-animations-page", MetrinoAnimationsPage);
