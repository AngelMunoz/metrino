import { LitElement } from "lit";
import "../../../src/components/tiles/flip-tile.ts";
import "../../../src/components/tiles/cycle-tile.ts";
import "../../../src/components/tiles/iconic-tile.ts";
import "../../../src/components/tiles/live-tile.ts";
import "../../../src/components/layout/tile-grid.ts";
import "../../../src/components/input/slider.ts";
import "../../../src/components/buttons/button.ts";
export declare class MetrinoTilesPage extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    static properties: {
        cycleInterval: {
            state: boolean;
        };
        flipTileFlipped: {
            state: boolean;
        };
        liveTileCount: {
            state: boolean;
        };
    };
    cycleInterval: number;
    flipTileFlipped: boolean;
    liveTileCount: number;
    constructor();
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=tiles.d.ts.map