import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

declare global {
  interface Window {
    /** How many times a component or the router called startViewTransition. */
    __viewTransitionCalls?: number;
    /** `scrollLeft` of the panorama container, sampled once per frame. */
    __panoramaScroll?: number[];
  }
}

/**
 * Counts every `startViewTransition` call the app makes. Reduced motion must
 * skip the transition instead of running it quickly, so the count is the thing
 * under test. Must run before the demo module loads.
 */
async function countViewTransitions(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__viewTransitionCalls = 0;
    const holder = Document.prototype as unknown as {
      startViewTransition?: (options: unknown) => unknown;
    };
    const original = holder.startViewTransition;
    if (typeof original !== "function") return;

    holder.startViewTransition = function (options: unknown): unknown {
      window.__viewTransitionCalls = (window.__viewTransitionCalls ?? 0) + 1;
      return original.call(this, options);
    };
  });
}

function viewTransitionCalls(page: Page): Promise<number> {
  return page.evaluate(() => window.__viewTransitionCalls ?? 0);
}

/**
 * Samples the panorama scroll position every frame, so a glide that runs after
 * the release is observed instead of raced.
 */
async function recordScroll(container: Locator): Promise<void> {
  await container.evaluate((el) => {
    window.__panoramaScroll = [];
    const sample = (): void => {
      window.__panoramaScroll?.push(el.scrollLeft);
      requestAnimationFrame(sample);
    };
    sample();
  });
}

/** Drags the panorama to the left and releases it with momentum. */
async function flingLeft(page: Page, container: Locator): Promise<void> {
  const box = await container.boundingBox();
  if (!box) throw new Error("panorama container has no bounding box");

  const y = box.y + 40;
  let x = box.x + box.width * 0.9;

  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let step = 0; step < 12; step++) {
    x -= 30;
    await page.mouse.move(x, y);
    await page.waitForTimeout(8);
  }
  await page.mouse.up();
}

/** Every duration (seconds) in a computed `*-duration` list. */
function durations(value: string): number[] {
  return value
    .split(",")
    .map((part) => Number.parseFloat(part) || 0);
}

/** The demo routes and the custom element each one renders first. */
const DEMO_ROUTES: Record<string, string> = {
  "/#/": "metrino-home",
  "/#/buttons": "metrino-buttons-page",
  "/#/input": "metrino-input-page",
  "/#/datetime": "metrino-datetime-page",
  "/#/progress": "metrino-progress-page",
  "/#/tiles": "metrino-tiles-page",
  "/#/layout": "metrino-layout-page",
  "/#/navigation": "metrino-navigation-page",
  "/#/selection": "metrino-selection-page",
  "/#/primitives": "metrino-primitives-page",
  "/#/dialogs": "metrino-dialogs-page",
  "/#/animations": "metrino-animations-page",
};

/**
 * Tag names of the shadow trees on the page whose styles carry rules but no
 * `prefers-reduced-motion` media rule. A shadow with no rules at all cannot
 * animate, so it is not a violation. Runs in the page, so it must be
 * self-contained.
 */
function shadowBlanketViolations(): string[] {
  const violations: string[] = [];

  const inspect = (root: ShadowRoot): { rules: number; blanket: boolean } => {
    let rules = 0;
    let blanket = false;
    for (const sheet of root.adoptedStyleSheets) {
      rules += sheet.cssRules.length;
      for (const rule of Array.from(sheet.cssRules)) {
        const media = (rule as CSSMediaRule).media;
        if (media && media.mediaText.includes("prefers-reduced-motion")) {
          blanket = true;
        }
      }
    }
    for (const style of Array.from(root.querySelectorAll("style"))) {
      const text = style.textContent ?? "";
      if (text.trim() !== "") rules += 1;
      if (text.includes("prefers-reduced-motion")) blanket = true;
    }
    return { rules, blanket };
  };

  const walk = (node: Document | ShadowRoot): void => {
    for (const el of Array.from(node.querySelectorAll("*"))) {
      if (el.shadowRoot) {
        const { rules, blanket } = inspect(el.shadowRoot);
        if (rules > 0 && !blanket) violations.push(el.tagName.toLowerCase());
        walk(el.shadowRoot);
      }
    }
  };

  walk(document);
  return violations;
}

/**
 * Drags the panorama 150 px to the left and holds, so the scroll state can be
 * read while the gesture still owns the position. The caller releases.
 */
async function dragLeftAndHold(page: Page, container: Locator): Promise<void> {
  const box = await container.boundingBox();
  if (!box) throw new Error("panorama container has no bounding box");

  const y = box.y + 40;
  let x = box.x + box.width * 0.9;

  await page.mouse.move(x, y);
  await page.mouse.down();
  for (let step = 0; step < 10; step++) {
    x -= 15;
    await page.mouse.move(x, y);
    await page.waitForTimeout(16);
  }
}

