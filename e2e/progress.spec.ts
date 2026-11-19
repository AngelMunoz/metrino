import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

/**
 * Reads a CSS rule from the style sheets of the shadow tree the element lives in. Lit
 * adopts static styles as `adoptedStyleSheets`, so the rule sits next to the element and
 * not in `document.styleSheets`. Pass an element from inside the component's shadow root:
 * a host's own root node is the tree that *contains* it.
 */
async function keyframesOf(
  locator: Locator,
  name: string,
): Promise<string | null> {
  return locator.evaluate(
    (el: Element, keyframesName: string) => {
      const root = el.getRootNode() as ShadowRoot | Document;
      const sheets = Array.from(root.adoptedStyleSheets ?? []);
      for (const sheet of sheets) {
        for (const rule of Array.from(sheet.cssRules)) {
          if (rule instanceof CSSKeyframesRule && rule.name === keyframesName) {
            return rule.cssText;
          }
        }
      }
      return null;
    },
    name,
  );
}

/** Reads the text of a `@keyframes` rule that the document itself loads. */
async function documentKeyframes(
  page: Page,
  name: string,
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

test.describe("progress motion", () => {
  test("indeterminate dots travel with a transform, not with layout", async ({
    page,
  }) => {
    await page.goto("/#/progress");

    const dot = page
      .locator("metro-progress-bar[indeterminate] .indeterminate-dot")
      .first();
    await expect(dot).toBeVisible();

    const keyframes = await keyframesOf(dot, "dot-flow");
    expect(keyframes).not.toBeNull();
    expect(keyframes).toContain("translateX");
    expect(keyframes).toContain("cqw");
    expect(keyframes).not.toContain("left:");

    const first = await dot.evaluate((el: Element) => ({
      left: getComputedStyle(el).left,
      x: el.getBoundingClientRect().x,
    }));
    expect(first.left).toBe("0px");

    await page.waitForTimeout(300);

    const later = await dot.evaluate((el: Element) => ({
      left: getComputedStyle(el).left,
      x: el.getBoundingClientRect().x,
    }));
    expect(later.left).toBe("0px");
    expect(Math.abs(later.x - first.x)).toBeGreaterThan(1);
  });

  test("progress rings orbit with the one shared geometry", async ({
    page,
  }) => {
    await page.goto("/#/progress");

    const sizes: { size: string; keyframes: string }[] = [
      { size: "small", keyframes: "metro-ring-orbit-small" },
      { size: "normal", keyframes: "metro-ring-orbit-normal" },
      { size: "large", keyframes: "metro-ring-orbit-large" },
    ];

    for (const { size, keyframes } of sizes) {
      const dot = page
        .locator(`metro-progress-ring[size="${size}"] .ring-dot`)
        .first();
      await expect(dot).toHaveCSS("animation-name", keyframes);
      await expect(dot).toHaveCSS("animation-duration", "3s");
      await expect(dot).toHaveCSS(
        "animation-timing-function",
        "cubic-bezier(0.7, 0, 0.3, 1)",
      );
    }

    // The orbit lives once, in animations.css, and reaches the shadow tree.
    const shared = await keyframesOf(
      page
        .locator('metro-progress-ring[size="normal"] .ring-dot')
        .first(),
      "metro-ring-orbit-normal",
    );
    expect(shared).toContain("translateY(-14px)");
    expect(shared).toContain("rotate(180deg)");
  });

  test("the animations page previews the same ring orbit", async ({
    page,
  }) => {
    await page.goto("/#/animations");

    const type = page.locator("metrino-animations-page select").first();
    await type.selectOption("metro-animate-progress-ring");
    await expect(
      page.locator("metrino-animations-page .preview-header"),
    ).toContainText("Progress Ring Orbit");

    await page.locator("metrino-animations-page .play-button").click();

    const target = page.locator("metrino-animations-page .animation-target");
    await expect(target).toHaveCSS("animation-name", "metro-ring-orbit-normal");
    await expect(target).toHaveCSS(
      "animation-timing-function",
      "cubic-bezier(0.7, 0, 0.3, 1)",
    );
  });

  test("metro-tile-flip turns on the same axis as metro-flip-tile", async ({
    page,
  }) => {
    await page.goto("/#/tiles");

    const keyframes = await documentKeyframes(page, "metro-tile-flip");
    expect(keyframes).not.toBeNull();
    expect(keyframes).toContain("rotateY(-90deg)");
    expect(keyframes).not.toContain("rotateX");

    const tile = page.locator("metro-flip-tile#flip-tile-medium");
    const container = tile.locator(".tile-container");
    await expect(container).toHaveCSS("transform", "none");

    await tile.click();
    await expect(container).toHaveCSS(
      "transform",
      "matrix3d(-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0, 0, 0, 0, 1)",
    );

    await expect(tile).toHaveAttribute("flipped");
    await tile.click();
    await expect(container).toHaveCSS("transform", "none");
  });

  test("the animations page previews the shared tile flip", async ({
    page,
  }) => {
    await page.goto("/#/animations");

    const type = page.locator("metrino-animations-page select").first();
    await type.selectOption("metro-animate-tile-flip");
    await page.locator("metrino-animations-page .play-button").click();

    await expect(
      page.locator("metrino-animations-page .animation-target"),
    ).toHaveCSS("animation-name", "metro-tile-flip");
  });
});
