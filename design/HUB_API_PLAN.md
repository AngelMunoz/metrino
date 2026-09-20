# Metro Hub API Plan

Programmatic API for `metro-hub`: parts, `sections`, `selectedIndex`,
`selectionchanged`, `scrollToSection`, opt-in `[snap]`, keyboard and ARIA,
`overscroll-behavior-x`.

The proposal analysis is settled. This plan carries the four decisions that
amend the proposal:

1. The default `behavior` of `scrollToSection()` is `"smooth"`, animated with
   the Metro tokens (333ms, `cubic-bezier(0.1, 0.9, 0.2, 1)`), never the
   browser curve. `behavior: "auto"` opts into an instant jump, and
   `prefers-reduced-motion: reduce` always forces instant. (Revised during
   implementation review: smooth is the expected default; reduced motion is
   the only instant path by default.)
2. Snap and motion are orthogonal. Snap governs where gestures settle;
   programmatic navigation always glides with the Metro easing and lands on
   the boundary, with or without `[snap]`. During the glide the container's
   inline `scroll-snap-type` is `none` (mandatory snap would re-snap every
   scripted write and turn the glide into a jump); it is restored on
   completion and on interrupt, where the target or the takeover point is
   already the snap position.
2. The scroll target is measured from the **first section rect**, not from the
   container rect. The proposal formula
   (`section.rect - container.rect + scrollLeft`) misses the 16px padding and
   lands 16px off the line of the first section.
3. No `role="heading"` on the section header. The `h3` has heading semantics
   already (hub-section.ts:81).
4. The header keeps `cursor: pointer` and the accent hover (the Windows 8.1 hub
   header was clickable). The docs state that the app wires the click handler.

## Methodology

Same workflow as `METRO_COMPLIANCE_PLAN.md`:

1. Fix - make the code change
2. Test - add or update unit tests
3. Type check - `pnpx tsc --noEmit`
4. Visual verify - MCP browser on the navigation demo page
5. Regression check - `pnpm test` (Chromium + Firefox, see
   web-test-runner.config.mjs)

Run the phases in order. Phases 3 and 4 need phase 2. Phase 6 needs phase 4.

## Ground rules

- Free pan with content peek is the default. Phases 2-6 must not change the
  default render path or the default CSS. `[snap]` is the only snap path.
- The hub owns no selection state. `selectedIndex` reads the scroll position.
  The setter scrolls. This is the difference to `metro-pivot`, whose
  `selectedIndex` stores state (pivot.ts:49).
- The hub pan is the native overflow scroll (hub.ts:58-63). All new scroll work
  stays on the native scroll model. Do not port the hub to `touch-physics`.
- Measure section geometry at call time. No geometry caches.

## Scroll math (the core formula)

At `scrollLeft = 0`, section 0 sits on the 16px padding line. For any scroll
position `s`, both section rects move with the content, so the difference

```ts
const target = sections[i].getBoundingClientRect().left
             - sections[0].getBoundingClientRect().left;
```

does not depend on `s`. This difference is the absolute `scrollLeft` that puts
the start of section `i` on the padding line:

- LTR: later sections give positive values. Direct `scrollTo({ left: target })`.
- RTL (`dir="rtl"`, spec scroll position: 0 at the inline start, negative
  toward the end): later sections have smaller `.left`, so the value is
  negative and matches the negative `scrollLeft`.

One formula, both directions, no padding term, no sign checks. Chromium and
Firefox (the two engines in web-test-runner.config.mjs) follow the spec RTL
`scrollLeft`. The RTL tests pin this on both engines.

If a hub has no `metro-hub-section` children, every scroll member is a no-op
and `selectedIndex` reads `-1`.

## Phase 1: part attributes (defect fix)

**Goal:** the built elements emit the parts that the d.ts files promise
(dist/components/navigation/hub.d.ts:27-28, hub-section.d.ts:28-29).

