import { expect, test, type Locator, type Page } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

declare global {
  interface Window {
    /** One entry per animation frame that the flight clone was on the body. */
    __continuumFrames?: ContinuumFrame[];
  }
}

interface ContinuumFrame {
  x: number;
  y: number;
  width: number;
  height: number;
  transform: string;
  transitionDuration: string;
}

/**
 * The selector the flight is reachable by: the clone hangs off the body, because the
 * tree that drew the tapped tile is gone by the time the destination renders.
 */
const CLONE = "body > [data-continuum-flight]";

/**
 * Samples the body-level flight clone once per animation frame, from now until it has
 * been gone for three frames. The flight itself is 150ms, so the recorder has to be
 * installed before the tap and read afterwards: an assertion that starts after the click
 * races it and loses on a warm module cache.
 */
async function recordFlightFrames(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__continuumFrames = [];
    const deadline = performance.now() + 5000;
    let absentFrames = 0;

    const step = (): void => {
      const clone = document.querySelector("body > [data-continuum-flight]");

      if (clone) {
        absentFrames = 0;
        const box = clone.getBoundingClientRect();
        const style = getComputedStyle(clone);
        window.__continuumFrames?.push({
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          transform: style.transform,
          transitionDuration: style.transitionDuration,
        });
      } else if ((window.__continuumFrames?.length ?? 0) > 0) {
        absentFrames += 1;
        if (absentFrames >= 3) return;
      }

      if (performance.now() >= deadline) return;
      requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  });
}

function readFrames(page: Page): Promise<ContinuumFrame[]> {
  return page.evaluate(() => window.__continuumFrames ?? []);
}

/** The largest duration in a computed `*-duration` list, in seconds. */
function seconds(value: string): number {
  return Math.max(
    ...value.split(",").map((part) => {
      const trimmed = part.trim();
      return Number.parseFloat(trimmed) * (trimmed.endsWith("ms") ? 0.001 : 1);
    })
  );
}

/** The scale factors and the offset of a computed `transform`. */
function decompose(transform: string): {
  a: number;
  d: number;
  x: number;
  y: number;
} {
  if (transform === "none") return { a: 1, d: 1, x: 0, y: 0 };

  const open = transform.indexOf("(");
  const close = transform.lastIndexOf(")");
  const numbers = transform
    .slice(open + 1, close)
    .split(",")
    .map((value) => Number.parseFloat(value));

  if (numbers.length === 6) {
    return { a: numbers[0], d: numbers[3], x: numbers[4], y: numbers[5] };
  }
  if (numbers.length === 16) {
    return { a: numbers[0], d: numbers[5], x: numbers[12], y: numbers[13] };
  }

  throw new TypeError(`unexpected transform "${transform}"`);
}

/**
 * Reads the text of a `@keyframes` rule out of the sheets the element's own tree
 * adopted: Lit adopts `static styles`, so the rule a preview runs sits next to the
 * preview. Pass an element from inside that shadow tree — the route elements live under
 * the app's own shadow root, so they are not reachable from `document`.
 */
async function keyframesOf(
  target: Locator,
  name: string
): Promise<string | null> {
  return target.evaluate(
    (el: Element, keyframesName: string) => {
      const root = el.getRootNode() as ShadowRoot | Document;
      for (const sheet of Array.from(root.adoptedStyleSheets ?? [])) {
        for (const rule of Array.from(sheet.cssRules)) {
          if (rule instanceof CSSKeyframesRule && rule.name === keyframesName) {
            return rule.cssText;
          }
        }
      }
      return null;
    },
    name
  );
}

/** Reads the text of a `@keyframes` rule the document itself loaded. */
async function documentKeyframes(
  page: Page,
  name: string
): Promise<string | null> {
  return page.evaluate((keyframesName: string) => {
    for (const sheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSKeyframesRule && rule.name === keyframesName) {
          return rule.cssText;
        }
      }
    }
    return null;
  }, name);
}

/** The first tile of the hub, which is on screen without any scrolling. */
function firstTile(page: Page) {
  return page
    .locator("metrino-home .hub-item")
    .filter({ hasText: "metro-button" })
    .first();
}

