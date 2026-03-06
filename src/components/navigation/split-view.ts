import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

/**
 * Metro Split View Component
 *
 * A navigation component that divides the screen into a pane and content area.
 * Supports multiple display modes including overlay (slides over content),
 * inline (pushes content), and compact (shrunken pane that expands).
 *
 * Features:
 * - Three display modes: overlay, inline, compact
 * - Configurable pane placement (left or right)
 * - Smooth slide/width animations when opening/closing
 * - Backdrop overlay in overlay mode
 * - Backdrop click to close in overlay mode
 * - Programmatic API for show/hide/toggle
 *
 * Use SplitView for master-detail layouts, navigation drawers, or any UI
 * that requires a collapsible side panel alongside main content.
 *
 * @fires paneopened - Fired when the pane opens (bubbles: true)
 * @fires paneclosed - Fired when the pane closes (bubbles: true)
 *
 * @cssprop --metro-background - Background color for pane and content (default: #1f1f1f)
 * @cssprop --metro-border - Border color for pane separator (default: rgba(255, 255, 255, 0.2))
 * @cssprop --metro-transition-slow - Transition duration for animations (default: 333ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 *
 * @slot pane - Slot for navigation/content in the side pane
 * @slot - Default slot for main content area
 *
 * @csspart split-pane - The side pane container
 * @csspart pane-content - The content area within the pane
 * @csspart content - The main content area
 * @csspart backdrop - The backdrop overlay (overlay mode only)
 */
export class MetroSplitView extends LitElement {
  static properties = {
    /**
     * Controls the visibility of the pane. When true, the pane is displayed.
     * In overlay mode, this also shows the backdrop.
     * @default false
     */
    open: { type: Boolean, reflect: true },
    /**
     * Display mode for the pane:
     * - "overlay": Pane slides over content (default)
     * - "inline": Pane pushes content (width animation)
     * - "compact": Pane shows as narrow strip, expands on open
     * @default "overlay"
     */
    displayMode: { type: String, reflect: true, attribute: "display-mode" },
    /**
     * Placement of the pane:
     * - "left": Pane on the left side (default)
     * - "right": Pane on the right side
     * @default "left"
     */
    panePlacement: { type: String, reflect: true, attribute: "pane-placement" },
  };

  declare open: boolean;
  declare displayMode: "overlay" | "inline" | "compact";
  declare panePlacement: "left" | "right";

  static styles = [
    baseTypography,
    css`
      :host {
        display: flex;
        position: relative;
        height: 100%;
        width: 100%;
        overflow: hidden;
      }

      .split-pane {
        height: 100%;
        background: var(--metro-background, #1f1f1f);
        overflow: hidden;
        box-sizing: border-box;
      }

      .pane-content {
        height: 100%;
        width: 320px;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .content {
        flex: 1;
        height: 100%;
        overflow: auto;
        background: var(--metro-background, #1f1f1f);
      }

      :host([display-mode="overlay"]) .split-pane {
        position: absolute;
        top: 0;
        left: 0;
        width: 320px;
        transform: translateX(-100%);
        transition: transform var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        z-index: 100;
        border-right: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }

      :host([display-mode="overlay"][pane-placement="right"]) .split-pane {
        left: auto;
        right: 0;
        transform: translateX(100%);
        border-right: none;
        border-left: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }

      :host([display-mode="overlay"][open]) .split-pane {
        transform: translateX(0);
      }

      :host([display-mode="inline"]) .split-pane {
        width: 0;
        transition: width var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        border-right: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }

      :host([display-mode="inline"][pane-placement="right"]) .split-pane {
        order: 2;
        border-right: none;
        border-left: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }

      :host([display-mode="inline"][pane-placement="right"]) .content {
        order: 1;
      }

      :host([display-mode="inline"][open]) .split-pane {
        width: 320px;
      }

      :host([display-mode="compact"]) .split-pane {
        width: 48px;
        transition: width var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        border-right: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }

      :host([display-mode="compact"][pane-placement="right"]) .split-pane {
        order: 2;
        border-right: none;
        border-left: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      }

      :host([display-mode="compact"][pane-placement="right"]) .content {
        order: 1;
      }

      :host([display-mode="compact"][open]) .split-pane {
        width: 320px;
      }

      :host([display-mode="compact"]) .pane-content {
        width: 320px;
      }

      .backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: 50;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--metro-transition-slow, 333ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }

      :host([display-mode="overlay"][open]) .backdrop {
        opacity: 1;
        pointer-events: auto;
      }
    `,
  ];

  constructor() {
    super();
    this.open = false;
    this.displayMode = "overlay";
    this.panePlacement = "left";
  }

  render() {
    return html`
      <div class="backdrop" @click=${this.#handleBackdropClick}></div>
      <div class="split-pane">
        <div class="pane-content">
          <slot name="pane"></slot>
        </div>
      </div>
      <div class="content">
        <slot></slot>
      </div>
    `;
  }

  /**
   * Handles backdrop click in overlay mode to close the pane.
   * @returns void
   */
  #handleBackdropClick(): void {
    if (this.displayMode === "overlay") {
      this.open = false;
      this.dispatchEvent(new CustomEvent("paneclosed", { bubbles: true }));
    }
  }

  /**
   * Toggles the pane open/closed state and dispatches appropriate event.
   * @returns void
   */
  toggle(): void {
    this.open = !this.open;
    this.dispatchEvent(new CustomEvent(this.open ? "paneopened" : "paneclosed", { bubbles: true }));
  }

  /**
   * Opens the pane if closed and dispatches the "paneopened" event.
   * @returns void
   */
  show(): void {
    if (!this.open) {
      this.open = true;
      this.dispatchEvent(new CustomEvent("paneopened", { bubbles: true }));
    }
  }

  /**
   * Closes the pane if open and dispatches the "paneclosed" event.
   * @returns void
   */
  hide(): void {
    if (this.open) {
      this.open = false;
      this.dispatchEvent(new CustomEvent("paneclosed", { bubbles: true }));
    }
  }
}

customElements.define("metro-split-view", MetroSplitView);

declare global {
  interface HTMLElementTagNameMap {
    "metro-split-view": MetroSplitView;
  }
}
