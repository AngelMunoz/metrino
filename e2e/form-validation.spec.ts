import { expect, test, type Locator, type Page } from "@playwright/test";
import { gotoReadyRoute } from "./page-ready.ts";

/**
 * Form-validation use cases for the "Form validation" fixture on #/input.
 *
 * Many-to-one collapse of the 23 integration cases from the former
 * src/utils/form-control.test.ts suite: every submit is a real button click,
 * every value travels a real user path (typing, clicking rendered controls),
 * and assertions only read observable outcomes — the per-form submit echo
 * and page-heard invalid events. The few values with no user path (roller
 * bounds, garbage into native date/time inputs, structural radio edits) go
 * through element properties and are flagged in the test names.
 */

/**
 * The demo app nests each page inside an outer shell shadow tree, so plain
 * `document.querySelector` cannot see the fixture. Walk through every shadow
 * root to find the input page's own shadow root and remember it for later
 * evaluate calls.
 */
async function storePageRoot(page: Page): Promise<void> {
  await page.evaluate(() => {
    const walk = (root: Document | ShadowRoot): Element | null => {
      const direct = root.querySelector("metrino-input-page");
      if (direct) return direct;
      const elements = Array.from(root.querySelectorAll("*"));
      for (const el of elements) {
        const shadow = (el as unknown as { shadowRoot?: ShadowRoot })
          .shadowRoot;
        if (shadow) {
          const found = walk(shadow);
          if (found) return found;
        }
      }
      return null;
    };
    const pageEl = walk(document);
    const pageRoot = (
      pageEl as unknown as { shadowRoot?: ShadowRoot } | null
    )?.shadowRoot;
    if (pageRoot === null || pageRoot === undefined) {
      throw new Error("input page shadow root not found");
    }
    (window as unknown as { __pageRoot?: ShadowRoot }).__pageRoot =
      pageRoot;
  });
}

test.beforeEach(async ({ page }) => {
  await gotoReadyRoute(page, "/#/input", page.locator("metrino-input-page"));
  await storePageRoot(page);
  // `invalid` does not cross shadow boundaries, so document cannot hear it:
  // listen in capture phase on the page's own shadow root, outside every
  // control under test.
  await page.evaluate(() => {
    const store = window as unknown as { __invalidTags: string[] };
    store.__invalidTags = [];
    const pageRoot = (
      window as unknown as { __pageRoot?: ShadowRoot }
    ).__pageRoot;
    if (pageRoot === null || pageRoot === undefined) {
      throw new Error("input page shadow root not stored");
    }
    pageRoot.addEventListener(
      "invalid",
      (event) => {
        store.__invalidTags.push(
          (event.target as Element | null)?.tagName.toLowerCase() ?? "?",
        );
      },
      true,
    );
  });
});

async function invalidEvents(page: Page): Promise<number> {
  return page.evaluate(
    () => (window as unknown as { __invalidTags: string[] }).__invalidTags.length,
  );
}

async function submitBlocked(page: Page, form: Locator): Promise<void> {
  const before = await invalidEvents(page);
  const echo = form.locator("[data-outcome]");
  // A blocked submit leaves the outcome exactly as it was: either the
  // initial "Not submitted" or the echo of an earlier successful submit.
  const previous = await echo.textContent();
  // Keyboard activation follows the same submission algorithm as a click.
  // (Firefox eats mouse clicks on a submit button while its validation
  // bubble from an earlier blocked submit is still up — the click never
  // dispatches, so no invalid fires. Keyboard activation is a real user
  // path that always runs the submission algorithm, and a blocked submit
  // still proves itself by firing invalid.)
  const button = form.getByRole("button", { name: "Submit" });
  await button.focus();
  await button.press("Enter");
  await expect(echo).toHaveText(previous ?? "");
  await expect
    .poll(() => invalidEvents(page), {
      message: "expected a blocked submit to fire invalid",
    })
    .toBeGreaterThan(before);
}