**Code changes:**

- hub.ts render: `<h2 class="hub-title" part="hub-title">` and
  `<div class="hub-container scrollbar-hidden" part="hub-container">`
- hub-section.ts render: `<h3 class="section-header" part="section-header">`
  and `<div class="section-content" part="section-content">`

**Tests (hub.test.ts, hub-section needs no test file yet - add one):**

- `hub title has part attribute`
- `hub container has part attribute`
- `section header has part attribute`
- `section content has part attribute`

**Verify:** `pnpx tsc --noEmit`, `pnpm test`.

## Phase 2: `sections` getter

**Goal:** consumers read the slotted sections in document order without
reaching into the light DOM.

**Code changes (hub.ts):**

```ts
get sections(): MetroHubSection[] {
  return Array.from(this.querySelectorAll("metro-hub-section"));
}
```

`metro-hub-section` children are light DOM children of the host, so
`querySelectorAll` on the host is enough. Sections the consumer drops from the
DOM disappear from the getter automatically.

Export pure helpers next to the class (functional-first, testable):

```ts
export function clampIndex(index: number, count: number): number;
export function nearestIndex(scrollLeft: number, targets: number[]): number;
```

- `clampIndex`: 0 when `count` is 0; clamps into `[0, count - 1]`.
- `nearestIndex`: index of the value in `targets` with the smallest
  `Math.abs(target - scrollLeft)`; returns `-1` for an empty array.

**Tests (hub.test.ts):**

- `sections returns slotted sections in document order`
- `sections ignores foreign children`
- `clampIndex clamps and handles empty`
- `nearestIndex finds nearest with mixed widths` (feed a hand-built
  `targets` array)

**Verify:** type check, `pnpm test`.

## Phase 3: `selectedIndex` + `selectionchanged`

**Goal:** read which section is in view; scroll to one; get one event per
settle, with the same name and shape as `metro-pivot`.

**Code changes (hub.ts):**

- `get selectedIndex(): number` - measure the targets
  (`rect_i.left - rect_0.left`, see the formula section), read
  `container.scrollLeft`, return `nearestIndex(scrollLeft, targets)`. `-1`
  when there are no sections.
- `set selectedIndex(index: number)` - `this.scrollToSection(index, "auto")`.
  No stored state, no `reflect`. The docs must state: the setter is a scroll,
  not a state commit.
- Settle detection on the container: use `scrollend` when
  `"onscrollend" in container` is true; otherwise debounce the `scroll` stream
  with a 100ms quiet period.
- On settle: compute the index. Dispatch only when it differs from the last
  dispatched index:

```ts
this.dispatchEvent(new CustomEvent("selectionchanged", {
  detail: { selectedIndex: index },
  bubbles: true,
  composed: true,
}));
```

This is byte-for-byte the pivot dispatch (pivot.ts:167-173). Never dispatch
per frame. Do not dispatch an initial event at connect time; consumers read
the property for the initial value.
- `#handleScroll`, listener add in `firstUpdated`, remove in
  `disconnectedCallback` together with the debounce timer.

**Tests (hub.test.ts):**

- `selectedIndex is 0 at scroll origin`
- `selectedIndex returns nearest section with mixed widths` (set
  `container.scrollLeft` directly, then read)
- `selectedIndex is -1 without sections`
- `setting selectedIndex scrolls to the section` (await the settle, assert
  `scrollLeft` is within 1px of the target)
- `setting selectedIndex out of range clamps`
- `selectionchanged fires once per settle` (fire several `scroll` events in a
  burst, await the quiet period, assert one event)
- `selectionchanged detail matches pivot shape` (pattern of
  pivot.test.ts:53)
- `selectionchanged does not fire when the index does not change`

**Verify:** type check, `pnpm test`.

## Phase 4: `scrollToSection` + motion

**Goal:** land a section on the padding line, instantly by default, with Metro
motion when the consumer asks for smooth.

