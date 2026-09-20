import { LitElement, html, css, type PropertyValues } from "lit";
import { toggleControlBase } from "../../styles/shared.ts";
import { checkedValidation, updateFormControlState } from "../../utils/form-control.ts";

export class MetroRadioButton extends LitElement {
  static formAssociated = true;

  static properties = {
    checked: { type: Boolean, reflect: true },
    disabled: { type: Boolean, reflect: true },
    name: { type: String, reflect: true },
    value: { type: String, reflect: true },
    required: { type: Boolean, reflect: true },
  };

  declare checked: boolean;
  declare disabled: boolean;
  declare name: string;
  declare value: string;
  declare required: boolean;

  static styles = [
    toggleControlBase,
    css`
      :host {
        padding: 7px;
        margin: -7px;
      }
      .radio {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .radio.checked {
        border-color: var(--metro-accent, #0078d4);
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--metro-accent, #0078d4);
        opacity: 0;
        transition: opacity var(--metro-transition-fast, 167ms) var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
      }
      .radio.checked .dot {
        opacity: 1;
      }
      .radio:focus-visible {
        outline: 2px solid var(--metro-accent, #0078d4);
        outline-offset: 2px;
      }
    `,
  ];

  #internals: ElementInternals;
  #control?: HTMLDivElement;

  constructor() {
    super();
    this.checked = false;
    this.disabled = false;
    this.name = "";
    this.value = "";
    this.required = false;
    this.#internals = this.attachInternals();
  }

  render() {
    return html`
      <div
        class="radio ${this.checked ? "checked" : ""}"
        role="radio"
        aria-checked="${this.checked}"
        tabindex="${this.disabled ? -1 : 0}"
        @click=${this.#select}
        @keydown=${this.#handleKeydown}
      >
        <div class="dot"></div>
      </div>
      <slot></slot>
    `;
  }

  firstUpdated(): void {
    this.#control = this.shadowRoot?.querySelector(".radio") ?? undefined;
    this.#updateState();
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (
      changedProperties.has("checked") ||
      changedProperties.has("required") ||
      changedProperties.has("disabled") ||
      changedProperties.has("name")
    ) {
      // Checkedness of one member changes the group-wide validity of all
      // others (required groups become valid once any member is checked),
      // so the whole group resyncs whenever this member's state changes.
      for (const member of this.#groupMembers()) {
        member.#updateState();
      }
    }
  }

  /**
   * Syncs both halves of form state — the submitted value and the
   * constraint-validation state — so neither can go stale. Validity is
   * group-wide: when any member of the group is required, the group needs a
   * selection before any member validates.
   * @returns void
   */
  #updateState(): void {
    const members = this.#groupMembers();
    const groupRequired = members.some(member => member.required);
    const groupChecked = members.some(member => member.checked);
    updateFormControlState(
      this.#internals,
      this.checked ? this.value : null,
      checkedValidation(groupChecked, groupRequired && !this.disabled),
      this.#control,
    );
  }

  #select(): void {
    if (this.disabled || this.checked) return;
    this.checked = true;
    // Uncheck the group before dispatching so change listeners observe the
    // final state. Like native radios, the group is scoped to the tree the
    // button lives in (its root node), not the document, so groups work
    // inside shadow roots as well as light DOM.
    for (const member of this.#groupMembers()) {
      if (member !== this && member.checked) {
        member.checked = false;
      }
      member.#updateState();
    }
    this.dispatchEvent(new CustomEvent("change", {
      detail: { checked: this.checked, value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  /**
   * Returns every radio button in this button's group: the same-named
   * buttons in the tree this button lives in (its root node), including
   * this one.
   * @returns MetroRadioButton[]
   */
  #groupMembers(): MetroRadioButton[] {
    const members: MetroRadioButton[] = [];
    if (!this.name) return [this];
    const root = this.getRootNode();
    if (!(root instanceof Document || root instanceof ShadowRoot || root instanceof Element)) {
      return [this];
    }
    root.querySelectorAll<MetroRadioButton>("metro-radio-button").forEach(rb => {
      if (rb.name === this.name) members.push(rb);
    });
    return members.length > 0 ? members : [this];
  }

  #handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.#select();
    }
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  formResetCallback(): void {
    this.checked = false;
    this.#updateState();
  }

  formStateRestoreCallback(
    state: string | File | FormData | null,
    _mode: "restore" | "autocomplete",
  ): void {
    if (typeof state === "string" && state === this.value) {
      this.checked = true;
      this.#updateState();
    }
  }
}

export function registerMetroRadioButton(): void {
  if (!customElements.get("metro-radio-button")) {
    customElements.define("metro-radio-button", MetroRadioButton);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "metro-radio-button": MetroRadioButton;
  }
}