async function submitAllowed(form: Locator): Promise<void> {
  // Keyboard activation follows the same submission algorithm as a click
  // (Firefox eats mouse clicks on these submit buttons while a validation
  // bubble from an earlier blocked submit is still up).
  const button = form.getByRole("button", { name: "Submit" });
  await button.focus();
  await button.press("Enter");
  await expect(form.locator("[data-outcome]")).toContainText("Submitted:");
}

/**
 * Scroll one tick over a roller's first column at a fractional x position:
 * real mouse movement plus a real wheel event, aimed by public geometry
 * (rollers stretch full width while their columns stay left-aligned).
 */
async function wheelRoller(
  page: Page,
  roller: Locator,
  xFraction: number,
): Promise<void> {
  await roller.scrollIntoViewIfNeeded();
  const box = await roller.boundingBox();
  if (box === null) {
    throw new Error("roller has no geometry");
  }
  await page.mouse.move(
    box.x + box.width * xFraction,
    box.y + box.height / 2,
  );
  await page.mouse.wheel(0, 120);
}

/** Programmatic set for values with no user path; awaited on updateComplete. */
async function setControlValue(
  page: Page,
  selector: string,
  value: unknown,
): Promise<void> {
  await page.evaluate(
    ([sel, val]) => {
      const pageRoot = (
        window as unknown as { __pageRoot?: ShadowRoot }
      ).__pageRoot;
      if (pageRoot === null || pageRoot === undefined) {
        throw new Error("input page shadow root not stored");
      }
      const control = pageRoot.querySelector(sel) as unknown as {
        value: unknown;
        updateComplete: Promise<unknown>;
      } | null;
      if (control === null || control === undefined) {
        throw new Error(`missing control ${sel}`);
      }
      control.value = val;
      return control.updateComplete;
    },
    [selector, value] as [string, unknown],
  );
}

test("required text and password block submit until filled, reset blocks again", async ({
  page,
}) => {
  const form = page.locator("#form-text");
  const outcome = form.locator("[data-outcome]");
  await expect(outcome).toHaveText("Not submitted");

  await submitBlocked(page, form);
  await form.locator("metro-text-box").locator("input").fill("scythes");
  await submitBlocked(page, form);
  await form.locator("metro-password-box").locator("input").fill("hunter2");
  await submitAllowed(form);
  await expect(outcome).toContainText("username=scythes");
  await expect(outcome).toContainText("password=hunter2");

  await form.getByRole("button", { name: "Reset" }).click();
  await expect(outcome).toHaveText("Not submitted");
  await submitBlocked(page, form);
});

test("number range, step, and non-numeric values block submit", async ({
  page,
}) => {
  const form = page.locator("#form-number");
  const outcome = form.locator("[data-outcome]");
  const count = form
    .locator('metro-number-box[name="count"]')
    .locator("input");
  const needed = form
    .locator('metro-number-box[name="needed"]')
    .locator("input");

  // Zero satisfies the required box and sits inside 0-10, so the form submits.
  await submitAllowed(form);
  await expect(outcome).toContainText("count=0");
  await expect(outcome).toContainText("needed=0");

  // Typing beyond the bounds clamps to the bound and still submits.
  await count.fill("15");
  await submitAllowed(form);
  await expect(outcome).toContainText("count=10");
  await count.fill("-5");
  await submitAllowed(form);
  await expect(outcome).toContainText("count=0");

  // Non-numeric keystrokes are dropped by the input, so the previous value
  // still submits. (Playwright fill refuses letters in number inputs, so
  // type them the way a user would.)
  await needed.focus();
  await needed.pressSequentially("abc");
  await submitAllowed(form);
  await expect(outcome).toContainText("needed=0");

  // Off-step values block; on-step values submit.
  await count.fill("5.5");
  await submitBlocked(page, form);
  await count.fill("10");
  await submitAllowed(form);

  // Out-of-range values have no user path (every input clamps to min/max).
  await setControlValue(page, '#form-number metro-number-box[name="count"]', 15);
  await submitBlocked(page, form);
  await setControlValue(page, '#form-number metro-number-box[name="count"]', -5);
  await submitBlocked(page, form);
  await count.fill("10");
  await submitAllowed(form);

  // A missing number on the required box has no user path either (typing is
  // ignored, never cleared to NaN).
  await setControlValue(
    page,
    '#form-number metro-number-box[name="needed"]',
    Number.NaN,
  );
  await submitBlocked(page, form);
  await needed.fill("3");
  await submitAllowed(form);
  await expect(outcome).toContainText("needed=3");
});

