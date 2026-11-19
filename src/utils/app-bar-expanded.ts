/**
 * Keeps an app bar button in step with the app bar that hosts it.
 *
 * The label of an app bar button shows only while its bar is expanded. CSS could
 * state that with `:host-context(metro-app-bar[expanded])`, but Firefox has no
 * `:host-context()`, so the parent state is mirrored onto the button as the
 * `data-expanded` attribute and the component styles `:host([data-expanded])`.
 *
 * A button outside any app bar keeps the attribute it was authored with, which
 * lets a demo or an app reveal its label directly.
 *
 * @param button - The app bar button element to sync
 * @returns a function that stops observing, or undefined when the button has no
 * ancestor `metro-app-bar`
 */
export function watchAppBarExpanded(
  button: HTMLElement,
): (() => void) | undefined {
  const appBar = button.closest("metro-app-bar");
  if (!appBar) return undefined;

  const sync = (): void => {
    button.toggleAttribute("data-expanded", appBar.hasAttribute("expanded"));
  };

  const observer = new MutationObserver(sync);
  observer.observe(appBar, {
    attributes: true,
    attributeFilter: ["expanded"],
  });
  sync();

  return () => observer.disconnect();
}
