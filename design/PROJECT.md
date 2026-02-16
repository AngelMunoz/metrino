# Metrino - Metro UI Web Components Library

A Lit-based Web Component library implementing the Windows Phone / Windows 8 Metro design system with full fidelity and modern practices.

## Project Overview

- **Name**: Metrino
- **Tech**: Lit Web Components (minimal runtime, ~6KB)
- **Font**: System font stack
- **Theming**: Light/dark themes with customizable accent color
- **RTL**: Architecture supports RTL (not priority for v1)
- **Animations**: Full faithfulness to original Metro motion language

---

## Project Structure

```
metrino/
├── src/
│   ├── components/
│   │   ├── navigation/      # Pivot, Panorama, Hub, AppBar
│   │   ├── tiles/           # FlipTile, CycleTile, IconicTile
│   │   ├── input/           # TextBox, ToggleSwitch, etc.
│   │   ├── buttons/         # Button, HyperlinkButton
│   │   │   └── button.ts
│   │   ├── selection/       # ListBox, LongListSelector
│   │   ├── progress/        # ProgressBar, ProgressRing
│   │   ├── datetime/        # DatePicker, TimePicker
│   │   ├── layout/          # Grid, StackPanel, ScrollViewer
│   │   ├── primitives/      # TextBlock
│   │   └── dialogs/         # MessageDialog, Flyout
│   ├── styles/
│   │   ├── tokens.css       # CSS custom properties (theme, accent)
│   │   ├── animations.css   # Metro motion language
│   │   └── shared.ts        # Reusable Lit css fragments
│   ├── demo/
│   │   └── index.html       # Single-file demo showcase
│   └── design/
│       └── PROJECT.md       # This file
├── package.json
└── README.md
```

---

## Component Inventory

### Navigation
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-pivot` | Tab-like navigation with sliding transition | [x] |
| `metro-pivot-item` | Individual pivot section | [x] |
| `metro-panorama` | Horizontal scrolling hub view | [x] |
| `metro-panorama-item` | Individual panorama section | [x] |
| `metro-hub` | Modern hub section container | [x] |
| `metro-hub-section` | Individual hub section | [x] |
| `metro-app-bar` | Bottom/top app bar | [x] |
| `metro-app-bar-button` | App bar button | [x] |

### Tiles
| Component | Sizes | Status |
|-----------|-------|--------|
| `metro-flip-tile` | small, medium, wide, large | [x] |
| `metro-cycle-tile` | medium, wide | [x] |
| `metro-iconic-tile` | small, medium, large | [x] |

### Buttons
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-button` | Standard button | [x] |
| `metro-hyperlink-button` | Hyperlink styled button | [x] |
| `metro-repeat-button` | Fires click repeatedly while pressed | [x] |

### Input
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-text-box` | Single-line text input | [x] |
| `metro-password-box` | Password input | [x] |
| `metro-check-box` | Checkbox control | [x] |
| `metro-radio-button` | Radio button | [x] |
| `metro-toggle-switch` | On/off toggle | [x] |
| `metro-slider` | Slider control | [x] |

### Selection
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-list-box` | Simple list selection | [x] |
| `metro-long-list-selector` | Jump list with headers | [x] |
| `metro-semantic-zoom` | Zoomed in/out view toggle | [x] |

### Progress
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-progress-bar` | Determinate/indeterminate bar | [x] |
| `metro-progress-ring` | Spinning progress indicator | [x] |

### Date/Time
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-date-picker` | Native-styled date picker | [x] |
| `metro-time-picker` | Native-styled time picker | [x] |

### Layout
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-grid` | Grid layout container | [x] |
| `metro-stack-panel` | Horizontal/vertical stack | [x] |
| `metro-wrap-panel` | Wrapping layout | [x] |
| `metro-scroll-viewer` | Scrollable container | [x] |

### Dialogs
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-message-dialog` | Alert dialog | [x] |
| `metro-flyout` | Popup flyout | [x] |

