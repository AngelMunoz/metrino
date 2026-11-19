import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";

type AnimationsModule = typeof import("../src/utils/animations.ts");

const ANIMATIONS = [
  "fade-in",
  "fade-out",
  "slide-up",
  "slide-left",
  "slide-right",
  "turnstile-in",
  "turnstile-out",
  "continuum-enter",
  "continuum-exit",
  "tile-flip",
  "zoom-in",
  "zoom-out",
  "semantic-zoom-in",
  "semantic-zoom-out",
] as const;

interface SourceSnapshot {
  keyframeNames: string[];
  classSelectors: string[];
  documentKeyframeNames: string[];
  tileFlip: string | null;
}

/**
 * Parses the keyframes and classes that `utils/animations.ts` publishes and reads the
 * `@keyframes` names of the animations sheet the document itself loaded. The module is
 * fetched through the dev server so the check runs on the same source the demo uses.
 */
async function snapshotAnimationSource(page: Page): Promise<SourceSnapshot> {
  return page.evaluate(async () => {
    const mod = (await import("/src/utils/animations.ts" as string)) as AnimationsModule;

    const probe = document.createElement("style");
    probe.textContent =
      mod.animationKeyframes.cssText + mod.animationClasses.cssText;
    document.head.appendChild(probe);
    const sheet = probe.sheet;
    if (!sheet) {
      throw new TypeError("The utils animation styles did not parse");
    }

    const keyframeNames: string[] = [];
    const classSelectors: string[] = [];
    let tileFlip: string | null = null;
    for (const rule of Array.from(sheet.cssRules)) {
      if (rule instanceof CSSKeyframesRule) {
        keyframeNames.push(rule.name);
        if (rule.name === "metro-tile-flip") tileFlip = rule.cssText;
      } else if (rule instanceof CSSStyleRule) {
        classSelectors.push(rule.selectorText);
      }
    }
    probe.remove();

    // Only the sheet that carries the metro animation classes, so unrelated global
    // keyframes cannot skew the parity check.
    const documentKeyframeNames: string[] = [];
    for (const styleSheet of Array.from(document.styleSheets)) {
      let rules: CSSRuleList;
      try {
        rules = styleSheet.cssRules;
      } catch {
        continue;
      }
      const ruleList = Array.from(rules);
      const isAnimationsSheet = ruleList.some(
        (rule) =>
          rule instanceof CSSStyleRule &&
          rule.selectorText === ".metro-animate-tile-flip",
      );
      if (!isAnimationsSheet) continue;
      for (const rule of ruleList) {
        if (rule instanceof CSSKeyframesRule) {
          documentKeyframeNames.push(rule.name);
        }
      }
    }

    return {
      keyframeNames,
      classSelectors,
      documentKeyframeNames,
      tileFlip,
    };
  });
}

