import { expect, test, type Page } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

declare global {
  interface Window {
    /** Routed content state per change: the page tag, or "loading". */
    __routeStates?: string[];
    /** One entry per view transition: outcome and the root snapshots' motion. */
    __vtLog?: {
      outcome: string;
      oldName?: string;
      oldDuration?: string;
      newDuration?: string;
      easing?: string;
    }[];
    /** Animation names seen on the destination page host after a continuum tap. */
    __entrance?: string[];
  }
}

/**
 * Records every view transition's outcome and the motion the root snapshots run,
 * read at `ready` while the pseudo-elements exist. Installed before goto so the
 * wrap is in place before the demo module loads.
 */
async function instrument(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__routeStates = [];
    window.__vtLog = [];
    const original = document.startViewTransition.bind(document);
    document.startViewTransition = (...args) => {
      const entry: NonNullable<Window["__vtLog"]>[number] = { outcome: "pending" };
      window.__vtLog?.push(entry);
      const transition = original(...args);
      transition.ready.then(
        () => {
          const old = getComputedStyle(
            document.documentElement,
            "::view-transition-old(root)",
          );
          const next = getComputedStyle(
            document.documentElement,
            "::view-transition-new(root)",
          );
          entry.outcome = "ready";
          entry.oldName = old.animationName;
          entry.oldDuration = old.animationDuration;
          entry.newDuration = next.animationDuration;
          entry.easing = next.animationTimingFunction;
        },
        (error: Error) => {
          entry.outcome = `rejected: ${error.message}`;
        },
      );
      return transition;
    };
  });
}

/**
 * Samples the routed content once per frame and records each state change. The
 * placeholder is recognized by its own box, not by page copy that may say "loading".
 */
