/**
 * Shared form-control state helpers.
 *
 * A form-associated custom element must keep two pieces of state in sync
 * through its ElementInternals: the submitted form value and the constraint
 * validation state. They are two halves of one state sync — updating one
 * without the other leaves stale form data or stale validity behind. Every
 * component routes both through `updateFormControlState` from a single
 * per-component choke point (usually `#updateState()`), which every mutating
 * path (property change, user input, reset, state restore) already calls.
 */

import { sanitizeHtmlFragment } from "./sanitize.ts";

/**
 * Constraint-validation outcome for a control state: which native validity
 * flags apply and the message reported for the first failing flag.
 */
export interface ValidationState {
  flags: ValidityStateFlags;
  message: string;
}

/** Validation state for a control whose constraints are all satisfied. */
export const VALID: ValidationState = { flags: {}, message: "" };

const REQUIRED_MESSAGE = "This field is required.";
const STEP_EPSILON = 1e-9;

/**
 * Validation for a missing value, for controls whose "empty" state does not
 * map to an empty string (e.g., an unrated rating or an unchecked group).
 * @returns ValidationState
 */
export function valueMissing(): ValidationState {
  return { flags: { valueMissing: true }, message: REQUIRED_MESSAGE };
}

/**
 * Writes both halves of a control's form state through its internals.
 * @param internals - The ElementInternals of the control
 * @param value - Value submitted with the owner form, or null for no entry
 * @param validation - The constraint-validation outcome for this state
 * @param anchor - Element focused by reportValidity(); should be the
 *   interactive element inside the control's shadow root, if any
 * @returns void
 */
export function updateFormControlState(
  internals: ElementInternals,
  value: string | File | FormData | null,
  validation: ValidationState,
  anchor?: HTMLElement | null,
): void {
  internals.setFormValue(value);
  internals.setValidity(validation.flags, validation.message, anchor ?? undefined);
}

/**
 * Validation for plain text entry: required fields must be non-empty.
 * @param value - Current text value
 * @param required - Whether the control requires a value (already gated on disabled)
 * @returns ValidationState
 */
export function textValidation(value: string, required: boolean): ValidationState {
  if (required && value === "") {
    return { flags: { valueMissing: true }, message: REQUIRED_MESSAGE };
  }
  return VALID;
}

/**
 * Validation for rich text entry: `value` is markup, so a required control
 * must contain visible text — formatting-only markup such as "<br>" or
 * whitespace-only content counts as missing.
 * @param value - Current HTML value
 * @param required - Whether the control requires content (already gated on disabled/readonly)
 * @returns ValidationState
 */
export function richTextValidation(value: string, required: boolean): ValidationState {
  if (!required) return VALID;
  const text = sanitizeHtmlFragment(value).textContent ?? "";
  return text.trim() === "" ? valueMissing() : VALID;
}

/**
 * Validation for a checkable control (checkbox, switch, radio): required
 * controls must be checked to carry a value.
 * @param checked - Whether the control is currently checked
 * @param required - Whether the control must be checked
 * @returns ValidationState
 */
export function checkedValidation(checked: boolean, required: boolean): ValidationState {
  if (required && !checked) {
    return { flags: { valueMissing: true }, message: REQUIRED_MESSAGE };
  }
  return VALID;
}

export interface NumberConstraints {
  /** Current numeric value; NaN or null means the value is not parseable. */
  value: number | null;
  /** Whether a value must be present (already gated on disabled). */
  required: boolean;
  /** Inclusive lower bound, when finite. */
  min?: number;
  /** Inclusive upper bound, when finite. */
  max?: number;
  /** Allowed step between values, when positive and finite. */
  step?: number;
}

/**
 * Validation for numeric entry. Compares numerically, never lexically:
 * reports badInput for non-finite values, valueMissing when required and
 * absent, rangeUnderflow/rangeOverflow against min/max, and stepMismatch
 * against the step grid measured from min.
 * @param constraints - The numeric value and its constraints
 * @returns ValidationState
 */
