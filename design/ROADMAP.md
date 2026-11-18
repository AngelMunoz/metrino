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
| Settings flyout widths 346 px (narrow) / 646 px (wide) | `src/components/dialogs/settings-flyout.ts:108,122` |
| ARIA roles: list-view `listbox`, grid-view `grid`, panorama `region` | `list-view.ts:101`, `grid-view.ts:132`, `panorama.ts` |
| App bar Escape + `aria-controls` | `src/components/navigation/app-bar.ts:167,190` |
| Keyboard activation: toggle-switch, check-box, radio-button | tabindex + Enter/Space handlers |
| Dialog focus trap + Escape (with a known gap, see §4) | `content-dialog.ts`, `message-dialog.ts`, `flyout.ts` |
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
| "Turnstile animations for `::view-transition-old(root)` / `new(root)`" | No root selectors exist anywhere. `metro-view-transition-in/out` keyframes are **dead CSS**. Demo routes use the UA default cross-fade |
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

### P0 — Page-wide motion killer + cheap wins

| Item | Detail |
|---|---|
| **View-transition-name collision** | 12 hardcoded names across 5 files (`content-dialog`, `message-dialog`, `flyout`, `settings-flyout`, `semantic-zoom`), set unconditionally on always-rendered elements. Per MDN, duplicate names on rendered elements reject `ViewTransition.ready` and skip the transition. Two instances of one component disable **all** view transitions on the page, including route changes. Fix: per-instance names assigned only while active |
| **Wire root turnstile** | Add `::view-transition-old(root)` / `new(root)` rules using the existing dead keyframes; pass `types` from `demo/main.ts`. Pairing job, not a feature build |
| **Content dialog swivel** | Replace `scale(0.85) translateY(20px)` with rotateX swivel to match message-dialog. **Owner decision: fix** |

### P1 — Motion correctness (shipped defects)

| Item | File(s) |
|---|---|
| Panorama: mandatory scroll-snap re-snaps scripted inertia; reuse the hub snap-suppression pattern. Remove the 0.1 s parallax transition lag | `panorama.ts` |
| Semantic zoom: host `touch-action: none` blocks inner touch scrolling | `semantic-zoom.ts` |
| Integrator is frame-rate dependent: `stepInertia`/`stepSpring` take no deltaTime; `calculateVelocity` hardcodes `* 16.67` | `touch-physics.ts`, `scroll-viewer.ts`, `panorama.ts` |
| Indeterminate progress dots animate `left` (layout), not transform | `progress-bar.ts` |
| Three progress-ring geometries disagree (component 3 s orbit; CSS class 1.5 s linear spin; demo 167 ms border spinner). Canonical = component orbit | `progress-ring.ts`, `animations.css`, demo |
| Flip axis disagrees: component rotateY vs global keyframe rotateX. Default: component wins | `flip-tile.ts`, `animations.css` |
| Animation sources duplicated: 14 keyframes in both `animations.css` and `utils/animations.ts` (bodies currently identical). `playAnimation` resolves on setTimeout, not animationend | both files |
| Semantic zoom: `transition-duration` property declared but never read; no animated fallback without View Transitions (hard cut on older browsers) | `semantic-zoom.ts` |

### P2 — Metro interaction completeness

| Item | Old ref |
|---|---|
| Pivot: swipe gesture + keyboard navigation + circular loop. The doc already claims keyboard support that does not exist | P2 |
| Continuum to the **Metro design language** behavior (tapped item flies from its origin into the page), not a WinJS-specific implementation. Bounded research first; see §7 | — |
| Semantic zoom scroll synchronization (`scrollToGroup`, group tracking, zoom-out tap re-enters at group) | P3 |
| Panorama circular wrap | P4 |
| Long-list-selector jump grid with turnstile transition | P6 |
| Hub + semantic zoom integration | P5 |
| Reduced-motion policy across all keyframe and JS motion (only hub honors it today) | — |

### P3 — Component bugs

See §4.

### P4 — Packaging and tokens

See §5.

### P5 — Docs site

See §8.

### P6 — RTL (scoped)

See §6.

---

## 4. Bug inventory (verified)

### A. Motion / interaction

| Bug | File |
|---|---|
| View-transition-name collision (P0) | 5 dialog/zoom files |
| Dead root-turnstile keyframes | `animations.css` |
| Panorama snap vs inertia conflict; parallax lag | `panorama.ts` |
| Semantic zoom blocks inner touch scroll; unused `transition-duration`; no non-VT fallback | `semantic-zoom.ts` |
| Content dialog entrance is scale+translate, not swivel; fallback is fade only | `content-dialog.ts`, `animations.css` |
| Frame-rate-dependent inertia/spring | `touch-physics.ts` |
| Progress dots animate `left` | `progress-bar.ts` |
| Three ring geometries; flip axis mismatch | `progress-ring.ts`, `flip-tile.ts`, `animations.css` |
| Duplicated keyframes; setTimeout-based animation completion | `utils/animations.ts`, `animations.css` |

### B. Components

| Bug | File |
|---|---|
| Image placeholder never hides: `#handleLoad` sets a private field without `requestUpdate` (error path re-renders, load path does not) | `image.ts` |
| Live tile `interval` property ignored; timer hardcodes 6–10 s | `live-tile.ts` |
| Cycle tile and iconic tile dispatch a synthetic non-composed `click` that doubles the native click | `cycle-tile.ts`, `iconic-tile.ts` |
| Expander: no `aria-expanded`, no tabindex, no key handler; doc claims ARIA support; 500 px max-height clips tall content | `expander.ts` |
| Content dialog focus trap queries shadow DOM only; slotted buttons escape | `content-dialog.ts` |
| Wrap panel `orientation="vertical"` has no CSS effect | `wrap-panel.ts` |
| Separator doc says hidden preserves layout space; CSS `display:none` removes it | `app-bar-separator.ts` |
| App bar button label uses `:host-context()` (1 usage); Firefox does not support it | `app-bar-button.ts:118` |
| Media control styling targets `::-webkit-media-controls` only | `media-element.ts` |
| Pivot doc claims keyboard support; none exists | `pivot.ts` |
| Toast documents `@fires toastshown` / `@fires toashidden` (typo) but dispatches no events | `toast.ts:52–53` |

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
| View-transition rules live only in `animations.css`; cherry-pick component imports carry the names with no rules → silent UA default fade | `src/index.ts` is the only src importer of `animations.css` |
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
  continuum transition. The roadmap previously cited "spec Section 5.2 / 7.2" — **no such
  spec file exists in the repo**; locate it or treat those citations as ungrounded. Fallback
  evidence: the WP7 toolkit reproduction (150 ms, translate-only, ExponentialEase, item
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
