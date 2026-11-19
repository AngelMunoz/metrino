import { expect, test } from "@playwright/test";
import {
  VALID,
  checkedValidation,
  dateValidation,
  numberValidation,
  parseISODate,
  textValidation,
  timeValidation,
} from "../../src/utils/form-control.ts";

test.describe("form-control helpers", () => {
  test.describe("textValidation", () => {
    test("empty required value reports valueMissing", () => {
      const validation = textValidation("", true);
      expect(validation.flags.valueMissing).toBe(true);
      expect(validation.message.length).toBeGreaterThanOrEqual(1);
    });

    test("filled required value is valid", () => {
      expect(textValidation("typed", true)).toEqual(VALID);
    });

    test("empty optional value is valid", () => {
      expect(textValidation("", false)).toEqual(VALID);
    });
  });

  // richTextValidation parses markup through the real sanitizer, which
  // needs a real DOM, so these cases run in the demo page against the real
  // module. The remaining helpers in this file never touch a DOM API and
  // stay as direct worker imports.
  test.describe("richTextValidation", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
    });

    test("required with empty or formatting-only markup reports valueMissing", async ({
      page,
    }) => {
      const flags = await page.evaluate(async () => {
        const mod = (await import(
          "/src/utils/form-control.ts" as string
        )) as typeof import("../../src/utils/form-control.ts");
        return [
          mod.richTextValidation("", true).flags.valueMissing,
          mod.richTextValidation("<br>", true).flags.valueMissing,
          mod.richTextValidation("<p>   </p>", true).flags.valueMissing,
        ];
      });

      expect(flags).toEqual([true, true, true]);
    });

    test("required with visible text is valid", async ({ page }) => {
      const validation = await page.evaluate(async () => {
        const mod = (await import(
          "/src/utils/form-control.ts" as string
        )) as typeof import("../../src/utils/form-control.ts");
        return mod.richTextValidation("<p>Hello</p>", true);
      });

      expect(validation).toEqual(VALID);
    });

    test("optional markup is always valid", async ({ page }) => {
      const validations = await page.evaluate(async () => {
        const mod = (await import(
          "/src/utils/form-control.ts" as string
        )) as typeof import("../../src/utils/form-control.ts");
        return [
          mod.richTextValidation("<br>", false),
          mod.richTextValidation("", false),
        ];
      });

      expect(validations).toEqual([VALID, VALID]);
    });
  });

  test.describe("checkedValidation", () => {
    test("required unchecked control reports valueMissing", () => {
      const validation = checkedValidation(false, true);
      expect(validation.flags.valueMissing).toBe(true);
    });

    test("checked control is valid", () => {
      expect(checkedValidation(true, true)).toEqual(VALID);
    });

    test("unchecked optional control is valid", () => {
      expect(checkedValidation(false, false)).toEqual(VALID);
    });
  });

  test.describe("numberValidation", () => {
    test("required with absent value reports valueMissing", () => {
      const validation = numberValidation({ value: null, required: true });
      expect(validation.flags.valueMissing).toBe(true);
    });

    test("non-finite value reports badInput", () => {
      expect(
        numberValidation({ value: Infinity, required: false }).flags.badInput,
      ).toBe(true);
      expect(
        numberValidation({ value: NaN, required: false }).flags.badInput,
      ).toBe(true);
    });

    test("value below min reports rangeUnderflow with the bound in the message", () => {
      const validation = numberValidation({
        value: 5,
        required: false,
        min: 10,
      });
      expect(validation.flags.rangeUnderflow).toBe(true);
      expect(validation.message).toContain("10");
    });

    test("value above max reports rangeOverflow with the bound in the message", () => {
      const validation = numberValidation({
        value: 15,
        required: false,
        max: 10,
      });
      expect(validation.flags.rangeOverflow).toBe(true);
      expect(validation.message).toContain("10");
    });

    test("boundary values satisfy min and max", () => {
      expect(
        numberValidation({ value: 10, required: false, min: 10, max: 10 }),
      ).toEqual(VALID);
    });

    test("value off the step grid reports stepMismatch measured from min", () => {
      const validation = numberValidation({
        value: 5.5,
        required: false,
        min: 0,
        step: 1,
      });
      expect(validation.flags.stepMismatch).toBe(true);
      expect(
        numberValidation({ value: 5, required: false, min: 0, step: 1 }).flags
          .stepMismatch,
      ).not.toBe(true);
      expect(
        numberValidation({ value: 2, required: false, min: 0.5, step: 1.5 })
          .flags.stepMismatch,
      ).not.toBe(true);
    });

    test("non-positive or infinite step never reports stepMismatch", () => {
      expect(
        numberValidation({ value: 5.5, required: false, step: 0 }),
      ).toEqual(VALID);
      expect(
        numberValidation({ value: 5.5, required: false, step: Infinity }),
      ).toEqual(VALID);
    });

    test("range and step checks still apply to required controls with values", () => {
      expect(
        numberValidation({ value: 99, required: true, max: 10 }).flags
          .rangeOverflow,
      ).toBe(true);
      expect(
        numberValidation({ value: 5.5, required: true, step: 1 }).flags
          .stepMismatch,
      ).toBe(true);
    });

    test("step without min measures the grid from zero", () => {
      expect(
        numberValidation({ value: 6, required: false, step: 3 }).flags
          .stepMismatch,
      ).not.toBe(true);
      expect(
        numberValidation({ value: 7, required: false, step: 3 }).flags
          .stepMismatch,
      ).toBe(true);
    });
  });

  test.describe("parseISODate", () => {
    test("parses valid ISO dates as local dates", () => {
      const date = parseISODate("2026-09-20");
      expect(date).not.toBeNull();
      expect(date?.getFullYear()).toBe(2026);
      expect(date?.getMonth()).toBe(8);
      expect(date?.getDate()).toBe(20);
    });

    test("rejects impossible dates instead of rolling over", () => {
      expect(parseISODate("2026-02-31")).toBeNull();
      expect(parseISODate("2026-13-01")).toBeNull();
    });

    test("rejects non-ISO shapes", () => {
      expect(parseISODate("")).toBeNull();
      expect(parseISODate("09/20/2026")).toBeNull();
      expect(parseISODate("2026-9-20")).toBeNull();
      expect(parseISODate("not-a-date")).toBeNull();
    });
  });

  test.describe("dateValidation", () => {
    test("empty required value reports valueMissing", () => {
      const validation = dateValidation({ value: "", required: true });
      expect(validation.flags.valueMissing).toBe(true);
    });

    test("empty optional value is valid", () => {
      expect(dateValidation({ value: "", required: false })).toEqual(VALID);
    });

    test("unparseable non-empty value reports badInput", () => {
      const validation = dateValidation({
        value: "not-a-date",
        required: false,
      });
      expect(validation.flags.badInput).toBe(true);
    });

    test("date before min reports rangeUnderflow compared as calendar dates", () => {
      const validation = dateValidation({
        value: "2026-01-15",
        required: false,
        min: "2026-09-01",
      });
      expect(validation.flags.rangeUnderflow).toBe(true);
    });

    test("date after max reports rangeOverflow compared as calendar dates", () => {
      const validation = dateValidation({
        value: "2026-12-01",
        required: false,
        max: "2026-09-01",
      });
      expect(validation.flags.rangeOverflow).toBe(true);
    });

    test("boundaries satisfy min and max", () => {
      expect(
        dateValidation({
          value: "2026-09-01",
          required: false,
          min: "2026-09-01",
          max: "2026-09-01",
        }),
      ).toEqual(VALID);
    });

    test("bounds that do not parse are ignored", () => {
      expect(
        dateValidation({ value: "2026-01-15", required: false, min: "junk" }),
      ).toEqual(VALID);
    });
  });

  test.describe("timeValidation", () => {
    test("empty required value reports valueMissing", () => {
      const validation = timeValidation("", true);
      expect(validation.flags.valueMissing).toBe(true);
    });

    test("24-hour values are valid", () => {
      expect(timeValidation("13:30", true)).toEqual(VALID);
      expect(timeValidation("00:00", false)).toEqual(VALID);
      expect(timeValidation("23:59:59", false)).toEqual(VALID);
    });

    test("12-hour values with meridiem are valid", () => {
      expect(timeValidation("12:30 PM", false)).toEqual(VALID);
      expect(timeValidation("2:05 am", false)).toEqual(VALID);
    });

    test("in-range seconds are valid", () => {
      expect(timeValidation("14:30:59", false)).toEqual(VALID);
      expect(timeValidation("1:05:59 PM", false)).toEqual(VALID);
    });

    test("out-of-range times report badInput", () => {
      expect(timeValidation("25:00", false).flags.badInput).toBe(true);
      expect(timeValidation("13:30 PM", false).flags.badInput).toBe(true);
      expect(timeValidation("23:59:99", false).flags.badInput).toBe(true);
      expect(timeValidation("1:05:99 PM", false).flags.badInput).toBe(true);
      expect(timeValidation("garbage", false).flags.badInput).toBe(true);
    });
  });
});
