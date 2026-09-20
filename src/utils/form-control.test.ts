import { assert } from "chai";
import {
  VALID,
  checkedValidation,
  dateValidation,
  numberValidation,
  parseISODate,
  richTextValidation,
  textValidation,
  timeValidation,
} from "./form-control.ts";
import { registerMetroButton } from "../components/buttons/button.ts";
import { registerMetroTextBox } from "../components/input/text-box.ts";
import { registerMetroPasswordBox } from "../components/input/password-box.ts";
import { registerMetroNumberBox } from "../components/input/number-box.ts";
import { registerMetroCheckBox } from "../components/input/check-box.ts";
import { registerMetroRadioButton } from "../components/input/radio-button.ts";
import { registerMetroToggleSwitch } from "../components/input/toggle-switch.ts";
import { registerMetroSlider } from "../components/input/slider.ts";
import { registerMetroRating } from "../components/input/rating.ts";
import { registerMetroComboBox } from "../components/input/combo-box.ts";
import { registerMetroAutoSuggestBox } from "../components/input/auto-suggest-box.ts";
import { registerMetroRichEditBox } from "../components/input/rich-edit-box.ts";
import { registerMetroDatePicker } from "../components/datetime/date-picker.ts";
import { registerMetroTimePicker } from "../components/datetime/time-picker.ts";
import { registerMetroCalendarDatePicker } from "../components/datetime/calendar-date-picker.ts";
import { registerMetroDatePickerRoller } from "../components/datetime/date-picker-roller.ts";
import { registerMetroTimePickerRoller } from "../components/datetime/time-picker-roller.ts";

