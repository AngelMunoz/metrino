import { test, expect, type Page } from "@playwright/test";

declare global {
  interface Window {
    /** Outcome of each view transition the app started: "ready" or "rejected: …". */
    __vtReady: string[];
    /** Computed `animation-name` of `::view-transition-old(root)` per transition. */
    __rootAnim: string[];
  }
}

/**
 * Records every view transition the app starts: whether `ready` resolved and the
 * animation the root snapshot got. Must run before goto so the init script wraps
 * `startViewTransition` before the demo module loads.
 */
async function instrumentViewTransitions(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.__vtReady = [];
    window.__rootAnim = [];
    const original = document.startViewTransition.bind(document);
    document.startViewTransition = (...args) => {
      const transition = original(...args);
      transition.ready.then(
        () => {
          window.__vtReady.push("ready");
          window.__rootAnim.push(
            getComputedStyle(document.documentElement, "::view-transition-old(root)")
              .animationName,
          );
        },
        (error: Error) => {
          window.__vtReady.push(`rejected: ${error.message}`);
        },
      );
      return transition;
    };
  });
}

/** Opens a route and skips the test when the browser has no View Transitions. */
async function gotoWithViewTransitions(page: Page, hash: string): Promise<void> {
  await page.goto(hash);
  const hasVT = await page.evaluate(() => "startViewTransition" in document);
  test.skip(!hasVT, "View Transitions not supported");
}

function readyOutcomes(page: Page): Promise<string[]> {
  return page.evaluate(() => window.__vtReady);
}

function rootAnimations(page: Page): Promise<string[]> {
  return page.evaluate(() => window.__rootAnim);
}

function appendToDialogsPage(
  page: Page,
  tag: string,
  id: string,
  title: string,
): Promise<void> {
  return page.evaluate(
    ({ tag, id, title }) => {
      const app = document.querySelector("metrino-app");
      const root = app?.shadowRoot
        ?.querySelector("metrino-dialogs-page")
        ?.shadowRoot;
      if (!root) throw new Error("dialogs page shadow root not found");
      const extra = document.createElement(tag);
      extra.id = id;
      extra.setAttribute("title", title);
      root.appendChild(extra);
    },
    { tag, id, title },
  );
}

/** Computed view-transition-name of a part inside a shadow root. */
function transitionName(page: Page, selector: string): Promise<string> {
  return page
    .locator(selector)
    .evaluate((el) => getComputedStyle(el).getPropertyValue("view-transition-name"));
}

