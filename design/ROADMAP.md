# Metrino Roadmap

Status source of truth for Metro Design Language fidelity, motion correctness, and the
docs site. Execution steps and ordering live in
[METRO_COMPLIANCE_PLAN.md](METRO_COMPLIANCE_PLAN.md).

Last verified against code: **2026-11-17, v0.5.2** (`5dbb11a`, clean tree). Every "done"
and "bug" entry below was checked against source, not against prior roadmap text.

Progressive enhancement (a no-JS HTML+CSS tier) is a **separate track** and is not part of
this roadmap. See the component audit summary at the bottom for the hand-off facts only.

---

## 1. Verified complete

| Item | Evidence |
|---|---|
| Metro easing curve `cubic-bezier(0.1, 0.9, 0.2, 1)` | `src/styles/tokens.css`; matches the documented WinJS transform curve |
| Duration family 167 / 250 / 333 ms | `tokens.css`; Microsoft standard control durations |
| Touch physics engine (inertia, spring, gesture, rails) + tests | `src/utils/touch-physics.ts`, `touch-physics.test.ts` |
| Auto-hide scrollbars (`scrollbarMode` auto/visible/hidden, 1.5 s idle) | `src/components/layout/scroll-viewer.ts` |
| Tilt on 9 components | `applyTiltEffect(this)`: button, hyperlink-button, repeat-button, app-bar-button, app-bar-toggle-button, flip-tile, live-tile, cycle-tile, iconic-tile |
| Hub programmatic API: Metro-eased glide, snap suppression, RTL, `scrollend`, reduced motion | `src/components/navigation/hub.ts` |
| Message dialog swivel entrance (rotateX 90°) | `src/styles/animations.css` `metro-msg-dialog-enter` |
| Per-instance view-transition-name scoping (5 components; names held only while active) | `src/utils/view-transition.ts` `createTransitionScope`; `e2e/view-transitions.spec.ts` |
| Root turnstile wired for demo route changes | `animations.css` `::view-transition-old/new(root)` under type `turnstile`; `demo/main.ts` passes `types` |
| Content dialog swivel entrance (rotateX 90°, matches message dialog) | `animations.css` `metro-dialog-enter/exit`; e2e CSSOM gate |
| Panorama: snap suppressed during scripted inertia/spring, lands on nearest item boundary; parallax without transition lag | `panorama.ts` `#suppressSnap`/`#releaseSnap`; `e2e/panorama.spec.ts` |
| Semantic zoom: inner touch panning (`touch-action: pan-x pan-y`), animated non-VT fallback, `transition-duration` honored | `semantic-zoom.ts`; `e2e/semantic-zoom.spec.ts` |
| Frame-rate-independent inertia/spring; velocities in px/ms | `touch-physics.ts` `stepInertia(state, dtMs)`, `stepSpring(state, dtMs)`, `frameDeltaMs`; independence tests in `touch-physics.test.ts` |
| Hub auto-hide horizontal scrollbar (pan/point/focus reveal, 1.5 s idle) | `hub.ts` `#showScrollbar`, pointer enter/leave; `e2e/hub-zoom.spec.ts` |
| Hub section-header click scrolls the section to the gutter and focuses it | `hub.ts` `#handleContainerClick`; `e2e/hub-zoom.spec.ts` |
| Settings flyout widths 346 px (narrow) / 646 px (wide) | `src/components/dialogs/settings-flyout.ts:108,122` |
| ARIA roles: list-view `listbox`, grid-view `grid`, panorama `region` | `list-view.ts:101`, `grid-view.ts:132`, `panorama.ts` |
| App bar Escape + `aria-controls` | `src/components/navigation/app-bar.ts:167,190` |
| Keyboard activation: toggle-switch, check-box, radio-button | tabindex + Enter/Space handlers |
| Dialog focus trap + Escape: settings-flyout works (document-level listener); content-dialog and message-dialog Escape is dead in real flows (focus gap, see §4) | `content-dialog.ts`, `message-dialog.ts`, `flyout.ts` |
| Panorama parallax ratio 0.2, opacity 0.15 | `panorama.ts` |
| Live tile pseudo-random cycle 6–10 s (property bug, see §4) | `live-tile.ts` |
| Border default thickness 2 px | `border.ts` |
| Toggle switch spring thumb `cubic-bezier(0.34, 1.56, 0.64, 1)` | `toggle-switch.ts` |
| Dark background `#000000`, secondary text 60% | `tokens.css` |
| Typography classes exist (`.display`, `.title`, `.body`, …) | `src/styles/typography.css` (ramp conflict, see §5) |
| Side-effect-free registration; CSS-only bundle ships | `register*()` functions; `dist/metrino.css` via `./styles.css` export |

