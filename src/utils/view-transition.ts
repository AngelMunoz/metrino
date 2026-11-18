import { prefersReducedMotion } from "./reduced-motion.ts";

let nextScopeId = 0;
/**
 * A per-instance holder for View Transition part names.
 *
 * A rendered element may hold a `view-transition-name` that no other rendered
 * element holds. Static styles cannot guarantee that: the name stays reserved
 * while the component is closed, and a second instance repeats it. So the names
 * here are minted per instance and attached only while the component is active.
 *
 * Two simultaneously active instances of the same component type are not
 * supported (modal pattern).
 */
export interface TransitionScope {
  /** Scoped name for each part, e.g. `{ content: "content-dialog-content-3" }`. */
  readonly names: Record<string, string>;
  /**
   * Points each part element at its scoped name and adds `rules` to the document.
   * Idempotent: the style element is only added once.
   * Does nothing under `prefers-reduced-motion: reduce`, where the caller skips the
   * transition and a reserved name would only collide with the next instance.
   */
  attach(targets: Record<string, HTMLElement | null>, rules: string): void;
  /**
   * Releases each part element's name and removes the style added by `attach`.
   * Idempotent: safe to call when nothing is attached.
   */
  detach(targets: Record<string, HTMLElement | null>): void;
}

/**
 * Creates a scoped set of `view-transition-name` values for one component instance.
 * @param component - Component discriminator, e.g. `"content-dialog"`.
 * @param parts - The element roles the component animates, e.g. `["content", "backdrop"]`.
 */
export function createTransitionScope(
  component: string,
  parts: readonly string[],
): TransitionScope {
  const scopeId = ++nextScopeId;
  const names: Record<string, string> = {};
  for (const part of parts) {
    names[part] = `${component}-${part}-${scopeId}`;
  }

  let styleElement: HTMLStyleElement | null = null;

  return {
    names,
    attach(targets, rules) {
      if (prefersReducedMotion()) return;
      for (const part of parts) {
        const target = targets[part];
        if (target) {
          target.style.viewTransitionName = names[part];
        }
      }
      if (styleElement) return;
      styleElement = document.createElement("style");
      styleElement.textContent = rules;
      document.head.appendChild(styleElement);
    },
    detach(targets) {
      for (const part of parts) {
        const target = targets[part];
        if (target) {
          target.style.viewTransitionName = "";
        }
      }
      styleElement?.remove();
      styleElement = null;
    },
  };
}
