import { test, expect, type Locator, type Page } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

/** Served image so the test does not depend on the network. */
const STUB_IMAGE = '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"></svg>';

async function openPrimitives(page: Page): Promise<void> {
  await gotoReadyRoute(
    page,
    "/#/primitives",
    page.locator("metrino-primitives-page h1")
  );
}

/** Top-left point and height of every box a locator matches. */
async function boxes(
  locator: Locator
): Promise<{ x: number; y: number; height: number }[]> {
  return locator.evaluateAll((els) =>
    els.map((el) => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, height: rect.height };
    })
  );
}

test.describe("primitives page use cases", () => {
  test("user sees the placeholder only while an image is loading", async ({
    page,
  }) => {
    await page.route("**picsum.photos/**", (route) =>
      route.fulfill({ status: 200, contentType: "image/svg+xml", body: STUB_IMAGE })
    );
    await openPrimitives(page);

    const image = page.locator("#demo-image-placeholder");
    // The placeholder is drawn first; the load event has to take it away.
    await expect(image.locator("img")).toBeVisible();
    await expect
      .poll(() => image.evaluate((el) => el.shadowRoot?.querySelector(".placeholder") === null))
      .toBe(true);
  });

  test("user expands a tall section with the keyboard and sees all of it", async ({
    page,
  }) => {
    await openPrimitives(page);

    const expander = page.locator("#tall-expander");
    const header = expander.locator(".expander-header");
    const content = expander.locator(".expander-content");

    await expect(header).toHaveAttribute("aria-expanded", "false");
    await header.focus();
    await page.keyboard.press("Enter");
    await expect(header).toHaveAttribute("aria-expanded", "true");

    // 800px of content has to fit: the old 500px max-height clip cut it off.
    await expect
      .poll(async () => (await boxes(content))[0]?.height ?? 0, {
        message: "the expanded content never reached its full height",
      })
      .toBeGreaterThanOrEqual(800);

    await page.keyboard.press(" ");
    await expect(header).toHaveAttribute("aria-expanded", "false");
    await expect
      .poll(async () => (await boxes(content))[0]?.height ?? -1)
      .toBeLessThanOrEqual(1);
  });

  test("user sees the Metro accent in the native player controls", async ({
    page,
  }) => {
    await openPrimitives(page);

    for (const type of ["video", "audio"]) {
      const media = page.locator(`metro-media-element[type="${type}"] ${type}`);
      // accent-color and color-scheme are the standard levers; the webkit
      // pseudo-element rules only reach Blink and WebKit.
      await expect(media).toHaveCSS("accent-color", /^rgb\(/);
      await expect(media).toHaveCSS("color-scheme", "dark");
    }
  });
});
