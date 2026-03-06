import type { html } from "lit";

export type RouteHandler = (params: Record<string, string>) => ReturnType<typeof html>;
export type RouteDef = {
  path: string;
  title: string;
  handler: RouteHandler;
};

export type RouterState = {
  path: string;
  params: Record<string, string>;
};

export type RouterListener = (state: RouterState) => void;

let listeners: RouterListener[] = [];
let routes: RouteDef[] = [];
let currentPath = "";
let currentParams: Record<string, string> = {};

export function initRouter(routeDefs: RouteDef[]): void {
  routes = routeDefs;
  window.addEventListener("hashchange", handleHashChange);
  handleHashChange();
}

export function getCurrentRoute(): RouterState {
  return { path: currentPath, params: currentParams };
}

export function navigate(path: string): void {
  window.location.hash = path;
}

export function subscribe(listener: RouterListener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function handleHashChange(): void {
  const fullHash = window.location.hash.slice(1) || "/";
  // Handle hash fragments like "/navigation#component-id"
  const hashIndex = fullHash.indexOf("#");
  const hash = hashIndex > -1 ? fullHash.slice(0, hashIndex) : fullHash;
  const fragment = hashIndex > -1 ? fullHash.slice(hashIndex + 1) : "";
  
  const [path, queryString] = hash.split("?");
  
  const params: Record<string, string> = {};
  if (queryString) {
    new URLSearchParams(queryString).forEach((value, key) => {
      params[key] = value;
    });
  }
  
  // Add fragment as a param for scrolling
  if (fragment) {
    params["__fragment"] = fragment;
  }

  currentPath = path;
  currentParams = params;

  const route = matchRoute(path);
  if (route) {
    document.title = `${route.title} | Metrino`;
  }

  listeners.forEach((l) => l({ path: currentPath, params: currentParams }));
  
  // Handle scrolling to fragment after route renders
  if (fragment) {
    setTimeout(() => {
      const element = document.getElementById(fragment);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  }
}

function matchRoute(path: string): RouteDef | undefined {
  for (const route of routes) {
    const routeParts = route.path.split("/").filter(Boolean);
    const pathParts = path.split("/").filter(Boolean);
    
    if (routeParts.length !== pathParts.length) continue;
    
    let matches = true;
    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) continue;
      if (routeParts[i] !== pathParts[i]) {
        matches = false;
        break;
      }
    }
    
    if (matches) return route;
  }
  
  return routes.find((r) => r.path === "/");
}

export function getRouteHandler(): RouteHandler | null {
  const route = matchRoute(currentPath);
  return route?.handler ?? null;
}

export function link(path: string): string {
  return `#${path}`;
}

// Navigate to a specific component within a page
export function navigateToComponent(page: string, componentId: string): void {
  window.location.hash = `${page}#${componentId}`;
}
