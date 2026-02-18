/**
 * Touch Physics Engine for Metro "Fast and Fluid" interactions.
 *
 * Pure, function-based architecture for testability.
 * All functions are stateless or operate on plain state objects.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type GestureType = "tap" | "drag-x" | "drag-y" | "cross-slide" | null;

export interface GestureResult {
  type: GestureType;
  dx: number;
  dy: number;
  velocityX: number;
  velocityY: number;
  duration: number;
}

export interface InertiaState {
  velocity: number;
  position: number;
  moving: boolean;
}

export interface SpringState {
  position: number;
  velocity: number;
  settled: boolean;
}

export interface AxisRailState {
  locked: "x" | "y" | null;
  totalDx: number;
  totalDy: number;
}

export interface GestureState {
  startX: number;
  startY: number;
  startTime: number;
  currentX: number;
  currentY: number;
  currentTime: number;
  resolved: GestureType;
  samples: Array<{ x: number; y: number; time: number }>;
}

export interface PointerInfo {
  clientX: number;
  clientY: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

/** Friction coefficient per frame (~60fps). Spec: k ≈ 0.97 */
export const INERTIA_FRICTION = 0.97;

/** Minimum velocity (px/frame) below which inertia stops */
export const INERTIA_MIN_VELOCITY = 0.5;

/** Tap/drag disambiguation threshold in pixels */
export const GESTURE_THRESHOLD = 10;

/** Cross-slide detection threshold in perpendicular pixels */
export const CROSS_SLIDE_THRESHOLD = 10;

/** Boundary spring stiffness */
export const SPRING_STIFFNESS = 0.1;

/** Boundary spring damping (critically damped) */
export const SPRING_DAMPING = 0.7;

/** Boundary drag resistance factor (0-1, lower = more resistance) */
export const BOUNDARY_RESISTANCE = 0.4;

/** Axis lock deviation angle in degrees */
export const AXIS_LOCK_ANGLE = 30;

/** Max velocity samples to keep for velocity calculation */
export const MAX_VELOCITY_SAMPLES = 5;

// ─── Inertia Functions ───────────────────────────────────────────────────────

/**
 * Create initial inertia state.
 */
export function createInertiaState(
  velocity: number = 0,
  position: number = 0
): InertiaState {
  return {
    velocity,
    position,
    moving: Math.abs(velocity) > INERTIA_MIN_VELOCITY,
  };
}

/**
 * Advance inertia by one frame. Returns new state (immutable).
 * Applies exponential decay: v(t) = v₀ × friction^frames
 */
export function stepInertia(
  state: InertiaState,
  friction: number = INERTIA_FRICTION
): InertiaState {
  if (!state.moving) return state;

  const velocity = state.velocity * friction;
  const position = state.position + velocity;
  const moving = Math.abs(velocity) > INERTIA_MIN_VELOCITY;

  return { velocity: moving ? velocity : 0, position, moving };
}

/**
 * Calculate the total distance inertia will travel before stopping.
 * Useful for predicting snap targets.
 *
 * Sum of geometric series: d = v₀ × friction / (1 - friction)
 */
export function predictInertiaDistance(
  velocity: number,
  friction: number = INERTIA_FRICTION
): number {
  if (Math.abs(velocity) < INERTIA_MIN_VELOCITY) return 0;
  return (velocity * friction) / (1 - friction);
}

/**
 * Calculate velocity from a sequence of pointer samples.
 * Uses the last few samples for a smoothed velocity estimate.
 */
export function calculateVelocity(
  samples: Array<{ x: number; y: number; time: number }>,
  axis: "x" | "y" = "x"
): number {
  if (samples.length < 2) return 0;

  const recent = samples.slice(-MAX_VELOCITY_SAMPLES);
  const first = recent[0];
  const last = recent[recent.length - 1];
  const dt = last.time - first.time;

  if (dt <= 0) return 0;

  const dp = axis === "x" ? last.x - first.x : last.y - first.y;
  // Convert from px/ms to px/frame (assuming 60fps ≈ 16.67ms/frame)
  return (dp / dt) * 16.67;
}

// ─── Boundary Spring Functions ───────────────────────────────────────────────

/**
 * Calculate the resisted offset when dragging past a boundary.
 * Returns how far the content should actually move (less than the drag distance).
 */