### Touch physics adoption (engine is done; adoption is partial)

| Component | Gesture | Inertia | Spring | Rails |
|---|---|---|---|---|
| scroll-viewer (opt-in `touch-physics`) | yes | yes | yes | yes |
| panorama | yes | yes | yes | no |
| flip-view | yes | no | boundary compress | no |
| list-view / grid-view / long-list-selector | cross-slide | native scroll | no | no |

---

## 2. Corrections to prior roadmap claims

These were listed as done or missing in the previous roadmap and are **wrong**:

| Old claim | Reality |
|---|---|
| "Touch physics engine missing" (old P1) | Engine exists and is consumed by 6 components. Remaining work is the integrator bug (§3) and adoption gaps |
| "Auto-hide scrollbars missing" (old P8) | Implemented in scroll-viewer |
| "Turnstile animations for `::view-transition-old(root)` / `new(root)`" | At audit: no root selectors existed; `metro-view-transition-in/out` keyframes were dead CSS and demo routes used the UA cross-fade. Wired in PR2 (2026-11-17) |
| "View Transition API for pivot tab switching" | Pivot uses CSS transitions only |
| "Typography type ramp (15px body …)" | `typography.css .body` is 15 px but `tokens.css --metro-font-size-normal` is 14 px. Demo pages bypass the ramp |
| "Turnstile correct rotation angles" | Unverified against any primary source. Library uses 10° in / −15° out; the demo page uses ±90°. Not a fidelity claim |
| P9 lists app-bar-toggle-button as missing tilt | It has tilt |
| "21 accent colors" | 20 `[accent="…"]` blocks in `tokens.css`; blue is the implicit `:root` default with no block |
| RTL "~86 instances" | Scoped measurement: 29 side-property sites + 33 bare offsets in component CSS bodies (excluding `shared.ts`), plus JS style writes in `border.ts`. See §6 |

---

## 3. Open priorities (re-ranked)

Rationale: defects that disable motion page-wide come first, then shipped motion defects,
then missing Metro interactions, then bugs, packaging, docs, RTL.

### P0 — Landed 2026-11-17 (PR2, branch `phase/2-p0-motion`)

All three P0 items are implemented and e2e-verified (`e2e/view-transitions.spec.ts`,
Chromium + Firefox): per-instance view-transition-name scoping, root turnstile wiring,
content dialog swivel. See §1 for evidence.

**Measured correction to the original P0 premise** (standalone probe, 2026-11-17,
Chromium 153 + Firefox 155): duplicate `view-transition-name` values **within one tree
scope** reject `ViewTransition.ready` in both engines; duplicates **across separate shadow
roots** are currently tolerated by both. The original claim that two instances disable all
page transitions was therefore overstated. The real defects were: closed instances
reserving names on always-rendered elements (the spec requires uniqueness document-wide),
and same-scope duplicates rejecting the transition. Scoping removes both risks.

### P1 — Motion correctness (landed: PR3 + PR4)

All four items landed: transform-only indeterminate dots, one ring orbit geometry,
rotateY flip axis, and a single animation source with `animationend` completion
(`e2e/progress.spec.ts`, `e2e/animations-source.spec.ts`).

### P2 — Metro interaction completeness (landed: PR5–PR8)

All seven items landed: pivot swipe/keyboard/loop and the reduced-motion policy (PR5),
semantic-zoom group sync and the jump grid (PR6), panorama wrap and the zoomable hub
(PR7), continuum from the verified WP toolkit source (PR8).

### P3 — Component bugs (landed: PR9)

See the §4.B disposition.

### P4 — Packaging and tokens

See §5.

### P5 — Docs site

See §8.

### P6 — RTL (scoped)

See §6.

---

## 4. Bug inventory (verified)

### A. Motion / interaction

All inventory items landed in PR2–PR4 (scoped transition names, root turnstile, swivel,
panorama snap/parallax, semantic-zoom touch/fallback, dt physics, dots transform, ring
orbit, flip axis, single animation source). Evidence: §1 and the e2e specs named there.

