// Captures the PR9 review artifacts. Assumes the demo dev server is running:
//   pnpm exec vite --mode demo --strictPort --no-open
// Run: node scripts/capture-artifacts-pr9.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const baseUrl = process.env.DEMO_URL ?? "http://localhost:5173";
const outDir = "artifacts/pr9";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

async function openRoute(hash, readySelector) {
  await page.goto(`${baseUrl}/${hash}`);
  await page.locator(readySelector).waitFor();
  // Let the route's view transition settle so input and screenshots are stable.
  await page.waitForTimeout(600);
}

// 1. Tall expander fully expanded (no 500px cap).
await openRoute("#/primitives", "metrino-primitives-page h1");
const tall = page.locator("#tall-expander");
await tall.scrollIntoViewIfNeeded();
await tall.locator(".expander-header").click();
await page.waitForTimeout(500);
await tall.screenshot({ path: `${outDir}/expander-tall.png` });

// 2. Content dialog open with focus inside it (focus moves in on open).
await openRoute("#/dialogs", "metrino-dialogs-page h1");
await page.locator("#content-dialog-open").click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${outDir}/dialog-focus.png` });
await page.keyboard.press("Escape");
await page.waitForTimeout(500);

// 3. Vertical wrap panel: items flow into columns.
await openRoute("#/layout", "metrino-layout-page h1");
const vertical = page.locator("#vertical-wrap-panel");
await vertical.scrollIntoViewIfNeeded();
await page.waitForTimeout(200);
await vertical.screenshot({ path: `${outDir}/vertical-wrap.png` });

// 4. Hidden separator keeps its space in the app bar.
await openRoute("#/navigation", "metrino-navigation-page h1");
const section = page.locator("#metro-app-bar-separator");
await section.scrollIntoViewIfNeeded();
await section
  .locator("metro-app-bar-separator")
  .first()
  .evaluate((el) => el.removeAttribute("visible"));
await page.waitForTimeout(200);
await section.screenshot({ path: `${outDir}/separator-space.png` });

await browser.close();
console.log(`Captured artifacts into ${outDir}/`);