test.describe("single animation source", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("utils animations are the ones in animations.css", async ({ page }) => {
    const snapshot = await snapshotAnimationSource(page);

    expect(snapshot.documentKeyframeNames.length).toBeGreaterThan(0);
    for (const animation of ANIMATIONS) {
      expect(snapshot.keyframeNames).toContain(`metro-${animation}`);
      expect(snapshot.classSelectors).toContain(`.metro-animate-${animation}`);
    }
    expect(snapshot.classSelectors).toContain(".metro-animate-progress-ring");
    expect([...snapshot.keyframeNames].sort()).toEqual(
      [...snapshot.documentKeyframeNames].sort(),
    );
    expect(snapshot.tileFlip).toContain("rotateY(-90deg)");
    expect(snapshot.tileFlip).not.toContain("rotateX");
  });

  test("continuum keyframes carry the toolkit travel offsets by default", async ({
    page,
  }) => {
    const blocks = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/animations.ts" as string
      )) as AnimationsModule;
      const probe = document.createElement("style");
      probe.textContent = mod.animationKeyframes.cssText;
      document.head.appendChild(probe);
      const found: Record<string, Record<string, string>> = {};
      for (const rule of Array.from(probe.sheet?.cssRules ?? [])) {
        if (
          rule instanceof CSSKeyframesRule &&
          (rule.name === "metro-continuum-enter" ||
            rule.name === "metro-continuum-exit")
        ) {
          const stops: Record<string, string> = {};
          for (const stop of Array.from(rule.cssRules)) {
            if (stop instanceof CSSKeyframeRule) {
              // Chromium serializes `from`/`to` as `0%`/`100%`.
              const key =
                stop.keyText === "0%"
                  ? "from"
                  : stop.keyText === "100%"
                    ? "to"
                    : stop.keyText;
              stops[key] = stop.style.cssText;
            }
          }
          found[rule.name] = stops;
        }
      }
      probe.remove();
      return found;
    });

    const enter = blocks["metro-continuum-enter"];
    const exit = blocks["metro-continuum-exit"];
    expect(enter, "the enter keyframes are missing").toBeDefined();
    expect(exit, "the exit keyframes are missing").toBeDefined();

    const enterFrom = (enter["from"] ?? "").replace(/\s+/g, "");
    const enterTo = (enter["to"] ?? "").replace(/\s+/g, "");
    const exitFrom = (exit["from"] ?? "").replace(/\s+/g, "");
    const exitTo = (exit["to"] ?? "").replace(/\s+/g, "");
    expect(enterFrom).toContain("var(--metro-continuum-dx,130px)");
    expect(enterFrom).toContain("var(--metro-continuum-dy,-70px)");
    expect(exitTo).toContain("var(--metro-continuum-dx,225px)");
    expect(exitTo).toContain("var(--metro-continuum-dy,73px)");

    // Direction: enter starts at the offset and lands at rest; exit leaves rest
    // and ends at the offset.
    expect(enterFrom).toContain("translate(");
    expect(exitTo).toContain("translate(");
    expect(enterTo).not.toContain("130px");
    expect(exitFrom).not.toContain("225px");
  });

  test("createTransition runs continuum at the flight easing unless overridden", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/animations.ts" as string
      )) as AnimationsModule;
      const read = async (
        type: "continuum" | "fade",
        options?: { duration?: number; easing?: string }
      ): Promise<string> => {
        const el = document.createElement("div");
        document.body.appendChild(el);
        await mod.createTransition(el, type, { duration: 10, ...options });
        const transition = el.style.transition;
        el.remove();
        return transition;
      };
      return {
        def: await read("continuum"),
        over: await read("continuum", { easing: "linear" }),
        fade: await read("fade"),
      };
    });

    expect(result.def.replace(/\s+/g, "")).toContain(
      "cubic-bezier(0.19,1,0.22,1)"
    );
    expect(result.over).toContain("linear");
    expect(result.over.replace(/\s+/g, "")).not.toContain(
      "cubic-bezier(0.19,1,0.22,1)"
    );
    expect(result.fade.replace(/\s+/g, "")).toContain(
      "cubic-bezier(0.1,0.9,0.2,1)"
    );
  });

  test("playAnimation waits for the animation, not for its own timer", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/animations.ts" as string
      )) as AnimationsModule;
      const el = document.createElement("div");
      el.style.width = "80px";
      el.style.height = "80px";
      el.style.background = "#ffffff";
      // The class asks for 333ms; the element runs 400ms, so only the real animation can
      // be what settles the promise — a timer would have settled it before this ended.
      el.style.animationDuration = "400ms";
      document.body.appendChild(el);

      const names: string[] = [];
      el.addEventListener("animationend", (event) =>
        names.push(event.animationName),
      );

      const started = performance.now();
      await mod.playAnimation(el, "slide-up");
      const elapsed = performance.now() - started;
      el.remove();

      return { elapsed, names };
    });

    expect(result.names).toEqual(["metro-slide-up"]);
    expect(result.elapsed).toBeGreaterThanOrEqual(390);
  });

  test("playAnimation settles at the end of a default-duration animation", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/animations.ts" as string
      )) as AnimationsModule;
      const el = document.createElement("div");
      el.style.width = "80px";
      el.style.height = "80px";
      el.style.background = "#ffffff";
      document.body.appendChild(el);

      const names: string[] = [];
      el.addEventListener("animationend", (event) =>
        names.push(event.animationName),
      );

      const started = performance.now();
      await mod.playAnimation(el, "fade-in");
      const elapsed = performance.now() - started;
      el.remove();

      return { elapsed, names };
    });

    expect(result.names).toEqual(["metro-fade-in"]);
    expect(result.elapsed).toBeGreaterThanOrEqual(150);
  });

  test("playAnimation still settles for an element that cannot animate", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/animations.ts" as string
      )) as AnimationsModule;
      const el = document.createElement("div");
      el.style.width = "80px";
      el.style.height = "80px";
      el.style.display = "none";
      document.body.appendChild(el);

      const names: string[] = [];
      el.addEventListener("animationend", (event) =>
        names.push(event.animationName),
      );

      const started = performance.now();
      await mod.playAnimation(el, "fade-in");
      const elapsed = performance.now() - started;
      el.remove();

      return { elapsed, names };
    });

    expect(result.names).toEqual([]);
    expect(result.elapsed).toBeGreaterThanOrEqual(300);
    expect(result.elapsed).toBeLessThan(1000);
  });

  test("animateChildren waits for the last child", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/animations.ts" as string
      )) as AnimationsModule;
      const container = document.createElement("div");
      for (let index = 0; index < 3; index += 1) {
        const child = document.createElement("div");
        child.style.width = "40px";
        child.style.height = "40px";
        child.style.background = "#ffffff";
        child.style.animationDuration = "100ms";
        container.appendChild(child);
      }
      document.body.appendChild(container);

      let ended = 0;
      container.addEventListener("animationend", (event) => {
        if (event.animationName === "metro-fade-in") ended += 1;
      });

      const started = performance.now();
      // 200ms apart, 100ms each: the last child ends around 500ms, while a wait built from
      // the reference durations and the stagger would have settled near 767ms.
      await mod.animateChildren(container, "fade-in", 200);
      const elapsed = performance.now() - started;
      container.remove();

      return { elapsed, ended };
    });

    expect(result.ended).toBe(3);
    expect(result.elapsed).toBeGreaterThanOrEqual(490);
    expect(result.elapsed).toBeLessThan(700);
  });
});
