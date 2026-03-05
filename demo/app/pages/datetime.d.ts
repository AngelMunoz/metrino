import { LitElement } from "lit";
import "../../../src/components/datetime/date-picker.ts";
import "../../../src/components/datetime/time-picker.ts";
import "../../../src/components/datetime/date-picker-roller.ts";
import "../../../src/components/datetime/time-picker-roller.ts";
import "../../../src/components/datetime/calendar.ts";
import "../../../src/components/datetime/calendar-date-picker.ts";
export declare class MetrinoDatetimePage extends LitElement {
    #private;
    static styles: import("lit").CSSResult;
    static properties: {
        dateValue: {
            state: boolean;
        };
        timeValue: {
            state: boolean;
        };
        rollerDateValue: {
            state: boolean;
        };
        rollerTime12Value: {
            state: boolean;
        };
        rollerTime24Value: {
            state: boolean;
        };
        calendarValue: {
            state: boolean;
        };
        calendarPickerValue: {
            state: boolean;
        };
    };
    dateValue: string;
    timeValue: string;
    rollerDateValue: string;
    rollerTime12Value: string;
    rollerTime24Value: string;
    calendarValue: string;
    calendarPickerValue: string;
    constructor();
    render(): import("lit-html").TemplateResult<1>;
}
//# sourceMappingURL=datetime.d.ts.map