### Primitives
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-text-block` | Styled text container | [x] |

---

## Implementation Phases

### Phase 1: Foundation
- [x] Create project scaffold
- [x] Implement CSS custom properties (theme tokens)
- [x] Create shared interactive utilities (functional approach, no base class)
- [x] Set up demo/index.html structure

### Phase 2: Layout Primitives
- [x] `metro-stack-panel`
- [x] `metro-grid`
- [x] `metro-scroll-viewer`
- [x] `metro-wrap-panel`

### Phase 3: Typography & Buttons
- [x] `metro-text-block`
- [x] `metro-button`
- [x] `metro-hyperlink-button`
- [x] `metro-repeat-button`

### Phase 4: Navigation
- [x] `metro-pivot` + `metro-pivot-item`
- [x] `metro-panorama` + `metro-panorama-item`
- [x] `metro-hub` + `metro-hub-section`
- [x] `metro-app-bar` + `metro-app-bar-button`

### Phase 5: Tiles
- [x] `metro-flip-tile` (all sizes)
- [x] `metro-cycle-tile` (medium, wide)
- [x] `metro-iconic-tile` (all sizes)

### Phase 6: Input Controls
- [x] `metro-text-box`
- [x] `metro-password-box`
- [x] `metro-check-box`
- [x] `metro-radio-button`
- [x] `metro-toggle-switch`
- [x] `metro-slider`

### Phase 7: Selection
- [x] `metro-list-box`
- [x] `metro-long-list-selector`
- [x] `metro-semantic-zoom`

### Phase 8: Progress & DateTime
- [x] `metro-progress-bar`
- [x] `metro-progress-ring`
- [x] `metro-date-picker`
- [x] `metro-time-picker`

### Phase 9: Dialogs
- [x] `metro-message-dialog`
- [x] `metro-flyout`

### Phase 10: Polish
- [ ] Complete demo site
- [ ] Cross-browser testing
- [ ] Accessibility audit (ARIA)
- [ ] Documentation

---

## Design Tokens

```css
:root {
  /* Accent */
  --metro-accent: #0078d4;
  --metro-accent-light: #429ce3;
  --metro-accent-dark: #005a9e;
  
  /* Dark Theme (default) */
  --metro-background: #1f1f1f;
  --metro-foreground: #ffffff;
  --metro-foreground-secondary: rgba(255, 255, 255, 0.7);
  --metro-foreground-disabled: rgba(255, 255, 255, 0.4);
  --metro-border: rgba(255, 255, 255, 0.2);
  --metro-highlight: rgba(255, 255, 255, 0.1);
  
  /* Typography */
  --metro-font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --metro-font-size-small: 12px;
  --metro-font-size-normal: 14px;
  --metro-font-size-medium: 16px;
  --metro-font-size-large: 20px;
  --metro-font-size-xlarge: 28px;
  --metro-font-size-xxlarge: 42px;
  
  /* Spacing */
  --metro-spacing-xs: 4px;
  --metro-spacing-sm: 8px;
  --metro-spacing-md: 12px;
  --metro-spacing-lg: 16px;
  --metro-spacing-xl: 24px;
  --metro-spacing-xxl: 40px;
  
  /* Animation */
  --metro-transition-fast: 167ms;
  --metro-transition-normal: 250ms;
  --metro-transition-slow: 333ms;
  --metro-easing: cubic-bezier(0.1, 0.9, 0.2, 1);
}

[data-theme="light"] {
  --metro-background: #ffffff;
  --metro-foreground: #1f1f1f;
  --metro-foreground-secondary: rgba(0, 0, 0, 0.7);
  --metro-foreground-disabled: rgba(0, 0, 0, 0.4);
  --metro-border: rgba(0, 0, 0, 0.2);
  --metro-highlight: rgba(0, 0, 0, 0.1);
}
```

---

## Animation Reference

### Metro Motion Principles
1. **Entrance**: Elements slide up/fade in from bottom
2. **Exit**: Elements fade out quickly
3. **Continuum**: Page transitions slide in/out
4. **Content**: Staggered reveal of content

### Key Animations
| Animation | Duration | Easing |
|-----------|----------|--------|
| Fade in | 167ms | ease-out |
| Slide up entrance | 333ms | cubic-bezier(0.1, 0.9, 0.2, 1) |
| Pivot slide | 250ms | cubic-bezier(0.1, 0.9, 0.2, 1) |
| Tile flip | 500ms | ease-in-out |
| App bar show/hide | 333ms | ease-out |
| Progress indeterminate | 1.5s (loop) | linear |

---

## Notes

- RTL support: CSS logical properties (`start`/`end` instead of `left`/`right`) where possible
- Accessibility: All interactive components need proper ARIA attributes
- Semantic zoom requires two views: "zoomed in" (normal) and "zoomed out" (grouped/jump list)
