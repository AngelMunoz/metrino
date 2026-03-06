import { LitElement, html, css, type PropertyValues } from "lit";
import {
  subscribe,
  getCurrentRoute,
  getRouteHandler,
  type RouterState,
} from "./router";
import { initTheme } from "./state";
import "./components/app-shell";

import "@src/styles/tokens.css";

import { initRouter, type RouteDef } from "./router";

const routes: RouteDef[] = [
  {
    path: "/",
    title: "Home",
    handler: () => html`<metrino-home></metrino-home>`,
  },
  {
    path: "/buttons",
    title: "Buttons",
    handler: () => html`<metrino-buttons-page></metrino-buttons-page>`,
  },
  {
    path: "/input",
    title: "Input",
    handler: () => html`<metrino-input-page></metrino-input-page>`,
  },
  {
    path: "/datetime",
    title: "Date & Time",
    handler: () => html`<metrino-datetime-page></metrino-datetime-page>`,
  },
  {
    path: "/progress",
    title: "Progress",
    handler: () => html`<metrino-progress-page></metrino-progress-page>`,
  },
  {
    path: "/tiles",
    title: "Tiles",
    handler: () => html`<metrino-tiles-page></metrino-tiles-page>`,
  },
  {
    path: "/layout",
    title: "Layout",
    handler: () => html`<metrino-layout-page></metrino-layout-page>`,
  },
  {
    path: "/navigation",
    title: "Navigation",
    handler: () => html`<metrino-navigation-page></metrino-navigation-page>`,
  },
  {
    path: "/selection",
    title: "Selection",
    handler: () => html`<metrino-selection-page></metrino-selection-page>`,
  },
  {
    path: "/primitives",
    title: "Primitives",
    handler: () => html`<metrino-primitives-page></metrino-primitives-page>`,
  },
  {
    path: "/dialogs",
    title: "Dialogs",
    handler: () => html`<metrino-dialogs-page></metrino-dialogs-page>`,
  },
  {
    path: "/animations",
    title: "Animations",
    handler: () => html`<metrino-animations-page></metrino-animations-page>`,
  },
];

initTheme();
initRouter(routes);

const pageLoaders: Record<string, () => Promise<unknown>> = {
  "/": () => import("./pages/home"),
  "/buttons": () => import("./pages/buttons"),
  "/input": () => import("./pages/input"),
  "/datetime": () => import("./pages/datetime"),
  "/progress": () => import("./pages/progress"),
  "/tiles": () => import("./pages/tiles"),
  "/layout": () => import("./pages/layout"),
  "/navigation": () => import("./pages/navigation"),
  "/selection": () => import("./pages/selection"),
  "/primitives": () => import("./pages/primitives"),
  "/dialogs": () => import("./pages/dialogs"),
  "/animations": () => import("./pages/animations"),
};

type TemplateResult = ReturnType<typeof html>;

export class MetrinoApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      min-height: 100vh;
    }
  `;

  static properties = {
    routeContent: { state: true },
  };

  declare routeContent: TemplateResult;

  #unsubscribe?: () => void;
  #currentPath = "";
  #loadedPages = new Set<string>();
  #initialized = false;

  constructor() {
    super();
    this.routeContent = html`<div style="padding: 24px; text-align: center;">
      Loading...
    </div>`;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.#unsubscribe = subscribe((state: RouterState) => {
      this.#handleRouteChange(state);
    });
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.#unsubscribe?.();
  }

  protected willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);
    if (!this.#initialized) {
      this.#initialized = true;
      this.#handleRouteChange(getCurrentRoute());
    }
  }

  #handleRouteChange(state: RouterState): void {
    if (state.path === this.#currentPath) return;
    this.#currentPath = state.path;
    void this.#loadRoute(state);
  }

  async #loadRoute(state: RouterState): Promise<void> {
    if (!this.#loadedPages.has(state.path)) {
      this.routeContent = html`<div
        style="padding: 24px; text-align: center; color: rgba(255,255,255,0.6);"
      >
        Loading...
      </div>`;

      const loader = pageLoaders[state.path];
      if (loader) {
        await loader();
        this.#loadedPages.add(state.path);
      }
    }

    const handler = getRouteHandler();
    if (handler) {
      this.routeContent = handler(state.params);
    } else {
      this.routeContent = html`<div style="padding: 24px;">Not Found</div>`;
    }
  }

  render() {
    return html`
      <metrino-app-shell> ${this.routeContent} </metrino-app-shell>
    `;
  }
}

customElements.define("metrino-app", MetrinoApp);
