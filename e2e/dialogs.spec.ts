import { test, expect, type Locator } from "@playwright/test";

/** Toast events the page collected, written by the toast test. */
interface WindowWithToastLog extends Window {
  toastEvents?: { name: string; id: string }[];
}

/**
 * Whether focus sits at or inside the element.
 *
 * `document.activeElement` stops at the outermost host, and every component here
 * keeps its real focusable node one shadow level deeper, so the check walks the
 * flat tree: descend into shadow roots to the focused node, then climb back out
 * through slots and hosts looking for the element.
 */
function isFocused(locator: Locator): Promise<boolean> {
  return locator.evaluate((el) => {
    let deep: Element | null = document.activeElement;
    while (deep?.shadowRoot?.activeElement) {
      deep = deep.shadowRoot.activeElement;
    }
    const flatParent = (node: Node): Node | null => {
      if (node instanceof Element && node.assignedSlot) return node.assignedSlot;
      if (node.parentNode) return node.parentNode;
      return node instanceof ShadowRoot ? node.host : null;
    };
    for (let node: Node | null = deep; node; node = flatParent(node)) {
      if (node === el) return true;
    }
    return false;
  });
}

test.describe("dialogs page use cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#/dialogs");
    await expect(page.locator("metrino-dialogs-page h1")).toHaveText("Dialogs");
  });

  test("user opens a content dialog, reads it, and dismisses with Escape", async ({
    page,
  }) => {
    await page
      .locator("metro-button", { hasText: "Open Content Dialog" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Content Dialog" });
    await expect(dialog).toBeVisible();
    await expect(
      page.locator("#content-dialog p", { hasText: "slot for any content" })
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("user confirms a content dialog with OK", async ({ page }) => {
    await page
      .locator("metro-button", { hasText: "Open Content Dialog" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Content Dialog" });
    await expect(dialog).toBeVisible();
    await page
      .locator("#content-dialog metro-button", { hasText: "OK" })
      .click();
    await expect(dialog).toBeHidden();
  });

  test("user acknowledges a message dialog", async ({ page }) => {
    await page
      .locator("metro-button", { hasText: "Show Message Dialog" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Information" });
    await expect(dialog).toBeVisible();
    await page
      .locator("#message-dialog metro-button", { hasText: "OK" })
      .click();
    await expect(dialog).toBeHidden();
  });

  test("user dismisses a message dialog with Escape", async ({ page }) => {
    await page
      .locator("metro-button", { hasText: "Show Message Dialog" })
      .click();
    const dialog = page.getByRole("dialog", { name: "Information" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("user gets focus inside the dialog they open with the keyboard", async ({
    page,
  }) => {
    const opener = page.locator("#content-dialog-open");
    await opener.locator("button").focus();
    await page.keyboard.press("Enter");

    const dialog = page.getByRole("dialog", { name: "Content Dialog" });
    await expect(dialog).toBeVisible();
    // Focus has to be in the dialog, or the user types into the page behind it.
    await expect.poll(() => isFocused(page.locator("#content-dialog"))).toBe(true);
  });

  test("closing a content dialog returns focus to its opener", async ({
    page,
  }) => {
    const opener = page.locator("#content-dialog-open");
    await opener.locator("button").focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Content Dialog" });
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect.poll(() => isFocused(opener)).toBe(true);
  });

  test("closing a message dialog returns focus to its opener", async ({
    page,
  }) => {
    const opener = page.locator("#message-dialog-open");
    await opener.locator("button").focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Information" });
    await expect(dialog).toBeVisible();
    await expect
      .poll(() => isFocused(page.locator("#message-dialog")))
      .toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect.poll(() => isFocused(opener)).toBe(true);
  });

  test("closing the settings flyout returns focus to its opener", async ({
    page,
  }) => {
    const opener = page.locator("#settings-flyout-open");
    await opener.locator("button").focus();
    await page.keyboard.press("Enter");
    const flyout = page.locator("#settings-flyout");
    await expect(
      flyout.locator(".settings-item label", { hasText: "Notifications" })
    ).toBeVisible();
    await expect.poll(() => isFocused(flyout)).toBe(true);

    await page.keyboard.press("Escape");
    await expect(flyout.locator(".flyout-panel")).toHaveCSS(
      "transform",
      "matrix(1, 0, 0, 1, 346, 0)"
    );
    await expect.poll(() => isFocused(opener)).toBe(true);
  });

  test("Tab cycles inside the open settings flyout", async ({ page }) => {
    const opener = page.locator("#settings-flyout-open");
    await opener.locator("button").focus();
    await page.keyboard.press("Enter");
    const flyout = page.locator("#settings-flyout");
    await expect(
      flyout.locator(".settings-item label", { hasText: "Notifications" })
    ).toBeVisible();
    await expect.poll(() => isFocused(flyout)).toBe(true);

    // Close button first, then the three toggle switches the page slotted in.
    const closeBtn = flyout.locator(".close-btn");
    const switches = flyout.locator("metro-toggle-switch");
    const flyoutHost = page.locator("#settings-flyout");
    await expect.poll(() => isFocused(closeBtn)).toBe(true);

    const reached = { toggles: false, wrappedToClose: false, escaped: false };
    for (let stop = 0; stop < 8; stop++) {
      await page.keyboard.press("Tab");
      if (await isFocused(switches.nth(0))) reached.toggles = true;
      if (await isFocused(closeBtn)) reached.wrappedToClose = true;
      if (!(await isFocused(flyoutHost))) reached.escaped = true;
    }

    expect(reached).toEqual({
      toggles: true,
      wrappedToClose: true,
      escaped: false,
    });
  });

  test("Tab cycles through the buttons projected into the dialog", async ({
    page,
  }) => {
    const opener = page.locator("#content-dialog-open");
    await opener.locator("button").focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Content Dialog" });
    await expect(dialog).toBeVisible();

    // Close button, then the Cancel/OK buttons the page slotted in. Each slotted
    // metro-button is a stop itself and one more for the control inside it, so
    // the walk counts the stops instead of assuming their number.
    const closeBtn = page.locator("#content-dialog .close-btn");
    const projected = page.locator("#content-dialog metro-button");
    const dialogHost = page.locator("#content-dialog");
    await expect.poll(() => isFocused(closeBtn)).toBe(true);

    const reached = { cancel: false, ok: false, wrappedToClose: false, escaped: false };
    for (let stop = 0; stop < 8; stop++) {
      await page.keyboard.press("Tab");
      reached.cancel ||= await isFocused(projected.nth(0));
      reached.ok ||= await isFocused(projected.nth(1));
      reached.wrappedToClose ||= await isFocused(closeBtn);
      if (!(await isFocused(dialogHost))) reached.escaped = true;
    }

    expect(reached).toEqual({
      cancel: true,
      ok: true,
      wrappedToClose: true,
      escaped: false,
    });
  });

  test("user opens a flyout and light-dismisses it", async ({ page }) => {
    await page.locator("#flyout-bottom-btn").click();
    const flyout = page.locator("#demo-flyout");
    await expect(flyout.locator("h4")).toHaveText("Flyout Title");
    await expect(flyout.locator("h4")).toBeVisible();
    await expect(flyout.locator(".flyout")).toHaveCSS("opacity", "1");
    // The View Transition overlay swallows pointer input until it finishes.
    await page.waitForTimeout(350);
    await page.mouse.click(20, 20);
    await expect(flyout.locator("h4")).toBeHidden();
  });

  test("user dismisses a flyout with Escape and focus returns to its opener", async ({
    page,
  }) => {
    const opener = page.locator("#flyout-bottom-btn");
    await opener.locator("button").focus();
    await page.keyboard.press("Enter");
    const flyout = page.locator("#demo-flyout");
    await expect(flyout.locator("h4")).toBeVisible();
    // The demo flyout content holds no tab stop, so the panel itself takes focus.
    await expect.poll(() => isFocused(flyout)).toBe(true);

    await page.keyboard.press("Escape");
    await expect(flyout.locator("h4")).toBeHidden();
    await expect.poll(() => isFocused(opener)).toBe(true);
  });

  test("user opens narrow and wide settings flyouts", async ({ page }) => {
    const flyout = page.locator("#settings-flyout");
    const panel = flyout.locator(".flyout-panel");
    const label = flyout.locator(".settings-item label", {
      hasText: "Notifications",
    });

    await page.locator("metro-button", { hasText: "Open Settings" }).click();
    await expect(label).toBeVisible();
    await expect(panel).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
    const narrow = await panel.boundingBox();
    expect(narrow?.width).toBeCloseTo(346, 0);

    await page.keyboard.press("Escape");
    await expect(panel).toHaveCSS("transform", "matrix(1, 0, 0, 1, 346, 0)");

    await page
      .locator("metro-button", { hasText: "Open Wide Settings" })
      .click();
    await expect(label).toBeVisible();
    await expect(panel).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 0)");
    const wide = await panel.boundingBox();
    expect(wide?.width).toBeCloseTo(646, 0);
  });

  test("user sees a toast and it auto-dismisses", async ({ page }) => {
    await page.locator("metro-button", { hasText: "Info Toast" }).click();
    const message = page.locator("#page-toast .toast-message");
    await expect(message).toHaveText(
      "This is a informational toast notification."
    );
    await expect(message).toBeHidden({ timeout: 6_000 });
  });

  test("user picks an action from the menu flyout and gets a toast", async ({
    page,
  }) => {
    await page.locator("#menu-flyout-btn").click();
    const saveItem = page.locator("#demo-menu-flyout .menu-item", {
      hasText: "Save",
    });
    await expect(saveItem).toBeVisible();
    await saveItem.click();
    await expect(page.locator("#page-toast .toast-title")).toHaveText("Save");
    await expect(saveItem).toBeHidden();
  });

  test("user's page hears a toast arrive and leave", async ({ page }) => {
    await page.evaluate(() => {
      const win = window as WindowWithToastLog;
      win.toastEvents = [];
      for (const name of ["toastshown", "toasthidden"]) {
        document.addEventListener(name, (event) => {
          const detail = (event as CustomEvent<{ id: string }>).detail;
          win.toastEvents?.push({ name: event.type, id: detail?.id ?? "" });
        });
      }
    });

    await page.locator("metro-button", { hasText: "Info Toast" }).click();
    await expect(page.locator("#page-toast .toast-message")).toBeVisible();

    // The host sits inside the demo page's shadow root, so events that reach the
    // document are both bubbling and composed.
    const line = () =>
      page.evaluate(() =>
        ((window as WindowWithToastLog).toastEvents ?? [])
          .map((e) => `${e.name}:${e.id}`)
          .join(",")
      );

    await expect.poll(line).toMatch(/^toastshown:toast-\d+$/);
    const shownId = (await line()).slice("toastshown:".length);
    await expect
      .poll(line, {
        message: "the toast never reported that it went away",
        timeout: 8_000,
      })
      .toBe(`toastshown:${shownId},toasthidden:${shownId}`);
  });
});
