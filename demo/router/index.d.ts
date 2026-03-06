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
export declare function initRouter(routeDefs: RouteDef[]): void;
export declare function getCurrentRoute(): RouterState;
export declare function navigate(path: string): void;
export declare function subscribe(listener: RouterListener): () => void;
export declare function getRouteHandler(): RouteHandler | null;
export declare function link(path: string): string;
//# sourceMappingURL=index.d.ts.map