suite("form-control helpers", () => {
  suite("textValidation", () => {
    test("empty required value reports valueMissing", () => {
      const validation = textValidation("", true);
      assert.isTrue(validation.flags.valueMissing);
      assert.isAtLeast(validation.message.length, 1);
    });

    test("filled required value is valid", () => {
      assert.deepEqual(textValidation("typed", true), VALID);
    });

    test("empty optional value is valid", () => {
      assert.deepEqual(textValidation("", false), VALID);
    });
  });

  suite("richTextValidation", () => {
    test("required with empty or formatting-only markup reports valueMissing", () => {
      assert.isTrue(richTextValidation("", true).flags.valueMissing);
      assert.isTrue(richTextValidation("<br>", true).flags.valueMissing);
      assert.isTrue(richTextValidation("<p>   </p>", true).flags.valueMissing);
    });

    test("required with visible text is valid", () => {
      assert.deepEqual(richTextValidation("<p>Hello</p>", true), VALID);
    });

    test("optional markup is always valid", () => {
      assert.deepEqual(richTextValidation("<br>", false), VALID);
      assert.deepEqual(richTextValidation("", false), VALID);
    });
  });

  suite("checkedValidation", () => {
    test("required unchecked control reports valueMissing", () => {
      const validation = checkedValidation(false, true);
      assert.isTrue(validation.flags.valueMissing);
    });

    test("checked control is valid", () => {
      assert.deepEqual(checkedValidation(true, true), VALID);
    });

    test("unchecked optional control is valid", () => {
      assert.deepEqual(checkedValidation(false, false), VALID);
    });
  });

  suite("numberValidation", () => {
    test("required with absent value reports valueMissing", () => {
      const validation = numberValidation({ value: null, required: true });
      assert.isTrue(validation.flags.valueMissing);
    });

    test("non-finite value reports badInput", () => {
      assert.isTrue(numberValidation({ value: Infinity, required: false }).flags.badInput);
      assert.isTrue(numberValidation({ value: NaN, required: false }).flags.badInput);
    });

    test("value below min reports rangeUnderflow with the bound in the message", () => {
      const validation = numberValidation({ value: 5, required: false, min: 10 });
      assert.isTrue(validation.flags.rangeUnderflow);
      assert.include(validation.message, "10");
    });

    test("value above max reports rangeOverflow with the bound in the message", () => {
      const validation = numberValidation({ value: 15, required: false, max: 10 });
      assert.isTrue(validation.flags.rangeOverflow);
      assert.include(validation.message, "10");
    });

    test("boundary values satisfy min and max", () => {
      assert.deepEqual(numberValidation({ value: 10, required: false, min: 10, max: 10 }), VALID);
    });

    test("value off the step grid reports stepMismatch measured from min", () => {
      const validation = numberValidation({ value: 5.5, required: false, min: 0, step: 1 });
      assert.isTrue(validation.flags.stepMismatch);
      assert.isNotTrue(numberValidation({ value: 5, required: false, min: 0, step: 1 }).flags.stepMismatch);
      assert.isNotTrue(numberValidation({ value: 2, required: false, min: 0.5, step: 1.5 }).flags.stepMismatch);
    });

    test("non-positive or infinite step never reports stepMismatch", () => {
      assert.deepEqual(numberValidation({ value: 5.5, required: false, step: 0 }), VALID);
      assert.deepEqual(numberValidation({ value: 5.5, required: false, step: Infinity }), VALID);
    });

    test("range and step checks still apply to required controls with values", () => {
      assert.isTrue(numberValidation({ value: 99, required: true, max: 10 }).flags.rangeOverflow);
      assert.isTrue(numberValidation({ value: 5.5, required: true, step: 1 }).flags.stepMismatch);
    });

    test("step without min measures the grid from zero", () => {
      assert.isNotTrue(numberValidation({ value: 6, required: false, step: 3 }).flags.stepMismatch);
      assert.isTrue(numberValidation({ value: 7, required: false, step: 3 }).flags.stepMismatch);
    });
  });

  suite("parseISODate", () => {
    test("parses valid ISO dates as local dates", () => {
      const date = parseISODate("2026-09-20");
      assert.isNotNull(date);
      assert.equal(date?.getFullYear(), 2026);
      assert.equal(date?.getMonth(), 8);
      assert.equal(date?.getDate(), 20);
    });

    test("rejects impossible dates instead of rolling over", () => {
      assert.isNull(parseISODate("2026-02-31"));
      assert.isNull(parseISODate("2026-13-01"));
    });

    test("rejects non-ISO shapes", () => {
      assert.isNull(parseISODate(""));
      assert.isNull(parseISODate("09/20/2026"));
      assert.isNull(parseISODate("2026-9-20"));
      assert.isNull(parseISODate("not-a-date"));
    });
  });

  suite("dateValidation", () => {
    test("empty required value reports valueMissing", () => {
      const validation = dateValidation({ value: "", required: true });
      assert.isTrue(validation.flags.valueMissing);
    });

    test("empty optional value is valid", () => {
      assert.deepEqual(dateValidation({ value: "", required: false }), VALID);
    });

    test("unparseable non-empty value reports badInput", () => {
      const validation = dateValidation({ value: "not-a-date", required: false });
      assert.isTrue(validation.flags.badInput);
    });

    test("date before min reports rangeUnderflow compared as calendar dates", () => {
      const validation = dateValidation({ value: "2026-01-15", required: false, min: "2026-09-01" });
      assert.isTrue(validation.flags.rangeUnderflow);
    });

    test("date after max reports rangeOverflow compared as calendar dates", () => {
      const validation = dateValidation({ value: "2026-12-01", required: false, max: "2026-09-01" });
      assert.isTrue(validation.flags.rangeOverflow);
    });

    test("boundaries satisfy min and max", () => {
      assert.deepEqual(
        dateValidation({ value: "2026-09-01", required: false, min: "2026-09-01", max: "2026-09-01" }),
        VALID,
      );
    });

    test("bounds that do not parse are ignored", () => {
      assert.deepEqual(dateValidation({ value: "2026-01-15", required: false, min: "junk" }), VALID);
    });
  });

  suite("timeValidation", () => {
    test("empty required value reports valueMissing", () => {
      const validation = timeValidation("", true);
      assert.isTrue(validation.flags.valueMissing);
    });

    test("24-hour values are valid", () => {
      assert.deepEqual(timeValidation("13:30", true), VALID);
      assert.deepEqual(timeValidation("00:00", false), VALID);
      assert.deepEqual(timeValidation("23:59:59", false), VALID);
    });

    test("12-hour values with meridiem are valid", () => {
      assert.deepEqual(timeValidation("12:30 PM", false), VALID);
      assert.deepEqual(timeValidation("2:05 am", false), VALID);
    });

    test("in-range seconds are valid", () => {
      assert.deepEqual(timeValidation("14:30:59", false), VALID);
      assert.deepEqual(timeValidation("1:05:59 PM", false), VALID);
    });

    test("out-of-range times report badInput", () => {
      assert.isTrue(timeValidation("25:00", false).flags.badInput);
      assert.isTrue(timeValidation("13:30 PM", false).flags.badInput);
      assert.isTrue(timeValidation("23:59:99", false).flags.badInput);
      assert.isTrue(timeValidation("1:05:99 PM", false).flags.badInput);
      assert.isTrue(timeValidation("garbage", false).flags.badInput);
    });
  });
});

