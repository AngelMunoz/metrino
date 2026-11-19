# Metro Compliance Plan — Execution Checklist

Derived from [ROADMAP.md](ROADMAP.md), which is the status source of truth. This file holds
the ordered, checkable execution steps. Update checkboxes here as work lands; update status
and evidence in the roadmap.

Baseline: **v0.5.2 (`5dbb11a`), verified 2026-11-17.**

The previous phase plan (Phases 1–13) is retired. Its disposition is at the bottom.

---

## Method

Per task:

1. Write the e2e use-case test first (`e2e/*.spec.ts`, Playwright against the demo
   app). It must fail before the fix and pass after. Test real input and observable
   outcomes: visible text, focus, page-level events, computed styles, geometry,
   `animationend`. Screenshots and traces are review artifacts, not pixel-diff gates.
2. Implement the change.
3. Type check: `pnpx tsc --noEmit`.
4. Run the e2e suite: `pnpm test:e2e` (Chromium + Firefox). Pure non-DOM logic
   changes also run their logic tests:
   `pnpx web-test-runner src/utils/<file>.test.ts --node-resolve`.
5. Capture visual artifacts for motion/spacing tasks into `artifacts/<phase>/`
   (before/after screenshots, frame sequences) and commit them with the phase.

Owner decision (2026-11-17): e2e use-case tests are mandatory for all component,
flow, and demo-page work. This supersedes the previous "verify motion manually"
method. The web-test-runner suite loads `.css` as empty and remains only for
non-DOM utils (`touch-physics`, `sanitize`, `virtualization`). Both suites run
chromium + firefox.

## Execution rules

- Create a work branch before the first commit (main is the default branch). No branch for
  work that ends without a commit.
- Never push without explicit permission. Never force push.
- Changelog (KeepAChangelog): released behavior → `Fixed` / `Changed` (mark breakage with
  **Breaking:**); new capability → `Added`. Bold-prefix the affected surface; group by
  user-facing concern.
- Style per `AGENTS.md`: 2 spaces, double quotes, no trailing commas, named exports,
  `import type`, logical properties where touched.
- Comments belong in doc/signature positions; keep implementation quirks noted inline only
  where the why is non-obvious.

---

## Phase 0 — Correct the record

- [x] Rewrite `ROADMAP.md` to verified status (this pass).
- [x] Replace this compliance plan with the execution checklist (this pass).
- [x] Fix false published JSDoc (ships in the manifest):
  - [x] `pivot.ts` — remove "keyboard navigation support" claim until P2.1 lands.
  - [x] `expander.ts` — remove "ARIA expanded state support" claim until P3 lands.
  - [x] `app-bar-separator.ts` — align doc with actual hidden behavior (or fix behavior in P3).
  - [x] `toast.ts` — remove or implement phantom `@fires toastshown` / `toashidden` (implement in P3).
- [x] `README.md` — accent count 21 → 20 named blocks + implicit blue default.
- [x] Locate the "spec" the old roadmap cited (Sections 5.2 / 7.2). No such file exists in
      the repo. Find it or mark those citations ungrounded in the roadmap. (Searched
      2026-11-17: not found — marked ungrounded in `ROADMAP.md` §7.)
- [x] `AGENTS.md` — reconcile the "all three browser engines" claim with the chromium+firefox config (done in the e2e foundation PR: Testing section rewritten).

Changelog: none (docs only), unless a behavior changes.

---

## Phase 1 — Motion correctness

### P0 first

- [x] **1.1 Per-instance view-transition-name scoping.** Assign unique names only while the
      component is active; remove unconditional hardcoded names from static styles.
      Files: `content-dialog.ts`, `message-dialog.ts`, `flyout.ts`, `settings-flyout.ts`,
      `semantic-zoom.ts`. Verify: two instances of one component on a page; a route change
      still animates. Category: **Fixed**. (PR2; `src/utils/view-transition.ts`;
      `e2e/view-transitions.spec.ts`. Probe correction: cross-shadow-root duplicates are
      tolerated by current Chromium/Firefox; same-scope duplicates reject. See ROADMAP §3.)
- [x] **1.2 Wire root turnstile.** Add `::view-transition-old(root)` / `new(root)` rules using
      the existing `metro-view-transition-out/in` keyframes; pass `types` in `demo/main.ts`.
      Unify the demo animations page turnstile with the library values (10° / −15°).
      Category: **Fixed**. (PR2; e2e root animation-name gate.)
- [x] **1.3 Content dialog swivel entrance.** Replace `metro-dialog-enter/exit`
      scale+translate with rotateX 90°↔0 (match `metro-msg-dialog-enter`). Keep the fade
      fallback. Category: **Changed**. (PR2; e2e CSSOM gate + frame artifacts.)

