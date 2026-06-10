# Changelog

## [Unreleased]

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
