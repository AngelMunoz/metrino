import { LitElement } from "lit";
import { type Theme, type AccentColor } from "../state";
export declare class MetrinoAppShell extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    static properties: {
        settingsOpen: {
            state: boolean;
        };
        currentTheme: {
            state: boolean;
        };
        currentAccent: {
            state: boolean;
        };
    };
    settingsOpen: boolean;
    currentTheme: Theme;
    currentAccent: AccentColor;
    constructor();
    connectedCallback(): void;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=app-shell.d.ts.map