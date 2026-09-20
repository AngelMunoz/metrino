import { LitElement, html, css, type PropertyValues } from "lit";
import { disabledState } from "../../styles/shared.ts";
import { numberValidation, updateFormControlState, valueMissing } from "../../utils/form-control.ts";

export class MetroRating extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: Number, reflect: true },
    max: { type: Number },
    disabled: { type: Boolean, reflect: true },
    name: { type: String, reflect: true },
    readonly: { type: Boolean, reflect: true },
    required: { type: Boolean, reflect: true },
  };

  declare value: number;
  declare max: number;
  declare disabled: boolean;
  declare name: string;
  declare readonly: boolean;
  declare required: boolean;

  static styles = [
    disabledState,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        gap: var(--metro-spacing-xs, 4px);
      }
      .star {
        font-size: 24px;
        color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.4));
        cursor: pointer;
        transition: color var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1)),
                    transform var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
        user-select: none;
      }
      .star:hover {
        transform: scale(1.1);
      }
      .star.filled {
        color: var(--metro-accent, #0078d4);
      }
      .star.half {
        background: linear-gradient(90deg, var(--metro-accent, #0078d4) 50%, var(--metro-foreground-secondary, rgba(255, 255, 255, 0.4)) 50%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    `,
  ];

  #internals: ElementInternals;
  #hoverValue = 0;
  #star?: HTMLSpanElement;

  constructor() {
    super();
    this.value = 0;
    this.max = 5;
    this.disabled = false;
    this.name = "";
    this.readonly = false;
    this.required = false;
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      ${Array.from({ length: this.max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= (this.#hoverValue || this.value);
        return html`
          <span 
            class="star ${isFilled ? "filled" : ""}"
            @click=${() => this.#setValue(starValue)}
            @mouseenter=${() => this.#handleHover(starValue)}
            @mouseleave=${() => this.#handleHover(0)}
          >
            &#x2605;
          </span>
        `;
      })}
    `;
  }

  firstUpdated(): void {
    this.#star = this.shadowRoot?.querySelector(".star") ?? undefined;
    this.#updateState();
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (
      changedProperties.has("value") ||
      changedProperties.has("required") ||
      changedProperties.has("max") ||
      changedProperties.has("disabled")
    ) {
      this.#updateState();
    }
  }

  /**
   * Syncs both halves of form state — the submitted value and the
   * constraint-validation state — so neither can go stale. An unrated
   * rating reports "0", so required treats 0 — not an empty string — as
   * the missing value.
   * @returns void
   */
  #updateState(): void {
    const unrated = this.value === 0;
    const validation =
      this.required && !this.disabled && unrated
        ? valueMissing()
        : numberValidation({ value: this.value, required: false, min: 0, max: this.max });
    updateFormControlState(this.#internals, String(this.value), validation, this.#star);
  }

  #setValue(value: number): void {
    if (this.disabled || this.readonly) return;
    this.value = value;
    this.#updateState();
    this.dispatchEvent(new CustomEvent("change", {
      detail: { value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  #handleHover(value: number): void {
    if (this.disabled || this.readonly) return;
    this.#hoverValue = value;
    this.requestUpdate();
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.value = 0;
    this.#updateState();
  }

  formStateRestoreCallback(
    state: string | File | FormData | null,
    _mode: "restore" | "autocomplete",
  ): void {
    const restored = typeof state === "string" ? parseFloat(state) : Number.NaN;
    if (!Number.isNaN(restored)) {
      this.value = restored;
      this.#updateState();
    }
  }
}

export function registerMetroRating(): void {
  if (!customElements.get("metro-rating")) {
    customElements.define("metro-rating", MetroRating);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-rating": MetroRating;
  }
}
