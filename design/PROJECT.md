# Metrino - Metro UI Web Components Library

A vanilla Web Component library implementing the Windows Phone / Windows 8 Metro design system with full fidelity and modern practices.

## Project Overview

- **Name**: Metrino
- **Tech**: Vanilla Web Components (no framework dependencies)
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
│   │   ├── selection/       # ListBox, LongListSelector
│   │   ├── progress/        # ProgressBar, ProgressRing
│   │   ├── datetime/        # DatePicker, TimePicker
│   │   ├── layout/          # Grid, StackPanel, ScrollViewer
│   │   ├── primitives/      # TextBlock
│   │   └── dialogs/         # MessageDialog, Flyout
│   ├── styles/
│   │   ├── tokens.css       # CSS custom properties (theme, accent)
│   │   └── animations.css   # Metro motion language
│   ├── base/
│   │   └── MetroElement.js  # Base component class
│   └── index.js             # Component exports
├── demo/
│   └── index.html           # Single-file demo showcase
├── design/
│   └── PROJECT.md           # This file
├── package.json
└── README.md
```

---

## Component Inventory

### Navigation
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-pivot` | Tab-like navigation with sliding transition | pending |
| `metro-pivot-item` | Individual pivot section | pending |
| `metro-panorama` | Horizontal scrolling hub view | pending |
| `metro-panorama-item` | Individual panorama section | pending |
| `metro-hub` | Modern hub section container | pending |
| `metro-hub-section` | Individual hub section | pending |
| `metro-app-bar` | Bottom/top app bar | pending |
| `metro-app-bar-button` | App bar button | pending |

### Tiles
| Component | Sizes | Status |
|-----------|-------|--------|
| `metro-flip-tile` | small, medium, wide, large | pending |
| `metro-cycle-tile` | medium, wide | pending |
| `metro-iconic-tile` | small, medium, large | pending |

### Buttons
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-button` | Standard button | pending |
| `metro-hyperlink-button` | Hyperlink styled button | pending |
| `metro-repeat-button` | Fires click repeatedly while pressed | pending |

### Input
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-text-box` | Single-line text input | pending |
| `metro-password-box` | Password input | pending |
| `metro-check-box` | Checkbox control | pending |
| `metro-radio-button` | Radio button | pending |
| `metro-toggle-switch` | On/off toggle | pending |
| `metro-slider` | Slider control | pending |

### Selection
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-list-box` | Simple list selection | pending |
| `metro-long-list-selector` | Jump list with headers | pending |
| `metro-semantic-zoom` | Zoomed in/out view toggle | pending |

### Progress
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-progress-bar` | Determinate/indeterminate bar | pending |
| `metro-progress-ring` | Spinning progress indicator | pending |

### Date/Time
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-date-picker` | Native-styled date picker | pending |
| `metro-time-picker` | Native-styled time picker | pending |

### Layout
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-grid` | Grid layout container | pending |
| `metro-stack-panel` | Horizontal/vertical stack | pending |
| `metro-wrap-panel` | Wrapping layout | pending |
| `metro-scroll-viewer` | Scrollable container | pending |

### Dialogs
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-message-dialog` | Alert dialog | pending |
| `metro-flyout` | Popup flyout | pending |

### Primitives
| Component | Description | Status |
|-----------|-------------|--------|
| `metro-text-block` | Styled text container | pending |

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Create project scaffold
- [ ] Implement CSS custom properties (theme tokens)
- [ ] Create `MetroElement` base class
- [ ] Set up demo/index.html structure

### Phase 2: Layout Primitives
- [ ] `metro-stack-panel`
- [ ] `metro-grid`
- [ ] `metro-scroll-viewer`
- [ ] `metro-wrap-panel`

### Phase 3: Typography & Buttons
- [ ] `metro-text-block`
- [ ] `metro-button`
- [ ] `metro-hyperlink-button`
- [ ] `metro-repeat-button`

### Phase 4: Navigation
- [ ] `metro-pivot` + `metro-pivot-item`
- [ ] `metro-panorama` + `metro-panorama-item`
- [ ] `metro-hub` + `metro-hub-section`
- [ ] `metro-app-bar` + `metro-app-bar-button`

### Phase 5: Tiles
- [ ] `metro-flip-tile` (all sizes)
- [ ] `metro-cycle-tile` (medium, wide)
- [ ] `metro-iconic-tile` (all sizes)

### Phase 6: Input Controls
- [ ] `metro-text-box`
- [ ] `metro-password-box`
- [ ] `metro-check-box`
- [ ] `metro-radio-button`
- [ ] `metro-toggle-switch`
- [ ] `metro-slider`

### Phase 7: Selection
- [ ] `metro-list-box`
- [ ] `metro-long-list-selector`
- [ ] `metro-semantic-zoom`

### Phase 8: Progress & DateTime
- [ ] `metro-progress-bar`
- [ ] `metro-progress-ring`
- [ ] `metro-date-picker`
- [ ] `metro-time-picker`

### Phase 9: Dialogs
- [ ] `metro-message-dialog`
- [ ] `metro-flyout`

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
