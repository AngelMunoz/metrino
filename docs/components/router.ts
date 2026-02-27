import { LitElement, html, css } from "lit";

import "../pages/home.ts";
import "../pages/design/principles.ts";
import "../pages/design/colors.ts";
import "../pages/design/typography.ts";
import "../pages/design/motion.ts";
import "../pages/components/buttons.ts";
import "../pages/components/input.ts";
import "../pages/components/tiles.ts";
import "../pages/components/navigation.ts";
import "../pages/components/selection.ts";
import "../pages/components/layout.ts";
import "../pages/components/progress.ts";
import "../pages/components/primitives.ts";
import "../pages/components/dialogs.ts";
import "../pages/components/datetime.ts";

type Route = {
  path: string;
  title: string;
  render: () => ReturnType<typeof html>;
};

const routes: Route[] = [
  { path: "", title: "Metrino", render: () => html`<page-home></page-home>` },
  {
    path: "design/principles",
    title: "Design Principles | Metrino",
    render: () => html`<page-design-principles></page-design-principles>`,
  },
  {
    path: "design/colors",
    title: "Colors | Metrino",
    render: () => html`<page-design-colors></page-design-colors>`,
  },
  {
    path: "design/typography",
    title: "Typography | Metrino",
    render: () => html`<page-design-typography></page-design-typography>`,
  },
  {
    path: "design/motion",
    title: "Motion | Metrino",
    render: () => html`<page-design-motion></page-design-motion>`,
  },
  {
    path: "components/buttons",
    title: "Buttons | Metrino",
    render: () => html`<page-components-buttons></page-components-buttons>`,
  },
  {
    path: "components/input",
    title: "Input | Metrino",
    render: () => html`<page-components-input></page-components-input>`,
  },
  {
    path: "components/tiles",
    title: "Tiles | Metrino",
    render: () => html`<page-components-tiles></page-components-tiles>`,
  },
  {
    path: "components/navigation",
    title: "Navigation | Metrino",
    render: () =>
      html`<page-components-navigation></page-components-navigation>`,
  },
  {
    path: "components/selection",
    title: "Selection | Metrino",
    render: () => html`<page-components-selection></page-components-selection>`,
  },
  {
    path: "components/layout",
    title: "Layout | Metrino",
    render: () => html`<page-components-layout></page-components-layout>`,
  },
  {
    path: "components/progress",
    title: "Progress | Metrino",
    render: () => html`<page-components-progress></page-components-progress>`,
  },
  {
    path: "components/primitives",
    title: "Primitives | Metrino",
    render: () =>
      html`<page-components-primitives></page-components-primitives>`,
  },
  {
    path: "components/dialogs",
    title: "Dialogs | Metrino",
    render: () => html`<page-components-dialogs></page-components-dialogs>`,
  },
  {
    path: "components/datetime",
    title: "Date & Time | Metrino",
    render: () => html`<page-components-datetime></page-components-datetime>`,
  },
];

const supportsViewTransitions = "startViewTransition" in document;

export class DocsRouter extends LitElement {
  static styles = css`
    :host {
      display: block;
    }
    .page-enter {
      view-transition-name: page-content;
    }
    .not-found {
      text-align: center;
      padding: var(--metro-spacing-xxl) var(--metro-spacing-xl);
    }
    .not-found h1 {
      font-size: var(--metro-font-size-xxlarge);
      font-weight: 200;
      margin-bottom: var(--metro-spacing-md);
    }
    .not-found p {
      color: var(--metro-foreground-secondary);
      font-size: var(--metro-font-size-large);
      margin-bottom: var(--metro-spacing-lg);
    }
  `;

  #currentPath = "";
  #hubScrollPositions: Map<string, number> = new Map();
  #isBackNavigation = false;
  #scrollListeners: Array<{ hub: Element; listener: () => void }> = [];

