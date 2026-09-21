# Changelog

## [Unreleased]

## [0.5.2] - 2026-09-20

### Added

- **menu-flyout**: `hide()` method. The menu now exposes `role="menu"`, receives focus when shown and returns focus to the trigger when dismissed, and Escape dismisses it. The `show` and `close` events now compose across shadow boundaries.

### Changed

- **menu-flyout**: the flyout is imperative-only, following the Metro popup menu pattern — `show()`/`hide()` drive it, the `open` attribute no longer controls it, and `open` is read-only state. **Breaking:** assigning `flyout.open = true` throws and `<metro-menu-flyout open>` no longer opens the flyout; call `show()` instead.

### Fixed

- **menu-flyout**: the fixed backdrop painted over the in-flow menu container, so real clicks and hover on slotted items resolved to the backdrop — items were unclickable and `show()` positioning was inert on the static box. The menu container is now positioned absolutely inside the fixed host and `show()` converts its coordinates to host-relative offsets, and the backdrop is transparent so it no longer dims the page.

## [0.5.1] - 2026-09-20

### Added

- **form controls** (text-box, password-box, number-box, check-box, toggle-switch, radio-button, rating, combo-box, auto-suggest-box, rich-edit-box, date-picker, time-picker, calendar-date-picker, date-picker-roller, time-picker-roller): constraint validation through the ElementInternals API. An invalid control now blocks form submission and fires `invalid`, and `form.reportValidity()` focuses the control's inner input when that element is focusable (`metro-rating` and the picker rollers report their message without moving focus). Values are validated according to each control's shape: dates compare as calendar dates against their bounds and flag `badInput` for unparseable values, numbers honor `min`/`max`/`step` (`stepMismatch` is measured from `min`) and flag `badInput` for non-finite values, which are also withheld from submission, a required `rich-edit-box` needs visible text (formatting-only markup such as `<br>` counts as missing), an unrated `metro-rating` counts as missing while `0` remains a valid value for optional use, and a required radio group validates group-wide — any selection among the same-named buttons in the same tree and form owner satisfies it. Every control re-computes its validity whenever its value or constraints change, on form reset and on state restore, so validity can never go stale.
- **check-box**, **toggle-switch**, **number-box**, **rating**, **combo-box**, **auto-suggest-box**, **rich-edit-box**, **calendar-date-picker**: new `required` attribute, joining the ones text-box, password-box, the date pickers and the rollers already declared (and now honor)
- **all form controls**: `formStateRestoreCallback` restores the submitted value (and checked state for checkable controls) on session history restore; previously only text-box and rich-edit-box implemented it
- **button**: form-associated — new `type` attribute with native button semantics: `submit` (the default) submits the owner form through `form.requestSubmit()` so constraint validation runs, `reset` clears it, `button` performs no form action. The button also disables together with its form via `formDisabledCallback`. `formaction`/`formmethod` submitter overrides are not supported (the spec restricts `requestSubmit(submitter)` to native buttons)
- **form-control**: new shared `src/utils/form-control.ts` module — `updateFormControlState` writes the submitted value and validity together so neither can go stale, alongside shape-specific validators (`textValidation`, `richTextValidation`, `numberValidation`, `dateValidation`, `timeValidation`, `checkedValidation`) and a strict `parseISODate` that rejects impossible dates like `2026-02-31` instead of rolling them over

### Changed

- **radio-button**: group exclusivity is scoped to the tree the button lives in (its root node) and its form owner instead of the document, so mutually exclusive groups now work inside shadow roots as well as light DOM and two forms can reuse the same `name`; group membership is re-synced when a member is renamed, removed or re-associated with another form, and the `change` event is dispatched after the group is synchronized so listeners observe the final state

### Fixed

- **hyperlink-button**: `href`, `target` and `rel` are omitted from the anchor when not set. An anchor with `href=""` is a link to the current page address, so clicking a hyperlink button without `href` reloaded the page; it now renders a placeholder anchor that does nothing (role stays `button`, it remains focusable)

## [0.5.0] - 2026-09-20

### Changed

- **hyperlink-button**: renders as a content-sized text hyperlink — underlined accent-colored text, 2px/4px padding with a 24px minimum hit area, and color-only hover/press feedback (theme-aware accent, no background block). Previously it kept the MetroButton footprint (120×40 hit area, 12px/24px padding) with a hover underline and an opacity press state.
- **toast**: global toast handling moved from the module-level `showToast()`/`hideToast()` functions (backed by a mutable module-scope `let`) to a `ToastHost` controller class. The host element reference lives in a private instance field, so bundlers can never tree-shake one path of the API without the other, and each `ToastHost` instance can be created and disposed independently (useful for tests). `ToastHost` creates and attaches the `<metro-toast>` element to `document.body` lazily on the first `show()` call and registers it (plus its `metro-icon` dependency) automatically.
- **demo**: the toast section of the dialogs page now demonstrates the `ToastHost` global API (global, persistent, and clear-all buttons) alongside the declarative `<metro-toast>` element
- **rich-text-block** / **rich-edit-box**: `content`/`value` now pass through a built-in sanitizer before rendering; unsupported elements are unwrapped, unsupported attributes are dropped, and the editor sanitizes pasted and dropped markup. Use the default slot for content beyond basic formatting.
- **demo**: the hub section of the navigation page demonstrates the new API — snap, RTL and motion (instant/smooth) toggles, first/previous/next/last navigation through `scrollToSection` (smooth animates with the Metro easing), a live in-view section readout bound to `selectionchanged`, and mixed-width sections

