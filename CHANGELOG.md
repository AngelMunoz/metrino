# Changelog

## [Unreleased]

### Added

- **pivot**: swipe paging, Arrow/Home/End keyboard navigation with a roving tabindex, and a circular loop. The headers were clickable only — `role="tab"` elements no key could move between, and a content area that ignored the pointer. Now a horizontal drag follows the pointer and releases onto the next or previous section past 50 px or 0.3 px/ms (a shorter drag springs back), `ArrowRight`/`ArrowLeft` page along the direction of the row (swapped in RTL, the reading `metro-hub` already uses), `Home`/`End` go to the ends, focus follows the selection, and only the active header stays in the tab sequence. A step past either end wraps to the other end, and the wrap slides over one virtual position — the incoming panel is reordered next to the outgoing one for the length of the slide — so it reads as the same short slide as a normal page turn instead of running the whole track back.
- **all components**: `prefers-reduced-motion` policy. A CSS blanket flattens every keyframe animation and transition in the document scope (`styles/tokens.css`) and in the shadow scopes (`styles/shared.ts`, carried by `baseTypography` and `tileBase`, and prepended as `reducedMotionBlanket` to the `static styles` of every component and demo module that carries neither, so the blanket now reaches every shadow tree), and scripted motion skips instead of speeding up: `demo/main.ts` assigns the route content without a view transition; the `#applyChange`/`#performTransition` wrappers in `content-dialog`, `message-dialog`, `flyout`, `settings-flyout` and `semantic-zoom` apply the change directly and publish no scoped `view-transition-name`; `metro-panorama` lands on the nearest item boundary and `metro-scroll-viewer` clamps to its bounds instead of running an inertia or spring frame loop; `utils/animations.ts` resolves immediately without staging classes or styles; and `applyTiltEffect` never attaches the pointer tilt. `src/utils/reduced-motion.ts` is the one place that reads the preference, and `watchReducedMotion` re-applies it live to components already on the page. `metro-hub` now uses the shared helper.

### Fixed

- **content-dialog**, **message-dialog**, **flyout**, **settings-flyout**, **semantic-zoom**: `view-transition-name` values are now scoped per instance and held only while the component is active. The names were hardcoded in static styles on elements that stay rendered, so a closed dialog still reserved its name and a second instance of the same component duplicated it. Each component now builds a scope through `src/utils/view-transition.ts`, which assigns `<component>-<part>-<id>` when the component opens and releases it after the exit transition finishes, and each component's `::view-transition` rules moved out of `animations.css` into that scope so they match its scoped names. The `@keyframes` stay in `animations.css`.
- **panorama**: a fling no longer fights the scroll snap points. `scroll-snap-type: x mandatory` stayed on the container while the inertia and spring-back scripts wrote `scrollLeft` every frame, so the browser re-snapped each write and the glide stuttered towards a boundary instead of running to one. A scripted animation now saves the inline snap type, holds it at `none` for its duration, and hands it back when it settles — landing on the nearest item start first, so restoring `x mandatory` cannot jump the content a second time. This is the pattern `metro-hub` already uses for its glide, and native (non-scripted) scrolling keeps its snap points. `scroll-behavior: smooth` also left `.panorama-container`: it animated every scripted write on top of the physics, smoothing twice. The drag owns the position the same way now: every drag move writes `scrollLeft`, so `#handlePointerDown` suppresses the snap points from pointer down and the release hands them back through `#releaseSnap` — landing on the nearest item boundary first — in both motion modes; before this, `x mandatory` re-snapped each drag write straight back and the content never followed the pointer.
- **panorama**: the parallax background no longer lags the scroll it tracks. `.parallax-bg` carried `transition: transform 0.1s linear`, so every scroll event started a new 100 ms tween from the previous position and the image trailed the content by up to a tenth of a second; the transform now applies immediately.
- **semantic-zoom**: touch now scrolls the zoomed-in content. `:host` declared `touch-action: none`, which tells the engine that no touch starting inside the component may pan at all; it declares `pan-x pan-y` instead, so inner panning works while browser pinch-zoom stays disabled and the component's own pinch handlers keep the gesture.
- **semantic-zoom**: the zoom animates on engines without View Transitions, and `transition-duration` is honored. The property was declared and never read: the injected `::view-transition` rules hardcoded `animation-duration: 400ms`, and where `startViewTransition` is missing `#performTransition` applied the new state instantly — a hard cut. The rules are now built when a transition starts, so a changed duration takes effect on the next one, and the two layers carry a CSS fallback transition over the same `transform`, `opacity` and `filter` the snapshots animate. Their duration comes from `--sz-dur`, which is `0ms` wherever View Transitions exist so a snapshot and a CSS transition never stack on the same change.
- **touch-physics**: inertia and spring-back no longer depend on the frame rate. `stepInertia` and `stepSpring` advanced one fixed step per call and every caller ran them once per `requestAnimationFrame`, so the same fling travelled half as far at 30 fps as at 60 fps and a dropped frame teleported the content. Both now take the elapsed milliseconds and integrate over them: friction decays as `friction^(dt / frame)` and moves by the mean velocity of the interval, and the spring runs in fixed sub-steps because explicit Euler overshoots badly over a long step. Velocities are px/ms throughout — `calculateVelocity`, `INERTIA_MIN_VELOCITY` and the spring settle threshold with it — and `predictInertiaDistance` converts back to px, which is now also the distance the integrator actually travels. `frameDeltaMs` clamps one animation step to the elapsed time between two `requestAnimationFrame` timestamps, so a throttled tab cannot feed the integrator a 5-second frame.
- **demo**: route changes now animate with the Metro root turnstile. `metro-view-transition-out` and `metro-view-transition-in` existed but no `::view-transition-old(root)` / `::view-transition-new(root)` rule referenced them, so they never ran; the rules are added under a `turnstile` transition type and `demo/main.ts` passes that type.
- **demo**: `animations.css` is imported by the app entry instead of only by the home page, so every deep-linked route gets the view-transition rules. A route that never loaded home previously had no view-transition rules at all.
- **progress-bar**: the indeterminate dots travel with a transform instead of animating `left`. The keyframes moved `left` from `-2%` to `100%`, so every frame re-laid out the dots and the track that holds them. The travel is now `translateX(100cqw)` — the track's own inline size, which is why the track became an inline-size query container — and `left` stays pinned to the track's inline-start edge. The 2.4s duration, the easing and the five staggered delays are unchanged.

