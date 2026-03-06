/**
 * Updates ARIA attributes for disabled state on an element.
 * Sets aria-disabled="true" and tabindex="-1" when disabled,
 * removes aria-disabled and sets tabindex="0" when enabled.
 *
 * @param el - The element to update ARIA attributes on
 * @param disabled - Whether the element should be marked as disabled
 * @returns void
 */
export function updateAriaDisabled(el: HTMLElement, disabled: boolean): void {
  if (disabled) {
    el.setAttribute("aria-disabled", "true");
    el.setAttribute("tabindex", "-1");
  } else {
    el.removeAttribute("aria-disabled");
    el.setAttribute("tabindex", "0");
  }
}

/**
 * Prevents click event propagation when the element is disabled.
 * Stops immediate propagation and prevents default behavior.
 *
 * @param e - The click event to handle
 * @param disabled - Whether the element is currently disabled
 * @returns boolean - True if the click should proceed, false if blocked
 */
export function handleDisabledClick(e: Event, disabled: boolean): boolean {
  if (disabled) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  }
  return true;
}

/**
 * Handles keyboard activation for Enter and Space keys.
 * Triggers the activation callback when Enter or Space is pressed
 * and the element is not disabled.
 *
 * @param e - The keyboard event
 * @param disabled - Whether the element is currently disabled
 * @param activate - Callback function to execute on activation
 * @returns void
 */
export function handleKeyboardActivation(e: KeyboardEvent, disabled: boolean, activate: () => void): void {
  if (disabled) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    activate();
  }
}

/**
 * Adds a temporary "pressed" CSS class to an element.
 * The class is automatically removed after 50ms to create
 * a brief visual pressed state effect.
 *
 * @param el - The element to apply the pressed state to
 * @param disabled - Whether the element is currently disabled (skips if true)
 * @returns void
 */
export function addPressedState(el: HTMLElement, disabled: boolean): void {
  if (disabled) return;
  el.classList.add("pressed");
  setTimeout(() => el.classList.remove("pressed"), 50);
}

/**
 * State object for tracking repeat button timers.
 * Used by startRepeat and stopRepeat functions to manage
 * the delayed start and interval timing.
 */
export interface RepeatState {
  /** Timer ID for the initial delay before repeating starts */
  timer: number | null;
  /** Interval ID for the ongoing repeat clicks */
  interval: number | null;
}

/**
 * Starts the repeat mode for a button.
 * Immediately triggers one callback, then waits for the delay
 * before starting interval-based repeated callbacks.
 *
 * @param state - The RepeatState object to track timers
 * @param delay - Milliseconds to wait before starting repeat interval
 * @param intervalMs - Milliseconds between each repeat callback
 * @param callback - Function to call on each activation
 * @returns void
 */
export function startRepeat(
  state: RepeatState,
  delay: number,
  intervalMs: number,
  callback: () => void
): void {
  stopRepeat(state);
  callback();
  state.timer = window.setTimeout(() => {
    state.interval = window.setInterval(callback, intervalMs);
  }, delay);
}

/**
 * Stops the repeat mode and clears all timers.
 * Clears both the initial delay timer and the repeat interval.
 *
 * @param state - The RepeatState object tracking the timers to clear
 * @returns void
 */
export function stopRepeat(state: RepeatState): void {
  if (state.timer !== null) {
    clearTimeout(state.timer);
    state.timer = null;
  }
  if (state.interval !== null) {
    clearInterval(state.interval);
    state.interval = null;
  }
}