### P1 defects

- [x] **1.4 Panorama snap ownership.** Suppress `scroll-snap-type` during scripted inertia
      (reuse the `hub.ts` glide pattern) or switch to proximity snap. Remove the 0.1 s
      parallax `transition`. Category: **Fixed**. (PR3; lands on nearest item boundary
      before restoring snap; `e2e/panorama.spec.ts`.)
- [x] **1.5 Semantic zoom touch scroll.** Remove host `touch-action: none`; let inner overflow
      pan while pinch/ctrl+wheel still zooms. Category: **Fixed**. (PR3; `pan-x pan-y`;
      trusted-touch e2e on Chromium.)
- [x] **1.6 DeltaTime integrator.** `stepInertia`/`stepSpring` accept dt; friction scaled by
      `dt/16.67`; `calculateVelocity` returns a time-based unit. Update `scroll-viewer.ts`
      and `panorama.ts` call sites; update `touch-physics.test.ts`. Category: **Fixed**.
      (PR3; px/ms contract, spring sub-steps, frame-rate independence tests.)
- [x] **1.7 Progress dots transform.** Animate `transform: translateX(...)` instead of `left`.
      Category: **Fixed**. (PR4; `100cqw` over an inline-size container, e2e on the demo page.)
- [x] **1.8 Unify ring geometry.** Canonical = 5-dot orbit component. Align the
      `.metro-animate-progress-ring` class and the demo preview to it. Category: **Changed**.
      (PR4; `metro-ring-orbit-small|normal|large` in `animations.css`, adopted into the
      component's shadow; the 1.5s spin and the demo border spinner are gone.)
- [x] **1.9 Unify flip axis.** Align the global `metro-tile-flip` keyframe to the component
      (rotateY). Category: **Changed**. (PR4; demo preview uses the shared keyframe too.)
- [x] **1.10 Single animation source.** Make `animations.css` canonical;
      `utils/animations.ts` consumes it; `playAnimation` resolves on `animationend`.
      Category: **Changed**. (PR4; `extractAnimationRules` reads the stylesheet through
      Vite's `?inline` import — stubbed in `web-test-runner.config.mjs`, which already
      stubs plain `.css`; `animationend` plus a bounded safety timeout.)
- [x] **1.11 Semantic zoom fallback + dead property.** Wire `transition-duration` or remove
      it; add a CSS transition fallback for non-VT browsers. Category: **Fixed**. (PR3;
      `--sz-dur` fallback, per-transition rule duration; e2e no-VT cases.)

---

## Phase 2 — Metro interaction completeness

- [ ] **2.1 Pivot swipe + keyboard + circular loop.** Pointer-driven paging; Arrow/Home/End
      on the tablist; wrap last↔first. Restores the keyboard claim. Category: **Added**
      (swipe, loop) + **Fixed** (keyboard).
- [ ] **2.2 Continuum to MDL behavior.** Research first (roadmap §7): archived WP design
      guidance / located spec; fallback = WP7 toolkit reproduction (150 ms, translate,
      ExponentialEase, item origin). Implement the tapped-item-flies-into-page transition.
      Cite the source used. Category: **Changed**.
- [ ] **2.3 Semantic zoom scroll sync.** `scrollToGroup(key)`, track current group, zoom-out
      tap re-enters at that group. Category: **Added**.
- [ ] **2.4 Panorama circular wrap.** Clone endpoints, seamless jump, parallax across the
      boundary. Category: **Added**.
- [ ] **2.5 Long-list-selector jump grid.** Full-screen header grid with turnstile in/out;
      keep the sidebar strip as a compact option. Category: **Added**.
- [ ] **2.6 Hub + semantic zoom integration.** `zoomable` hub, generated zoomed-out view,
      coordinated scroll. Category: **Added**.
- [ ] **2.7 Reduced-motion policy.** Honor `prefers-reduced-motion` across keyframe and JS
      motion (hub already does). Category: **Added**.

---

## Phase 3 — Component bugs

- [ ] **3.1** `image.ts` — `requestUpdate()` in `#handleLoad` so the placeholder hides. **Fixed**.
- [ ] **3.2** `live-tile.ts` — honor the `interval` property (keep 6–10 s as the default). **Fixed**.
- [ ] **3.3** `cycle-tile.ts`, `iconic-tile.ts` — remove the synthetic non-composed `click`. **Fixed**.
- [ ] **3.4** `expander.ts` — `aria-expanded`, tabindex, Enter/Space; replace the 500 px
      max-height clip (grid-rows 0fr→1fr or `interpolate-size`). **Fixed**.
- [ ] **3.5** `content-dialog.ts` — focus trap includes slotted assigned nodes. **Fixed**.
- [ ] **3.6** `wrap-panel.ts` — implement the vertical wrap rule. **Fixed**.
- [ ] **3.7** `app-bar-separator.ts` — hidden preserves space (`visibility:hidden`). **Fixed**.
- [ ] **3.8** `app-bar-button.ts` — replace `:host-context()` with a Firefox-safe mechanism
      (parent-driven attribute/part or `:has()`). **Fixed**.
- [ ] **3.9** `media-element.ts` — standard `accent-color`/`color-scheme` beyond webkit pseudos. **Fixed**.
- [ ] **3.10** `toast.ts` — implement `toastshown`/`toasthidden` (composed; fix the typo). **Added**.
- [ ] **3.11** Dialog focus + Escape (e2e-verified defect): focus the dialog only after
      `open` is applied (after the View Transition update, not a pre-transition rAF);
      document-level Escape while open for content-dialog and message-dialog; restore
      focus to the opener on close (settings-flyout restore observed broken); include
      slotted nodes in the trap (with 3.5). Un-fixme the two Escape tests in
      `e2e/dialogs.spec.ts`. **Fixed**.

---

## Phase 4 — Packaging and tokens

- [ ] **4.1** Export utils subpaths (`animations`, `touch-physics`, `form-control`,
      `sanitize`, `virtualization`) or stop shipping dead `dist/utils` modules. **Changed**.
- [ ] **4.2** Ship the manifest in `dist`; fix the `customElements` field path. **Fixed**.
- [ ] **4.3** Structured cssprop defaults: extract `(default: …)` into `default` in
      `scripts/sort-manifest.mjs`. **Fixed**.
- [ ] **4.4** View-transition rules travel with cherry-pick imports (shared CSSResult or
      documented `styles.css` requirement). **Fixed**.
- [ ] **4.5** Define `--metro-gap`; align dark-biased fallbacks; unify
      secondary/border/highlight literals. **Changed**.
- [ ] **4.6** Single type ramp in tokens; `typography.css` consumes vars; fix `.body` to 14 px. **Changed**.

---

## Phase 5 — Docs site (parallel track)

- [ ] **5.1** Deep links: render-root query or light-DOM content; stable per-component ids.
- [ ] **5.2** Shared docs stylesheet on tokens; delete or revive `templates/index.ts`.
- [ ] **5.3** api-docs: required detection, markdown rendering, defaults column.
- [ ] **5.4** Code samples generated from live demo DOM.
- [ ] **5.5** Side navigation + manifest search + per-component routes.
- [ ] **5.6** Prerender/SSG, meta tags, deploy workflow.
- [ ] **5.7** Animations page rebuilt on library classes/durations; remove invalid
      `translateX(0);`, phantom `slide-down`, dead stagger toggle.
- [ ] **5.8** Spacing normalization (double padding, fallback drift, code-block styles).
- [ ] **5.9** Light-theme loading text; `#/home` link.
- [ ] **5.10** Dogfood settings-flyout / pivot / hub in the docs shell.
- [ ] **5.11** Write the 35 empty element descriptions.

---

## Phase 6 — RTL (scoped, last)

- [ ] **6.1** Convert side properties + directional offsets to logical properties, starting
      with split-view (12 sites), then info-bar, combo-box, auto-suggest-box, number-box,
      tree-view. Include `border.ts` JS style writes. Exclude symmetric `left:0;right:0`
      and circular centering. No single-total KPI.

---

## Suggested first commit set

Phase 0 + 1.1 + 1.2 + 1.3. Corrects the record, removes the page-wide motion killer, wires
the existing turnstile, and fixes the content dialog entrance the owner asked for — one
reviewable batch.

---

## Disposition of the retired phase plan

| Old phase | Status |
|---|---|
| 1 — fix broken test files | Done (prior release) |
| 2 — keyboard for toggle/check/radio | Done |
| 3 — dialog a11y (Escape, trap, ARIA) | Done, with the slotted-focus gap → 3.5 |
| 4 — ARIA roles for collections | Done |
| 5 — app bar keyboard | Done |
| 6 — tilt effects | Done (9 components); remaining check-box/radio/list items optional |
| 7 — hover/press states | Done |
| 8 — swivel for dialogs | Partial: message-dialog done; content-dialog → 1.3. The cited `dialogAnimation` export in `shared.ts` never existed |
| 9 — pivot circular loop | Open → 2.1 |
| 10 — panorama circular wrap | Open → 2.4 |
| 11 — RTL | Open → Phase 6 (scoped) |
| 12 — scroll-viewer auto-hide | Done |
| 13 — final verification | Superseded by the per-task method above |
