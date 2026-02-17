import { LitElement, html, type PropertyValues } from "lit";
import { inputBase } from "../../styles/shared.ts";

export class MetroTextBox extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: String, reflect: true },
    placeholder: { type: String, reflect: true },
    disabled: { type: Boolean, reflect: true },
    label: { type: String, reflect: true },
    name: { type: String, reflect: true },
    required: { type: Boolean, reflect: true },
  };

  declare value: string;
  declare placeholder: string;
  declare disabled: boolean;
  declare label: string;
  declare name: string;
  declare required: boolean;

  static styles = inputBase;

  #internals: ElementInternals;

  constructor() {
    super();
    this.value = "";
    this.placeholder = "";
    this.disabled = false;
    this.label = "";
    this.name = "";
    this.required = false;
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      ${this.label ? html`<label class="label">${this.label}</label>` : ""}
      <input
        type="text"
        .value=${this.value}
        placeholder=${this.placeholder}
        ?disabled=${this.disabled}
        ?required=${this.required}
        @input=${this.#handleInput}
        @change=${this.#handleChange}
      />
    `;
  }

  firstUpdated(): void {
    this.#updateFormValue();
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("value")) {
      this.#updateFormValue();
    }
  }

  #updateFormValue(): void {
    this.#internals.setFormValue(this.value);
  }

  #handleInput(e: InputEvent): void {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    this.#updateFormValue();
    this.dispatchEvent(
      new CustomEvent("input", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  #handleChange(e: Event): void {
    const target = e.target as HTMLInputElement;
    this.value = target.value;
    this.#updateFormValue();
    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: this.value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  formAssociatedCallback(_form: HTMLFormElement): void {}

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = "";
    this.#updateFormValue();
  }

  formStateRestoreCallback(
    state: string | File | FormData | null,
    _mode: "restore" | "autocomplete",
  ): void {
    if (typeof state === "string") {
      this.value = state;
      this.#updateFormValue();
    }
  }
}

customElements.define("metro-text-box", MetroTextBox);

declare global {
  interface HTMLElementTagNameMap {
    "metro-text-box": MetroTextBox;
  }
}
