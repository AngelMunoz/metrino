import { LitElement, html, type PropertyValues } from "lit";
import "./components/app-shell";
import "../../src/styles/tokens.css";
type TemplateResult = ReturnType<typeof html>;
export declare class MetrinoApp extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    static properties: {
        routeContent: {
            state: boolean;
        };
    };
    routeContent: TemplateResult;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    protected willUpdate(changedProperties: PropertyValues<this>): void;
    render(): import("lit-html").TemplateResult<1>;
}
export {};
//# sourceMappingURL=main.d.ts.map