### B. Components

Disposition of the verified inventory (all landed):

| Bug | Landed in |
|---|---|
| Image placeholder never hides (`#handleLoad` without `requestUpdate`) | PR9 |
| Live tile `interval` ignored | PR9 |
| Cycle/iconic tile synthetic non-composed `click` doubles the native click | PR9 |
| Expander: no ARIA/keyboard, 500 px clip | PR9 |
| Content dialog focus trap misses slotted nodes | PR9 |
| Dialog Escape/focus defects (focus race, no document Escape, restore during exit) | PR9 |
| Wrap panel `orientation="vertical"` inert | PR9 |
| Separator hidden removed layout space | PR9 |
| App bar button label via `:host-context()` (Firefox) | PR9 |
| Media controls styled via webkit pseudos only | PR9 |
| Pivot doc claimed keyboard support that did not exist | PR5 (2.1) |
| Toast phantom `@fires` names, no events | PR9 |

### C. Demo / docs

| Bug | File |
|---|---|
| Deep-link scroll uses `document.getElementById`; all pages render in shadow DOM; only `navigation.ts` has 8 `metro-*` ids | `demo/router/index.ts:77` |
| API viewer badges every attribute without "undefined" in its type as required: **256 of 265** | `demo/components/api-docs.ts` |
| CSS property Default column always "-": **0 of 188** manifest cssProperties carry a structured default | `public/custom-elements.json` |
| Manifest descriptions render as raw text; markdown/paragraphs lost | `api-docs.ts` |
| **35 of 71** element declarations ship an empty description | manifest |
| Animations page redefines keyframes with different values; invalid `translateX(0);` in slideRight; lists non-existent `metro-animate-slide-down`; stagger toggle never read | `demo/pages/animations.ts` |
| `templates/index.ts` has zero imports; every page hand-writes CSS | `demo/templates/index.ts` |
| Spacing drift: double 24 px padding on 4 pages; home 200 px bottom; token fallbacks disagree (32/24/48/20); three code-block styles; duplicate `.ring-row` padding | `demo/pages/*` |
| Loading text hardcodes white at 60% opacity; fails on light theme | `demo/main.ts` |
| Hyperlink demo targets `#/home`; route is `/` (masked by router fallback) | `demo/pages/buttons.ts` |
| Demo settings panel hand-rolled at 320 px instead of the library flyout | `demo/components/app-shell.ts` |

---

## 5. Packaging and token defects (verified)

| Item | Evidence |
|---|---|
| Utils modules ship in `dist/utils` (5 modules) but have **0 entries** in the 53-entry exports map; not exported from `src/index.ts` | `package.json`, `dist/utils` |
| `customElements` field points to `public/custom-elements.json`, which is not in `files: ["dist","README.md","LICENSE"]` → manifest never published | `package.json` |
| View-transition rules: the 5 components' `::view-transition` rules now travel with the component via `createTransitionScope`; the keyframes still live only in `animations.css`, so cherry-pick consumers need `./styles.css` for them (the demo entry imports it since PR2) | `src/utils/view-transition.ts`, `src/index.ts` |
| `--metro-gap` is defined nowhere; `grid.ts` falls back 8 px, `stack-panel.ts` 0 | token scan |
| Fallbacks encode the dark theme: 60 `--metro-foreground` sites in components fall back to white; light token value is `#1f1f1f`. `--metro-foreground-secondary` / `--metro-border` / `--metro-highlight` carry 3–5 different fallback literals each | component scan (630 `var()` sites, 6 tokens with 2+ fallbacks) |
| Type ramp conflict: token normal 14 px vs `typography.css .body` 15 px; home title 72 px vs `.display` 56 px | `tokens.css`, `typography.css`, `demo/pages/home.ts` |

---

## 6. RTL scope (P6)

Do not use a single total as a KPI. Measured in component CSS bodies (excluding `shared.ts`):

- **29** side-property sites (`margin/padding/border-left/right`).
- **33** bare `left:`/`right:` offsets — many are symmetric `left:0;right:0` or circular centering, not direction defects.
- JS style writes in `border.ts` (`borderLeftWidth`, `paddingLeft`, …) are also RTL work.

