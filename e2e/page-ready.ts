import { expect, type Locator, type Page } from "@playwright/test";

/** True while a view transition holds the document. */
function viewTransitionRunning(page: Page): Promise<boolean> {
  return page.evaluate(() =>
    document
      .getAnimations()
      .some(
        (animation) =>
          ((animation as CSSAnimation).animationName ?? "").includes(
            "view-transition"
          )
      )
  );
}

/**
 * Opens a demo route and waits until the page takes input again.
 *
 * A route change runs the root turnstile inside a view transition, and the
 * document is not hit-testable while one is active. The transition only starts
 * once the route module has loaded, so it can still be in flight well after
 * `goto` resolved. Locators that check actionability wait it out on their own;
 * raw mouse and touch input has to wait for it explicitly.
 *
 * @param page - The page to navigate
 * @param route - Hash route of the demo app, e.g. `"/#/navigation"`
 * @param content - A locator inside the route, resolved before the wait
 */
export async function gotoReadyRoute(
  page: Page,
  route: string,
  content: Locator
): Promise<void> {
  await page.goto(route);
  // The route renders inside the transition's update callback, so waiting for
  // its content first makes sure the transition has actually started.
  await content.waitFor();
  await expect
    .poll(() => viewTransitionRunning(page), {
      message: `the route transition for ${route} never settled`,
      timeout: 10_000,
    })
    .toBe(false);
}
