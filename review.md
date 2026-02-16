# Metrino — Metro Design Review & Gap Analysis

Full review of `src/components` against [PROJECT.md](file:///Users/amunoz/repos/metrino/design/PROJECT.md) and the original **Windows Phone 8 / Windows 8** Metro design language.

---

## 1. What You're Doing Well

| Area | Assessment |
|------|-----------|
| **Design tokens** | Solid. Dark/light theme, 10 accent colors matching the WP8 palette, correct font stack fallback |
| **Typography ramp** | Matches the Metro type ramp (42/28/20/16/14/12) with proper light weights |
| **Form association** | `formAssociated = true` + `ElementInternals` on all input components — modern and correct |
| **Functional shared code** | No base class inheritance; pure functions in `buttons/shared.ts` — clean composition |
| **Components beyond plan** | `split-view`, `auto-suggest-box`, `combo-box`, `number-box`, `rating`, `content-dialog`, `expander`, `icon`, `info-bar`, `menu-flyout`, `person-picture`, `toast`, `tooltip` are implemented but not listed in PROJECT.md |

---

## 2. Metro Design Conformance Issues

These are places where the current implementation **diverges** from the original Metro design language.

### 2.1 Buttons — Border, Not Fill

> [!IMPORTANT]
> Original Metro buttons had a **2px border outline with transparent background** — not a filled background. The fill only appeared on hover/press.

Current [button.ts](file:///Users/amunoz/repos/metrino/src/components/buttons/button.ts) uses:
```css
background: var(--metro-highlight, rgba(255,255,255,0.1)); /* Filled */
```

Metro-correct default state should be:
```css
background: transparent;
border: 2px solid var(--metro-foreground, #fff);
```
The `[accent]` variant (colored fill) is fine — that's the accent-styled variant.

### 2.2 Toggle Switch — Metro Used a Flat Rectangle, Not Rounded Pill

The original WP8 toggle switch was a **flat rectangular track** with a **square thumb** (no `border-radius`). Current [toggle-switch.ts](file:///Users/amunoz/repos/metrino/src/components/input/toggle-switch.ts) uses `border-radius: 12px` and a circular thumb — this is the iOS/Material style, not Metro.

Metro-correct:
```css
.switch { border-radius: 0; border: 2px solid var(--metro-foreground); background: transparent; }
.thumb  { border-radius: 0; }
.switch.checked { background: var(--metro-accent); border-color: var(--metro-accent); }
```

### 2.3 Checkbox — Should Be Square with Sharp Corners

The [check-box.ts](file:///Users/amunoz/repos/metrino/src/components/input/check-box.ts) is correct in being square (no border-radius), which matches Metro. ✅

### 2.4 Date/Time Pickers — Should be Looping Roller Selectors

> [!WARNING]
> The original Metro date/time pickers used **three-column looping roller wheels** (like slot machines). Using `<input type="date">` with a browser-native popup is functional but completely diverges from the Metro visual identity.

This is a significant gap. A faithful implementation would need custom looping wheel columns for day/month/year (or hour/minute/AM-PM).

### 2.5 Progress Bar (Indeterminate) — Correct ✅

The five-dot animation pattern faithfully reproduces the WP8 indeterminate progress bar. Good work.

### 2.6 Progress Ring — Correct ✅

The five-dot orbital animation matches the original Metro ring. Multiple size variants are a bonus.

### 2.7 App Bar — Missing Ellipsis Menu ("...") Pattern

The WP8 app bar had a distinctive **bottom-anchored bar with circle-icon buttons** and a "..." (ellipsis) button that expanded to reveal a menu of text-only commands. The current [app-bar.ts](file:///Users/amunoz/repos/metrino/src/components/navigation/app-bar.ts) has no:
- Circular icon button styling (WP8 used a circle border around each icon)
- Ellipsis "..." expand/collapse toggle
- Hidden menu items that slide up on expand

### 2.8 App Bar Button — Missing Circle Border

Original WP8 had each icon inside a **circle outline** (round border, 48×48). Current [app-bar-button.ts](file:///Users/amunoz/repos/metrino/src/components/navigation/app-bar-button.ts) renders icons without the signature circle border.

### 2.9 Panorama — Background Image Parallax Missing

The original Metro Panorama control had a key feature: a **parallax-scrolling background image** that moved slower than the content. Current [panorama.ts](file:///Users/amunoz/repos/metrino/src/components/navigation/panorama.ts) has no `background-image` or parallax support.

### 2.10 Pivot — Header Sizing

Original WP8 pivot headers used a **much larger font** (matching the title type ramp ~42px) with the inactive headers visibly smaller/dimmed. Current [pivot.ts](file:///Users/amunoz/repos/metrino/src/components/navigation/pivot.ts) uses `font-size-normal` (14px) — too small for the Metro look.

### 2.11 Tiles — Missing Tile Grid Layout Helper

The original Start Screen used a fixed grid system where tiles snap to a grid. There's no `<metro-tile-grid>` or similar layout helper to arrange tiles in a proper grid.

### 2.12 Flip Tile — Uses Y-Axis, Should be X-Axis (Vertical Flip)

The original WP8 flip tile flipped on the **X-axis** (top-to-bottom vertical rotation), like a card flipping upward. Current [flip-tile.ts](file:///Users/amunoz/repos/metrino/src/components/tiles/flip-tile.ts) uses `rotateY(180deg)` — that's a **horizontal** flip. The `animations.css` correctly defines `metro-tile-flip` using `rotateX`, but the component doesn't use it.

### 2.13 Semantic Zoom — Missing Pinch Gesture

The original semantic zoom was triggered by **pinch-to-zoom** gesture. The current [semantic-zoom.ts](file:///Users/amunoz/repos/metrino/src/components/selection/semantic-zoom.ts) only has a button toggle. While touch events are harder on web, at minimum `wheel` with Ctrl (browser zoom gesture) could be intercepted.

### 2.14 Icon Component — Uses Material Design Icons, Not Segoe MDL2 / Fluent System Icons

> [!NOTE]
> Since Segoe MDL2 Assets is proprietary, using MDI is a reasonable substitute. However, the icon *names* in the map should more closely match the original WP8/Win8 icon vocabulary. Consider also offering [Fluent System Icons](https://github.com/microsoft/fluentui-system-icons) as an open-source alternative that's closer to the Metro aesthetic.

### 2.15 Tooltip — Has border-radius: 2px

Metro is aggressively zero-radius. The tooltip has `border-radius: 2px` which breaks the design language. Should be `0`.

---

## 3. Missing Components from Windows Phone 8 / Windows 8

These are controls that shipped in the original SDK but are **not present** in Metrino:

### 3.1 High Priority (Core Metro Experience)

| Component | Description | Difficulty |
|-----------|-------------|------------|
| **Live Tile** (`metro-live-tile`) | A tile container that supports automatic content rotation (text headlines, images) on a timer, distinct from flip/cycle tiles. The WP8 "live tile" was the *defining* Metro feature. | Medium |
| **Command Bar** | Win8.1/WinRT variant of the app bar with primary + secondary commands, overflow menu. Distinct from WP8 app bar. | Medium |
| **Settings Flyout** | Win8-style settings panel that slides in from the right edge. | Low |
| **Charms Bar** | The Edge swipe panels (Search, Share, Devices, Settings). Could be implemented as a reusable side panel. | Medium |
| **Status Bar** | WP8 top status bar showing clock, battery, signal. Decorative but iconic. | Low |
| **Lock Screen** | WP8 lock screen with clock, date, notification badges. A showcase component. | Low |

### 3.2 Medium Priority (Common Controls)

| Component | Description |
|-----------|-------------|
| **Multi-Select List** | Grid-style multi-select with checkmark overlay (photo gallery style) |
| **Map Control** | A Metro-styled map wrapper |
| **Media Player** | Transport controls styled to Metro (play/pause/seek bar) |
| **WebView** | A styled iframe wrapper with Metro chrome |
| **Rich Text Box** | Multi-line text input with basic formatting |
| **Search Box** | Distinct from auto-suggest; the Win8 search contract-style search with scope selector |
| **Navigation View** | The hamburger-nav pattern (Win10 UWP style, evolved from `SplitView`) with nav items, header, and back button |
| **Tree View** | Hierarchical expand/collapse list |
| **Breadcrumb Bar** | Navigation breadcrumb trail |
| **Tab View** | Tab bar (distinct from pivot — this is the Win10 WinUI tab strip) |
| **Calendar View** | Full month-view calendar (not just a date picker) |
| **Color Picker** | Color selection control |

### 3.3 Lower Priority (Nice to Have)

| Component | Description |
|-----------|-------------|
| **Badge** | Notification badge (number or glyph) |
| **Teaching Tip** | Contextual tutorial popup |
| **Image** | Metro-styled `<img>` with loading states and placeholder |
| **Ink Canvas** | Drawing / inking surface |
| **Popup** | Generic low-level popup (lighter than flyout) |
| **Viewbox** | Content scaling container |
| **Border** | Styled border container with Metro look |
| **Content Presenter** | Templated content slot |

---

## 4. Missing Metro Paradigms & Patterns

Beyond individual components, these are **system-level patterns** from the original Metro design language that the library doesn't expose:

### 4.1 Page Transitions (Continuum / Turnstile)

The motion language defines several page-level transitions:
- **Turnstile**: 3D rotation around Y-axis (page peels in from the right)
- **Continuum**: A specific element "flies" from one page to become a title on the next
- **Slide**: Full-page slide left/right

`animations.css` has slide-left/right but no turnstile or continuum. These could be offered as CSS classes or a `<metro-page-transition>` wrapper.

### 4.2 Tilt Effect

Every tappable element on WP8 had a **tilt effect** — a subtle 3D rotation toward the touch point. This is the single most recognizable Metro micro-interaction. Currently not implemented anywhere.

Could be a utility function:
```ts
export function applyTiltEffect(el: HTMLElement): void { ... }
```
Or a CSS mixin / shared style that components opt into.

### 4.3 Staggered Content Entrance (Turnstile Feather)

`animations.css` has `metro-entrance-stagger` (10 children with 50ms offsets) but doesn't implement the **turnstile feather** variant where each item rotates in 3D along the Y-axis with a stagger (the "feather" effect). This was used extensively in list views.

### 4.4 Theme Transition Animation

When switching between light/dark themes, Metro animated the transition with a **clock-wipe** or fade. Currently theme switching would be an instant cut.

### 4.5 System Tray / Status Bar Integration

WP8 apps had awareness of the system tray. A `<metro-page>` component could provide:
- Status bar area (decorative)
- Content area with proper padding for the app bar
- Page title area (the large text at the top of every WP8 page)

### 4.6 Accent Color Picker (20 WP8 Colors)

The tokens define 10 accent colors. The original WP8 had **20** accent presets:

Missing: `cobalt`, `indigo`, `violet`, `crimson`, `emerald`, `mauve`, `sienna`, `olive`, `steel`, `taupe`

---

## 5. Minor Code Quality & Conformance Notes

| File | Issue |
|------|-------|
| [text-box.ts](file:///Users/amunoz/repos/metrino/src/components/input/text-box.ts) L123-125 | `formAssociatedCallback` has a `console.log` — should be removed |
| [password-box.ts](file:///Users/amunoz/repos/metrino/src/components/input/password-box.ts) | Missing "reveal" button (eye icon to show password) — a standard WP8/Win8 feature |
| [info-bar.ts](file:///Users/amunoz/repos/metrino/src/components/primitives/info-bar.ts) | Uses PUA Unicode codepoints (`&#xE946;` etc.) that reference Segoe MDL2 — these won't render correctly without that font. Should use text or SVG fallbacks |
| [content-dialog.ts](file:///Users/amunoz/repos/metrino/src/components/dialogs/content-dialog.ts) L103 | Close button uses `&#xE711;` (Segoe MDL2) — won't render. Use `×` or an SVG |
| [toast.ts](file:///Users/amunoz/repos/metrino/src/components/primitives/toast.ts) L106 | Same `&#xE711;` issue |
| [expander.ts](file:///Users/amunoz/repos/metrino/src/components/primitives/expander.ts) L69 | Uses `&#xE0A4;` — won't render without Segoe MDL2 |
| [combo-box.ts](file:///Users/amunoz/repos/metrino/src/components/input/combo-box.ts) L132 | Same `&#xE0A4;` issue |
| [auto-suggest-box.ts](file:///Users/amunoz/repos/metrino/src/components/input/auto-suggest-box.ts) L122 | Uses `&#xE721;` — won't render |
| Multiple files | Various components use `left`/`right` instead of CSS logical properties (`inline-start`/`inline-end`) — the PROJECT.md notes RTL support via logical properties |
| [list-box.ts](file:///Users/amunoz/repos/metrino/src/components/selection/list-box.ts) | `::slotted(.list-item)` requires consumers to add specific class names to children — fragile API. Consider using a dedicated `<metro-list-item>` sub-component |
| [cycle-tile.ts](file:///Users/amunoz/repos/metrino/src/components/tiles/cycle-tile.ts) | Transition is opacity crossfade only. Original WP8 cycle tile used a vertical **sliding** transition (content slides up to reveal next) |

---

## 6. Prioritized Recommendations

### Must-Fix (Design Fidelity)

1. **Button style**: Change default to outlined (transparent bg + border)
2. **Toggle switch**: Make rectangular, not pill-shaped
3. **Flip tile axis**: Change from `rotateY` to `rotateX`
4. **PUA codepoint icons**: Replace all `&#xE7xx;` / `&#xE9xx;` references with Unicode characters, SVGs, or the MDI icon component — they render as □ without Segoe MDL2
5. **Pivot header size**: Increase to ~42px with light weight (title-scale)
6. **Tooltip border-radius**: Change from `2px` to `0`

### Should-Add (Core Metro Identity)

7. **Tilt effect** utility — the signature Metro micro-interaction
8. **App bar circle buttons + ellipsis expand**
9. **Panorama parallax background**
10. **Live Tile** component (automatic content rotation)
11. **Page transition animations** (turnstile, continuum)
12. **Tile grid layout** helper
13. **Date/time picker roller wheels** (or at minimum metro-styled dropdown selectors)

### Nice-to-Have (Completeness)

14. Remaining 10 WP8 accent colors
15. Password box reveal button
16. CSS logical properties throughout
17. `console.log` cleanup
18. Semantic zoom pinch/Ctrl+wheel gesture
19. Turnstile feather stagger animation
20. Theme transition animation