test("required check-box and toggle-switch block submit until on", async ({
  page,
}) => {
  const form = page.locator("#form-checkable");
  const outcome = form.locator("[data-outcome]");

  await submitBlocked(page, form);
  await form.getByRole("checkbox").click();
  await submitBlocked(page, form);
  await form.getByRole("switch").click();
  await submitAllowed(form);
  await expect(outcome).toContainText("agree=on");
  await expect(outcome).toContainText("notify=on");
});

test("required radio group blocks until checked, scoped to the form owner", async ({
  page,
}) => {
  const form = page.locator("#form-radio");
  const other = page.locator("#form-radio-other");

  await submitBlocked(page, form);
  // A selection in the other form must neither satisfy nor clear this group.
  await other.getByRole("radio").nth(0).click();
  await submitBlocked(page, form);
  // ...while the other form submits on its own selection.
  await other.getByRole("button", { name: "Submit" }).click();
  await expect(other.locator("[data-outcome]")).toContainText(
    "Submitted: plan=x",
  );

  await form.getByRole("radio").nth(1).click();
  await submitAllowed(form);
  await expect(form.locator("[data-outcome]")).toContainText("plan=b");
});

test("radio group revalidates after rename, remove, and move (structural edits)", async ({
  page,
}) => {
  const form = page.locator("#form-radio");
  const other = page.locator("#form-radio-other");

  await form.getByRole("radio").nth(1).click();
  await submitAllowed(form);

  async function renameChecked(next: string): Promise<void> {
    await page.evaluate((name) => {
      const pageRoot = (
        window as unknown as { __pageRoot?: ShadowRoot }
      ).__pageRoot;
      if (pageRoot === null || pageRoot === undefined) {
        throw new Error("input page shadow root not stored");
      }
      const group = pageRoot.querySelector("#form-radio");
      group
        ?.querySelector('metro-radio-button[value="b"]')
        ?.setAttribute("name", name);
      return (
        group?.querySelector("metro-radio-button[required]") as unknown as {
          updateComplete: Promise<unknown>;
        } | null
      )?.updateComplete;
    }, next);
  }

  // Renaming the checked member out leaves the required group with no
  // selection, so submit blocks; renaming back restores it.
  await renameChecked("other");
  await submitBlocked(page, form);
  await renameChecked("plan");
  await submitAllowed(form);

  // Moving the checked member to the other form moves its group membership.
  await page.evaluate(() => {
    const pageRoot = (
      window as unknown as { __pageRoot?: ShadowRoot }
    ).__pageRoot;
    if (pageRoot === null || pageRoot === undefined) {
      throw new Error("input page shadow root not stored");
    }
    const from = pageRoot.querySelector("#form-radio");
    const to = pageRoot.querySelector("#form-radio-other");
    const pro = from?.querySelector('metro-radio-button[value="b"]');
    if (pro !== null && pro !== undefined && to !== null && to !== undefined) {
      to.appendChild(pro);
    }
    return (
      from?.querySelector("metro-radio-button[required]") as unknown as {
        updateComplete: Promise<unknown>;
      } | null
    )?.updateComplete;
  });
  await submitBlocked(page, form);
  await other.getByRole("button", { name: "Submit" }).click();
  await expect(other.locator("[data-outcome]")).toContainText("plan=b");

  // Moving it back satisfies the group again; removing it invalidates it.
  await page.evaluate(() => {
    const pageRoot = (
      window as unknown as { __pageRoot?: ShadowRoot }
    ).__pageRoot;
    if (pageRoot === null || pageRoot === undefined) {
      throw new Error("input page shadow root not stored");
    }
    const from = pageRoot.querySelector("#form-radio-other");
    const to = pageRoot.querySelector("#form-radio");
    const pro = from?.querySelector('metro-radio-button[value="b"]');
    if (pro !== null && pro !== undefined && to !== null && to !== undefined) {
      to.appendChild(pro);
    }
    return (
      to?.querySelector("metro-radio-button[required]") as unknown as {
        updateComplete: Promise<unknown>;
      } | null
    )?.updateComplete;
  });
  await submitAllowed(form);
  await page.evaluate(() => {
    const pageRoot = (
      window as unknown as { __pageRoot?: ShadowRoot }
    ).__pageRoot;
    if (pageRoot === null || pageRoot === undefined) {
      throw new Error("input page shadow root not stored");
    }
    const group = pageRoot.querySelector("#form-radio");
    group?.querySelector('metro-radio-button[value="b"]')?.remove();
    return (
      group?.querySelector("metro-radio-button[required]") as unknown as {
        updateComplete: Promise<unknown>;
      } | null
    )?.updateComplete;
  });
  await submitBlocked(page, form);
});