test.describe("continuum flight", () => {
  test("tapping a home tile flies it into the page", async ({ page }) => {
    await gotoReadyRoute(page, "/#/", page.locator("metrino-home h1"));

    const tile = firstTile(page);
    const origin = await tile.boundingBox();
    expect(origin, "the tapped tile has no box to fly from").not.toBeNull();

    await recordFlightFrames(page);
    await tile.click();

    // The destination renders on its own; the flight is what the user watched.
    await expect(page.locator("metrino-buttons-page h1")).toBeVisible();
    await expect(page.locator(CLONE)).toHaveCount(0);

    const frames = await readFrames(page);
    expect(
      frames.length,
      "no body-level flight clone was sampled"
    ).toBeGreaterThan(3);

    const start = decompose(frames[0].transform);
    expect(
      Math.abs(frames[0].x - origin!.x),
      `the clone started at x ${frames[0].x}, the tile was at ${origin!.x}`
    ).toBeLessThanOrEqual(4);
    expect(
      Math.abs(frames[0].y - origin!.y),
      `the clone started at y ${frames[0].y}, the tile was at ${origin!.y}`
    ).toBeLessThanOrEqual(4);
    expect(
      Math.abs(frames[0].width - origin!.width)
    ).toBeLessThanOrEqual(4);
    expect(
      Math.abs(frames[0].height - origin!.height)
    ).toBeLessThanOrEqual(4);
    expect(
      Math.abs(start.x) + Math.abs(start.y),
      `the clone started displaced: ${frames[0].transform}`
    ).toBeLessThanOrEqual(1);

    for (const frame of frames) {
      expect(
        seconds(frame.transitionDuration),
        `the flight did not run at 150ms: ${frame.transitionDuration}`
      ).toBeCloseTo(0.15, 3);

      // Translate only: a scale would be the old continuum, not the item travelling.
      const box = decompose(frame.transform);
      expect(box.a, `the flight scaled on X: ${frame.transform}`).toBeCloseTo(1, 3);
      expect(box.d, `the flight scaled on Y: ${frame.transform}`).toBeCloseTo(1, 3);
    }

    const lastFrame = frames[frames.length - 1];
    const travelled = decompose(lastFrame.transform);
    expect(
      Math.abs(travelled.x) + Math.abs(travelled.y),
      "the clone never left the tile it was copied from"
    ).toBeGreaterThan(8);

    const landing = await page
      .locator("metrino-buttons-page h1")
      .boundingBox();
    expect(landing, "the destination title has no box").not.toBeNull();
    expect(
      Math.abs(lastFrame.x - landing!.x),
      `the clone rested at x ${lastFrame.x}, the page title is at ${landing!.x}`
    ).toBeLessThanOrEqual(24);
    expect(
      Math.abs(lastFrame.y - landing!.y),
      `the clone rested at y ${lastFrame.y}, the page title is at ${landing!.y}`
    ).toBeLessThanOrEqual(24);
  });

  test("the flight replaces the route cross-fade", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __vtCalls?: number };
      w.__vtCalls = 0;
      const holder = Document.prototype as unknown as {
        startViewTransition?: (options: unknown) => unknown;
      };
      const original = holder.startViewTransition;
      if (typeof original !== "function") return;
      holder.startViewTransition = function (options: unknown): unknown {
        w.__vtCalls = (w.__vtCalls ?? 0) + 1;
        return original.call(this, options);
      };
    });
    await gotoReadyRoute(page, "/#/", page.locator("metrino-home h1"));

    await page.evaluate(() => {
      const w = window as unknown as { __flightOpacity?: number[] };
      w.__flightOpacity = [];
      const deadline = performance.now() + 5000;
      let absent = 0;
      const step = (): void => {
        const clone = document.querySelector("body > [data-continuum-flight]");
        if (clone) {
          absent = 0;
          w.__flightOpacity?.push(parseFloat(getComputedStyle(clone).opacity));
        } else if ((w.__flightOpacity?.length ?? 0) > 0) {
          absent += 1;
          if (absent >= 3) return;
        }
        if (performance.now() >= deadline) return;
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });

    // The initial home load runs its own turnstile; only calls from the tap on
    // are the ones under test.
    await page.evaluate(() => {
      (window as unknown as { __vtCalls: number }).__vtCalls = 0;
    });

    await firstTile(page).click();
    await expect(page.locator("metrino-buttons-page h1")).toBeVisible();
    await page.waitForTimeout(400);

    const calls = await page.evaluate(
      () => (window as unknown as { __vtCalls: number }).__vtCalls
    );
    expect(
      calls,
      "the continuum is the transition; the root turnstile must not also run"
    ).toBe(0);

    const opacities = await page.evaluate(
      () => (window as unknown as { __flightOpacity: number[] }).__flightOpacity
    );
    expect(opacities.length, "the flight was never sampled").toBeGreaterThan(0);
    expect(
      opacities.every((value) => value === 1),
      `a snapshot overlay dimmed the flight: ${opacities.join(", ")}`
    ).toBe(true);
  });

  test.describe("under reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("reduced motion skips the flight", async ({ page }) => {
      test.skip(
        !(await page.evaluate(
          () => matchMedia("(prefers-reduced-motion: reduce)").matches
        )),
        "this browser cannot emulate prefers-reduced-motion"
      );

      await gotoReadyRoute(page, "/#/", page.locator("metrino-home h1"));

      await recordFlightFrames(page);
      await firstTile(page).click();

      // Ten frames of sampling, all of them empty, is the claim: skipping motion is not
      // running it faster, and a clone that never appears is the evidence.
      await page.evaluate(() => {
        const waits: Promise<void>[] = [];
        for (let index = 0; index < 10; index += 1) {
          waits.push(
            new Promise<void>((resolve) => {
              requestAnimationFrame(() => resolve());
            })
          );
        }
        return Promise.all(waits);
      });

      const frames = await readFrames(page);
      expect(
        frames,
        `reduced motion still flew through ${frames.length} frames`
      ).toHaveLength(0);
      expect(await page.locator(CLONE).count()).toBe(0);

      await expect(page.locator("metrino-buttons-page h1")).toBeVisible();
    });
  });
});

