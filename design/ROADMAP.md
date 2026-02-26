# Metrino Roadmap: Remaining Large Effort Items

This document tracks the remaining work needed to achieve full Metro Design Language compliance. These items require significant engineering effort (L = Large) and are prioritized for future implementation.

## Current Status

The following S (Small) and M (Medium) effort fixes have been completed:
- Typography type ramp (15px body, 26px header-2, 56px display, 11px badge)
- Dark theme background (#000000)
- Secondary text opacity (60%)
- Metro easing function applied to all transitions
- Turnstile animation (correct rotation angles, scale transforms, timing)
- Continuum stagger (logarithmic pattern)
- Flip tile horizontal axis (rotateY)
- Toggle switch spring animation
- Touch target padding for toggle controls
- Settings flyout width (346px)
- Border default thickness (2px)
- Live tile pseudo-random interval (6-10s)
- Panorama parallax ratio (0.2:1)
- Tilt effect applied to buttons

---

## PRIORITY 1: Touch Physics Engine

**Effort:** L (Large)  
**Impact:** Critical - Core Metro "fast and fluid" feel

### Missing Features

| Feature | Spec Reference | Components Affected |
|---------|----------------|---------------------|
| **Inertia Scrolling** | `v(t) = v₀ × e^(-kt)`, k≈0.97 per frame | list-view, grid-view, flip-view, long-list-selector, panorama |
| **Boundary Bounce** | Spring compression with resistance, critically damped return | All scrollable components |
| **Tap vs Drag Threshold** | ~2.7mm / 10px radius | All interactive components |
| **Cross-Slide Selection** | 10-30px perpendicular drag locks item | list-view, grid-view, long-list-selector |
| **Rails (Axis Lock)** | Lock to primary axis unless deviation > 30-45° | All scrollable containers |

### Implementation Plan

Create `/src/utils/touch-physics.ts`:

```typescript
// InertiaScroller - exponential deceleration
export class InertiaScroller {
  private velocity = 0;
  private friction = 0.97; // k coefficient per frame
  
  start(initialVelocity: number): void;
  update(deltaTime: number): number; // returns new position offset
  isMoving(): boolean;
  stop(): void;
}

// GestureDisambiguator - tap/drag/cross-slide detection  
export class GestureDisambiguator {
  private tapThreshold = 10; // pixels
  private crossSlideThreshold = 10; // pixels perpendicular
  
  onPointerDown(e: PointerEvent): void;
  onPointerMove(e: PointerEvent): GestureType; // 'tap' | 'drag' | 'cross-slide' | null
  onPointerUp(e: PointerEvent): GestureResult;
}

// BoundarySpring - bounce physics
export class BoundarySpring {
  private stiffness = 0.1;
  private damping = 0.7; // critical damping
  
  compress(overScroll: number): number;
  release(): { position: number; velocity: number };
}

// AxisRail - directional locking
export class AxisRail {
  private lockAngle = 30; // degrees
  private locked: 'x' | 'y' | null = null;
  
  feedMovement(dx: number, dy: number): { x: number; y: number };
  reset(): void;
}
```

### Affected Files
- `src/components/selection/list-view.ts`
- `src/components/selection/grid-view.ts`
- `src/components/selection/flip-view.ts`
- `src/components/selection/long-list-selector.ts`
- `src/components/navigation/panorama.ts`
- `src/components/layout/scroll-viewer.ts`

---

## PRIORITY 2: Pivot Circular Loop

**Effort:** M (Medium-Large)  
**Impact:** High - Key navigation pattern

### Current Behavior
Headers stop at first/last item. No wrap-around.

### Required Behavior
Per spec Section 7.2: "The headers loop infinitely (circular buffer)"

### Implementation Plan

1. Implement virtual header list with duplicated endpoints
2. Add seamless wrap animation when crossing boundary
3. Maintain selection state across wrap

### Affected Files
- `src/components/navigation/pivot.ts`

---

## PRIORITY 3: SemanticZoom Scroll Coordination

**Effort:** M (Medium)  
**Impact:** High - Core feature incomplete

### Current Behavior
Zoom in/out works but scroll position is not synchronized between views.

### Required Behavior
Per spec Section 6.1: "The control automatically synchronizes the scroll position. If user zooms out from 'W' section and taps 'A', ZoomedInView re-enters at 'A' section."

### Implementation Plan

1. Add `scrollToGroup(key: string)` method to zoomed-in view
2. Track current group key during scroll
3. On zoom-out item tap, pass key to zoomed-in view
4. Animate scroll to target group

### Affected Files
- `src/components/selection/semantic-zoom.ts`

---

## PRIORITY 4: Panorama Circular Wrapping

**Effort:** M (Medium)  
**Impact:** Medium - Navigation completeness

### Current Behavior
Stops at first/last panel.

### Required Behavior
Per spec Section 7.1: "The control is circular - scrolling past the last panel wraps seamlessly back to the first"

### Implementation Plan

1. Clone first/last panels for seamless wrap illusion
2. Implement jump-back animation after reaching clone
3. Maintain multi-layer parallax across wrap

### Affected Files
- `src/components/navigation/panorama.ts`
- `src/components/navigation/panorama-item.ts`

---

## PRIORITY 5: Hub + SemanticZoom Integration

**Effort:** M (Medium)  
**Impact:** Medium - Feature completeness

### Current Behavior
Hub and SemanticZoom exist but are not integrated.

### Required Behavior
Per spec Section 6.4: "Hubs almost always support Semantic Zoom to navigate sections"

### Implementation Plan

1. Add `zoomable` attribute to Hub
2. Wrap Hub content in SemanticZoom automatically
3. Generate zoomed-out view from section headers
4. Coordinate scroll between views

### Affected Files
- `src/components/navigation/hub.ts`
- `src/components/navigation/hub-section.ts`

---

## PRIORITY 6: LongListSelector Jump Grid Transition

**Effort:** M (Medium)  
**Impact:** Medium - UX enhancement

### Current Behavior
Jump list is a sidebar strip, always visible.

### Required Behavior
Per spec Section 5.4: "Tapping a header triggers a 'Turnstile' transition to a grid of available headers (the 'Jump List')"

### Implementation Plan

1. Add full-screen jump grid mode
2. Implement Turnstile transition to/from grid
3. Keep current sidebar mode as compact option

### Affected Files
- `src/components/selection/long-list-selector.ts`

---

## PRIORITY 7: Swivel Transition for Dialogs

**Effort:** S-M (Small-Medium)  
**Impact:** Medium - Animation completeness

### Current Behavior
Dialogs use scale + translate animation.

### Required Behavior
Per spec Section 5.2: "Swivel: The element rotates into view around its center horizontal axis... rotates from 90 degrees to 0 degrees. Duration: 250-300ms"

### Implementation Plan

Add swivel keyframes:
```css
@keyframes swivelIn {
  from {
    opacity: 0;
    transform: perspective(1000px) rotateX(90deg);
  }
  to {
    opacity: 1;
    transform: perspective(1000px) rotateX(0deg);
  }
}
```

### Affected Files
- `src/styles/animations.css`
- `src/components/dialogs/content-dialog.ts`
- `src/components/dialogs/message-dialog.ts`
- `src/components/dialogs/flyout.ts`

---

## PRIORITY 8: ScrollViewer Auto-Hide Scrollbars

**Effort:** S (Small)  
**Impact:** Low - Polish

### Current Behavior
Scrollbars are always visible (8px width).

### Required Behavior
Per spec Section 9.2: "Scrollbars should be hidden when not interacting, or styled to be minimal overlay bars"

### Implementation Plan

1. Add `scrollbarMode="auto" | "visible" | "hidden"` attribute
2. Use CSS overlay scrollbar properties where supported
3. Implement JS-based show/hide on scroll interaction

### Affected Files
- `src/components/layout/scroll-viewer.ts`

---

## PRIORITY 9: Tilt Effect for Remaining Components

**Effort:** M (Medium)  
**Impact:** Low - Micro-interaction completeness

### Components Missing Tilt
- `metro-check-box`
- `metro-radio-button`
- `metro-flip-tile`, `metro-live-tile`, `metro-cycle-tile`, `metro-iconic-tile`
- `metro-app-bar-button`, `metro-app-bar-toggle-button`
- List items in `metro-list-view`, `metro-grid-view`, `metro-long-list-selector`

### Implementation
Apply `applyTiltEffect()` from `shared.ts` in `connectedCallback()`.

---

## PRIORITY 10: RTL Support

**Effort:** L (Large)  
**Impact:** Low - Accessibility/Internationalization

### Current State
~86 instances of `left`/`right` CSS properties should use logical properties.

### Implementation Plan
Replace:
- `left` → `inset-inline-start`
- `right` → `inset-inline-end`
- `margin-left` → `margin-inline-start`
- `margin-right` → `margin-inline-end`
- `padding-left` → `padding-inline-start`
- `padding-right` → `padding-inline-end`
- `border-left` → `border-inline-start`
- `border-right` → `border-inline-end`

---

## Missing Components (Future Work)

These components from the Metro design language are not yet implemented:

| Component | Description | Effort |
|-----------|-------------|--------|
| **Command Bar** | Win8.1 app bar with primary/secondary commands | M |
| **Charms Bar** | Edge swipe panels (Search, Share, Settings, Devices, Start) | L |
| **Status Bar** | System status (clock, battery, signal) | S |
| **Lock Screen** | Showcase component with time/date | M |
| **Breadcrumb Bar** | Navigation trail | S |
| **Tab View** | Tab strip (distinct from Pivot) | M |
| **Color Picker** | Color selection control | M |
| **Teaching Tip** | Contextual tutorial popup | M |
| **Ink Canvas** | Drawing surface | L |

---

## Summary

| Priority | Count | Total Effort |
|----------|-------|--------------|
| P1 Touch Physics | 1 | L |
| P2 Pivot Loop | 1 | M |
| P3 SemanticZoom Sync | 1 | M |
| P4 Panorama Wrap | 1 | M |
| P5 Hub+Zoom | 1 | M |
| P6 Jump Grid | 1 | M |
| P7 Swivel | 1 | S-M |
| P8 Auto-hide | 1 | S |
| P9 Tilt | 9 components | M |
| P10 RTL | 86 instances | L |

**Recommended Order:**
1. Touch Physics Engine (highest impact)
2. SemanticZoom Scroll Coordination
3. Pivot Circular Loop
4. Swivel Transition
5. ScrollViewer Auto-hide
6. Remaining tilt effects
7. Panorama wrap
8. Hub integration
9. RTL support
