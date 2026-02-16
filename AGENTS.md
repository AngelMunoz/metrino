# AGENTS.md

Coding agent guidelines for the Metrino project.

## Project Overview

Metrino is a vanilla Web Component library implementing the Windows Phone / Windows 8 Metro design system. Built with TypeScript and Vite, no framework dependencies.

## Build/Lint/Test Commands

```bash
# Development server with hot reload
bun dev

# Type check and build for production
bun run build

# Preview production build locally
bun run preview

# Type check only (no emit)
bunx tsc --noEmit

# Run type check on a single file
bunx tsc --noEmit src/components/button.ts

# Run tests in real browsers (Chromium, Firefox, WebKit)
bun test

# Run tests in watch mode
bun test:watch

# Run specific test file
bunx web-test-runner src/components/button.test.ts --node-resolve
```

## Testing

Tests use **@web/test-runner** which runs tests in real browsers via Playwright. This ensures components behave identically to production environments.

- Test files use `.test.ts` suffix (e.g., `button.test.ts`)
- Tests are placed alongside the source files they test
- The test framework uses TDD mode (suite/test setup)
- All three browser engines (Chromium, Firefox, WebKit) run by default

## Code Style Guidelines

### Architecture

- **Functional-first:** Modules export functions; classes are thin wrappers over those functions
- **Minimal OOP:** Extend `HTMLElement` directly (no base `MetroElement` class needed)
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
import type { SomeType } from './types'

// Regular imports for values
import { createElement } from './utils'

// CSS imports in TypeScript
import './styles.css'

// Keep imports organized: external → internal → types
```

### Formatting

- **Indentation:** 2 spaces
- **Semicolons:** Required
- **Quotes:** Prefer double quotes for strings, single quotes for CSS-in-JS
- **Trailing commas:** None in TypeScript (ES5 trailing commas in multiline are acceptable)

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | `metro-<name>` (kebab-case) | `metro-button`, `metro-pivot` |
| Classes | PascalCase | `MetroElement`, `FlipTile` |
| Functions | camelCase | `setupCounter`, `createElement` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_TILE_SIZE` |
| CSS custom properties | `--metro-<name>` | `--metro-accent`, `--metro-background` |
| Private methods | Prefix with `#` | `#handleClick()` |
| Event handlers | `handle<Event>` | `handleClick`, `handleKeyDown` |

### Web Components

- Extend `HTMLElement` directly; behavior is modeled with functions, not inheritance
- Use custom elements registry: `customElements.define('metro-name', Class)`
- Shadow DOM for style encapsulation
- Use `observedAttributes` for reactive attribute changes
- Dispatch custom events for component communication

```typescript
class MetroButton extends HTMLElement {
  static observedAttributes = ['disabled', 'accent']
  
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }
  
  attributeChangedCallback(name: string, oldVal: string | null, newVal: string | null) {
    updateAttribute(this, name, oldVal, newVal)
  }
}

// Logic lives in functions, not methods
function updateAttribute(el: MetroButton, name: string, old: string | null, val: string | null) {
  if (old === val) return
  // Handle changes
}
```

### Error Handling

- Use TypeScript's type system to prevent errors at compile time
- Throw `TypeError` for invalid arguments
- Use `try/catch` for async operations and external calls
- Validate attributes in `attributeChangedCallback`
- Provide meaningful error messages

```typescript
// Use Set for O(1) lookups, not arrays
const VALID_SIZES = new Set(['small', 'medium', 'large'])

function updateAttribute(el: MetroButton, name: string, _old: string | null, val: string | null) {
  if (name === 'size' && val !== null && !VALID_SIZES.has(val)) {
    throw new TypeError(`Invalid size "${val}". Expected: small, medium, large`)
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