test("slider adjusts by keyboard, rating required until a star is clicked", async ({
  page,
}) => {
  const form = page.locator("#form-choice");
  const outcome = form.locator("[data-outcome]");

  await submitBlocked(page, form);
  const thirdStar = form.locator("metro-rating").locator("span").nth(2);
  await thirdStar.hover();
  await thirdStar.click();
  await submitAllowed(form);
  await expect(outcome).toContainText("stars=3");
  await expect(outcome).toContainText("volume=50");

  const sliderInput = form
    .locator("metro-slider")
    .locator('input[type="range"]');
  await sliderInput.focus();
  await sliderInput.press("ArrowRight");
  await sliderInput.press("ArrowRight");
  await submitAllowed(form);
  await expect(outcome).toContainText("volume=52");

  // Out-of-range and non-finite slider values, and an above-max rating, have
  // no user path (the UI clamps); set programmatically.
  await setControlValue(page, "#form-choice metro-slider", 150);
  await submitBlocked(page, form);
  await setControlValue(page, "#form-choice metro-slider", 50);
  await submitAllowed(form);
  await setControlValue(page, "#form-choice metro-rating", 9);
  await submitBlocked(page, form);
  await thirdStar.hover();
  await thirdStar.click();
  await submitAllowed(form);
  await setControlValue(page, "#form-choice metro-slider", Number.NaN);
  await submitBlocked(page, form);
});

test("required combo and auto-suggest block submit until an option is picked", async ({
  page,
}) => {
  const form = page.locator("#form-pick");
  const outcome = form.locator("[data-outcome]");
  const combo = form.locator("#form-combo");
  const suggest = form.locator("#form-suggest");

  await submitBlocked(page, form);
  // Scroll first: opening the dropdown and only then scrolling to the option
  // moves it under the click in Firefox. A click can still miss the entering
  // dropdown under load; a user would simply click the option again.
  await combo.scrollIntoViewIfNeeded();
  const option = combo.locator(".dropdown-item", { hasText: "Option 1" });
  for (let attempt = 0; attempt < 3; attempt++) {
    if (!(await option.isVisible())) {
      await combo.locator("input").click();
      await expect(option).toBeVisible();
    }
    await option.click();
    const picked = await expect(combo.locator("input"))
      .toHaveValue("Option 1", { timeout: 1_000 })
      .then(() => true)
      .catch(() => false);
    if (picked) break;
  }
  await expect(combo.locator("input")).toHaveValue("Option 1");
  await submitBlocked(page, form);

  const suggestInput = suggest.locator("input");
  await suggestInput.fill("Apple");
  await suggest.getByText("Apple", { exact: true }).click();
  await expect(suggestInput).toHaveValue("Apple");
  await submitAllowed(form);
  await expect(outcome).toContainText("choice=Option 1");
  await expect(outcome).toContainText("fruit=Apple");
});

