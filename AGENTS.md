# AGENTS.md

Coding agent guidelines for the Metrino project.

## Project Overview

Metrino is a lit Web Component library implementing the Windows Phone / Windows 8 Metro design system. Built with TypeScript and Vite.

## Build/Lint/Test Commands

```bash
# Development server with hot reload
pnpm dev

# Type check and build for production
pnpm run build

# Preview production build locally
pnpm run preview

# Type check only (no emit)
pnpx tsc --noEmit

# Run type check on a single file
pnpx tsc --noEmit src/components/button.ts

# Run tests in real browsers (Chromium, Firefox, WebKit)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpx web-test-runner src/components/button.test.ts --node-resolve

# Run e2e use-case tests against the demo app (Chromium + Firefox)
pnpm test:e2e

# Run e2e tests for one browser project
pnpx playwright test --project=chromium
```

## Testing

One rule: **tests exercise use cases, not implementation internals.**

- **E2e (mandatory for all component, flow, and demo-page work):** Playwright
  drives the real demo app (`e2e/*.spec.ts`). Real clicks, keys, and touch;
  assertions on observable outcomes — visible text, focus, page-level events,
  computed styles, geometry, `animationend`. Motion gates are deterministic
  assertions; screenshots and traces are review artifacts, never pixel-diff
  gates. New behavior ships with a use-case test that fails before the fix and
  passes after.
- **Logic tests (non-DOM utils only):** `@web/test-runner` for pure functions
  (`touch-physics`, `sanitize`, `virtualization`). Files use `.test.ts` beside
  the source, TDD mode (suite/test). The config loads `.css` as empty, so this
  suite cannot verify styles — never use it for motion or spacing.
- Both suites run Chromium + Firefox.

## Code Style Guidelines

### Architecture

- **Functional-first:** Modules export functions; classes are thin wrappers over those functions
- **Minimal OOP:** Extend `LitElement` directly (no base `MetroElement` class needed)
- **Performance:** First-class citizen - avoid unnecessary allocations, use efficient data structures

### TypeScript

- **Target:** ES2022 with ESNext modules
- **Strict mode:** Enabled with all strict checks
- **Module syntax:** Use `verbatimModuleSyntax` - import types with `import type { X }` syntax
- **Unused code:** `noUnusedLocals` and `noUnusedParameters` are enabled - remove unused variables
- **Null assertions:** Avoid `!` non-null assertions; use proper null checks
- **Null vs undefined:** Treat both equally as "absence of data" - no semantic distinction needed
- **Exports:** Prefer named exports over default exports

### Imports

```typescript
// Type-only imports use 'type' keyword
import type { SomeType } from "./types";

// Regular imports for values
import { createElement } from "./utils";

// CSS imports in TypeScript
import "./styles.css";

// Keep imports organized: external → internal → types
```

### Formatting

- **Indentation:** 2 spaces
- **Semicolons:** Required
- **Quotes:** Prefer double quotes for strings, single quotes for CSS-in-JS
- **Trailing commas:** None in TypeScript (ES5 trailing commas in multiline are acceptable)

### Naming Conventions

| Type                  | Convention                  | Example                                |
| --------------------- | --------------------------- | -------------------------------------- |
| Components            | `metro-<name>` (kebab-case) | `metro-button`, `metro-pivot`          |
| Classes               | PascalCase                  | `MetroElement`, `FlipTile`             |
| Functions             | camelCase                   | `setupCounter`, `createElement`        |
| Constants             | SCREAMING_SNAKE_CASE        | `MAX_TILE_SIZE`                        |
| CSS custom properties | `--metro-<name>`            | `--metro-accent`, `--metro-background` |
| Private methods       | Prefix with `#`             | `#handleClick()`                       |
| Event handlers        | `handle<Event>`             | `handleClick`, `handleKeyDown`         |

### Web Components

- Extend `LitElement` directly; behavior is modeled with functions, not inheritance
- Use custom elements registry: `customElements.define('metro-name', Class)`s
- Shadow DOM for style encapsulation
- Dispatch custom events for component communication

### Error Handling

- Use TypeScript's type system to prevent errors at compile time
- Throw `TypeError` for invalid arguments
- Use `try/catch` for async operations and external calls
- Validate attributes in `attributeChangedCallback`
- Provide meaningful error messages

```typescript
// Use Set for O(1) lookups, not arrays
const VALID_SIZES = new Set(["small", "medium", "large"]);

function updateAttribute(
  el: MetroButton,
  name: string,
  _old: string | null,
  val: string | null,
) {
  if (name === "size" && val !== null && !VALID_SIZES.has(val)) {
    throw new TypeError(
      `Invalid size "${val}". Expected: small, medium, large`,
    );
  }
}
```

### CSS Guidelines

- Use CSS custom properties (design tokens) for theming
- Follow naming convention: `--metro-<category>-<property>`
- Support both light and dark themes via `[data-theme]` attribute
- Use logical properties (`inset-inline-start` instead of `left`) for RTL support
- Metro animation timing: fast (167ms), normal (250ms), slow (333ms)

Key design tokens:

```css
--metro-accent: #0078d4;
--metro-background: #1f1f1f;
--metro-foreground: #ffffff;
--metro-font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
--metro-easing: cubic-bezier(0.1, 0.9, 0.2, 1);
```

### Accessibility

- All interactive components must have proper ARIA attributes
- Ensure keyboard navigation works
- Maintain focus management in composite components
- Test with screen readers for critical flows
