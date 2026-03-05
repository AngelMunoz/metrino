export function updateAriaDisabled(el: HTMLElement, disabled: boolean): void {
  if (disabled) {
    el.setAttribute("aria-disabled", "true");
    el.setAttribute("tabindex", "-1");
  } else {
    el.removeAttribute("aria-disabled");
    el.setAttribute("tabindex", "0");
  }
}

export function handleDisabledClick(e: Event, disabled: boolean): boolean {
  if (disabled) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  }
  return true;
}

export function handleKeyboardActivation(e: KeyboardEvent, disabled: boolean, activate: () => void): void {
  if (disabled) return;
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    activate();
  }
}

export function addPressedState(el: HTMLElement, disabled: boolean): void {
  if (disabled) return;
  el.classList.add("pressed");
  setTimeout(() => el.classList.remove("pressed"), 50);
}

export interface RepeatState {
  timer: number | null;
  interval: number | null;
}

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