export function compressBoundary(
  overscroll: number,
  resistance: number = BOUNDARY_RESISTANCE
): number {
  return overscroll * resistance;
}

/**
 * Create initial spring state for boundary release animation.
 */
export function createSpringState(
  position: number,
  velocity: number = 0
): SpringState {
  return {
    position,
    velocity,
    settled: Math.abs(position) < 0.5 && Math.abs(velocity) < 0.5,
  };
}

/**
 * Advance spring simulation by one frame.
 * Critically damped spring returning to position = 0.
 */
export function stepSpring(
  state: SpringState,
  stiffness: number = SPRING_STIFFNESS,
  damping: number = SPRING_DAMPING
): SpringState {
  if (state.settled) return state;

  // Hooke's law + damping: a = -kx - bv
  const acceleration = -stiffness * state.position - damping * state.velocity;
  const velocity = state.velocity + acceleration;
  const position = state.position + velocity;
  const settled = Math.abs(position) < 0.5 && Math.abs(velocity) < 0.5;

  return {
    velocity: settled ? 0 : velocity,
    position: settled ? 0 : position,
    settled,
  };
}

// ─── Gesture Disambiguation Functions ────────────────────────────────────────

/**
 * Create initial gesture state from a pointer-down event.
 */
export function createGestureState(pointer: PointerInfo): GestureState {
  const now = performance.now();
  return {
    startX: pointer.clientX,
    startY: pointer.clientY,
    startTime: now,
    currentX: pointer.clientX,
    currentY: pointer.clientY,
    currentTime: now,
    resolved: null,
    samples: [{ x: pointer.clientX, y: pointer.clientY, time: now }],
  };
}

/**
 * Update gesture state with a pointer-move event.
 * Returns updated state with gesture type resolved if threshold exceeded.
 */
export function updateGesture(
  state: GestureState,
  pointer: PointerInfo
): GestureState {
  const now = performance.now();
  const dx = pointer.clientX - state.startX;
  const dy = pointer.clientY - state.startY;
  const samples = [
    ...state.samples,
    { x: pointer.clientX, y: pointer.clientY, time: now },
  ].slice(-MAX_VELOCITY_SAMPLES);

  const updated: GestureState = {
    ...state,
    currentX: pointer.clientX,
    currentY: pointer.clientY,
    currentTime: now,
    samples,
  };

  // Already resolved
  if (state.resolved) return updated;

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Not past threshold yet
  if (distance < GESTURE_THRESHOLD) return updated;

  // Determine gesture type
  if (absDx > absDy) {
    // Primary axis is horizontal
    if (absDy > CROSS_SLIDE_THRESHOLD) {
      updated.resolved = "cross-slide";
    } else {
      updated.resolved = "drag-x";
    }
  } else {
    updated.resolved = "drag-y";
  }

  return updated;
}

/**
 * Finalize gesture on pointer-up. Returns the gesture result.
 */
export function resolveGesture(state: GestureState): GestureResult {
  const dx = state.currentX - state.startX;
  const dy = state.currentY - state.startY;
  const duration = state.currentTime - state.startTime;

  return {
    type: state.resolved ?? "tap",
    dx,
    dy,
    velocityX: calculateVelocity(state.samples, "x"),
    velocityY: calculateVelocity(state.samples, "y"),
    duration,
  };
}

// ─── Axis Rail Functions ─────────────────────────────────────────────────────

/**
 * Create initial axis rail state.
 */
export function createAxisRailState(): AxisRailState {
  return { locked: null, totalDx: 0, totalDy: 0 };
}

/**
 * Feed a movement delta into the axis rail.
 * Returns the filtered movement (cross-axis component zeroed when locked)
 * and the updated state.
 */
export function feedAxisRail(
  state: AxisRailState,
  dx: number,
  dy: number
): { movement: { x: number; y: number }; state: AxisRailState } {
  const totalDx = state.totalDx + dx;
  const totalDy = state.totalDy + dy;
  const newState: AxisRailState = { ...state, totalDx, totalDy };

  // If not yet locked, check if we should lock
  if (!state.locked) {
    const distance = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
    if (distance > GESTURE_THRESHOLD) {
      newState.locked = Math.abs(totalDx) > Math.abs(totalDy) ? "x" : "y";
    }
    // Before locking, allow free movement
    return { movement: { x: dx, y: dy }, state: newState };
  }

  // Check if deviation angle exceeds threshold → unlock
  const angle =
    (Math.atan2(Math.abs(totalDy), Math.abs(totalDx)) * 180) / Math.PI;

  if (state.locked === "x" && angle > AXIS_LOCK_ANGLE) {
    newState.locked = "y";
  } else if (state.locked === "y" && 90 - angle > AXIS_LOCK_ANGLE) {
    newState.locked = "x";
  }

  // Apply rail: zero out the cross-axis
  if (newState.locked === "x") {
    return { movement: { x: dx, y: 0 }, state: newState };
  } else {
    return { movement: { x: 0, y: dy }, state: newState };
  }
}

