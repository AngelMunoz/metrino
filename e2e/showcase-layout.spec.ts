import { expect, test, type Page } from "@playwright/test";

/**
 * Showcase columns must be wide enough for the API reference tables: no clipped
 * cells, no page-level horizontal scroll. Narrow viewports scroll the table inside
 * its own section instead of overflowing the page.
 */

interface OverflowReport {
  pageOverflow: boolean;
  clipped: string[];
  tracks: number;
}

async function measure(page: Page): Promise<OverflowReport> {
  return page.evaluate(() => {
    const clipped: string[] = [];
    // The page host lives inside the app's shadow root, not the light DOM.
    const walk = (root: Document | ShadowRoot): Element | null => {
      for (const el of Array.from(root.querySelectorAll("*"))) {
        if (el.tagName === "METRINO-INPUT-PAGE") return el;
        if (el.shadowRoot) {
          const found = walk(el.shadowRoot);
          if (found) return found;
        }
      }
      return null;
    };
    const pageEl = walk(document);
    const grid = pageEl?.shadowRoot?.querySelector("metro-grid");
    const cards = Array.from(
      pageEl?.shadowRoot?.querySelectorAll(".demo-card") ?? []
    );
    for (const card of cards) {
      const cardBox = card.getBoundingClientRect();
      const docs = card.querySelector("api-docs");
      const table = docs?.shadowRoot?.querySelector("table");
      if (!table) continue;
      const tableBox = table.getBoundingClientRect();
      if (tableBox.right > cardBox.right + 1 || tableBox.left < cardBox.left - 1) {
        clipped.push(card.querySelector("h3")?.textContent ?? "card");
      }
    }
    return {
      pageOverflow:
        document.documentElement.scrollWidth > window.innerWidth + 1,
      clipped,
      tracks: grid
        ? getComputedStyle(grid).gridTemplateColumns.split(" ").length
        : 0,
    };
  });
}

test.describe("showcase layout", () => {
  test("API tables fit their columns at desktop width", async ({ page }) => {
    await page.setViewportSize({ width: 1872, height: 1080 });
    await page.goto("/#/input");
    await page.locator("metrino-input-page api-docs table").first().waitFor();
    await page.waitForTimeout(600);

    const report = await measure(page);
    expect(report.pageOverflow, "the page scroll-widened past the viewport").toBe(
      false
    );
    expect(report.clipped, `tables clipped by their column: ${report.clipped}`).toEqual(
      []
    );
    expect(report.tracks, "wide desktop should show two content-wide columns").toBe(2);
  });

  test("a laptop width falls back to one full-width column", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/#/input");
    await page.locator("metrino-input-page api-docs table").first().waitFor();
    await page.waitForTimeout(600);

    const report = await measure(page);
    expect(report.pageOverflow).toBe(false);
    expect(report.clipped).toEqual([]);
    expect(report.tracks, "1280px must not squeeze tables into narrow columns").toBe(1);
  });

  test("a phone width scrolls tables inside their section, not the page", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    await page.goto("/#/input");
    await page.locator("metrino-input-page api-docs table").first().waitFor();
    await page.waitForTimeout(600);

    const report = await measure(page);
    expect(report.pageOverflow, "the page overflow-scrolls on a phone").toBe(false);
    const internal = await page.evaluate(() => {
      const walk = (root: Document | ShadowRoot): Element | null => {
        for (const el of Array.from(root.querySelectorAll("*"))) {
          if (el.tagName === "METRINO-INPUT-PAGE") return el;
          if (el.shadowRoot) {
            const found = walk(el.shadowRoot);
            if (found) return found;
          }
        }
        return null;
      };
      const sections = Array.from(
        walk(document)
          ?.shadowRoot?.querySelector("api-docs")
          ?.shadowRoot?.querySelectorAll(".api-section") ?? []
      );
      const section = sections.find((s) => s.querySelector("table"));
      return section ? section.scrollWidth > section.clientWidth : false;
    });
    expect(internal, "the table must scroll inside its section on a phone").toBe(true);
  });
});
