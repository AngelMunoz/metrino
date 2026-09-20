# Changelog

## [Unreleased]

### Changed

- **hyperlink-button**: renders as a content-sized text hyperlink — underlined accent-colored text, 2px/4px padding with a 24px minimum hit area, and color-only hover/press feedback (theme-aware accent, no background block). Previously it kept the MetroButton footprint (120×40 hit area, 12px/24px padding) with a hover underline and an opacity press state.
- **toast**: global toast handling moved from the module-level `showToast()`/`hideToast()` functions (backed by a mutable module-scope `let`) to a `ToastHost` controller class. The host element reference lives in a private instance field, so bundlers can never tree-shake one path of the API without the other, and each `ToastHost` instance can be created and disposed independently (useful for tests). `ToastHost` creates and attaches the `<metro-toast>` element to `document.body` lazily on the first `show()` call and registers it (plus its `metro-icon` dependency) automatically.
- **demo**: the toast section of the dialogs page now demonstrates the `ToastHost` global API (global, persistent, and clear-all buttons) alongside the declarative `<metro-toast>` element

### Added

- **toast**: `ToastHost` class and the `ToastOptions` type are exported from the toast module and the package root
- **tokens**: `--metro-accent-text-hover` semantic token for accent-colored text on hover and press; resolves to `--metro-accent-dark` in light themes and `--metro-accent-light` in dark themes

### Removed

- **toast**: `showToast()` and `hideToast()` module functions. They were never re-exported from the package entry, so consumers importing from `@angelmunoz/metrino` are unaffected; code importing them directly from the module should switch to `new ToastHost()`.

## [0.4.0] - 2026-08-18

### Changed

- **all components**: Component modules no longer register their custom elements as an import side effect. Each module exports a `registerMetro<Component>()` function (e.g. `registerMetroButton`) that defines the element if it is not already defined; calling it also registers the component's internal dependencies. The root package additionally exports per-category helpers (`registerButtons`, `registerNavigation`, ...) and `registerAllComponents` from the new `src/register.ts`. Consumers must now call the register function explicitly — importing a module only pulls in the class and its types.

### Added

- **register.ts** - central registration module with per-category register helpers and `registerAllComponents()`

### Fixed

- **demo**: demo pages and the app shell now register the components they render explicitly instead of relying on side-effect imports
- **tests**: all test suites call the component's register function explicitly
- **package.json**: `prepublishOnly` now uses `pnpm run build`

## [0.3.0] - 2026-06-10

### Added

- **icons** - exported the icon map from the icon module

### Changed

- **tokens.css** - made sure that the tokens css sets font family at the document level

## [0.2.0] - 2026-06-10

### Changed

- **content-dialog**: Replaced `closing` state machine and `animationend` handler with View Transitions API. `show()` and `hide()` are now async (`Promise<void>`). Removed `closing` property.
- **message-dialog**: Same VT refactor as content-dialog. Removed `closing` property and `animationend` handler. `show()` and `hide()` are now async.
- **settings-flyout**: Added `view-transition-name` on panel and backdrop for View Transition participation. CSS transitions remain as baseline. `show()` and `hide()` are now async.
- **flyout**: Added `view-transition-name` on panel and backdrop. CSS transitions remain as baseline. `show()` and `hide()` are now async.
- **semantic-zoom**: Fixed VT callback pattern — DOM changes now happen inside `startViewTransition` with an `applied` flag fallback for headless browsers.
- **shared styles**: Removed unused `dialogAnimation` export (keyframes moved into component styles).

### Fixed

- **View Transition pseudo-element styles**: Moved `::view-transition-old/new` animation rules and `@keyframes` from component shadow CSS to global `src/styles/animations.css`. Shadow CSS cannot style document-root pseudo-elements — these rules were silently failing. Now scoped with `html:active-view-transition-type(...)` per component.

### Removed

- Centralized `dialogAnimation` keyframes from `src/styles/shared.ts` (no longer imported by any component).

## [0.1.0] - 2026-06-09

### Added

- 62 Metro Design Language web components built with Lit
- CSS custom properties design token system (light/dark themes, 21 accent colors)
- Metro type ramp (title, subtitle, header, body, display, badge, caption)
- Turnstile, continuum, slide, zoom, and semantic-zoom animations
- View Transition API support for page transitions and semantic zoom
- Touch physics engine (inertia, boundary bounce, gesture disambiguation, axis rails)
- List virtualization for large collections
- Keyboard accessibility (tabindex, Enter/Space activation) for toggle-switch, check-box, radio-button
- Focus trap and Escape key handling for content-dialog, message-dialog, flyout
- ARIA roles for list-view, grid-view, panorama
- Tilt effect on buttons, tiles, and app bar buttons
- Cherry-pickable component imports for tree-shaking
- Custom Elements Manifest for API documentation
- @web/test-runner test suite with Playwright (Chromium, Firefox)

[Unreleased]: https://github.com/AngelMunoz/metrino/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/AngelMunoz/metrino/releases/tag/v0.1.0