test.describe("reduced motion use cases", () => {
  test.use({ reducedMotion: "reduce" });

  test.beforeEach(async ({ page }) => {
    test.skip(
      !(await page.evaluate(
        () => matchMedia("(prefers-reduced-motion: reduce)").matches
      )),
      "this browser cannot emulate prefers-reduced-motion"
    );
  });

  test("route changes do not run view transitions", async ({ page }) => {
    await countViewTransitions(page);
    await gotoReadyRoute(page, "/#/dialogs", page.locator("metrino-dialogs-page h1"));

    expect(
      await viewTransitionCalls(page),
      "opening a route must not start a view transition under reduce"
    ).toBe(0);

    await page.goto("/#/");
    await expect(page.locator("metrino-home h1")).toBeVisible();

    expect(
      await viewTransitionCalls(page),
      "a route change must be assigned directly under reduce"
    ).toBe(0);
  });

  test("dialogs open without entrance motion", async ({ page }) => {
    await countViewTransitions(page);
    await gotoReadyRoute(page, "/#/dialogs", page.locator("metrino-dialogs-page h1"));

    await page
      .locator("metro-button", { hasText: "Open Content Dialog" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Content Dialog" });
    await expect(dialog).toBeVisible();

    expect(
      await viewTransitionCalls(page),
      "opening a dialog must not start a view transition under reduce"
    ).toBe(0);

    // The shadow-scope blanket: the host fades with a transition that reduce
    // flattens, and no part of the dialog keeps an entrance duration.
    const hostDuration = await page
      .locator("#content-dialog")
      .evaluate((el) => getComputedStyle(el).transitionDuration);
    const dialogDuration = await page
      .locator("#content-dialog .dialog")
      .evaluate((el) => getComputedStyle(el).animationDuration);
    expect(
      Math.max(...durations(hostDuration)),
      `the dialog host still transitions at ${hostDuration}`
    ).toBeLessThanOrEqual(0.00002);
    expect(
      Math.max(...durations(dialogDuration)),
      `the dialog still animates at ${dialogDuration}`
    ).toBeLessThanOrEqual(0.00002);
  });

  test("panorama fling settles immediately", async ({ page }) => {
    const panorama = page.locator("#metro-panorama metro-panorama");
    await gotoReadyRoute(page, "/#/navigation", panorama);
    await panorama.scrollIntoViewIfNeeded();
    const container = panorama.locator(".panorama-container");

    // The fling has to start away from the origin, so the container is scrolled
    // to a boundary first: with the snap points live, every position the drag
    // writes is snapped straight back.
    const start = await container.evaluate((el) => {
      el.scrollLeft = el.clientWidth;
      return el.scrollLeft;
    });
    expect(start, "the container must start on a boundary past the origin").toBeGreaterThan(100);

    await recordScroll(container);

    await flingLeft(page, container);
    const releasedAt = await page.evaluate(
      () => window.__panoramaScroll?.length ?? 0
    );
    await page.waitForTimeout(150);

    const rest = await container.evaluate((el) => {
      const host = (el.getRootNode() as ShadowRoot).host as HTMLElement;
      const items = Array.from(
        host.querySelectorAll<HTMLElement>("metro-panorama-item")
      );
      const padding = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const offsets = items.map((item) =>
        Math.min(Math.max(item.offsetLeft - padding, 0), maxScroll)
      );
      const scrollLeft = el.scrollLeft;
      const nearest = offsets.reduce(
        (best, offset) =>
          Math.abs(offset - scrollLeft) < Math.abs(best - scrollLeft)
            ? offset
            : best,
        offsets[0] ?? 0
      );
      return {
        scrollLeft,
        nearest,
        snapType: getComputedStyle(el).scrollSnapType,
      };
    });

    expect(
      rest.scrollLeft,
      "the release must not run the container back to the origin"
    ).toBeGreaterThan(100);
    expect(
      Math.abs(rest.scrollLeft - rest.nearest),
      `settled at ${rest.scrollLeft}, nearest item boundary is ${rest.nearest}`
    ).toBeLessThanOrEqual(2);
    expect(
      rest.snapType,
      "the snap points must stay with the browser"
    ).toContain("x mandatory");

    const afterRelease = await page.evaluate(
      (start) => (window.__panoramaScroll ?? []).slice(start),
      releasedAt
    );
    const positions = new Set(afterRelease.map((value) => Math.round(value)));
    expect(
      positions.size,
      `the release glided through ${[...positions].join(", ")}`
    ).toBeLessThanOrEqual(2);
  });

  test("user drags the panorama under reduce and the content follows", async ({
    page,
  }) => {
    const panorama = page.locator("#metro-panorama metro-panorama");
    await gotoReadyRoute(page, "/#/navigation", panorama);
    await panorama.scrollIntoViewIfNeeded();
    const container = panorama.locator(".panorama-container");
    await recordScroll(container);

    await dragLeftAndHold(page, container);

    const held = await container.evaluate((el) => ({
      scrollLeft: el.scrollLeft,
      snapType: getComputedStyle(el).scrollSnapType,
    }));
    expect(
      held.scrollLeft,
      `the drag stayed pinned at ${held.scrollLeft}`
    ).toBeGreaterThan(100);
    expect(
      held.snapType,
      "the drag must own the scroll position"
    ).toBe("none");

    await page.mouse.up();
    const releasedAt = await page.evaluate(
      () => window.__panoramaScroll?.length ?? 0
    );
    await page.waitForTimeout(150);

    const rest = await container.evaluate((el) => {
      const host = (el.getRootNode() as ShadowRoot).host as HTMLElement;
      const items = Array.from(
        host.querySelectorAll<HTMLElement>("metro-panorama-item")
      );
      const padding = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const offsets = items.map((item) =>
        Math.min(Math.max(item.offsetLeft - padding, 0), maxScroll)
      );
      const scrollLeft = el.scrollLeft;
      const nearest = offsets.reduce(
        (best, offset) =>
          Math.abs(offset - scrollLeft) < Math.abs(best - scrollLeft)
            ? offset
            : best,
        offsets[0] ?? 0
      );
      return {
        scrollLeft,
        nearest,
        snapType: getComputedStyle(el).scrollSnapType,
      };
    });
    expect(
      Math.abs(rest.scrollLeft - rest.nearest),
      `settled at ${rest.scrollLeft}, nearest item boundary is ${rest.nearest}`
    ).toBeLessThanOrEqual(2);
    expect(
      rest.snapType,
      "the snap points must be handed back to the browser"
    ).toContain("x mandatory");

    const afterRelease = await page.evaluate(
      (start) => (window.__panoramaScroll ?? []).slice(start),
      releasedAt
    );
    const positions = new Set(afterRelease.map((value) => Math.round(value)));
    expect(
      positions.size,
      `the release glided through ${[...positions].join(", ")}`
    ).toBeLessThanOrEqual(2);
  });

  test("the reduce blanket reaches every shadow tree on the demo", async ({
    page,
  }) => {
    for (const [route, tag] of Object.entries(DEMO_ROUTES)) {
      await gotoReadyRoute(page, route, page.locator(`${tag} h1`));
      const violations = await page.evaluate(shadowBlanketViolations);
      expect(
        violations,
        `shadow trees on ${route} carry styles without the reduce blanket`
      ).toEqual([]);
    }
  });

  test("the ring orbit stops under reduce", async ({ page }) => {
    const ring = page.locator("metro-progress-ring").first();
    await gotoReadyRoute(page, "/#/progress", ring);

    const duration = await ring
      .locator(".ring-dot")
      .first()
      .evaluate((el) => getComputedStyle(el).animationDuration);
    expect(
      Math.max(...durations(duration)),
      `the ring orbit still animates at ${duration}`
    ).toBeLessThanOrEqual(0.00002);
  });

  test("pivot switches instantly", async ({ page }) => {
    const pivot = page.locator("#metro-pivot metro-pivot");
    const slides = pivot.locator(".pivot-slides");
    const content = pivot.locator(".pivot-content");
    await gotoReadyRoute(page, "/#/navigation", content);
    const width = await content.evaluate((el) => el.getBoundingClientRect().width);

    await pivot.getByRole("tab", { name: "Second" }).click();

    const startedAt = Date.now();
    await expect
      .poll(() =>
        slides.evaluate((el) => {
          const value = getComputedStyle(el).transform;
          if (value === "none") return 0;
          const open = value.indexOf("(");
          const close = value.lastIndexOf(")");
          if (open < 0 || close < 0) return Number.NaN;
          const numbers = value.slice(open + 1, close).split(",");
          // A 2-D matrix carries the offset at index 4, a 3-D one at index 12.
          return Number.parseFloat(numbers[numbers.length > 6 ? 12 : 4]);
        })
      )
      .toBeCloseTo(-width, 0);

    expect(
      Date.now() - startedAt,
      "the slide took more than one frame to land"
    ).toBeLessThan(60);
  });

  test("tilt is disabled", async ({ page }) => {
    const button = page.locator("metro-button").first();
    await gotoReadyRoute(page, "/#/buttons", button);
    await button.scrollIntoViewIfNeeded();
    const box = await button.boundingBox();
    if (!box) throw new Error("the button has no bounding box");

    await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.8);
    await page.mouse.down();

    const transform = await button.evaluate(
      (el) => (el as HTMLElement).style.transform
    );
    expect(
      transform,
      "the pointer tilt still skews the button under reduce"
    ).toBe("");

    await page.mouse.up();
  });
});
