export type Subscriber<T> = (value: T) => void;
export type Unsubscriber = () => void;

export interface Readable<T> {
  subscribe(run: Subscriber<T>): Unsubscriber;
  get(): T;
}

export interface Writable<T> extends Readable<T> {
  set(value: T): void;
  update(fn: (value: T) => T): void;
}

export function writable<T>(initial: T): Writable<T> {
  let value = initial;
  const subscribers = new Set<Subscriber<T>>();

  return {
    subscribe(run: Subscriber<T>): Unsubscriber {
      subscribers.add(run);
      run(value);
      return () => subscribers.delete(run);
    },
    get(): T {
      return value;
    },
    set(newValue: T): void {
      if (Object.is(value, newValue)) return;
      value = newValue;
      subscribers.forEach((run) => run(value));
    },
    update(fn: (value: T) => T): void {
      this.set(fn(value));
    },
  };
}

const THEME_KEY = "metrino-theme";
const ACCENT_KEY = "metrino-accent";

export type Theme = "light" | "dark";
export type AccentColor =
  | "blue" | "red" | "orange" | "green" | "teal"
  | "purple" | "magenta" | "lime" | "brown" | "pink"
  | "mango" | "cobalt" | "indigo" | "violet" | "crimson"
  | "emerald" | "mauve" | "sienna" | "olive" | "steel" | "taupe";

const internalThemeState = writable<Theme>(
  (localStorage.getItem(THEME_KEY) as Theme) || "dark"
);

const internalAccentState = writable<AccentColor>(
  (localStorage.getItem(ACCENT_KEY) as AccentColor) || "blue"
);

export const themeState: Readable<Theme> = {
  subscribe: internalThemeState.subscribe,
  get: internalThemeState.get,
};

export const accentState: Readable<AccentColor> = {
  subscribe: internalAccentState.subscribe,
  get: internalAccentState.get,
};

export function setTheme(theme: Theme): void {
  internalThemeState.set(theme);
  localStorage.setItem(THEME_KEY, theme);
  document.body.dataset.theme = theme;
}

export function setAccent(accent: AccentColor): void {
  internalAccentState.set(accent);
  localStorage.setItem(ACCENT_KEY, accent);
  if (accent === "blue") {
    document.body.removeAttribute("accent");
  } else {
    document.body.setAttribute("accent", accent);
  }
}

export function initTheme(): void {
  document.body.dataset.theme = internalThemeState.get();
  const accent = internalAccentState.get();
  if (accent !== "blue") {
    document.body.setAttribute("accent", accent);
  }
}
