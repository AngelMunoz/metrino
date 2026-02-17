import { LitElement, html, css, type PropertyValues } from "lit";
import { disabledState } from "../../styles/shared.ts";

export class MetroRating extends LitElement {
  static formAssociated = true;

  static properties = {
    value: { type: Number, reflect: true },
    max: { type: Number },
    disabled: { type: Boolean, reflect: true },
    name: { type: String, reflect: true },
    readonly: { type: Boolean, reflect: true },
  };

  declare value: number;
  declare max: number;
  declare disabled: boolean;
  declare name: string;
  declare readonly: boolean;

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
        transition: color var(--metro-transition-fast, 167ms) ease-out,
                    transform var(--metro-transition-fast, 167ms) ease-out;
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

  constructor() {
    super();
    this.value = 0;
    this.max = 5;
    this.disabled = false;
    this.name = "";
    this.readonly = false;
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
    this.#updateFormValue();
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("value")) {
      this.#updateFormValue();
    }
  }

  #updateFormValue(): void {
    this.#internals.setFormValue(String(this.value));
  }

  #setValue(value: number): void {
    if (this.disabled || this.readonly) return;
    this.value = value;
    this.#updateFormValue();
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
    this.#updateFormValue();
  }
}

customElements.define("metro-rating", MetroRating);

declare global {
  interface HTMLElementTagNameMap {
    "metro-rating": MetroRating;
  }
}
