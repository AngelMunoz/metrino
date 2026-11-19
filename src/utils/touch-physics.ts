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
  /** Pointer velocity along the x axis at release, in px/ms. */
  velocityX: number;
  /** Pointer velocity along the y axis at release, in px/ms. */
  velocityY: number;
  duration: number;
}

export interface InertiaState {
  /** px/ms */
  velocity: number;
  /** px travelled */
  position: number;
  moving: boolean;
}

export interface SpringState {
  /** Overscroll in px from the resting position (0) */
  position: number;
  /** px/ms */
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

/**
 * Duration (ms) of the reference frame the per-frame physics constants are
 * tuned for (~60fps). All velocities in this module are px/ms, so every step
 * converts elapsed milliseconds into reference frames with this divisor.
 */
const REFERENCE_FRAME_MS = 16.67;

/**
 * Upper bound (ms) accepted for one animation step. A longer gap means the tab
 * was throttled or a frame was dropped; integrating it whole would teleport the
 * content, so the step is clamped instead.
 */
const MAX_FRAME_DELTA_MS = 64;

/**
 * Integration interval (ms) of the boundary spring. Explicit Euler needs a
 * constant small interval to stay stable and give the same path per elapsed
 * millisecond, so a long `dtMs` is run as several sub-steps.
 */
const SPRING_SUB_STEP_MS = REFERENCE_FRAME_MS / 4;

/** Friction coefficient per reference frame (~60fps). Spec: k ≈ 0.97 */
export const INERTIA_FRICTION = 0.97;

/** Minimum velocity (px/ms) below which inertia stops */
export const INERTIA_MIN_VELOCITY = 0.5 / REFERENCE_FRAME_MS;

/** Tap/drag disambiguation threshold in pixels */
export const GESTURE_THRESHOLD = 10;

/** Cross-slide detection threshold in perpendicular pixels */
export const CROSS_SLIDE_THRESHOLD = 10;

/** Boundary spring stiffness (per reference frame) */
export const SPRING_STIFFNESS = 0.1;

/** Boundary spring damping (per reference frame, critically damped) */
export const SPRING_DAMPING = 0.7;

/** Distance (px) below which the boundary spring counts as settled */
export const SPRING_SETTLE_DISTANCE = 0.5;

/** Velocity (px/ms) below which the boundary spring counts as settled */
export const SPRING_SETTLE_VELOCITY = 0.5 / REFERENCE_FRAME_MS;

/** Boundary drag resistance factor (0-1, lower = more resistance) */
export const BOUNDARY_RESISTANCE = 0.4;

/** Axis lock deviation angle in degrees */
export const AXIS_LOCK_ANGLE = 30;

/** Max velocity samples to keep for velocity calculation */
export const MAX_VELOCITY_SAMPLES = 5;

// ─── Inertia Functions ───────────────────────────────────────────────────────

/**
 * Create initial inertia state.
 * @param velocity - Starting velocity in px/ms
 * @param position - travelled distance in px
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
 * Elapsed milliseconds for one animation step, from requestAnimationFrame
 * timestamps. The first step of an animation has no previous timestamp and
 * runs at the reference frame rate; longer gaps are clamped to
 * {@link MAX_FRAME_DELTA_MS}.
 *
 * @param lastTimestamp - Timestamp of the previous frame, or null on the first
 * @param timestamp - Timestamp of the current frame
 * @returns elapsed time in ms
 */
export function frameDeltaMs(
  lastTimestamp: number | null,
  timestamp: number
): number {
  if (lastTimestamp === null) return REFERENCE_FRAME_MS;
  return Math.min(Math.max(timestamp - lastTimestamp, 0), MAX_FRAME_DELTA_MS);
}

/**
 * Advance inertia by `dtMs`. Returns new state (immutable).
 * Applies exponential decay: v(t) = v₀ × friction^(t / reference frame).
 * The step moves by the mean velocity over the interval, so the travelled
 * distance does not depend on how the interval was split into frames.
 */
export function stepInertia(
  state: InertiaState,
  dtMs: number,
  friction: number = INERTIA_FRICTION
): InertiaState {
  if (!state.moving) return state;

  const velocity = state.velocity * friction ** (dtMs / REFERENCE_FRAME_MS);
  const position = state.position + ((state.velocity + velocity) / 2) * dtMs;
  const moving = Math.abs(velocity) > INERTIA_MIN_VELOCITY;

  return { velocity: moving ? velocity : 0, position, moving };
}

/**
 * Calculate the total distance (px) inertia will travel before stopping.
 * Useful for predicting snap targets.
 *
 * Sum of the geometric series over reference frames:
 * d = v₀ × frame × friction / (1 - friction), with `velocity` in px/ms.
 */
export function predictInertiaDistance(
  velocity: number,
  friction: number = INERTIA_FRICTION
): number {
  if (Math.abs(velocity) < INERTIA_MIN_VELOCITY) return 0;
  return (velocity * REFERENCE_FRAME_MS * friction) / (1 - friction);
}

/**
 * Calculate velocity (px/ms) from a sequence of pointer samples.
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
  return dp / dt;
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
 * `position` is the overscroll in px, `velocity` in px/ms.
 */
export function createSpringState(
  position: number,
  velocity: number = 0
): SpringState {
  return {
    position,
    velocity,
    settled:
      Math.abs(position) < SPRING_SETTLE_DISTANCE &&
      Math.abs(velocity) < SPRING_SETTLE_VELOCITY,
  };
}

/**
 * Advance the spring simulation by `dtMs`, returning to position = 0.
 * Critically damped spring: a = -kx - bv, integrated in reference-frame units.
 *
 * The step is split into fixed sub-steps because explicit Euler is only stable
 * and frame-rate independent at a small, constant integration interval: one
 * 100 ms step overshoots where six 16.67 ms steps converge.
 */
export function stepSpring(
  state: SpringState,
  dtMs: number,
  stiffness: number = SPRING_STIFFNESS,
  damping: number = SPRING_DAMPING
): SpringState {
  if (state.settled) return state;

  // The constants are per reference frame; convert them to per-millisecond so
  // the same ODE is solved whatever dtMs the display asked for.
  const stiffnessPerMs = stiffness / (REFERENCE_FRAME_MS * REFERENCE_FRAME_MS);
  const dampingPerMs = damping / REFERENCE_FRAME_MS;
  const steps = Math.max(1, Math.round(dtMs / SPRING_SUB_STEP_MS));
  const subStep = dtMs / steps;

  let position = state.position;
  let velocity = state.velocity;

  for (let step = 0; step < steps; step++) {
    // Hooke's law + damping: a = -kx - bv
    const acceleration = -stiffnessPerMs * position - dampingPerMs * velocity;
    velocity += acceleration * subStep;
    position += velocity * subStep;
  }

  const settled =
    Math.abs(position) < SPRING_SETTLE_DISTANCE &&
    Math.abs(velocity) < SPRING_SETTLE_VELOCITY;

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