**Code changes (hub.ts):**

```ts
scrollToSection(index: number, behavior: ScrollBehavior = "auto"): void;
```

- Clamp with `clampIndex`. No-op when there are no sections.
- Reduced motion: at call time read
  `window.matchMedia("(prefers-reduced-motion: reduce)").matches`. When true,
  force `"auto"`. Export the pure decision helper:

```ts
export function resolveScrollBehavior(
  behavior: ScrollBehavior | undefined,
  reduceMotion: boolean,
): ScrollBehavior;
```

- `"auto"` path: `container.scrollTo({ left: target, behavior: "auto" })`.
- `"smooth"` path: do not use the browser curve. Animate `scrollLeft` with
  `requestAnimationFrame` over
  `var(--metro-transition-slow, 333ms)` and the Metro curve. Import
  `METRO_EASING_VALUES` from utils/animations.ts (animations.ts:289) and
  export the evaluator:

```ts
export function metroEase(t: number): number;
```

  Implement the standard cubic-bezier solver for `(0.1, 0.9, 0.2, 1)`.
  `metroEase(0)` is `0`, `metroEase(1)` is `1`, monotonic in between.
- Cancel: keep an animation token. A new call, `pointerdown`, `wheel`, or a
  handled key on the container cancels the running animation.
- After the animation ends, run the same settle path as phase 3, so one
  `selectionchanged` fires per programmatic scroll too.

**Tests (hub.test.ts):**

- `resolveScrollBehavior downgrades under reduced motion`
- `resolveScrollBehavior keeps the consumer value otherwise`
- `metroEase endpoints and monotonicity`
- `scrollToSection lands on the padding line` (assert `scrollLeft` within 1px
  of the phase-2 target)
- `scrollToSection lands identically under dir rtl` (set `dir="rtl"` on the
  host, same assertion)
- `scrollToSection smooth settles on the target` (`"smooth"`, await ~450ms,
  assert the final position)

**Verify:** type check, `pnpm test`.

## Phase 5: `[snap]` + overscroll containment (CSS only)

**Goal:** snap only on demand. Contain horizontal overscroll always.

**Code changes (hub.ts):**

- `static properties`: add `snap: { type: Boolean, reflect: true }`.
- Styles:

```css
.hub-container {
  overscroll-behavior-x: contain; /* point 8, always on */
}
:host([snap]) .hub-container {
  scroll-snap-type: x mandatory;
  scroll-padding-inline: var(--metro-spacing-lg, 16px);
}
:host([snap]) ::slotted(metro-hub-section) {
  scroll-snap-align: inline-start;
}
```

Static selectors keyed on the host attribute; no render dependency, so
toggling `snap` cannot touch the render path.

**Tests (hub.test.ts):**

- `container has no snap by default`
  (`getComputedStyle().scrollSnapType` is `none` - the free-pan regression
  guard from the proposal)
- `container contains horizontal overscroll`
  (`overscrollBehaviorX` is `contain`)
- `snap attribute enables mandatory snapping`
- `fling settles on a section boundary` (with `[snap]`, set `scrollLeft` to a
  mid-position, await settle, assert the position is within 1px of a target;
  if the two engines differ on re-snapping after a script scroll, set the
  position with `scrollBy` smooth or adjust the assertion and note it)

**Verify:** type check, `pnpm test`, MCP: toggle `[snap]` on the demo page,
pan, and check the settle.

## Phase 6: keyboard + ARIA

**Goal:** keyboard users reach the pan; the structure reads correctly to
assistive tech.

**Code changes (hub.ts):**

- Container: `tabindex="0"`, `role="region"`,
  `aria-label=${this.ariaLabel ?? this.title ?? "hub"}`. Declare
  `ariaLabel: { attribute: "aria-label" }` in `static properties` so the host
  attribute is reactive.
