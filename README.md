# Metrino

A Lit Web Component library implementing the Windows Phone / Windows 8 Metro design system. Built with TypeScript for modern web applications.

## Installation

Metrino is published to [GitHub Packages](https://github.com/AngelMunoz/metrino/packages). Configure the registry first:

```bash
npm config set @angelmunoz:registry https://npm.pkg.github.com
```

Or add to your project's `.npmrc`:

```
@angelmunoz:registry=https://npm.pkg.github.com
```

Then install:

```bash
npm install @angelmunoz/metrino
# or
pnpm add @angelmunoz/metrino
```

### Peer Dependencies

Metrino requires `lit` and `@mdi/js` as peer dependencies:

```bash
npm install lit @mdi/js
```

## Usage

### Full Bundle

Import all components at once:

```typescript
import '@angelmunoz/metrino';
```

```html
<metro-button accent>Click Me</metro-button>
<metro-pivot>
  <metro-pivot-item header="Tab 1">Content 1</metro-pivot-item>
  <metro-pivot-item header="Tab 2">Content 2</metro-pivot-item>
</metro-pivot>
```

### Cherry-Pick Components

Import only the components you need for smaller bundle sizes:

```typescript
import '@angelmunoz/metrino/button';
import '@angelmunoz/metrino/pivot';
import '@angelmunoz/metrino/pivot-item';
import '@angelmunoz/metrino/flip-tile';
```

### Import Classes for TypeScript

```typescript
import { MetroButton, MetroPivot } from '@angelmunoz/metrino';

const button: MetroButton = document.querySelector('metro-button');
```

### CSS Bundle Only

If you only need the CSS custom properties (without components):

```typescript
import '@angelmunoz/metrino/styles.css';
```

## Components

### Buttons
- `metro-button` - Standard push button with accent color variant
- `metro-hyperlink-button` - Link-styled navigation button
- `metro-repeat-button` - Button that fires repeatedly on hold
- `metro-dropdown-button` - Button that reveals a dropdown menu

### Date & Time
- `metro-date-picker` - Calendar date selection
- `metro-date-picker-roller` - Roller-style date picker
- `metro-time-picker` - Time selection
- `metro-time-picker-roller` - Roller-style time picker
- `metro-calendar` - Month view calendar display
- `metro-calendar-date-picker` - Inline calendar picker

### Dialogs
- `metro-content-dialog` - Custom content modal
- `metro-message-dialog` - Alert/confirmation dialog
- `metro-flyout` - Contextual popup
- `metro-settings-flyout` - Settings panel (346px width)
- `metro-toast` - Notification banner
- `metro-menu-flyout` - Menu commands popup

### Input
- `metro-text-box` - Single-line text input
- `metro-password-box` - Password input with reveal toggle
- `metro-number-box` - Numeric input with spinners
- `metro-check-box` - Checkbox control
- `metro-radio-button` - Radio button for mutually exclusive choices
- `metro-toggle-switch` - On/off sliding switch
- `metro-slider` - Range value selector
- `metro-rating` - Star rating control
- `metro-combo-box` - Dropdown selection
- `metro-auto-suggest-box` - Autocomplete input
- `metro-rich-edit-box` - Rich text editor

### Layout
- `metro-grid` - CSS Grid container
- `metro-stack-panel` - Vertical/horizontal flexbox stack
- `metro-wrap-panel` - Flowing wrap layout
- `metro-scroll-viewer` - Scrollable container with touch physics
- `metro-viewbox` - Scalable content container
- `metro-canvas` - Absolute positioning container
- `metro-tile-grid` - Responsive tile layout
- `metro-variable-sized-wrap-grid` - Mixed-size flow layout

### Navigation
- `metro-pivot` - Tab-based navigation
- `metro-pivot-item` - Pivot tab content
- `metro-hub` - Horizontal section grouping
- `metro-hub-section` - Hub content section
- `metro-panorama` - Full-screen horizontal scrolling view
- `metro-panorama-item` - Panorama panel
- `metro-split-view` - Collapsible sidebar layout
- `metro-app-bar` - Bottom command bar
- `metro-app-bar-button` - Circular icon button for app bar
- `metro-app-bar-toggle-button` - Checkable command button
- `metro-app-bar-separator` - Visual divider

### Primitives
- `metro-icon` - Material Design icons (via @mdi/js)
- `metro-text-block` - Typography element
- `metro-border` - Styled container
- `metro-image` - Image display
- `metro-person-picture` - Contact avatar
- `metro-expander` - Collapsible section
- `metro-info-bar` - Informational banner
- `metro-tooltip` - Hover information
- `metro-toast` - Notification
- `metro-context-menu` - Right-click menu
- `metro-menu-flyout` - Popup menu
- `metro-rich-text-block` - Formatted text
- `metro-media-element` - Audio/video player

### Progress
- `metro-progress-bar` - Determinate linear progress
- `metro-progress-ring` - Indeterminate circular spinner

### Selection
- `metro-list-box` - Selectable item list
- `metro-list-view` - Virtualized list with gestures
- `metro-grid-view` - Virtualized tiled grid
- `metro-flip-view` - Swipeable carousel
- `metro-tree-view` - Hierarchical expandable list
- `metro-long-list-selector` - Virtualized list with jump grid
- `metro-semantic-zoom` - Zoom between overview and detail views
- `metro-list-picker` - Modal selection dialog

### Tiles
- `metro-live-tile` - Animated content updates
- `metro-flip-tile` - 3D rotation effect
- `metro-cycle-tile` - Rotating content
- `metro-iconic-tile` - Icon with counter

## Theming

Metrino uses CSS custom properties for theming and respects `prefers-color-scheme` automatically. Override tokens in your CSS:

```css
:root {
  --metro-accent: #0078d4;
  --metro-accent-light: #429ce3;
  --metro-accent-dark: #005a9e;
  --metro-background: #000000;
  --metro-background-alt: #1a1a1a;
  --metro-surface: rgba(255, 255, 255, 0.05);
  --metro-foreground: #ffffff;
  --metro-foreground-secondary: rgba(255, 255, 255, 0.6);
  --metro-border: rgba(255, 255, 255, 0.2);
  --metro-highlight: rgba(255, 255, 255, 0.1);
  --metro-font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  --metro-transition-fast: 167ms;
  --metro-transition-normal: 250ms;
  --metro-transition-slow: 333ms;
  --metro-easing: cubic-bezier(0.1, 0.9, 0.2, 1);
}
```

### Manual Theme Switch

Use `data-theme` on `<html>` to override the system preference:

```html
<html data-theme="light">
```

### Accent Colors

21 accent colors are available via the `accent` attribute:

```html
<html accent="red">
```

Available: `blue` (default), `red`, `orange`, `green`, `teal`, `purple`, `magenta`, `lime`, `brown`, `pink`, `mango`, `cobalt`, `indigo`, `violet`, `crimson`, `emerald`, `mauve`, `sienna`, `olive`, `steel`, `taupe`.

## License

MIT © Angel D. Munoz