test.describe("continuum keyframes", () => {
  test("the continuum class runs translate-only at 150ms", async ({ page }) => {
    await page.goto("/#/");

    const reading = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.className = "metro-animate-continuum-enter";
      document.body.append(probe);
      const style = getComputedStyle(probe);
      const value = {
        name: style.animationName,
        duration: style.animationDuration,
        timing: style.animationTimingFunction,
      };
      probe.remove();
      return value;
    });

    expect(reading.name).toBe("metro-continuum-enter");
    expect(
      seconds(reading.duration),
      `the continuum class ran at ${reading.duration}`
    ).toBeCloseTo(0.15, 3);
    expect(reading.timing.replace(/\s+/g, "")).toBe("cubic-bezier(0.19,1,0.22,1)");

    const keyframes = await documentKeyframes(page, "metro-continuum-enter");
    expect(
      keyframes,
      "the continuum keyframes are not in the document"
    ).not.toBeNull();
    expect(keyframes).toContain("translate");
    expect(keyframes).not.toContain("scale(");
  });

  test("the animations page previews the shared translate", async ({ page }) => {
    await gotoReadyRoute(
      page,
      "/#/animations",
      page.locator("metrino-animations-page h1")
    );

    const controls = page.locator("metrino-animations-page");
    await controls.locator("select").first().selectOption({
      label: "Continuum Enter",
    });
    await controls.locator("input[type=range]").fill("150");
    await expect(controls.locator(".duration-value")).toHaveText("150ms");
    await controls.locator(".play-button").click();

    const target = page.locator("metrino-animations-page .animation-target");
    await expect(target).toHaveCSS("animation-name", "metro-continuum-enter");
    await expect(target).toHaveCSS("animation-duration", "0.15s");

    const keyframes = await keyframesOf(target, "metro-continuum-enter");
    expect(
      keyframes,
      "the preview runs keyframes the page does not own"
    ).not.toBeNull();
    expect(keyframes).toContain("translate");
    expect(keyframes).not.toContain("scale(");
  });
});
