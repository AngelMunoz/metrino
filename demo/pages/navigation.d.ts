import { LitElement } from "lit";
import "../@src/components/navigation/pivot.ts";
import "../@src/components/navigation/pivot-item.ts";
import "../@src/components/navigation/hub.ts";
import "../@src/components/navigation/hub-section.ts";
import "../@src/components/navigation/panorama.ts";
import "../@src/components/navigation/panorama-item.ts";
import "../@src/components/navigation/split-view.ts";
import "../@src/components/navigation/app-bar.ts";
import "../@src/components/navigation/app-bar-button.ts";
import "../@src/components/navigation/app-bar-separator.ts";
import "../@src/components/navigation/app-bar-toggle-button.ts";
import "../@src/components/primitives/icon.ts";
export declare class MetrinoNavigationPage extends LitElement {
  #private;
  static properties: {
    splitViewOpen: {
      state: boolean;
    };
    splitViewMode: {
      state: boolean;
    };
    appBarExpanded: {
      state: boolean;
    };
  };
  splitViewOpen: boolean;
  splitViewMode: "overlay" | "inline" | "compact";
  appBarExpanded: boolean;
  static styles: import("lit").CSSResult;
  constructor();
  render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=navigation.d.ts.map
