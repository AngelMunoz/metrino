import { LitElement } from "lit";
import "../../../src/styles/tokens.css";
import "../../../src/styles/typography.css";
import "../../../src/styles/animations.css";
import "../../../src/components/tiles/flip-tile.ts";
import "../../../src/components/tiles/cycle-tile.ts";
import "../../../src/components/tiles/iconic-tile.ts";
import "../../../src/components/tiles/live-tile.ts";
import "../../../src/components/layout/tile-grid.ts";
import "../../../src/components/navigation/hub.ts";
import "../../../src/components/navigation/hub-section.ts";
import "../../../src/components/selection/semantic-zoom.ts";
export declare class MetrinoHome extends LitElement {
    #private;
    static styles: any[];
    static properties: {
        _animateTiles: {
            state: boolean;
        };
    };
    _animateTiles: boolean;
    constructor();
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "metrino-home": MetrinoHome;
    }
}
//# sourceMappingURL=home.d.ts.map