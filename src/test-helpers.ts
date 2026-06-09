const originalStartViewTransition = document.startViewTransition?.bind(document);

export function mockViewTransitions(): void {
  document.startViewTransition = ((callback?: () => void | Promise<void>) => {
    const cb = callback ?? (() => Promise.resolve());
    const updateCallbackDone = Promise.resolve().then(cb);
    return {
      finished: updateCallbackDone,
      ready: updateCallbackDone,
      updateCallbackDone,
      skipTransition: () => {},
    };
  }) as typeof document.startViewTransition;
}

export function restoreViewTransitions(): void {
  if (originalStartViewTransition) {
    document.startViewTransition = originalStartViewTransition;
  }
}
