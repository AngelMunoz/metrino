import { LitElement, html, css } from "lit";
import "../../../src/components/primitives/icon.ts";
import "../../../src/components/layout/stack-panel.ts";

export class PageDesignPrinciples extends LitElement {
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
    .principle {
      margin-bottom: var(--metro-spacing-xxl);
      border-left: 4px solid var(--metro-accent);
      padding-left: var(--metro-spacing-lg);
    }
    .principle-title {
      font-size: var(--metro-font-size-xlarge, 28px);
      font-weight: 200;
      margin-bottom: var(--metro-spacing-sm);
      display: flex;
      align-items: center;
      gap: var(--metro-spacing-md);
    }
    .principle-subtitle {
      font-size: var(--metro-font-size-medium, 16px);
      color: var(--metro-accent);
      margin-bottom: var(--metro-spacing-md);
      font-weight: 400;
    }
    .principle-content {
      font-size: var(--metro-font-size-normal, 14px);
      line-height: 1.6;
      color: var(--metro-foreground-secondary);
    }
    .principle-content p {
      margin-bottom: var(--metro-spacing-md);
    }
    .example-box {
      background: var(--metro-highlight);
      padding: var(--metro-spacing-lg);
      margin-top: var(--metro-spacing-md);
    }
    .example-title {
      font-size: var(--metro-font-size-small, 12px);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--metro-foreground-secondary);
      margin-bottom: var(--metro-spacing-md);
    }
    .do-dont {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--metro-spacing-md);
      margin-top: var(--metro-spacing-md);
    }
    .do-box, .dont-box {
      padding: var(--metro-spacing-md);
    }
    .do-box {
      background: rgba(0, 163, 0, 0.1);
      border-left: 3px solid #00a300;
    }
    .dont-box {
      background: rgba(229, 20, 0, 0.1);
      border-left: 3px solid #e51400;
    }
    .do-box h4, .dont-box h4 {
      font-size: var(--metro-font-size-small, 12px);
      font-weight: 600;
      margin-bottom: var(--metro-spacing-sm);
    }
    .do-box h4 { color: #00a300; }
    .dont-box h4 { color: #e51400; }
    @media (max-width: 600px) {
      .do-dont {
        grid-template-columns: 1fr;
      }
    }
  `;

  render() {
    return html`
      <h1 class="page-title">Design Principles</h1>
      <p class="page-description">
        The Metro design language was created by Microsoft for Windows Phone 7 and later 
        adopted in Windows 8, Xbox 360, and Xbox One. It emphasizes clean typography, 
        content-first design, and authentically digital experiences.
      </p>

      <div class="principle">
        <h2 class="principle-title">
          <metro-icon icon="eye-outline" size="large"></metro-icon>
          Content Over Chrome
        </h2>
        <p class="principle-subtitle">Reduce visual noise, amplify content</p>
        <div class="principle-content">
          <p>
            Metro removes unnecessary visual elements like gradients, shadows, and 
            decorative borders. The content itself becomes the UI. Instead of chrome, 
            typography and whitespace provide structure.
          </p>
          <p>
            Traditional interfaces often wrap content in decorative containers. Metro 
            flips this: content is the interface. A photo app shows photos, not photo 
            frames. A news reader shows text, not paper textures.
          </p>
          <div class="example-box">
            <div class="example-title">Example</div>
            <p>Use flat backgrounds with subtle borders. Let typography carry visual weight instead of decorative elements.</p>
          </div>
        </div>
      </div>

      <div class="principle">
        <h2 class="principle-title">
          <metro-icon icon="format-font" size="large"></metro-icon>
          Typography as Design
        </h2>
        <p class="principle-subtitle">Type is the primary visual element</p>
        <div class="principle-content">
          <p>
            In Metro, typography isn't just for reading—it's the primary design element. 
            Large, light-weight type creates visual hierarchy and emotional impact. 
            Segoe UI (Windows Phone) or system fonts create a clean, modern aesthetic.
          </p>
          <p>
            Headlines use extra-light weights (200-300) at large sizes (42px+). Body text 
            uses regular weights at comfortable reading sizes. The contrast creates 
            visual rhythm without relying on color or imagery.
          </p>
          <div class="do-dont">
            <div class="do-box">
              <h4>DO</h4>
              <p>Use large, light typography for headers. Let whitespace create separation.</p>
            </div>
            <div class="dont-box">
              <h4>DON'T</h4>
              <p>Add decorative elements when typography alone creates hierarchy.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="principle">
        <h2 class="principle-title">
          <metro-icon icon="gesture-tap" size="large"></metro-icon>
          Motion with Purpose
        </h2>
        <p class="principle-subtitle">Animations guide users and provide feedback</p>
        <div class="principle-content">
          <p>
            Metro motion is fast, fluid, and purposeful. Animations use a specific 
            easing curve (0.1, 0.9, 0.2, 1) that creates snappy, responsive feels. 
            Durations are short: 167ms (fast), 250ms (normal), 333ms (slow).
          </p>
          <p>
            Motion communicates: elements slide in from where they came, tile flips 
            reveal additional content, transitions show spatial relationships. 
            Animation is never purely decorative.
          </p>
          <div class="example-box">
            <div class="example-title">Timing Reference</div>
            <p>
              <strong>Fast (167ms):</strong> Hover states, small UI changes<br>
              <strong>Normal (250ms):</strong> Standard transitions, panel opens<br>
              <strong>Slow (333ms):</strong> Page transitions, tile animations
            </p>
          </div>
        </div>
      </div>

      <div class="principle">
        <h2 class="principle-title">
          <metro-icon icon="cellphone" size="large"></metro-icon>
          Authentically Digital
        </h2>
        <p class="principle-subtitle">Embrace the medium, don't simulate reality</p>
        <div class="principle-content">
          <p>
            Metro doesn't try to look like paper, leather, or glass. It embraces 
            its digital nature: flat colors, crisp edges, pixel-perfect alignment. 
            This is "authentically digital" design.
          </p>
          <p>
            The interface doesn't pretend to be something it's not. Buttons don't 
            look like physical buttons—they're flat, colored areas that respond 
            to touch. Content doesn't sit on shelves—it flows naturally in space.
          </p>
          <div class="do-dont">
            <div class="do-box">
              <h4>DO</h4>
              <p>Use flat colors, sharp edges, and clear visual hierarchy.</p>
            </div>
            <div class="dont-box">
              <h4>DON'T</h4>
              <p>Apply textures, shadows, or effects that simulate physical materials.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="principle">
        <h2 class="principle-title">
          <metro-icon icon="view-grid" size="large"></metro-icon>
          Live Tiles
        </h2>
        <p class="principle-subtitle">Information at a glance</p>
        <div class="principle-content">
          <p>
            Live tiles are Metro's signature element. They're not just icons—they're 
            windows into app content. A weather tile shows the temperature, a mail 
            tile shows unread counts, a photos tile cycles through images.
          </p>
          <p>
            Tiles come in four sizes: small (70×70), medium (150×150), wide (310×150), 
            and large (310×310). The grid system allows flexible arrangements while 
            maintaining visual order.
          </p>
          <div class="example-box">
            <div class="example-title">Tile Sizes</div>
            <p>
              <strong>Small:</strong> Status indicators, single icons<br>
              <strong>Medium:</strong> Standard app tiles with icon and label<br>
              <strong>Wide:</strong> Rich content, notifications, images<br>
              <strong>Large:</strong> Dashboard-style content display
            </p>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define("page-design-principles", PageDesignPrinciples);
