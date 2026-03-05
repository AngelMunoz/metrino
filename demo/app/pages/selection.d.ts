import { LitElement } from "lit";
import "../../../src/components/selection/list-box.ts";
import "../../../src/components/selection/list-view.ts";
import "../../../src/components/selection/grid-view.ts";
import "../../../src/components/selection/flip-view.ts";
import "../../../src/components/selection/tree-view.ts";
import "../../../src/components/selection/long-list-selector.ts";
import "../../../src/components/selection/semantic-zoom.ts";
import "../../../src/components/selection/list-picker.ts";
import "../../../src/components/buttons/button.ts";
import "../../../src/components/primitives/icon.ts";
export declare class MetrinoSelectionPage extends LitElement {
    #private;
    static styles: import("lit").CSSResult[];
    static properties: {
        listBoxMode: {
            state: boolean;
        };
        listViewItems: {
            state: boolean;
        };
        gridViewItems: {
            state: boolean;
        };
        listViewMode: {
            state: boolean;
        };
        gridViewMode: {
            state: boolean;
        };
        longListItems: {
            state: boolean;
        };
        longListMode: {
            state: boolean;
        };
        treeSelected: {
            state: boolean;
        };
        renderedListViewCount: {
            state: boolean;
        };
        renderedGridViewCount: {
            state: boolean;
        };
        renderedLongListCount: {
            state: boolean;
        };
        listBoxSelection: {
            state: boolean;
        };
        listViewSelection: {
            state: boolean;
        };
        gridViewSelection: {
            state: boolean;
        };
        longListSelection: {
            state: boolean;
        };
    };
    listBoxMode: "single" | "multiple" | "extended";
    listViewItems: {
        name: string;
        category: string;
    }[];
    gridViewItems: {
        name: string;
        color: string;
    }[];
    listViewMode: "none" | "single" | "multiple" | "extended";
    gridViewMode: "none" | "single" | "multiple" | "extended";
    longListItems: {
        name: string;
        category: string;
    }[];
    longListMode: "none" | "single" | "multiple";
    treeSelected: string;
    renderedListViewCount: number;
    renderedGridViewCount: number;
    renderedLongListCount: number;
    listBoxSelection: string;
    listViewSelection: string;
    gridViewSelection: string;
    longListSelection: string;
    constructor();
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=selection.d.ts.map