/**
 * Reset the axis rail state (e.g., on pointer-up).
 */
export function resetAxisRail(): AxisRailState {
  return createAxisRailState();
}

// ─── Pointer Event Helpers ───────────────────────────────────────────────────

/**
 * Check whether PointerEvent is supported in the current environment.
 */
export function supportsPointerEvents(): boolean {
  return typeof PointerEvent !== "undefined";
}

/**
 * Extract a PointerInfo from a PointerEvent, TouchEvent, or MouseEvent.
 * Normalizes touch events to use the first touch point.
 */
export function normalizePointerEvent(
  e: PointerEvent | TouchEvent | MouseEvent
): PointerInfo {
  if ("touches" in e) {
    const touch = e.touches[0] ?? (e as TouchEvent).changedTouches[0];
    return { clientX: touch?.clientX ?? 0, clientY: touch?.clientY ?? 0 };
  }
  return { clientX: (e as MouseEvent).clientX, clientY: (e as MouseEvent).clientY };
}

/**
 * Attach pointer/touch/mouse handlers to an element using the best available API.
 * Returns a cleanup function to remove all listeners.
 */
export function attachPointerHandlers(
  element: HTMLElement,
  handlers: {
    onDown: (info: PointerInfo, e: Event) => void;
    onMove: (info: PointerInfo, e: Event) => void;
    onUp: (info: PointerInfo, e: Event) => void;
  }
): () => void {
  if (supportsPointerEvents()) {
    const down = (e: Event) => handlers.onDown(normalizePointerEvent(e as PointerEvent), e);
    const move = (e: Event) => handlers.onMove(normalizePointerEvent(e as PointerEvent), e);
    const up = (e: Event) => handlers.onUp(normalizePointerEvent(e as PointerEvent), e);

    element.addEventListener("pointerdown", down);
    element.addEventListener("pointermove", move);
    element.addEventListener("pointerup", up);
    element.addEventListener("pointercancel", up);

    return () => {
      element.removeEventListener("pointerdown", down);
      element.removeEventListener("pointermove", move);
      element.removeEventListener("pointerup", up);
      element.removeEventListener("pointercancel", up);
    };
  }

  // Fallback: touch + mouse
  const touchStart = (e: Event) => handlers.onDown(normalizePointerEvent(e as TouchEvent), e);
  const touchMove = (e: Event) => handlers.onMove(normalizePointerEvent(e as TouchEvent), e);
  const touchEnd = (e: Event) => handlers.onUp(normalizePointerEvent(e as TouchEvent), e);
  const mouseDown = (e: Event) => handlers.onDown(normalizePointerEvent(e as MouseEvent), e);
  const mouseMove = (e: Event) => handlers.onMove(normalizePointerEvent(e as MouseEvent), e);
  const mouseUp = (e: Event) => handlers.onUp(normalizePointerEvent(e as MouseEvent), e);

  element.addEventListener("touchstart", touchStart, { passive: false });
  element.addEventListener("touchmove", touchMove, { passive: false });
  element.addEventListener("touchend", touchEnd);
  element.addEventListener("touchcancel", touchEnd);
  element.addEventListener("mousedown", mouseDown);
  element.addEventListener("mousemove", mouseMove);
  element.addEventListener("mouseup", mouseUp);

  return () => {
    element.removeEventListener("touchstart", touchStart);
    element.removeEventListener("touchmove", touchMove);
    element.removeEventListener("touchend", touchEnd);
    element.removeEventListener("touchcancel", touchEnd);
    element.removeEventListener("mousedown", mouseDown);
    element.removeEventListener("mousemove", mouseMove);
    element.removeEventListener("mouseup", mouseUp);
  };
}