test("required rich-edit needs visible text; formatting-only markup is empty", async ({
  page,
}) => {
  const form = page.locator("#form-rich");
  const outcome = form.locator("[data-outcome]");
  const editor = form
    .locator("metro-rich-edit-box")
    .getByRole("textbox", { name: "Bio" });

  await submitBlocked(page, form);
  await editor.click();
  await editor.fill("Hello");
  await submitAllowed(form);
  await expect(outcome).toContainText("Hello");

  await editor.fill("");
  await submitBlocked(page, form);
  // Bare markup has no user path; clearing leaves an empty editor either way.
  await setControlValue(page, "#form-rich metro-rich-edit-box", "<p>   </p>");
  await submitBlocked(page, form);
  await editor.fill("Hello again");
  await submitAllowed(form);
});

test("required date, time, calendar bounds, and roller bounds block submit", async ({
  page,
}) => {
  const datetime = page.locator("#form-datetime");
  const datetimeOutcome = datetime.locator("[data-outcome]");
  await submitBlocked(page, datetime);
  await datetime.locator("metro-date-picker").locator("input").fill("2026-09-20");
  await submitBlocked(page, datetime);
  await datetime.locator("metro-time-picker").locator("input").fill("13:30");
  await submitAllowed(datetime);
  await expect(datetimeOutcome).toContainText("day=2026-09-20");
  await expect(datetimeOutcome).toContainText("alarm=13:30");
  // Unparseable values have no user path on native date/time inputs.
  await setControlValue(page, "#form-datetime metro-date-picker", "not-a-date");
  await submitBlocked(page, datetime);
  await setControlValue(page, "#form-datetime metro-date-picker", "2026-09-20");
  await submitAllowed(datetime);
  await setControlValue(page, "#form-datetime metro-time-picker", "99:99");
  await submitBlocked(page, datetime);
  await setControlValue(page, "#form-datetime metro-time-picker", "13:30");
  await submitAllowed(datetime);

  const calendar = page.locator("#form-calendar");
  const calendarOutcome = calendar.locator("[data-outcome]");
  const picker = calendar.locator("metro-calendar-date-picker");
  await submitBlocked(page, calendar);
  await picker.locator("input").click();
  const monthPrefix = await page.evaluate(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  await picker.getByRole("button", { name: `${monthPrefix}-15` }).click();
  await submitAllowed(calendar);
  await expect(calendarOutcome).toContainText(`holiday=${monthPrefix}-15`);
  // Out-of-range and impossible dates have no user path (disabled days are
  // unclickable and the input is readonly).
  await setControlValue(
    page,
    "#form-calendar metro-calendar-date-picker",
    "2019-06-01",
  );
  await submitBlocked(page, calendar);
  await setControlValue(
    page,
    "#form-calendar metro-calendar-date-picker",
    "2026-06-15",
  );
  await submitAllowed(calendar);
  await setControlValue(
    page,
    "#form-calendar metro-calendar-date-picker",
    "2026-02-31",
  );
  await submitBlocked(page, calendar);
  await setControlValue(
    page,
    "#form-calendar metro-calendar-date-picker",
    "2026-06-15",
  );
  await submitAllowed(calendar);

  const roller = page.locator("#form-roller");
  const rollerOutcome = roller.locator("[data-outcome]");
  const dateRoller = roller.locator("metro-date-picker-roller");
  const timeRoller = roller.locator("metro-time-picker-roller");
  await submitBlocked(page, roller);
  // Scrolling a roller column is the documented user path (clipped items
  // cannot be clicked); one tick sets a value from the defaults.
  await wheelRoller(page, dateRoller, 0.03);
  await submitBlocked(page, roller);
  await wheelRoller(page, timeRoller, 0.03);
  await submitAllowed(roller);
  await expect(rollerOutcome).toContainText("rolled=");
  await expect(rollerOutcome).toContainText("shift=");
  // Out-of-range years are unpickable (the year column is constrained), and
  // garbage has no user path.
  await setControlValue(
    page,
    "#form-roller metro-date-picker-roller",
    "1999-05-05",
  );
  await submitBlocked(page, roller);
  await setControlValue(
    page,
    "#form-roller metro-date-picker-roller",
    "2026-05-05",
  );
  await submitAllowed(roller);
  await setControlValue(page, "#form-roller metro-time-picker-roller", "25:99");
  await submitBlocked(page, roller);
});
