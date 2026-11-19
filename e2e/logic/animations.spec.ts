import { expect, test } from "@playwright/test";

type AnimationsModule = typeof import("../../src/utils/animations.ts");

const SOURCE = `
    /* a leading comment with a brace { inside */
    @keyframes metro-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .metro-animate-fade-in {
      animation: metro-fade-in 167ms var(--metro-easing) forwards;
    }

    .page-title {
      font-size: 42px;
    }

    @media (prefers-reduced-motion: reduce) {
      .metro-animate-slide-up {
        animation: none;
      }

      @keyframes metro-slide-up {
        from {
          transform: translateY(40px);
        }
        to {
          transform: translateY(0);
        }
      }
    }

    .metro-entrance-stagger > * {
      animation: metro-entrance-stagger 250ms forwards;
    }
  `;

test.describe("extractAnimationRules", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("collects every keyframes block, braces and all", async ({ page }) => {
    const { keyframes } = await page.evaluate(async (source: string) => {
      const mod = (await import(
        "/src/utils/animations.ts" as string
      )) as AnimationsModule;
      return mod.extractAnimationRules(source);
    }, SOURCE);

    expect(keyframes).toContain("@keyframes metro-fade-in {");
    expect(keyframes).toContain("from { opacity: 0; }");
    expect(keyframes).toContain("@keyframes metro-slide-up {");
    expect(keyframes).toContain("transform: translateY(40px);");
    expect(keyframes).not.toContain("metro-entrance-stagger");
    expect(keyframes).not.toContain("font-size");
  });

  test("collects the animate classes and nothing else", async ({ page }) => {
    const { classes } = await page.evaluate(async (source: string) => {
      const mod = (await import(
        "/src/utils/animations.ts" as string
      )) as AnimationsModule;
      return mod.extractAnimationRules(source);
    }, SOURCE);

    expect(classes).toContain(".metro-animate-fade-in {");
    expect(classes).toContain(".metro-animate-slide-up {");
    expect(classes).not.toContain(".page-title");
    expect(classes).not.toContain(".metro-entrance-stagger");
  });

  test("drops comments", async ({ page }) => {
    const combined = await page.evaluate(async (source: string) => {
      const mod = (await import(
        "/src/utils/animations.ts" as string
      )) as AnimationsModule;
      const { keyframes, classes } = mod.extractAnimationRules(source);
      return keyframes + classes;
    }, SOURCE);

    expect(combined).not.toContain("a leading comment");
  });

  test("keeps the two groups apart", async ({ page }) => {
    const groups = await page.evaluate(async (source: string) => {
      const mod = (await import(
        "/src/utils/animations.ts" as string
      )) as AnimationsModule;
      const { keyframes, classes } = mod.extractAnimationRules(source);
      return {
        keyframesMentionClass: keyframes.indexOf(".metro-animate-fade-in"),
        classesMentionKeyframes: classes.indexOf("@keyframes"),
      };
    }, SOURCE);

    expect(groups.keyframesMentionClass).toBe(-1);
    expect(groups.classesMentionKeyframes).toBe(-1);
  });

  test("handles an empty stylesheet", async ({ page }) => {
    const result = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/animations.ts" as string
      )) as AnimationsModule;
      return mod.extractAnimationRules("");
    });

    expect(result).toEqual({ keyframes: "", classes: "" });
  });

  test("extracts the real animations sheet served to the demo", async ({
    page,
  }) => {
    const result = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/animations.ts" as string
      )) as AnimationsModule;
      const css = (await import("/src/styles/animations.css?inline")) as {
        default: string;
      };
      const { keyframes, classes } = mod.extractAnimationRules(css.default);
      return {
        keyframesHasFadeIn: keyframes.includes("@keyframes metro-fade-in"),
        classesHasFadeIn: classes.includes(".metro-animate-fade-in"),
      };
    });

    expect(result.keyframesHasFadeIn).toBe(true);
    expect(result.classesHasFadeIn).toBe(true);
  });
});