export function numberValidation(constraints: NumberConstraints): ValidationState {
  const { value, required, min, max, step } = constraints;
  if (value === null || Number.isNaN(value)) {
    if (required) {
      return { flags: { valueMissing: true }, message: REQUIRED_MESSAGE };
    }
    return { flags: { badInput: true }, message: "Enter a valid number." };
  }
  if (!Number.isFinite(value)) {
    return { flags: { badInput: true }, message: "Enter a valid number." };
  }
  if (min !== undefined && Number.isFinite(min) && value < min) {
    return { flags: { rangeUnderflow: true }, message: `Value must be greater than or equal to ${min}.` };
  }
  if (max !== undefined && Number.isFinite(max) && value > max) {
    return { flags: { rangeOverflow: true }, message: `Value must be less than or equal to ${max}.` };
  }
  if (step !== undefined && Number.isFinite(step) && step > 0) {
    const base = min !== undefined && Number.isFinite(min) ? min : 0;
    const remainder = Math.abs((value - base) % step);
    const onStep = remainder < STEP_EPSILON || Math.abs(step - remainder) < STEP_EPSILON;
    if (!onStep) {
      return { flags: { stepMismatch: true }, message: `Value must be a multiple of ${step}.` };
    }
  }
  return VALID;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Parses a strict ISO calendar date ("YYYY-MM-DD"). Rejects strings with
 * other shapes and impossible dates like "2026-02-31" instead of letting
 * the Date constructor silently roll them over.
 * @param value - Candidate ISO date string
 * @returns The parsed local Date, or null when unparseable
 */
export function parseISODate(value: string): Date | null {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}

export interface DateConstraints {
  /** Current value: an ISO "YYYY-MM-DD" string, or "" when nothing is picked. */
  value: string;
  /** Whether a date must be selected (already gated on disabled). */
  required: boolean;
  /** Inclusive lower bound as an ISO date string, or "" for none. */
  min?: string;
  /** Inclusive upper bound as an ISO date string, or "" for none. */
  max?: string;
}

/**
 * Validation for date-picking controls. Bounds are compared as calendar
 * dates, never as strings, and a non-empty value that does not parse as an
 * ISO date reports badInput.
 * @param constraints - The current date value and its bounds
 * @returns ValidationState
 */
export function dateValidation(constraints: DateConstraints): ValidationState {
  const { value, required, min, max } = constraints;
  if (value === "") {
    if (required) {
      return { flags: { valueMissing: true }, message: REQUIRED_MESSAGE };
    }
    return VALID;
  }
  const date = parseISODate(value);
  if (!date) {
    return { flags: { badInput: true }, message: "Enter a valid date." };
  }
  const minDate = min ? parseISODate(min) : null;
  if (minDate && date.getTime() < minDate.getTime()) {
    return { flags: { rangeUnderflow: true }, message: `Date must be ${min} or later.` };
  }
  const maxDate = max ? parseISODate(max) : null;
  if (maxDate && date.getTime() > maxDate.getTime()) {
    return { flags: { rangeOverflow: true }, message: `Date must be ${max} or earlier.` };
  }
  return VALID;
}

const TIME_PATTERN = /^(\d{1,3}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])?$/;

/**
 * Validation for time-picking controls. Accepts both 24-hour values
 * ("14:30", "14:30:00") and 12-hour values with a meridiem ("2:30 PM"),
 * which is what the time roller reports. Reports valueMissing for empty
 * values and badInput for non-empty values that do not parse as a time of
 * day.
 * @param value - Current time value
 * @param required - Whether the control requires a value (already gated on disabled)
 * @returns ValidationState
 */
export function timeValidation(value: string, required: boolean): ValidationState {
  if (value === "") {
    if (required) {
      return { flags: { valueMissing: true }, message: REQUIRED_MESSAGE };
    }
    return VALID;
  }
  const match = TIME_PATTERN.exec(value);
  if (!match) {
    return { flags: { badInput: true }, message: "Enter a valid time." };
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = match[3] === undefined ? 0 : Number(match[3]);
  const meridiem = match[4]?.toLowerCase();
  if (meridiem) {
    if (hours < 1 || hours > 12 || minutes > 59 || seconds > 59) {
      return { flags: { badInput: true }, message: "Enter a valid time." };
    }
    return VALID;
  }
  if (hours > 23 || minutes > 59 || seconds > 59) {
    return { flags: { badInput: true }, message: "Enter a valid time." };
  }
  return VALID;
}
