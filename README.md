# Metrino

A Lit Web Component library implementing the Windows Phone / Windows 8 Metro design system. Built with TypeScript for modern web applications.

## Installation

```bash
npm install metrino
# or
yarn add metrino
# or
pnpm add metrino
# or
bun add metrino
```

### Peer Dependencies

Metrino requires `lit` as a peer dependency:

```bash
npm install lit
```

## Usage

### Full Bundle

Import all components at once:

```typescript
import 'metrino';
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
import 'metrino/button';
import 'metrino/pivot';
import 'metrino/pivot-item';
import 'metrino/flip-tile';
```

### Import Classes for TypeScript

```typescript
import { MetroButton, MetroPivot } from 'metrino';

// Use for type annotations or subclassing
const button: MetroButton = document.querySelector('metro-button');
```

### CSS Bundle Only

If you only need the CSS custom properties (without components):

```typescript
import 'metrino/styles.css';
```

## Components

### Buttons
- `metro-button` - Standard button
- `metro-hyperlink-button` - Link-styled button
- `metro-repeat-button` - Button that repeats on hold

### Date & Time
- `metro-date-picker` - Date selection control
- `metro-date-picker-roller` - Roller-style date picker
- `metro-time-picker` - Time selection control
- `metro-time-picker-roller` - Roller-style time picker

### Dialogs
- `metro-content-dialog` - Custom content dialog
- `metro-flyout` - Lightweight popup
- `metro-message-dialog` - Alert/message dialog

### Input
- `metro-auto-suggest-box` - Autocomplete input
- `metro-check-box` - Checkbox control
- `metro-combo-box` - Dropdown select
- `metro-number-box` - Numeric input
- `metro-password-box` - Password input
- `metro-radio-button` - Radio button
- `metro-rating` - Star rating control
- `metro-slider` - Range slider
- `metro-text-box` - Text input
- `metro-toggle-switch` - Toggle/switch control

### Layout
- `metro-grid` - CSS Grid wrapper
- `metro-scroll-viewer` - Scrollable container
- `metro-stack-panel` - Flexbox stack
- `metro-tile-grid` - Grid for tiles
- `metro-wrap-panel` - Wrapping flex container

### Navigation
- `metro-app-bar` - Top app bar
- `metro-app-bar-button` - App bar button
- `metro-hub` - Hub/section navigation
- `metro-hub-section` - Hub section
- `metro-panorama` - Panoramic view
- `metro-panorama-item` - Panorama item
- `metro-pivot` - Tab/tabs navigation
- `metro-pivot-item` - Pivot tab item
- `metro-split-view` - Sidebar/main layout

### Primitives
- `metro-expander` - Expandable section
- `metro-icon` - Icon component
- `metro-info-bar` - Info/warning bar
- `metro-menu-flyout` - Context menu
- `metro-person-picture` - Avatar component
- `metro-text-block` - Text display
- `metro-toast` - Toast notification
- `metro-tooltip` - Tooltip component

### Progress
- `metro-progress-bar` - Linear progress
- `metro-progress-ring` - Circular progress

### Selection
- `metro-list-box` - List selection
- `metro-long-list-selector` - Virtualized list
- `metro-semantic-zoom` - Zoom between views

### Tiles
- `metro-cycle-tile` - Cycling image tile
- `metro-flip-tile` - Flipping tile
- `metro-iconic-tile` - Icon-based tile
- `metro-live-tile` - Live updating tile

## Theming

Metrino uses CSS custom properties for theming. Override these in your CSS:

```css
:root {
  --metro-accent: #0078d4;
  --metro-accent-light: #429ce3;
  --metro-accent-dark: #005a9e;
  --metro-background: #1f1f1f;
  --metro-foreground: #ffffff;
  --metro-foreground-secondary: rgba(255, 255, 255, 0.7);
  --metro-font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  --metro-transition-fast: 167ms;
  --metro-transition-normal: 250ms;
  --metro-transition-slow: 333ms;
  --metro-easing: cubic-bezier(0.1, 0.9, 0.2, 1);
}
```

### Light Theme Example

```css
[data-theme="light"] {
  --metro-background: #ffffff;
  --metro-foreground: #1f1f1f;
  --metro-foreground-secondary: rgba(0, 0, 0, 0.7);
}
```

## Publishing

The package uses a `prepublishOnly` hook that automatically builds before publishing.

### One-liner (CI or local)

```bash
npm publish
```

This will:
1. Run `vite build` (generates ESM/CJS modules)
2. Run `tsc -p tsconfig.build.json` (generates `.d.ts` files)
3. Publish to npm

### Manual build (without publishing)

```bash
npm run build
```

### CI Workflow Example

```yaml
- run: npm ci
- run: npm publish --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## License

MIT © Angel D. Munoz
