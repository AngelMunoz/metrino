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
  /**
   * Snapshot of the group this button belonged to after the last sync, used
   * to resync the members it leaves behind on a name or form-owner change.
   */
  #group: MetroRadioButton[] = [];

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

  connectedCallback(): void {
    super.connectedCallback();
    // This button may have joined a different group by being re-parented.
    this.#syncGroup(this.#group);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    // Removing a member -- especially a checked or required one -- can flip
    // the group-wide validity of the members left behind.
    for (const member of this.#group) {
      if (member !== this && member.isConnected) member.#updateState();
    }
    this.#group = [];
  }

  firstUpdated(): void {
    this.#control = this.shadowRoot?.querySelector(".radio") ?? undefined;
    this.#syncGroup();
  }

  updated(changedProperties: PropertyValues<this>): void {
    if (
      changedProperties.has("checked") ||
      changedProperties.has("required") ||
      changedProperties.has("disabled") ||
      changedProperties.has("name")
    ) {
      // Checkedness of one member changes the group-wide validity of all
      // others (required groups become valid once any member is checked).
      // A name change also moves this button to a different group, so the
      // group it left is resynced from the pre-change snapshot.
      const previous = changedProperties.has("name") ? this.#group : [];
      this.#syncGroup(previous);
    }
  }

  /**
   * Recomputes this button's group and writes form state on every member,
   * including the members of a group it just left, because group-wide
   * validity can change for them too.
   * @param previous - Members of the group before this update, if any
   * @returns void
   */
  #syncGroup(previous: MetroRadioButton[] = []): void {
    const members = this.#groupMembers();
    for (const member of members) {
      member.#group = members;
    }
    for (const member of new Set([...members, ...previous])) {
      if (member === this || member.isConnected) {
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
    // button lives in (its root node) and its form owner, not the document,
    // so groups work inside shadow roots as well as light DOM and two forms
    // can reuse the same name.
    for (const member of this.#groupMembers()) {
      if (member !== this && member.checked) {
        member.checked = false;
      }
    }
    this.#syncGroup();
    this.dispatchEvent(new CustomEvent("change", {
      detail: { checked: this.checked, value: this.value },
      bubbles: true,
      composed: true,
    }));
  }

  /**
   * Returns every radio button in this button's group: the same-named
   * buttons in the tree this button lives in (its root node) that share its
   * form owner, including this one.
   * @returns MetroRadioButton[]
   */
  #groupMembers(): MetroRadioButton[] {
    const members: MetroRadioButton[] = [];
    if (!this.name) return [this];
    const root = this.getRootNode();
    if (!(root instanceof Document || root instanceof ShadowRoot || root instanceof Element)) {
      return [this];
    }
    const form = this.#internals.form;
    root.querySelectorAll<MetroRadioButton>("metro-radio-button").forEach(rb => {
      if (rb instanceof MetroRadioButton && rb.name === this.name && rb.#internals.form === form) {
        members.push(rb);
      }
    });
    return members.length > 0 ? members : [this];
  }

  #handleKeydown(e: KeyboardEvent): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this.#select();
    }
  }

  formAssociatedCallback(): void {
    // The group is scoped to the form owner, so association changes (e.g.
    // moving the button between forms) move it between groups.
    this.#syncGroup(this.#group);
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