### Changed

- **content-dialog**: the entrance is now the Metro swivel (`perspective(1000px) rotateX(90deg)` to `0deg`), matching the message dialog; it was a scale and translate (`scale(0.85) translateY(20px)`). The 280ms duration, the easing and the backdrop fade are unchanged, as is the exit, which reverses the swivel.
- **touch-physics**: `stepInertia(state, dtMs, friction)` and `stepSpring(state, dtMs, stiffness, damping)` take a required `dtMs`, and `calculateVelocity` / `GestureResult.velocityX|velocityY` report px per millisecond instead of px per frame. **Breaking:** direct consumers must pass the elapsed time and re-scale anything they compare a velocity against (`0.5` px/frame is now `0.03` px/ms). The library callers are updated: `metro-panorama` and `metro-scroll-viewer` drive the physics from the frame timestamps, and `metro-flip-view` passes the px/ms velocity straight into `predictInertiaDistance`, which expects that unit. `metro-list-view`, `metro-grid-view` and `metro-long-list-selector` read only `dx`/`dy` from `resolveGesture` and are unaffected.

- **animations**: `styles/animations.css` is the single source of the animation keyframes and classes. `utils/animations.ts` carried a second copy of all fourteen `@keyframes` blocks and fourteen `.metro-animate-*` rules, with the durations written out in milliseconds instead of read from the design tokens, so the two could drift apart. It now extracts both groups from the stylesheet when the module loads (`extractAnimationRules`), and a change to `animations.css` reaches the shadow components, the demo and the API together.
- **animations**: `playAnimation` and `animateChildren` settle on `animationend`. They resolved on a `setTimeout` of their own duration table, which no longer has to agree with the stylesheet: the wait now ends when the element reports the end of its own keyframe, and the table only bounds the wait — duration plus 250 ms — for an element that is not rendered and therefore never animates. `animateChildren` waits for the last child rather than for a sum of the stagger.
- **flip-tile**, **animations**: `metro-tile-flip` turns on the Y axis. The keyframes rotated the tile through `rotateX` while `metro-flip-tile` flips with `rotateY`, so the shared class and the component described two different tiles; the keyframes now use `rotateY`, and the animations page preview animates with them instead of a local copy. The class duration and easing (500ms, `ease-in-out`) are unchanged.
- **progress-ring**, **animations**: one orbit geometry for the ring. `metro-progress-ring`, the `.metro-animate-progress-ring` class and the animations page preview now all animate the `metro-ring-orbit-small|normal|large` keyframes of `animations.css` — 3s on `cubic-bezier(0.7, 0, 0.3, 1)`, the component's curve. The class was a single-element spin (`metro-progress-ring-spin`, 1.5s linear) and the preview a 167ms border spinner; both are gone, and the component adopts the shared keyframes instead of keeping a private copy of its own. The demo option reads "Progress Ring Orbit".

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