test.describe("view transitions", () => {
  test("route change animates with two content dialogs on the page", async ({
    page,
  }) => {
    await instrumentViewTransitions(page);
    await gotoWithViewTransitions(page, "/#/dialogs");
    await appendToDialogsPage(
      page,
      "metro-content-dialog",
      "second-dialog",
      "Second Dialog",
    );

    await page
      .locator("metro-button", { hasText: "Open Content Dialog" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Content Dialog" });
    await expect(dialog).toBeVisible();

    const activeName = await transitionName(page, "#content-dialog .dialog");
    expect(
      activeName,
      "the open dialog must not hold the shared literal name",
    ).not.toBe("dialog-content");
    const idleName = await transitionName(page, "#second-dialog .dialog");
    expect(idleName, "a closed dialog must hold no name").toBe("none");

    await page
      .locator("#content-dialog metro-button", { hasText: "OK" })
      .click();
    await expect(dialog).toBeHidden();

    await page.locator('metro-app-bar-button[label="Home"]').click();
    await expect(page.locator("metrino-home h1.title")).toBeVisible();

    const outcomes = await readyOutcomes(page);
    expect(outcomes.at(-1), `outcomes: ${outcomes.join(", ")}`).toBe("ready");
  });

  test("closed dialogs hold no transition names", async ({ page }) => {
    await instrumentViewTransitions(page);
    await gotoWithViewTransitions(page, "/#/dialogs");

    await page
      .locator("metro-button", { hasText: "Open Content Dialog" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Content Dialog" });
    await expect(dialog).toBeVisible();
    await page
      .locator("#content-dialog metro-button", { hasText: "OK" })
      .click();
    await expect(dialog).toBeHidden();

    await expect
      .poll(
        async () => {
          const value = await page
            .locator("#content-dialog .dialog")
            .evaluate((el) =>
              getComputedStyle(el).getPropertyValue("view-transition-name"),
            );
          return value === "none" || value === "";
        },
        "a closed dialog must release its view-transition-name",
      )
      .toBe(true);

    await page.locator('metro-app-bar-button[label="Home"]').click();
    await expect(page.locator("metrino-home h1.title")).toBeVisible();

    const outcomes = await readyOutcomes(page);
    expect(outcomes.at(-1), `outcomes: ${outcomes.join(", ")}`).toBe("ready");
  });

  test("route change animates with two settings flyouts on the page", async ({
    page,
  }) => {
    await instrumentViewTransitions(page);
    await gotoWithViewTransitions(page, "/#/dialogs");
    await appendToDialogsPage(
      page,
      "metro-settings-flyout",
      "second-settings",
      "Second Settings Flyout",
    );

    await page.locator("metro-button", { hasText: "Open Settings" }).click();
    const label = page.locator("#settings-flyout .settings-item label", {
      hasText: "Notifications",
    });
    await expect(label).toBeVisible();

    const activeName = await transitionName(
      page,
      "#settings-flyout .flyout-panel",
    );
    expect(
      activeName,
      "the open flyout must not hold the shared literal name",
    ).not.toBe("settings-flyout-panel");
    const idleName = await transitionName(page, "#second-settings .flyout-panel");
    expect(idleName, "a closed flyout must hold no name").toBe("none");

    await page.keyboard.press("Escape");
    const panel = page.locator("#settings-flyout .flyout-panel");
    await expect(panel).toHaveCSS("transform", "matrix(1, 0, 0, 1, 346, 0)");

    await page.locator('metro-app-bar-button[label="Home"]').click();
    await expect(page.locator("metrino-home h1.title")).toBeVisible();

    const outcomes = await readyOutcomes(page);
    expect(outcomes.at(-1), `outcomes: ${outcomes.join(", ")}`).toBe("ready");
  });

  test("route change uses the root turnstile", async ({ page }) => {
    await instrumentViewTransitions(page);
    await gotoWithViewTransitions(page, "/#/dialogs");

    await page.locator('metro-app-bar-button[label="Home"]').click();
    await expect(page.locator("metrino-home h1.title")).toBeVisible();

    const animations = await rootAnimations(page);
    expect(
      animations.at(-1),
      `root animations: ${animations.join(", ")}`,
    ).toBe("metro-view-transition-out");
  });

  test("animations page turnstile preview uses library keyframes", async ({
    page,
  }) => {
    await gotoWithViewTransitions(page, "/#/animations");

    await page.locator("select").first().selectOption({ label: "Turnstile In" });
    await page.locator(".play-button").click();

    const target = page.locator(".animation-target");
    await expect(target).toHaveCSS("animation-name", "metro-turnstile-in");
    const running = await target.evaluate((el) =>
      el
        .getAnimations()
        .map((animation) => (animation as CSSAnimation).animationName),
    );
    expect(running).toContain("metro-turnstile-in");
  });

  test("content dialog entrance is a swivel", async ({ page }) => {
    await gotoWithViewTransitions(page, "/#/dialogs");

    const enterCss = await page.evaluate(() => {
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSKeyframesRule && rule.name === "metro-dialog-enter") {
            return rule.cssText;
          }
        }
      }
      return null;
    });

    expect(
      enterCss,
      "metro-dialog-enter keyframes should be loaded on every route",
    ).toBeTruthy();
    expect(enterCss).toContain("rotateX(90deg)");
    expect(enterCss).not.toContain("scale(0.85)");
  });
});
