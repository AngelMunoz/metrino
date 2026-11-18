import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";
import { createTransitionScope } from "../../utils/view-transition.ts";

/**
 * The ::view-transition rules of one flyout instance, keyed to its scoped part
 * names. Injected only while the flyout is active, so a second instance on the
 * same page cannot share a view-transition-name.
 */
function flyoutTransitionRules(names: Record<string, string>): string {
  return `
html:active-view-transition-type(flyout)::view-transition-new(${names.panel}) {
  animation: metro-flyout-enter var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
}
html:active-view-transition-type(flyout)::view-transition-old(${names.panel}) {
  animation: metro-flyout-exit var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)) both;
}
html:active-view-transition-type(flyout)::view-transition-new(${names.backdrop}) {
  animation: metro-fade-in var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
}
html:active-view-transition-type(flyout)::view-transition-old(${names.backdrop}) {
  animation: metro-fade-out var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)) both;
}
`;
}

/**
 * Flyout placement options relative to the target element.
 */
type FlyoutPlacement = "top" | "bottom" | "left" | "right";

/**
 * Metro Flyout Component
 *
 * A floating popup panel that appears relative to a target element.
 * Features a 3D perspective animation via View Transitions and backdrop overlay.
 * The Flyout is positioned programmatically and is ideal for contextual menus,
 * tooltips, or any popup content.
 *
 * Features:
 * - 3D perspective enter animation via View Transitions
 * - Four placement options: top, bottom, left, right
 * - Backdrop overlay for modal-like behavior
 * - Automatic positioning based on target element
 * - Fixed positioning to appear above other content
 *
 * Unlike MetroTooltip, the Flyout requires a target element and is
 * designed for more substantial content like menus or forms.
 *
 * @fires show - Fired when the flyout opens (bubbles: true)
 * @fires close - Fired when the flyout closes (bubbles: true)
 *
 * @cssprop --metro-background - Flyout background color (default: #1f1f1f)
 * @cssprop --metro-transition-normal - Transition duration (default: 250ms)
 * @cssprop --metro-easing - Easing curve for animations (default: cubic-bezier(0.1, 0.9, 0.2, 1))
 *
 * @slot - Default slot for flyout content
 *
 * @csspart flyout - The flyout panel element
 * @csspart backdrop - The backdrop overlay element
 */
export class MetroFlyout extends LitElement {
  static properties = {
    /**
     * Controls the visibility of the flyout. When true, the flyout is displayed
     * with enter animation and positioned relative to the target.
     * @default false
     */
    open: { type: Boolean, reflect: true },
    /**
     * Position of the flyout relative to the target element.
     * @default "bottom"
     */
    placement: { type: String, reflect: true },
  };

  declare open: boolean;
  declare placement: FlyoutPlacement;

  static styles = [
    baseTypography,
    css`
      :host {
        display: none;
        position: fixed;
        z-index: 1000;
      }
      :host([open]) {
        display: block;
      }
      :host(:active-view-transition) {
        view-transition-name: none;
      }
      .flyout {
        position: fixed;
        background: var(--metro-background, #1f1f1f);
        min-width: 160px;
        opacity: 0;
        transform: perspective(800px) rotateX(-15deg);
        transition: opacity var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)), transform var(--metro-transition-normal, 250ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        transform-origin: top center;
      }
      :host([open]) .flyout {
        opacity: 1;
        transform: perspective(800px) rotateX(0deg);
      }
      .backdrop {
        position: fixed;
        inset: 0;
        z-index: -1;
      }
    `,
  ];

  #target: Element | null = null;
  #transition = createTransitionScope("flyout", ["panel", "backdrop"]);
  #transitionRules = flyoutTransitionRules(this.#transition.names);

  constructor() {
    super();
    this.open = false;
    this.placement = "bottom";
  }

  render() {
    return html`
      <div class="backdrop" @click=${this.#close}></div>
      <div class="flyout" @keydown=${this.#handleKeydown}>
        <slot></slot>
      </div>
    `;
  }

  #handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.preventDefault();
      void this.hide();
    }
  }

  /**
   * Applies a property change via View Transitions with headless fallback.
   */
  async #applyChange(setter: () => void): Promise<void> {
    if ("startViewTransition" in document) {
      let applied = false;
      try {
        const transition = document.startViewTransition({
          update: () => {
            setter();
            applied = true;
            return this.updateComplete;
          },
          types: ["flyout"],
        });
        try {
          await transition.updateCallbackDone;
        } catch {
          // updateCallbackDone rejected
        }
        try {
          await transition.finished;
        } catch {
          // finished rejected
        }
      } catch {
        // startViewTransition threw
      }
      if (!applied) {
        setter();
        await this.updateComplete;
      }
    } else {
      setter();
      await this.updateComplete;
    }
  }

  /**
   * Shows the flyout positioned relative to the target element.
   * @param target - The element to position the flyout relative to
   * @returns Promise that resolves when the flyout is fully open.
   */
  async show(target: Element): Promise<void> {
    this.#target = target;
    this.dispatchEvent(new CustomEvent("show", { bubbles: true }));
    await this.updateComplete;
    this.#transition.attach(this.#transitionTargets(), this.#transitionRules);
    await this.#applyChange(() => { this.open = true; });
  }

  /**
   * Hides the flyout and dispatches the close event.
   * @returns Promise that resolves when the flyout is fully closed.
   */
  async hide(): Promise<void> {
    if (!this.open) return;
    this.dispatchEvent(new CustomEvent("close", { bubbles: true }));
    // Names stay held until the exit transition has captured them.
    await this.#applyChange(() => { this.open = false; });
    this.#transition.detach(this.#transitionTargets());
  }

  /**
   * Updates the flyout position when opened.
   */
  protected updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("open") && this.open && this.#target) {
      requestAnimationFrame(() => this.#positionFlyout());
    }
  }

  #positionFlyout(): void {
    if (!this.#target) return;
    const rect = this.#target.getBoundingClientRect();
    const flyout = this.shadowRoot?.querySelector(".flyout") as HTMLElement;
    if (!flyout) return;

    const flyoutRect = flyout.getBoundingClientRect();
    let top = 0;
    let left = 0;

    switch (this.placement) {
      case "top":
        top = rect.top - flyoutRect.height;
        left = rect.left;
        break;
      case "bottom":
        top = rect.bottom;
        left = rect.left;
        break;
      case "left":
        top = rect.top;
        left = rect.left - flyoutRect.width;
        break;
      case "right":
        top = rect.top;
        left = rect.right;
        break;
    }

    flyout.style.top = `${top}px`;
    flyout.style.left = `${left}px`;
  }

  #close(): void {
    void this.hide();
  }

  #transitionTargets(): Record<string, HTMLElement | null> {
    const root = this.shadowRoot;
    return {
      panel: root?.querySelector<HTMLElement>(".flyout") ?? null,
      backdrop: root?.querySelector<HTMLElement>(".backdrop") ?? null,
    };
  }
}

export function registerMetroFlyout(): void {
  if (!customElements.get("metro-flyout")) {
    customElements.define("metro-flyout", MetroFlyout);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-flyout": MetroFlyout;
  }
}
