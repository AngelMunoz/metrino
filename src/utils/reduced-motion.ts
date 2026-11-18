/**
 * The `prefers-reduced-motion` policy for JavaScript motion.
 *
 * CSS motion is handled by the blanket rule that `styles/tokens.css` and
 * `styles/shared.ts` install. This module is what the scripted motion asks when
 * it decides whether to run at all: under reduce it must be skipped, never
 * played faster.
 */

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Whether the user asks the platform to reduce motion.
 * @returns true when the reduce preference is on
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia(REDUCE_QUERY).matches;
}

/**
 * Runs `listener` whenever the reduce preference changes, starting with its
 * current value, so motion that is already wired up can switch on and off live.
 * @param listener - Called with the new value of the preference
 * @returns a function that stops listening
 */
export function watchReducedMotion(
  listener: (reduce: boolean) => void
): () => void {
  const media = window.matchMedia(REDUCE_QUERY);
  const onChange = (event: MediaQueryListEvent): void => {
    listener(event.matches);
  };

  media.addEventListener("change", onChange);
  listener(media.matches);

  return () => media.removeEventListener("change", onChange);
}
