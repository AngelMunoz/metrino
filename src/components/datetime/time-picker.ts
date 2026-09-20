import { LitElement, html, css, type PropertyValues } from "lit";
import { inputBase } from "../../styles/shared.ts";
import { timeValidation, updateFormControlState } from "../../utils/form-control.ts";

export class MetroTimePicker extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: String, reflect: true },
    label: { type: String, reflect: true },
    name: { type: String, reflect: true },
    required: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare label: string;
  declare name: string;
  declare required: boolean;
  declare disabled: boolean;

  static styles = [
    inputBase,
    css`
      input::-webkit-calendar-picker-indicator {
        filter: invert(1);
        cursor: pointer;
      }
    `,
  ];

  #internals: ElementInternals;
  #input?: HTMLInputElement;

  constructor() {
    super();
    this.value = "";
    this.label = "";
    this.name = "";
    this.required = false;
    this.disabled = false;
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : ""}
      <input
        type="time"
        .value=${this.value}
        ?required=${this.required}
        ?disabled=${this.disabled}
        @change=${this.#handleChange}
      />
    `;
  }

  firstUpdated(): void {
    this.#input = this.shadowRoot?.querySelector("input") ?? undefined;
    this.#updateState();
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (
      changedProperties.has("value") ||
      changedProperties.has("required") ||
      changedProperties.has("disabled")
    ) {
      this.#updateState();
    }
  }

  /**
   * Syncs both halves of form state — the submitted value and the
   * constraint-validation state — so neither can go stale. Values are
   * native "HH:MM" strings; unparseable programmatic values report badInput.
   * @returns void
   */
  #updateState(): void {
    updateFormControlState(
      this.#internals,
      this.value,
      timeValidation(this.value, this.required && !this.disabled),
      this.#input,
    );
  }

  #handleChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    this.#updateState();
    this.dispatchEvent(new CustomEvent("change", {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = "";
    this.#updateState();
  }

  formStateRestoreCallback(
    state: string | File | FormData | null,
    _mode: "restore" | "autocomplete",
  ): void {
    if (typeof state === "string") {
      this.value = state;
      this.#updateState();
    }
  }
}

export function registerMetroTimePicker(): void {
  if (!customElements.get("metro-time-picker")) {
    customElements.define("metro-time-picker", MetroTimePicker);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-time-picker": MetroTimePicker;
  }
}
