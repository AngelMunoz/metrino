import { LitElement } from "lit";
import "../../../src/components/progress/progress-bar.ts";
import "../../../src/components/progress/progress-ring.ts";
import "../../../src/components/input/slider.ts";
import "../../../src/components/buttons/button.ts";
export declare class MetrinoProgressPage extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    static properties: {
        progressValue: {
            state: boolean;
        };
        isAnimating: {
            state: boolean;
        };
    };
    progressValue: number;
    isAnimating: boolean;
    constructor();
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=progress.d.ts.map