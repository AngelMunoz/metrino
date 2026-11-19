/**
 * Focus helpers for modal containers.
 *
 * A dialog holds its own focusables in the shadow root and the user's nodes in
 * slots, and a slotted custom element keeps its real focusable one level deeper
 * in its own shadow root. `document.activeElement` and a plain `querySelector`
 * both stop at a shadow boundary, so the Tab cycle and the initial focus have to
 * walk the tree instead.
 */

const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Whether an element takes keyboard focus itself.
 * @param el - The element to test
 * @returns true when the element is focusable and rendered
 */
function isFocusable(el: Element): boolean {
  const target = el as HTMLElement;
  if (!target.matches(FOCUSABLE_SELECTOR)) return false;
  if (target.tabIndex < 0) return false;
  if (target.hasAttribute("disabled")) return false;
  return target.getClientRects().length > 0;
}

/**
 * Adds `el` and the focusables below it to `found`, in tab order.
 * @param el - The element to visit
 * @param found - Accumulator of focusable elements in document order
 */
function visit(el: HTMLElement, found: HTMLElement[]): void {
  if (isFocusable(el)) found.push(el);
  // A host with a shadow root keeps its own focusables inside it, and reaches
  // its light children through that root's slots, so only the root is walked.
  if (el.shadowRoot) collectFrom(el.shadowRoot, found);
  else collectFrom(el, found);
}

/**
 * Collects every focusable element below `parent` in tab order, crossing the
 * shadow boundaries of custom elements and the slot assignments of projected
 * content.
 * @param parent - The subtree root to walk
 * @param found - Accumulator of focusable elements in document order
 */
function collectFrom(parent: Element | ShadowRoot, found: HTMLElement[]): void {
  for (const child of Array.from(parent.children)) {
    if (child.tagName === "SLOT") {
      for (const node of (child as HTMLSlotElement).assignedNodes({
        flatten: true,
      })) {
        if (node instanceof HTMLElement) visit(node, found);
      }
      continue;
    }
    visit(child as HTMLElement, found);
  }
}

/**
 * The focusable elements at or below `el`, in tab order.
 * @param el - The element to start from
 * @returns the focusable elements, first tab stop first
 */
function focusablesIn(el: HTMLElement): HTMLElement[] {
  const found: HTMLElement[] = [];
  visit(el, found);
  return found;
}

/**
 * The element that actually holds focus, following nested shadow roots.
 * @returns the deeply focused element, or null when nothing in the document has focus
 */
export function deepActiveElement(): HTMLElement | null {
  let current = document.activeElement as HTMLElement | null;
  while (current?.shadowRoot?.activeElement) {
    current = current.shadowRoot.activeElement as HTMLElement;
  }
  return current;
}

/**
 * The element a dialog should return focus to when it closes.
 *
 * This is the shadow-including focus, not `document.activeElement`: when the app
 * renders its routes inside a shadow root, the document only reports the
 * outermost host, and restoring to that lands on the first control of the whole
 * application. A mouse click does not focus a button in Firefox, so the result is
 * often the body; the body has no single tab stop, so absence of focus stays
 * absence of focus.
 *
 * @returns the focused element, or null when the document itself had it
 */
export function rememberedFocus(): HTMLElement | null {
  const deep = deepActiveElement();
  if (!deep || deep === document.body || deep === document.documentElement) {
    return null;
  }
  return deep;
}

/**
 * Focuses the first tab stop at or below `container`. A custom-element host is
 * not itself focusable, so restoring to one lands on the control inside it.
 * @param container - The element to focus into
 * @returns true when focus moved
 */
export function focusFirstInside(container: HTMLElement): boolean {
  const [first] = focusablesIn(container);
  if (!first) return false;
  first.focus();
  return true;
}

/**
 * Keeps a Tab keystroke inside `container`: focus wraps from the last focusable
 * to the first, and Shift+Tab from the first to the last.
 * @param container - The modal container to trap focus in
 * @param event - The Tab keydown to handle
 * @returns void
 */
export function trapTabKey(container: HTMLElement, event: KeyboardEvent): void {
  const focusables = focusablesIn(container);
  if (focusables.length === 0) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = deepActiveElement();

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}