function recordRouteStates(page: Page): Promise<void> {
  return page.evaluate(() => {
    window.__routeStates = [];
    const deadline = performance.now() + 8000;
    let last = "";
    const step = (): void => {
      const shell = document
        .querySelector("metrino-app")
        ?.shadowRoot?.querySelector("metrino-app-shell");
      const first = shell?.firstElementChild;
      const state =
        first?.tagName === "DIV" && (first.textContent ?? "").trim() === "Loading..."
          ? "loading"
          : (first?.tagName.toLowerCase() ?? "other");
      if (state !== last) {
        window.__routeStates?.push(state);
        last = state;
      }
      if (performance.now() < deadline) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/**
 * Waits for the destination page host and collects the animation names it runs
 * for ~25 frames — the entrance is 150ms, so reading after the click races it.
 */
function recordEntrance(page: Page, pageTag: string): Promise<void> {
  return page.evaluate((tag) => {
    window.__entrance = [];
    const deadline = performance.now() + 8000;
    let frames = 0;
    const step = (): void => {
      const shell = document
        .querySelector("metrino-app")
        ?.shadowRoot?.querySelector("metrino-app-shell");
      const host = shell?.firstElementChild;
      if (host && host.tagName.toLowerCase() === tag) {
        for (const animation of host.getAnimations()) {
          const name = (animation as CSSAnimation).animationName;
          if (name && !window.__entrance?.includes(name)) {
            window.__entrance?.push(name);
          }
        }
        frames += 1;
        if (frames >= 25) return;
      }
      if (performance.now() < deadline) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, pageTag);
}

function routeStates(page: Page): Promise<string[]> {
  return page.evaluate(() => window.__routeStates ?? []);
}

function vtLog(page: Page): Promise<NonNullable<Window["__vtLog"]>> {
  return page.evaluate(() => window.__vtLog ?? []);
}

test.describe("route motion", () => {
  test("first visit turns the previous page, not a loading placeholder", async ({
    page,
  }) => {
    await instrument(page);
    await gotoReadyRoute(page, "/#/", page.locator("metrino-home h1"));
    test.skip(
      !(await page.evaluate(() => "startViewTransition" in document)),
      "View Transitions not supported",
    );

    await recordRouteStates(page);
    await page.locator('metro-app-bar-button[label="Input"]').click();
    await expect(page.locator("metrino-input-page h1")).toBeVisible();

    const states = await routeStates(page);
    expect(states[0], `route states: ${states.join(" -> ")}`).toBe("metrino-home");
    expect(
      states,
      `the placeholder popped between pages: ${states.join(" -> ")}`,
    ).not.toContain("loading");
    expect(states.at(-1)).toBe("metrino-input-page");

    const forward = (await vtLog(page)).at(-1);
    expect(forward?.outcome, `vt log: ${JSON.stringify(forward)}`).toBe("ready");
    expect(forward?.oldName).toBe("metro-view-transition-out");
    expect(forward?.oldDuration).toBe("0.4s");
    expect(forward?.newDuration).toBe("0.5s");
    expect(forward?.easing?.replace(/\s+/g, "")).toBe(
      "cubic-bezier(0.25,0.46,0.45,0.94)",
    );

    // Back must run the same page-to-page turnstile.
    const forwardCount = (await vtLog(page)).length;
    await page.locator('metro-app-bar-button[label="Back"]').click();
    await expect(page.locator("metrino-home h1.title")).toBeVisible();
    const log = await vtLog(page);
    expect(
      log.length,
      "back navigation started no view transition",
    ).toBe(forwardCount + 1);
    const back = log.at(-1);
    expect(back?.outcome).toBe("ready");
    expect(back?.oldName).toBe("metro-view-transition-out");
  });

  test("a continuum tap turns the page while the item flies", async ({ page }) => {
    await instrument(page);
    await gotoReadyRoute(page, "/#/", page.locator("metrino-home h1"));
    test.skip(
      !(await page.evaluate(() => "startViewTransition" in document)),
      "View Transitions not supported",
    );

    await page
      .locator("metrino-home .hub-item")
      .filter({ hasText: "metro-button" })
      .first()
      .click();
    await expect(page.locator("metrino-buttons-page h1")).toBeVisible();

    const last = (await vtLog(page)).at(-1);
    expect(
      last?.oldName,
      `the tap skipped the page turnstile: ${JSON.stringify(last)}`,
    ).toBe("metro-view-transition-out");
  });

  test("the chrome swivels with the page turnstile", async ({ page }) => {
    await instrument(page);
    await gotoReadyRoute(page, "/#/", page.locator("metrino-home h1"));
    test.skip(
      !(await page.evaluate(() => "startViewTransition" in document)),
      "View Transitions not supported",
    );

    // Named chrome pairs ghost over the root swivel (Chromium bakes shadow-nested
    // names into root as well); the whole screen turns as one, chrome included.
    const themeName = await page
      .locator("metrino-app-shell .theme-controls")
      .evaluate((el) => getComputedStyle(el).viewTransitionName);
    expect(themeName).toBe("none");
    const barName = await page
      .locator("metrino-app-shell metro-app-bar")
      .evaluate((el) => getComputedStyle(el).viewTransitionName);
    expect(barName).toBe("none");

    await page.locator('metro-app-bar-button[label="Buttons"]').click();
    await expect(page.locator("metrino-buttons-page h1")).toBeVisible();
    const last = (await vtLog(page)).at(-1);
    expect(last?.outcome).toBe("ready");
    expect(last?.oldName).toBe("metro-view-transition-out");
  });

  test.describe("under reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("routes swap without placeholder or entrance", async ({ page }) => {
      await gotoReadyRoute(page, "/#/", page.locator("metrino-home h1"));

      await recordRouteStates(page);
      await recordEntrance(page, "metrino-input-page");
      await page.locator('metro-app-bar-button[label="Input"]').click();
      await expect(page.locator("metrino-input-page h1")).toBeVisible();
      await page.waitForTimeout(300);

      const states = await routeStates(page);
      expect(states).not.toContain("loading");
      const names = await page.evaluate(() => window.__entrance ?? []);
      expect(names, "reduced motion ran an entrance").toHaveLength(0);
    });
  });
});