- Key handling, active only with `[snap]` (without snap the native arrow
  scrolling of the focused container is enough):

  - `ArrowRight` / `ArrowLeft`: one section forward or back. Logical
    direction: under `dir="rtl"` the keys swap. Resolve direction with
    `getComputedStyle(container).direction` at event time.
  - `Home` / `End`: first / last section.
  - `event.preventDefault()` on handled keys.

- Focus style, matching the repo focus convention:

```css
.hub-container:focus-visible {
  outline: 2px solid var(--metro-accent, #0078d4);
  outline-offset: -2px;
}
```

**Code changes (hub-section.ts):**

- In `connectedCallback`: `if (!this.hasAttribute("role")) this.setAttribute("role", "group");`
- In `updated()`: when `header` is set, mirror it to `aria-label` on the host.
- No `role="heading"`. The `h3` is a heading already. The header stays
  non-interactive at the component level.

**Tests (hub.test.ts, plus a new hub-section.test.ts):**

- `container is a labelled focusable region` (tabindex, role, label from
  title)
- `region label falls back to hub without title`
- `host aria-label wins over title`
- `container focus ring is visible` (style rule presence)
- `arrow key steps one section with snap` (dispatch `keydown`, assert
  `scrollLeft` at the next target)
- `arrow keys follow direction under dir rtl`
- `home and end jump to first and last`
- `arrow keys do nothing without snap` (no programmatic scroll; the native
  path stays)
- `section has group role`
- `section header becomes the group label`
- `section has no heading role override`

**Verify:** type check, `pnpm test`, MCP: Tab to the hub on the demo page,
arrow through sections with `[snap]`.

## Phase 7: demo, docs, regression

**Goal:** the demo shows the new surface; the docs match the code; everything
is green.

**Code changes:**

- demo/pages/navigation.ts: add a `[snap]` checkbox, a `dir` toggle, and
  buttons for `scrollToSection`. Mixed-width sections stay in the demo so the
  math shows against unequal content.
- hub.ts JSDoc: `@fires selectionchanged` with
  `Detail: { selectedIndex: number }`; state that the hub event fires at the
  pan settle while the pivot event fires at once; state that the index is
  zero-based; state that `selectedIndex` reads and scrolls but stores no
  state; document `scrollToSection`, `sections`, `[snap]`, the keyboard map,
  and that section header clicks belong to the app.
- Export any new public types from src/index.ts if the event detail gets an
  exported interface.
- design/ROADMAP.md: add and tick the hub API entry when the phases are done.

**Tests:** full `pnpm test`, `pnpx tsc --noEmit` clean.

**Verify (MCP, navigation demo page):**

- Pan mixed-width sections; the date-header style consumer reads
  `selectedIndex` live.
- `::part(hub-container) { ... }` from a document stylesheet takes effect.
- `[snap]` on: a fast pan settles on a section boundary aligned to the 16px
  gutter.
- `dir="rtl"`: the same math lands the header on the inline start.
- DevTools rendering emulation `prefers-reduced-motion: reduce`: every
  programmatic scroll is instant.

## Acceptance checks

| Check from the proposal | Where it is proven |
| ----------------------- | ------------------ |
| `selectedIndex` nearest with mixed widths; one event per settle | Phase 3 tests |
| `scrollToSection(3)` lands on the padding line; same under RTL | Phase 4 tests (first-section formula) |
| Free pan is unchanged without `[snap]` | Phase 5 default test + existing four tests stay green |
| `[snap]` settles on the gutter line | Phase 5 settle test |
| `::part()` works from a document stylesheet | Phase 1 tests + Phase 7 MCP check |
| Instant under reduced motion | Phase 4 `resolveScrollBehavior` tests + Phase 7 MCP check |

## Non-goals

No item templates, no lazy section rendering, no header tab strip, no built-in
section click behavior, no stored selection state, no snap by default. The hub
stays a passive canvas; apps wire their own tap handling on the light DOM
sections.