### Added

- **toast**: `ToastHost` class and the `ToastOptions` type are exported from the toast module and the package root
- **tokens**: `--metro-accent-text-hover` semantic token for accent-colored text on hover and press; resolves to `--metro-accent-dark` in light themes and `--metro-accent-light` in dark themes
- **rich-text-block** / **rich-edit-box**: optional `sanitize` function property applied to `content`/`value` before rendering
- **hyperlink-button**: exported `isSafeHyperlink()` helper for validating hyperlink schemes
- **hub**: programmatic scroll API — read-only `sections` list, a `selectedIndex` accessor (reads the section whose inline start is nearest the scroll position; the setter scrolls that section to the container gutter and, unlike `metro-pivot`, stores no state), and `scrollToSection(index, behavior = "smooth")`. Smooth is the default and animates with the Metro easing (`--metro-easing`, honored and parsed, with a fallback to the Metro curve for invalid values) and duration (`--metro-transition-slow`) tokens instead of the browser curve; `behavior: "auto"` opts into an instant jump; every programmatic scroll is instant under `prefers-reduced-motion: reduce`. RTL works through rect math on the inline-start edges, so the same call lands the section on the gutter under `dir="rtl"`.
- **hub**: a `selectionchanged` event (`detail: { selectedIndex: number }`, same name and shape as `metro-pivot`) fired once when the pan settles (`scrollend` where available, a 100ms quiet window otherwise), and only when the index actually changed — never per frame during a pan.
- **hub**: an opt-in `snap` boolean attribute — `scroll-snap-type: x mandatory` with `scroll-padding-inline` matching the 16px container gutter. Absent by default: free panning with content peek is unchanged. Snap and motion are orthogonal: snap only governs where a gesture settles, while programmatic navigation keeps its smooth glide and lands exactly on the boundary (the glide temporarily suppresses the container's snap so mandatory re-snapping cannot collapse it into a jump). The scroll container now also sets `overscroll-behavior-x: contain`, so a pan at the hub edge no longer chains into an outer horizontal scroller (for example a pivot item); vertical chaining is untouched.
- **hub**: keyboard and ARIA support — the section container is now a focusable `role="region"` labelled from `title` (overridable through the host `aria-label` attribute). With `snap`, Arrow keys step one section (direction-aware under `dir="rtl"`) and Home/End jump to the first/last section; without `snap` the browser's native arrow scrolling applies.
- **hub-section**: `role="group"` labelled by its `header` attribute (a consumer-provided `aria-label` wins over the header). The header keeps its pointer/hover styling (the Windows 8.1 hub header was clickable) but stays non-interactive at the component level — apps attach their own click listeners on the light-DOM section elements.
- **hub**: exported `HubSelectionChangedEventDetail`, `clampIndex`, `nearestIndex`, `resolveScrollBehavior` and `metroEase` (the Metro cubic-bezier evaluator) from the hub module; the event detail type is also exported from the package root.

### Fixed

- **hub** / **hub-section**: the elements now emit the `part` attributes (`hub-title`, `hub-container`, `section-header`, `section-content`) that the type definitions already documented, so `::part()` selectors work from document stylesheets.

### Security

- **toast**: `title` and `message` are now rendered with `textContent` instead of `innerHTML`, so untrusted values can no longer inject markup (DOM XSS). `show()` also validates `severity` and throws a `TypeError` for unknown values.
- **live-tile**: `setItems()` item text is now rendered with `textContent` instead of `innerHTML`; custom content remains available through the `icon` and default slots.
- **hyperlink-button**: `href` values are limited to relative URLs and the `http`, `https`, `mailto` and `tel` schemes — `javascript:`, `data:` and `blob:` URLs are neither rendered on the anchor nor navigated. `target="_blank"` now also sets `rel="noopener noreferrer"`.
- **rich-text-block** / **rich-edit-box**: `content`/`value` and pasted/dropped editor markup are always sanitized through a built-in allowlist (formatting elements, safe attributes, `http`/`https`/`mailto`/`tel` links) before rendering; an optional `sanitize` hook can apply an additional policy first. Both components now build DOM nodes instead of using `innerHTML`/`unsafeHTML` sinks, so they are compatible with Trusted Types enforcement.
- **border**, **panorama**, **long-list-selector**: style values are applied through the CSSOM instead of raw style/style-element interpolation, so injected declarations are rejected. Panorama only applies relative, http(s) and `data:image` background URLs.
- **context-menu**: invalid `target` selectors are ignored instead of throwing during connect.

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