Concentration: split-view (12), info-bar (5), combo-box (4), auto-suggest-box (4),
number-box (3), tree-view (2). Convert to logical properties; exclude symmetric inset
patterns and circular centering.

---

## 7. Research and decisions

### Closed by owner (2026-11-17)

| Topic | Decision |
|---|---|
| Default accent | Keep `#0078d4`. Palette fidelity is not a goal |
| Iconography | Keep MDI; proprietary Segoe/MDL2 assets cannot be used |
| Continuum target | The Metro design language behavior, not WinJS specifically |
| Turnstile angles | No reference, no invented numbers. Internal consistency only |
| Content dialog entrance | Fix to swivel |
| Test baseline / browser repro | Not a gate; treated as noise |
| Progressive enhancement | Separate track |

### Defaults chosen for execution (override if needed)

| Topic | Default |
|---|---|
| Flip axis | Component (rotateY) wins; align the keyframe |
| Body size | Single ramp in tokens; keep 14 px; fix `.body` to consume the token |
| Wrap panel vertical | Implement the vertical wrap rule |
| Separator hidden | `visibility:hidden`, preserve space (match the doc) |
| Toast events | Implement `toastshown`/`toasthidden` (fix typo) |
| Canonical ring | The 5-dot orbit component |

### Still open (bounded)

- **Continuum primary reference.** Retrieve archived Windows Phone design guidance for the
  continuum transition. The "spec Section 5.2 / 7.2" citations are **ungrounded**: no spec
  file exists in the repo. Searched 2026-11-17 — `design/` holds only `ROADMAP.md` and
  `METRO_COMPLIANCE_PLAN.md`. The citations are dropped, not resolved; do not invent a spec.
  Fallback evidence: the WP7 toolkit reproduction (150 ms, translate-only, ExponentialEase, item
  origin). Cite whatever is used; do not invent values.
- WP type ramp and original turnstile/tilt values are **not pursued** (owner decision).

---

## 8. Docs site track (P5)

The demo is a hash-routed SPA with no deployment. CI (`.github/workflows/release.yml`)
publishes the package only. Work items:

1. Fix deep links (render-root query or light-DOM docs content) + stable per-component ids.
2. One shared docs stylesheet on tokens; delete or revive `templates/index.ts`.
3. api-docs: correct required detection, markdown rendering, structured cssprop defaults
   (extract in `scripts/sort-manifest.mjs`).
4. Generate code samples from the live demo DOM.
5. Side navigation, manifest search (71 elements, 265 attributes), per-component routes.
6. Prerender/SSG, meta tags, deploy workflow.
7. Rebuild the animations page on the library's real classes and durations; remove the
   invalid declaration, phantom class, and dead toggle.
8. Normalize spacing (double padding, fallback drift, code-block styles).
9. Light-theme loading text; `#/home` link.
10. Dogfood library components (settings-flyout, pivot, hub) in the docs shell.
11. Write the 35 empty element descriptions.

---

## 9. Missing components (future work, unchanged)

| Component | Description | Effort |
|---|---|---|
| Command Bar | Win8.1 app bar with primary/secondary commands | M |
| Charms Bar | Edge swipe panels | L |
| Status Bar | System status | S |
| Lock Screen | Showcase time/date | M |
| Breadcrumb Bar | Navigation trail | S |
| Tab View | Tab strip distinct from Pivot | M |
| Color Picker | Color selection | M |
| Teaching Tip | Contextual tutorial popup | M |
| Ink Canvas | Drawing surface | L |

---

## 10. Separate track: progressive enhancement (hand-off facts only)

Not part of this roadmap. Component audit (2026-11-17, 71 elements):

- **13 CSS-only candidates**: stack-panel, wrap-panel, canvas, text-block, grid, tile-grid,
  variable-sized-wrap-grid, border, pivot-item, panorama-item, hub-section,
  app-bar-separator, progress-ring.
- **38 hybrid** (native HTML/CSS baseline + JS for Metro behavior).
- **20 JS-required** (pickers, dialogs/flyouts, virtualized lists, semantic zoom, timer
  tiles, viewbox, repeat-button, rich-edit-box, tooltip, pivot).
- The CSS tier already partly ships (`dist/metrino.css`). Shadow DOM is the structural
  constraint: a class-based light-DOM tier is required, not `::part` overrides.
