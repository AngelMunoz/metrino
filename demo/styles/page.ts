import { css } from "lit";

/**
 * Shared chrome for every documentation page. The app shell owns the outer
 * gutter and the app background; pages must not add their own padding,
 * max-width or centering, or the showcases drift apart page by page.
 */
export const pageStyles = css`
  :host {
    display: block;
    font-family: var(
      --metro-font-family,
      system-ui,
      -apple-system,
      "Segoe UI",
      sans-serif
    );
    color: var(--metro-foreground, #ffffff);
  }
  .page-title {
    font-size: 42px;
    font-weight: 200;
    margin: 0 0 var(--metro-spacing-xl, 24px) 0;
    color: var(--metro-foreground, #ffffff);
  }
  .page-description {
    font-size: 14px;
    font-weight: 300;
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
    margin: 0 0 var(--metro-spacing-xl, 24px) 0;
    max-width: 600px;
  }
  /* metro-grid owns the column template; columns stay wide enough for the
     API reference tables instead of newspaper-narrow cards. */
  .demo-grid {
    gap: var(--metro-spacing-xl, 24px);
    align-items: start;
  }
  .demo-card {
    background: var(--metro-highlight, rgba(255, 255, 255, 0.05));
    padding: var(--metro-spacing-lg, 16px);
    border: 2px solid transparent;
    box-sizing: border-box;
    min-width: 0;
  }
  .demo-card:hover {
    border-color: var(--metro-border, rgba(255, 255, 255, 0.2));
  }
  /* Interactive stages (panorama, split view, the animation playground) need
     the full content width; they span every column of the same grid. */
  .demo-card.wide {
    grid-column: 1 / -1;
  }
  .component-title {
    font-size: 24px;
    font-weight: 200;
    margin: 0 0 var(--metro-spacing-md, 12px) 0;
    color: var(--metro-foreground, #ffffff);
  }
  .component-desc {
    font-size: var(--metro-font-size-small, 12px);
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
    margin: 0 0 var(--metro-spacing-md, 12px) 0;
  }
  .demo-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--metro-spacing-md, 12px);
    align-items: center;
    margin-bottom: var(--metro-spacing-sm, 8px);
  }
  .code-snippet {
    background: var(--metro-background, #1f1f1f);
    padding: var(--metro-spacing-sm, 8px) var(--metro-spacing-md, 12px);
    font-family: "Consolas", "Monaco", monospace;
    font-size: var(--metro-font-size-small, 12px);
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.8));
    overflow-x: auto;
    border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.1));
    margin: 0 0 var(--metro-spacing-md, 12px) 0;
    white-space: pre-wrap;
    line-height: 1.5;
  }
`;

/** One column rule for every showcase: two content-wide columns on desktop,
 * one full-width column below, never narrower than the API tables. */
export const SHOWCASE_COLUMNS =
  "repeat(auto-fit, minmax(min(640px, 100%), 1fr))";
