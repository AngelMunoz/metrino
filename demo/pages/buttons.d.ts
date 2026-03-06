import { LitElement } from "lit";
import "../@src/components/buttons/button.ts";
import "../@src/components/buttons/hyperlink-button.ts";
import "../@src/components/buttons/repeat-button.ts";
import "../@src/components/buttons/dropdown-button.ts";
export declare class MetrinoButtonsPage extends LitElement {
  #private;
  static styles: import("lit").CSSResult;
  static properties: {
    repeatCount: {
      state: boolean;
    };
    dropdownOpen: {
      state: boolean;
    };
  };
  repeatCount: number;
  dropdownOpen: boolean;
  constructor();
  render(): import("lit-html").TemplateResult<1>;
}
declare global {
  interface HTMLElementTagNameMap {
    "metrino-buttons-page": MetrinoButtonsPage;
  }
}
//# sourceMappingURL=buttons.d.ts.map
