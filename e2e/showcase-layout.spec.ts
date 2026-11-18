import { expect, test, type Page } from "@playwright/test";

/**
 * Every documentation page shares one showcase chrome: the shell's gutter,
 * full-bleed hosts (no centering), the same metro-grid column rule, the same
 * card padding and gap. Columns stay wide enough for the API tables; narrow
 * viewports scroll tables inside their section instead of overflowing the page.
 */

const DOC_PAGES = [
  { route: "/buttons", tag: "METRINO-BUTTONS-PAGE" },
  { route: "/input", tag: "METRINO-INPUT-PAGE" },
  { route: "/datetime", tag: "METRINO-DATETIME-PAGE" },
  { route: "/progress", tag: "METRINO-PROGRESS-PAGE" },
  { route: "/tiles", tag: "METRINO-TILES-PAGE" },
  { route: "/layout", tag: "METRINO-LAYOUT-PAGE" },
  { route: "/navigation", tag: "METRINO-NAVIGATION-PAGE" },
  { route: "/selection", tag: "METRINO-SELECTION-PAGE" },
  { route: "/primitives", tag: "METRINO-PRIMITIVES-PAGE" },
  { route: "/dialogs", tag: "METRINO-DIALOGS-PAGE" },
  { route: "/animations", tag: "METRINO-ANIMATIONS-PAGE" },
] as const;

interface ShowcaseReport {
  hostLeft: number;
  hostWidth: number;
  viewport: number;
  tracks: number;
  columns: string;
  gap: string;
  cardPadding: string;
  wideMisSpan: string[];
  clipped: string[];
  pageOverflow: boolean;
  cards: number;
}

async function measure(page: Page, tag: string): Promise<ShowcaseReport> {
  return page.evaluate((tagName) => {
    // The page host lives inside the app's shadow root, not the light DOM.
    const walk = (root: Document | ShadowRoot): Element | null => {
      for (const el of Array.from(root.querySelectorAll("*"))) {
        if (el.tagName === tagName) return el;
        if (el.shadowRoot) {
          const found = walk(el.shadowRoot);
          if (found) return found;
        }
      }
      return null;
    };
    const pageEl = walk(document);
    const shadow = pageEl?.shadowRoot;
    const grid = shadow?.querySelector("metro-grid.demo-grid");
    const cards = Array.from(shadow?.querySelectorAll(".demo-card") ?? []);
    const clipped: string[] = [];
    const wideMisSpan: string[] = [];
    const gridBox = grid?.getBoundingClientRect();
    for (const card of cards) {
      const cardBox = card.getBoundingClientRect();
      if (card.classList.contains("wide") && gridBox) {
        if (Math.abs(cardBox.width - gridBox.width) > 1) {
          wideMisSpan.push(card.querySelector("h2")?.textContent ?? "wide");
        }
      }
      const table = card
        .querySelector("api-docs")
        ?.shadowRoot?.querySelector("table");
      if (!table) continue;
      const tableBox = table.getBoundingClientRect();
      if (tableBox.right > cardBox.right + 1 || tableBox.left < cardBox.left - 1) {
        clipped.push(card.querySelector("h2")?.textContent ?? "card");
      }
    }
    const hostBox = pageEl?.getBoundingClientRect();
    const gridStyle = grid ? getComputedStyle(grid) : null;
    const cardStyle = cards[0] ? getComputedStyle(cards[0]) : null;
    return {
      hostLeft: hostBox?.left ?? -1,
      hostWidth: hostBox?.width ?? -1,
      viewport: window.innerWidth,
      tracks: gridStyle
        ? gridStyle.gridTemplateColumns.split(" ").length
        : 0,
      columns: gridStyle?.gridTemplateColumns ?? "",
      gap: gridStyle?.columnGap ?? "",
      cardPadding: cardStyle?.paddingTop ?? "",
      wideMisSpan,
      clipped,
      pageOverflow:
        document.documentElement.scrollWidth > window.innerWidth + 1,
      cards: cards.length,
    };
  }, tag);
}

async function openPage(page: Page, route: string): Promise<void> {
  await page.goto(`/#${route}`);
  await page.locator("metrino-app h1").first().waitFor();
  await page.waitForTimeout(600);
}

test.describe("showcase layout consistency", () => {
  // Each test walks all eleven documentation pages; the default 30s budget is
  // too tight for that many route turns on a loaded machine.
  test.describe.configure({ timeout: 120_000 });
  test("desktop: every doc page is full-bleed with the same two wide columns", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1872, height: 1080 });
    const columnsSeen = new Set<string>();
    for (const { route, tag } of DOC_PAGES) {
      await openPage(page, route);
      const report = await measure(page, tag);
      const at = `${route}:`;
      expect(report.cards, `${at} no showcase cards found`).toBeGreaterThan(1);
      expect(report.hostLeft, `${at} host is inset or centered`).toBe(24);
      expect(
        report.hostWidth,
        `${at} host does not span the shell gutter`
      ).toBe(report.viewport - 48);
      expect(
        report.tracks,
        `${at} wide desktop should show two content-wide columns`
      ).toBe(2);
      expect(report.gap, `${at} grid gap drifted`).toBe("24px");
      expect(report.cardPadding, `${at} card padding drifted`).toBe("16px");
      expect(
        report.wideMisSpan,
        `${at} wide cards must span the whole grid: ${report.wideMisSpan}`
      ).toEqual([]);
      expect(
        report.clipped,
        `${at} tables clipped by their column: ${report.clipped}`
      ).toEqual([]);
      expect(
        report.pageOverflow,
        `${at} the page scroll-widened past the viewport`
      ).toBe(false);
      columnsSeen.add(report.columns);
    }
    expect(
      columnsSeen.size,
      `column tracks differ between pages: ${[...columnsSeen]}`
    ).toBe(1);
  });

  test("laptop: every doc page falls back to one full-width column", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    for (const { route, tag } of DOC_PAGES) {
      await openPage(page, route);
      const report = await measure(page, tag);
      const at = `${route}:`;
      expect(report.hostLeft, `${at} host is inset or centered`).toBe(24);
      expect(
        report.tracks,
        `${at} 1280px must not squeeze tables into narrow columns`
      ).toBe(1);
      expect(report.clipped, `${at} ${report.clipped}`).toEqual([]);
      expect(report.pageOverflow, `${at} page overflow`).toBe(false);
    }
  });

  test("phone: no page overflow; tables scroll inside their section", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 480, height: 800 });
    for (const { route, tag } of DOC_PAGES) {
      await openPage(page, route);
      const report = await measure(page, tag);
      expect(
        report.pageOverflow,
        `${route}: the page overflow-scrolls on a phone`
      ).toBe(false);
      expect(report.tracks, `${route}: phone must be one column`).toBe(1);
      const internal = await page.evaluate((tagName) => {
        const walk = (root: Document | ShadowRoot): Element | null => {
          for (const el of Array.from(root.querySelectorAll("*"))) {
            if (el.tagName === tagName) return el;
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
        return section ? section.scrollWidth > section.clientWidth : null;
      }, tag);
      if (internal !== null) {
        expect(
          internal,
          `${route}: the table must scroll inside its section on a phone`
        ).toBe(true);
      }
    }
  });
});
