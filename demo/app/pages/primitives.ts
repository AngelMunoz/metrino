import { LitElement, html, css } from "lit";
import "../../../src/components/primitives/text-block.ts";
import "../../../src/components/primitives/icon.ts";
import "../../../src/components/primitives/expander.ts";
import "../../../src/components/primitives/info-bar.ts";
import "../../../src/components/primitives/person-picture.ts";
import "../../../src/components/primitives/tooltip.ts";
import "../../../src/components/primitives/border.ts";
import "../../../src/components/primitives/image.ts";
import "../../../src/components/primitives/rich-text-block.ts";
import "../../../src/components/primitives/media-element.ts";
import "../../../src/components/primitives/context-menu.ts";
import "../../../src/components/buttons/button.ts";

const ICON_SAMPLES = [
  "home", "settings", "search", "add", "edit", "delete", "save", "cancel",
  "check", "close", "more", "favorite", "share", "download", "upload",
  "mail", "phone", "camera", "play", "pause", "volume", "star", "user",
  "calendar", "clock", "location", "wifi", "warning", "error", "info", "help"
];

export class MetrinoPrimitivesPage extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: var(--metro-spacing-xl, 24px);
      max-width: 1200px;
      margin: 0 auto;
      background: var(--metro-background, #1f1f1f);
      min-height: 100vh;
    }
    h1 {
      font-size: var(--metro-font-size-xxlarge, 42px);
      font-weight: 200;
      color: var(--metro-foreground, #ffffff);
      margin: 0 0 var(--metro-spacing-xl, 24px);
    }
    h2 {
      font-size: 24px;
      font-weight: 200;
      color: var(--metro-foreground, #ffffff);
      margin: var(--metro-spacing-xl, 24px) 0 var(--metro-spacing-md, 12px);
      border-bottom: 2px solid var(--metro-accent, #0078d4);
      padding-bottom: var(--metro-spacing-sm, 8px);
    }
    .section {
      margin-bottom: var(--metro-spacing-xl, 24px);
    }
    .demo-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--metro-spacing-md, 12px);
      align-items: center;
      margin-bottom: var(--metro-spacing-md, 12px);
    }
    .demo-box {
      padding: var(--metro-spacing-md, 12px);
      background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
      border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.1));
    }
    .icons-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: var(--metro-spacing-sm, 8px);
    }
    .icon-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: var(--metro-spacing-sm, 8px);
      background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
      gap: var(--metro-spacing-xs, 4px);
    }
    .icon-item span {
      font-size: 10px;
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
    }
    .tooltip-demo {
      display: flex;
      gap: var(--metro-spacing-lg, 16px);
      margin-bottom: var(--metro-spacing-md, 12px);
    }
    .image-demos {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--metro-spacing-md, 12px);
    }
    .image-demo-item {
      padding: var(--metro-spacing-md, 12px);
      background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
    }
    .image-demo-item h4 {
      font-size: var(--metro-font-size-small, 12px);
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      margin: 0 0 var(--metro-spacing-sm, 8px);
    }
    metro-image {
      width: 100%;
      height: 120px;
      display: block;
    }
    .context-demo {
      padding: var(--metro-spacing-lg, 16px);
      background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      user-select: none;
    }
    .person-grid {
      display: flex;
      gap: var(--metro-spacing-lg, 16px);
      flex-wrap: wrap;
    }
    .person-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--metro-spacing-sm, 8px);
    }
    .person-item span {
      font-size: var(--metro-font-size-small, 12px);
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
    }
    .media-demo {
      max-width: 480px;
    }
  `;

  static properties = {
    _tooltipPlacement: { state: true },
  };

  declare _tooltipPlacement: string;

  constructor() {
    super();
    this._tooltipPlacement = "top";
  }

  render() {
    return html`
      <h1>Primitives</h1>

      <section class="section">
        <h2>metro-text-block</h2>
        <div class="demo-row">
          <metro-text-block>Default Text</metro-text-block>
          <metro-text-block bold>Bold Text</metro-text-block>
          <metro-text-block italic>Italic Text</metro-text-block>
          <metro-text-block underline>Underlined Text</metro-text-block>
          <metro-text-block strikethrough>Strikethrough</metro-text-block>
        </div>
        <div class="demo-row">
          <metro-text-block bold italic underline>Bold, Italic & Underlined</metro-text-block>
        </div>
      </section>

      <section class="section">
        <h2>metro-icon</h2>
        <h3>Sizes</h3>
        <div class="demo-row">
          <metro-icon icon="home" size="small"></metro-icon>
          <metro-icon icon="home" size="normal"></metro-icon>
          <metro-icon icon="home" size="medium"></metro-icon>
          <metro-icon icon="home" size="large"></metro-icon>
          <metro-icon icon="home" size="xlarge"></metro-icon>
        </div>
        <h3>Icon Grid</h3>
        <div class="icons-grid">
          ${ICON_SAMPLES.map(icon => html`
            <div class="icon-item">
              <metro-icon icon=${icon} size="large"></metro-icon>
              <span>${icon}</span>
            </div>
          `)}
        </div>
      </section>

      <section class="section">
        <h2>metro-expander</h2>
        <metro-expander title="Click to expand">
          <metro-text-block>This content was hidden. The expander component allows you to show and hide content with a smooth animation.</metro-text-block>
        </metro-expander>
        <metro-expander title="Another expander" expanded>
          <metro-text-block>This expander starts expanded. You can collapse it by clicking the header.</metro-text-block>
        </metro-expander>
      </section>

      <section class="section">
        <h2>metro-info-bar</h2>
        <div class="demo-row" style="flex-direction: column; align-items: stretch;">
          <metro-info-bar severity="informational" title="Information">
            This is an informational message for the user.
          </metro-info-bar>
          <metro-info-bar severity="success" title="Success">
            Your changes have been saved successfully.
          </metro-info-bar>
          <metro-info-bar severity="warning" title="Warning">
            This action cannot be undone.
          </metro-info-bar>
          <metro-info-bar severity="error" title="Error">
            An error occurred while processing your request.
          </metro-info-bar>
        </div>
      </section>

      <section class="section">
        <h2>metro-person-picture</h2>
        <h3>Sizes</h3>
        <div class="person-grid">
          <div class="person-item">
            <metro-person-picture size="small" display-name="John Doe"></metro-person-picture>
            <span>small</span>
          </div>
          <div class="person-item">
            <metro-person-picture size="normal" display-name="Jane Smith"></metro-person-picture>
            <span>normal</span>
          </div>
          <div class="person-item">
            <metro-person-picture size="large" display-name="Bob Wilson"></metro-person-picture>
            <span>large</span>
          </div>
          <div class="person-item">
            <metro-person-picture size="xlarge" display-name="Alice Brown"></metro-person-picture>
            <span>xlarge</span>
          </div>
        </div>
        <h3>Presence Status</h3>
        <div class="person-grid">
          <div class="person-item">
            <metro-person-picture size="large" display-name="John Doe" presence="available"></metro-person-picture>
            <span>available</span>
          </div>
          <div class="person-item">
            <metro-person-picture size="large" display-name="Jane Smith" presence="away"></metro-person-picture>
            <span>away</span>
          </div>
          <div class="person-item">
            <metro-person-picture size="large" display-name="Bob Wilson" presence="busy"></metro-person-picture>
            <span>busy</span>
          </div>
          <div class="person-item">
            <metro-person-picture size="large" display-name="Alice Brown" presence="offline"></metro-person-picture>
            <span>offline</span>
          </div>
        </div>
        <h3>With Initials</h3>
        <div class="person-grid">
          <metro-person-picture size="large" initials="AB"></metro-person-picture>
          <metro-person-picture size="large" initials="CD" presence="available"></metro-person-picture>
        </div>
      </section>

      <section class="section">
        <h2>metro-tooltip</h2>
        <div class="tooltip-demo">
          <metro-button id="tooltip-top" @mouseenter=${this.#showTooltipTop} @mouseleave=${this.#hideTooltip}>Top Tooltip</metro-button>
          <metro-button id="tooltip-bottom" @mouseenter=${this.#showTooltipBottom} @mouseleave=${this.#hideTooltip}>Bottom Tooltip</metro-button>
          <metro-button id="tooltip-left" @mouseenter=${this.#showTooltipLeft} @mouseleave=${this.#hideTooltip}>Left Tooltip</metro-button>
          <metro-button id="tooltip-right" @mouseenter=${this.#showTooltipRight} @mouseleave=${this.#hideTooltip}>Right Tooltip</metro-button>
        </div>
        <metro-tooltip id="demo-tooltip" text="This is a tooltip"></metro-tooltip>
      </section>

      <section class="section">
        <h2>metro-border</h2>
        <div class="demo-row">
          <metro-border border-thickness="2" border-color="var(--metro-accent, #0078d4)" corner-radius="0" padding="16">
            <metro-text-block>Default Border</metro-text-block>
          </metro-border>
          <metro-border border-thickness="4" border-color="#e51400" corner-radius="0" padding="16">
            <metro-text-block>Thick Red Border</metro-text-block>
          </metro-border>
          <metro-border border-thickness="2,2,2,2" border-color="#00a300" corner-radius="0" padding="16">
            <metro-text-block>Green Border</metro-text-block>
          </metro-border>
        </div>
        <div class="demo-row">
          <metro-border border-thickness="2" border-color="var(--metro-foreground, #fff)" corner-radius="8" padding="16">
            <metro-text-block>Rounded Corners</metro-text-block>
          </metro-border>
          <metro-border border-thickness="4,1,1,1" border-color="var(--metro-accent, #0078d4)" corner-radius="0" padding="16">
            <metro-text-block>Accent Top Border</metro-text-block>
          </metro-border>
        </div>
      </section>

      <section class="section">
        <h2>metro-image</h2>
        <div class="image-demos">
          <div class="image-demo-item">
            <h4>Stretch: uniform (default)</h4>
            <metro-image src="https://picsum.photos/400/300" alt="Random image" stretch="uniform"></metro-image>
          </div>
          <div class="image-demo-item">
            <h4>Stretch: fill</h4>
            <metro-image src="https://picsum.photos/400/300" alt="Random image" stretch="fill"></metro-image>
          </div>
          <div class="image-demo-item">
            <h4>Stretch: uniformToFill</h4>
            <metro-image src="https://picsum.photos/400/300" alt="Random image" stretch="uniformToFill"></metro-image>
          </div>
          <div class="image-demo-item">
            <h4>Stretch: none</h4>
            <metro-image src="https://picsum.photos/400/300" alt="Random image" stretch="none"></metro-image>
          </div>
          <div class="image-demo-item">
            <h4>With Placeholder</h4>
            <metro-image src="https://picsum.photos/400/300" alt="Random image" placeholder="Loading..."></metro-image>
          </div>
          <div class="image-demo-item">
            <h4>With Fallback</h4>
            <metro-image src="invalid-url.jpg" alt="Broken image" fallback="Image not available"></metro-image>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>metro-rich-text-block</h2>
        <div class="demo-box">
          <h4>HTML Content</h4>
          <metro-rich-text-block content="<strong>Bold</strong>, <em>Italic</em>, and <a href='#'>links</a> are supported."></metro-rich-text-block>
        </div>
        <div class="demo-box" style="margin-top: 12px;">
          <h4>With Line Clamping (max 2 lines)</h4>
          <metro-rich-text-block max-lines="2" content="This is a very long text that should be truncated after two lines using CSS line-clamp. The overflow will be hidden and the text will end with an ellipsis if the browser supports it properly."></metro-rich-text-block>
        </div>
        <div class="demo-box" style="margin-top: 12px;">
          <h4>With Ellipsis Trimming</h4>
          <metro-rich-text-block text-trimming="ellipsis" style="width: 200px; white-space: nowrap;">
            This text is too long and will be truncated
          </metro-rich-text-block>
        </div>
      </section>

      <section class="section">
        <h2>metro-media-element</h2>
        <h3>Video Player</h3>
        <div class="media-demo">
          <metro-media-element
            type="video"
            src="https://www.w3schools.com/html/mov_bbb.mp4"
            controls
          ></metro-media-element>
        </div>
        <h3>Audio Player</h3>
        <div class="media-demo">
          <metro-media-element
            type="audio"
            src="https://www.w3schools.com/html/horse.mp3"
            controls
          ></metro-media-element>
        </div>
      </section>

      <section class="section">
        <h2>metro-context-menu</h2>
        <p style="color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6)); margin-bottom: 12px;">
          Right-click on the box below to show the context menu. Long-press also works on touch devices.
        </p>
        <div class="context-demo" id="context-target">
          Right-click here for context menu
        </div>
        <metro-context-menu target="#context-target">
          <div slot="item"><metro-icon icon="edit" size="small"></metro-icon> Edit</div>
          <div slot="item"><metro-icon icon="copy" size="small"></metro-icon> Copy</div>
          <div slot="item"><metro-icon icon="paste" size="small"></metro-icon> Paste</div>
          <div slot="item" class="menu-divider"></div>
          <div slot="item"><metro-icon icon="delete" size="small"></metro-icon> Delete</div>
        </metro-context-menu>
      </section>
    `;
  }

  #showTooltipTop(e: MouseEvent): void {
    this.#showTooltip(e.target as Element, "top");
  }

  #showTooltipBottom(e: MouseEvent): void {
    this.#showTooltip(e.target as Element, "bottom");
  }

  #showTooltipLeft(e: MouseEvent): void {
    this.#showTooltip(e.target as Element, "left");
  }

  #showTooltipRight(e: MouseEvent): void {
    this.#showTooltip(e.target as Element, "right");
  }

  #showTooltip(target: Element, placement: string): void {
    const tooltip = this.shadowRoot?.querySelector("#demo-tooltip") as HTMLElement & { showDelayed: (el: Element, delay?: number) => void };
    if (tooltip) {
      tooltip.setAttribute("placement", placement);
      tooltip.showDelayed(target, 300);
    }
  }

  #hideTooltip(): void {
    const tooltip = this.shadowRoot?.querySelector("#demo-tooltip") as HTMLElement & { hideImmediate: () => void };
    if (tooltip) {
      tooltip.hideImmediate();
    }
  }
}

customElements.define("metrino-primitives-page", MetrinoPrimitivesPage);