  constructor() {
    super();
    this.#currentPath = this.#getPath();

    // Handle popstate (back/forward) vs hashchange (link clicks)
    window.addEventListener("popstate", () => {
      this.#isBackNavigation = true;
      this.#handleNavigation();
    });
    window.addEventListener("hashchange", () => {
      this.#isBackNavigation = false;
      this.#handleNavigation();
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.#updateTitle();
    this.#addViewTransitionStyles();
    this.#handleNavigation();
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#cleanupScrollListeners();
  }

  #cleanupScrollListeners(): void {
    this.#scrollListeners.forEach(({ hub, listener }) => {
      const container = (hub as Element).shadowRoot?.querySelector(
        ".hub-container",
      );
      container?.removeEventListener("scroll", listener);
    });
    this.#scrollListeners = [];
  }

  #setupScrollListeners(): void {
    this.#cleanupScrollListeners();

    requestAnimationFrame(() => {
      const pageEl = this.shadowRoot?.querySelector(".page-enter");
      if (pageEl) {
        const hubs = pageEl.querySelectorAll("metro-hub");
        hubs.forEach((hub) => {
          const container = hub.shadowRoot?.querySelector(
            ".hub-container",
          ) as HTMLElement;
          if (container) {
            const listener = () => {
              if (this.#currentPath) {
                this.#hubScrollPositions.set(
                  this.#currentPath,
                  container.scrollLeft,
                );
              }
            };
            container.addEventListener("scroll", listener, { passive: true });
            this.#scrollListeners.push({ hub, listener });
          }
        });
      }
    });
  }

  #getPath(): string {
    return window.location.hash.slice(1) || "";
  }

  #restoreHubScroll(): void {
    if (!this.#isBackNavigation) return;

    const savedScroll = this.#hubScrollPositions.get(this.#currentPath);
    if (savedScroll !== undefined && savedScroll > 0) {
      requestAnimationFrame(() => {
        const pageEl = this.shadowRoot?.querySelector(".page-enter");
        if (pageEl) {
          const hubs = pageEl.querySelectorAll("metro-hub");
          hubs.forEach((hub) => {
            const container = hub.shadowRoot?.querySelector(
              ".hub-container",
            ) as HTMLElement;
            if (container) {
              container.scrollLeft = savedScroll;
            }
          });
        }
      });
    }
  }

  #handleNavigation(): void {
    const newPath = this.#getPath();

    if (supportsViewTransitions) {
      document.startViewTransition(async () => {
        this.#currentPath = newPath;
        this.#updateTitle();
        this.requestUpdate();
        await this.updateComplete;
        if (!this.#isBackNavigation) {
          window.scrollTo({ top: 0, behavior: "instant" });
        }
        this.#restoreHubScroll();
        this.#setupScrollListeners();
      });
    } else {
      this.#currentPath = newPath;
      this.#updateTitle();
      this.requestUpdate();
      if (!this.#isBackNavigation) {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
      this.#restoreHubScroll();
      this.#setupScrollListeners();
    }
  }

  #updateTitle(): void {
    const route = routes.find((r) => r.path === this.#currentPath);
    document.title = route?.title || "Not Found | Metrino";
  }

  #addViewTransitionStyles(): void {
    if (!supportsViewTransitions) return;

    const style = document.createElement("style");
    style.textContent = `
      ::view-transition {
        perspective: 1000px;
      }
      ::view-transition-old(page-content) {
        animation: metro-continuum-exit 333ms cubic-bezier(0.1, 0.9, 0.2, 1);
      }
      ::view-transition-new(page-content) {
        animation: metro-continuum-enter 333ms cubic-bezier(0.1, 0.9, 0.2, 1);
      }
    `;
    document.head.appendChild(style);
  }

  render() {
    const route = routes.find((r) => r.path === this.#currentPath);

    if (route) {
      return html`<div class="page-enter" style="view-transition-name: page-content">${route.render()}</div>`;
    }

    return html`
      <div class="not-found page-enter" style="view-transition-name: page-content">
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
        <metro-button @click=${() => (window.location.hash = "")}>
          Go Home
        </metro-button>
      </div>
    `;
  }
}

customElements.define("docs-router", DocsRouter);