/**
 * Lit update signal plus the control-specific properties the tests exercise.
 * Note: the constraint-validation API (checkValidity/validity) is NOT
 * exposed on custom element hosts in current browsers, so the integration
 * tests below assert validity through form behavior instead: requestSubmit()
 * blocks and fires `invalid` on the offending control.
 */
type Validatable = HTMLElement & {
  updateComplete: Promise<unknown>;
  [key: string]: any;
};

suite("form control validation integration", () => {
  registerMetroButton();
  registerMetroTextBox();
  registerMetroPasswordBox();
  registerMetroNumberBox();
  registerMetroCheckBox();
  registerMetroRadioButton();
  registerMetroToggleSwitch();
  registerMetroSlider();
  registerMetroRating();
  registerMetroComboBox();
  registerMetroAutoSuggestBox();
  registerMetroRichEditBox();
  registerMetroDatePicker();
  registerMetroTimePicker();
  registerMetroCalendarDatePicker();
  registerMetroDatePickerRoller();
  registerMetroTimePickerRoller();

  let container: HTMLDivElement;

  setup(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  teardown(() => {
    container.remove();
  });

  async function createInForm(
    tag: string,
    attrs: Record<string, string> = {},
  ): Promise<{ form: HTMLFormElement; control: Validatable }> {
    const form = document.createElement("form");
    const control = document.createElement(tag) as Validatable;
    for (const [name, value] of Object.entries(attrs)) {
      control.setAttribute(name, value);
    }
    form.appendChild(control);
    container.appendChild(form);
    await control.updateComplete;
    return { form, control };
  }

  async function assertSubmitBlocked(
    form: HTMLFormElement,
    control: Validatable,
    mutate: () => void,
    expectedInvalid = 1,
  ): Promise<void> {
    mutate();
    await control.updateComplete;
    let submits = 0;
    let invalid = 0;
    form.addEventListener("submit", e => {
      e.preventDefault();
      submits += 1;
    });
    control.addEventListener("invalid", () => {
      invalid += 1;
    });
    form.requestSubmit();
    assert.equal(submits, 0, "expected submit to be blocked");
    assert.equal(invalid, expectedInvalid, "expected invalid events on the blocked control");
  }

  async function assertSubmitAllowed(form: HTMLFormElement): Promise<void> {
    let submits = 0;
    form.addEventListener("submit", e => {
      e.preventDefault();
      submits += 1;
    });
    form.requestSubmit();
    assert.equal(submits, 1, "expected submit to go through");
  }

  test("text-box: required blocks submit until filled, reset blocks again", async () => {
    const { form, control } = await createInForm("metro-text-box", { name: "field", required: "" });
    await assertSubmitBlocked(form, control, () => {});

    control.value = "typed";
    await control.updateComplete;
    await assertSubmitAllowed(form);

    form.reset();
    await control.updateComplete;
    assert.equal(control.value, "");
    await assertSubmitBlocked(form, control, () => {});
  });

  test("password-box: required blocks submit until filled", async () => {
    const { form, control } = await createInForm("metro-password-box", { name: "pass", required: "" });
    await assertSubmitBlocked(form, control, () => {});
    control.value = "hunter2";
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });

  test("number-box: range and step constraints block submit", async () => {
    const { form, control } = await createInForm("metro-number-box", {
      name: "count",
      min: "0",
      max: "10",
      step: "1",
    });
    await assertSubmitAllowed(form);

    await assertSubmitBlocked(form, control, () => { control.value = 15; });
    await assertSubmitBlocked(form, control, () => { control.value = -5; });
    await assertSubmitBlocked(form, control, () => { control.value = 5.5; });

    control.value = 10;
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });

  test("number-box: required blocks submit only while the value is not a number", async () => {
    const { form, control } = await createInForm("metro-number-box", { name: "count", required: "" });
    // A numeric control always reports a value, so 0 satisfies required.
    await assertSubmitAllowed(form);

    control.value = Number.NaN;
    await control.updateComplete;
    await assertSubmitBlocked(form, control, () => {});

    control.value = 3;
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });

  test("check-box: required blocks submit until checked", async () => {
    const { form, control } = await createInForm("metro-check-box", { name: "agree", required: "" });
    await assertSubmitBlocked(form, control, () => {});
    control.checked = true;
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });

  test("toggle-switch: required blocks submit until on", async () => {
    const { form, control } = await createInForm("metro-toggle-switch", { name: "tos", required: "" });
    await assertSubmitBlocked(form, control, () => {});
    control.on = true;
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });

  test("radio-button: required group blocks submit until any member is checked", async () => {
    const form = document.createElement("form");
    const radios: Validatable[] = [];
    for (const value of ["a", "b", "c"]) {
      const radio = document.createElement("metro-radio-button") as Validatable;
      radio.setAttribute("name", "plan");
      radio.setAttribute("value", value);
      if (value === "a") radio.setAttribute("required", "");
      form.appendChild(radio);
      radios.push(radio);
    }
    container.appendChild(form);
    for (const radio of radios) {
      await radio.updateComplete;
    }

    // One required member makes the whole unchecked group invalid; each
    // member fires its own invalid event, the helper listens on radios[0].
    await assertSubmitBlocked(form, radios[0], () => {});

    const target = radios[2].shadowRoot?.querySelector(".radio") as HTMLElement;
    target.click();
    for (const radio of radios) {
      await radio.updateComplete;
    }
    await assertSubmitAllowed(form);
  });

  test("radio-button: groups are scoped to the form owner", async () => {
    const formA = document.createElement("form");
    const formB = document.createElement("form");
    const radios: Validatable[] = [];

    function addRadio(form: HTMLFormElement, value: string, required = false): Validatable {
      const radio = document.createElement("metro-radio-button") as Validatable;
      radio.setAttribute("name", "plan");
      radio.setAttribute("value", value);
      if (required) radio.setAttribute("required", "");
      form.appendChild(radio);
      radios.push(radio);
      return radio;
    }

    const [a1, a2, b1, b2] = [
      addRadio(formA, "a1", true),
      addRadio(formA, "a2"),
      addRadio(formB, "b1"),
      addRadio(formB, "b2"),
    ];
    container.appendChild(formA);
    container.appendChild(formB);
    for (const radio of radios) {
      await radio.updateComplete;
    }

    async function click(radio: Validatable): Promise<void> {
      (radio.shadowRoot?.querySelector(".radio") as HTMLElement).click();
      await radio.updateComplete;
    }

    // A selection in form B must neither satisfy nor clear form A's group.
    await click(b1);
    assert.isFalse(a1.checked);
    assert.isFalse(a2.checked);
    await assertSubmitBlocked(formA, a1, () => {});

    await click(a2);
    assert.isTrue(b1.checked);
    await assertSubmitAllowed(formA);

    // Selecting another member of form B leaves form A's selection alone.
    await click(b2);
    assert.isTrue(a2.checked);
    assert.isTrue(b2.checked);
  });

  test("radio-button: renaming the checked member revalidates the group left behind", async () => {
    const form = document.createElement("form");
    const required = document.createElement("metro-radio-button") as Validatable;
    required.setAttribute("name", "plan");
    required.setAttribute("value", "a");
    required.setAttribute("required", "");
    const checked = document.createElement("metro-radio-button") as Validatable;
    checked.setAttribute("name", "plan");
    checked.setAttribute("value", "b");
    form.appendChild(required);
    form.appendChild(checked);
    container.appendChild(form);
    await required.updateComplete;
    await checked.updateComplete;

    checked.checked = true;
    await checked.updateComplete;
    await assertSubmitAllowed(form);

    // The required group loses its only selection when the checked member is
    // renamed out of it, so the form must block again.
    await assertSubmitBlocked(form, required, () => { checked.name = "other"; });
  });

  test("radio-button: removing the checked member invalidates the group left behind", async () => {
    const form = document.createElement("form");
    const required = document.createElement("metro-radio-button") as Validatable;
    required.setAttribute("name", "plan");
    required.setAttribute("value", "a");
    required.setAttribute("required", "");
    const checked = document.createElement("metro-radio-button") as Validatable;
    checked.setAttribute("name", "plan");
    checked.setAttribute("value", "b");
    form.appendChild(required);
    form.appendChild(checked);
    container.appendChild(form);
    await required.updateComplete;
    await checked.updateComplete;

    checked.checked = true;
    await checked.updateComplete;
    await assertSubmitAllowed(form);

    checked.remove();
    await new Promise(resolve => setTimeout(resolve, 0));
    await required.updateComplete;
    await assertSubmitBlocked(form, required, () => {});
  });

  test("radio-button: moving a checked member between forms moves its group membership", async () => {
    const formA = document.createElement("form");
    formA.id = "radio-move-form-a";
    const formB = document.createElement("form");
    const required = document.createElement("metro-radio-button") as Validatable;
    required.setAttribute("name", "plan");
    required.setAttribute("value", "a");
    required.setAttribute("required", "");
    const checked = document.createElement("metro-radio-button") as Validatable;
    checked.setAttribute("name", "plan");
    checked.setAttribute("value", "b");
    formA.appendChild(required);
    formB.appendChild(checked);
    container.appendChild(formA);
    container.appendChild(formB);
    await required.updateComplete;
    await checked.updateComplete;

    // Checking the member in form B must not satisfy form A's group.
    checked.checked = true;
    await checked.updateComplete;
    await assertSubmitBlocked(formA, required, () => {});

    // Re-associating the checked radio with form A satisfies its group.
    checked.setAttribute("form", formA.id);
    await new Promise(resolve => setTimeout(resolve, 0));
    await required.updateComplete;
    await assertSubmitAllowed(formA);
  });

  test("slider: programmatic out-of-range values block submit", async () => {
    const { form, control } = await createInForm("metro-slider", { name: "vol", min: "0", max: "100" });
    await assertSubmitAllowed(form);
    await assertSubmitBlocked(form, control, () => { control.value = 150; });
    control.value = 50;
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });

  test("rating: required blocks submit while unrated (0)", async () => {
    const { form, control } = await createInForm("metro-rating", { name: "stars", required: "" });
    await assertSubmitBlocked(form, control, () => {});
    control.value = 3;
    await control.updateComplete;
    await assertSubmitAllowed(form);
    await assertSubmitBlocked(form, control, () => { control.value = 9; });
  });

  test("numeric controls: non-finite values are not submitted", async () => {
    const cases = [
      ["metro-number-box", "count"],
      ["metro-slider", "vol"],
      ["metro-rating", "stars"],
    ] as const;

    for (const [tag, name] of cases) {
      const { form, control } = await createInForm(tag, { name });

      control.value = Number.NaN;
      await control.updateComplete;
      assert.isFalse(new FormData(form).has(name), `${tag} must not submit NaN`);

      control.value = Number.POSITIVE_INFINITY;
      await control.updateComplete;
      assert.isFalse(new FormData(form).has(name), `${tag} must not submit Infinity`);

      control.value = 3;
      await control.updateComplete;
      assert.equal(new FormData(form).get(name), "3", `${tag} must submit finite values`);
    }
  });

  test("combo-box: required blocks submit until selected", async () => {
    const { form, control } = await createInForm("metro-combo-box", { name: "pick", required: "" });
    await assertSubmitBlocked(form, control, () => {});
    control.value = "Option 1";
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });

  test("auto-suggest-box: required blocks submit until selected", async () => {
    const { form, control } = await createInForm("metro-auto-suggest-box", { name: "city", required: "" });
    await assertSubmitBlocked(form, control, () => {});
    control.value = "Seattle";
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });

  test("rich-edit-box: required blocks submit until content is set", async () => {
    const { form, control } = await createInForm("metro-rich-edit-box", { name: "bio", required: "" });
    await assertSubmitBlocked(form, control, () => {});
    control.value = "<p>Hello</p>";
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });

  test("rich-edit-box: required ignores formatting-only markup", async () => {
    const { form, control } = await createInForm("metro-rich-edit-box", { name: "bio", required: "" });
    await assertSubmitBlocked(form, control, () => { control.value = "<br>"; });
    await assertSubmitBlocked(form, control, () => { control.value = "<p>   </p>"; });
    control.value = "<p>Hello</p>";
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });

  test("date-picker: required and unparseable values block submit", async () => {
    const { form, control } = await createInForm("metro-date-picker", { name: "when", required: "" });
    await assertSubmitBlocked(form, control, () => {});
    await assertSubmitBlocked(form, control, () => { control.value = "not-a-date"; });
    control.value = "2026-09-20";
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });

  test("time-picker: required and unparseable values block submit", async () => {
    const { form, control } = await createInForm("metro-time-picker", { name: "at", required: "" });
    await assertSubmitBlocked(form, control, () => {});
    await assertSubmitBlocked(form, control, () => { control.value = "99:99"; });
    control.value = "13:30";
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });

  test("calendar-date-picker: min/max dates and badInput block submit", async () => {
    const { form, control } = await createInForm("metro-calendar-date-picker", {
      name: "day",
      required: "",
      "min-date": "2026-01-01",
      "max-date": "2026-12-31",
    });
    await assertSubmitBlocked(form, control, () => {});
    await assertSubmitBlocked(form, control, () => { control.value = "2025-06-01"; });
    await assertSubmitBlocked(form, control, () => { control.value = "2027-06-01"; });
    await assertSubmitBlocked(form, control, () => { control.value = "2026-02-31"; });
    control.value = "2026-06-15";
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });

  test("date-picker-roller: year bounds translate to date range blocking", async () => {
    const { form, control } = await createInForm("metro-date-picker-roller", {
      name: "rolled",
      required: "",
      "min-year": "2000",
      "max-year": "2030",
    });
    await assertSubmitBlocked(form, control, () => {});
    await assertSubmitBlocked(form, control, () => { control.value = "1999-05-05"; });
    await assertSubmitBlocked(form, control, () => { control.value = "2031-05-05"; });
    control.value = "2026-05-05";
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });

  test("time-picker-roller: required, 12-hour values valid, garbage blocks", async () => {
    const { form, control } = await createInForm("metro-time-picker-roller", { name: "alarm", required: "" });
    await assertSubmitBlocked(form, control, () => {});
    await assertSubmitBlocked(form, control, () => { control.value = "25:99"; });
    control.value = "12:30 PM";
    await control.updateComplete;
    await assertSubmitAllowed(form);
  });
});
