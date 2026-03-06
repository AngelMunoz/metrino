import { LitElement } from "lit";
import "../@src/components/input/text-box.ts";
import "../@src/components/input/password-box.ts";
import "../@src/components/input/number-box.ts";
import "../@src/components/input/check-box.ts";
import "../@src/components/input/radio-button.ts";
import "../@src/components/input/toggle-switch.ts";
import "../@src/components/input/slider.ts";
import "../@src/components/input/rating.ts";
import "../@src/components/input/combo-box.ts";
import "../@src/components/input/auto-suggest-box.ts";
import "../@src/components/input/rich-edit-box.ts";
export declare class MetrinoInputPage extends LitElement {
  #private;
  static styles: import("lit").CSSResult;
  static properties: {
    textBoxValue: {
      state: boolean;
    };
    passwordValue: {
      state: boolean;
    };
    numberValue: {
      state: boolean;
    };
    checkBoxChecked: {
      state: boolean;
    };
    toggleOn: {
      state: boolean;
    };
    sliderValue: {
      state: boolean;
    };
    ratingValue: {
      state: boolean;
    };
    comboValue: {
      state: boolean;
    };
    autoSuggestValue: {
      state: boolean;
    };
    richEditValue: {
      state: boolean;
    };
  };
  textBoxValue: string;
  passwordValue: string;
  numberValue: number;
  checkBoxChecked: boolean;
  toggleOn: boolean;
  sliderValue: number;
  ratingValue: number;
  comboValue: string;
  autoSuggestValue: string;
  richEditValue: string;
  constructor();
  firstUpdated(): void;
  render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=input.d.ts.map
