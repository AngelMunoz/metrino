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
export declare function writable<T>(initial: T): Writable<T>;
export type Theme = "light" | "dark";
export type AccentColor = "blue" | "red" | "orange" | "green" | "teal" | "purple" | "magenta" | "lime" | "brown" | "pink" | "mango" | "cobalt" | "indigo" | "violet" | "crimson" | "emerald" | "mauve" | "sienna" | "olive" | "steel" | "taupe";
export declare const themeState: Readable<Theme>;
export declare const accentState: Readable<AccentColor>;
export declare function setTheme(theme: Theme): void;
export declare function setAccent(accent: AccentColor): void;
export declare function initTheme(): void;
//# sourceMappingURL=index.d.ts.map