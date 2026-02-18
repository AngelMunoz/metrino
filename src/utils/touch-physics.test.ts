import { assert } from "chai";
import {
  createInertiaState,
  stepInertia,
  predictInertiaDistance,
  calculateVelocity,
  compressBoundary,
  createSpringState,
  stepSpring,
  createGestureState,
  updateGesture,
  resolveGesture,
  createAxisRailState,
  feedAxisRail,
  resetAxisRail,
  normalizePointerEvent,
  INERTIA_FRICTION,
  INERTIA_MIN_VELOCITY,
  GESTURE_THRESHOLD,
  BOUNDARY_RESISTANCE,
} from "./touch-physics.ts";

// ─── Inertia ─────────────────────────────────────────────────────────────────

suite("touch-physics: inertia", () => {
  test("createInertiaState sets initial values", () => {
    const state = createInertiaState(10, 50);
    assert.equal(state.velocity, 10);
    assert.equal(state.position, 50);
    assert.isTrue(state.moving);
  });

  test("createInertiaState with zero velocity is not moving", () => {
    const state = createInertiaState(0, 0);
    assert.isFalse(state.moving);
  });

  test("createInertiaState with sub-threshold velocity is not moving", () => {
    const state = createInertiaState(INERTIA_MIN_VELOCITY * 0.5);
    assert.isFalse(state.moving);
  });

  test("stepInertia decays velocity", () => {
    const s0 = createInertiaState(10, 0);
    const s1 = stepInertia(s0);
    assert.isBelow(Math.abs(s1.velocity), Math.abs(s0.velocity));
    assert.approximately(s1.velocity, 10 * INERTIA_FRICTION, 0.001);
  });

  test("stepInertia updates position", () => {
    const s0 = createInertiaState(10, 0);
    const s1 = stepInertia(s0);
    assert.isAbove(s1.position, 0);
  });

  test("stepInertia eventually stops", () => {
    let state = createInertiaState(10, 0);
    let frames = 0;
    while (state.moving && frames < 1000) {
      state = stepInertia(state);
      frames++;
    }
    assert.isFalse(state.moving);
    assert.isBelow(frames, 500, "should settle within 500 frames");
  });

  test("stepInertia on stopped state is no-op", () => {
    const state = createInertiaState(0, 100);
    const next = stepInertia(state);
    assert.equal(next.position, 100);
    assert.equal(next.velocity, 0);
  });

  test("stepInertia with negative velocity works", () => {
    const s0 = createInertiaState(-10, 0);
    const s1 = stepInertia(s0);
    assert.isAbove(s1.velocity, -10);
    assert.isBelow(s1.position, 0);
  });

  test("predictInertiaDistance approximates total travel", () => {
    const dist = predictInertiaDistance(10);
    assert.isAbove(dist, 0);

    // Verify by actually stepping
    let state = createInertiaState(10, 0);
    let frames = 0;
    while (state.moving && frames < 1000) {
      state = stepInertia(state);
      frames++;
    }
    // The formula is an upper bound (doesn't account for min-velocity cutoff)
    assert.approximately(dist, state.position, 20);
  });

  test("predictInertiaDistance returns 0 for sub-threshold velocity", () => {
    assert.equal(predictInertiaDistance(0), 0);
    assert.equal(predictInertiaDistance(INERTIA_MIN_VELOCITY * 0.1), 0);
  });

  test("calculateVelocity from samples", () => {
    const samples = [
      { x: 0, y: 0, time: 0 },
      { x: 100, y: 0, time: 100 },
    ];
    const vx = calculateVelocity(samples, "x");
    // 100px / 100ms * 16.67ms/frame ≈ 16.67 px/frame
    assert.approximately(vx, 16.67, 0.1);
  });

  test("calculateVelocity returns 0 for single sample", () => {
    assert.equal(calculateVelocity([{ x: 0, y: 0, time: 0 }]), 0);
  });

  test("calculateVelocity y-axis", () => {
    const samples = [
      { x: 0, y: 0, time: 0 },
      { x: 0, y: 50, time: 100 },
    ];
    const vy = calculateVelocity(samples, "y");
    assert.approximately(vy, 8.335, 0.1);
  });
});

// ─── Boundary Spring ─────────────────────────────────────────────────────────

suite("touch-physics: boundary spring", () => {
  test("compressBoundary reduces overscroll", () => {
    const result = compressBoundary(100);
    assert.equal(result, 100 * BOUNDARY_RESISTANCE);
    assert.isBelow(result, 100);
  });

  test("compressBoundary with zero overscroll returns 0", () => {
    assert.equal(compressBoundary(0), 0);
  });

  test("compressBoundary with negative overscroll", () => {
    const result = compressBoundary(-100);
    assert.isAbove(result, -100);
    assert.isBelow(result, 0);
  });

  test("createSpringState with position away from 0 is not settled", () => {
    const state = createSpringState(50);
    assert.isFalse(state.settled);
    assert.equal(state.position, 50);
  });

  test("createSpringState near zero is settled", () => {
    const state = createSpringState(0.1, 0.1);
    assert.isTrue(state.settled);
  });

  test("stepSpring converges to 0", () => {
    let state = createSpringState(100);
    let frames = 0;
    while (!state.settled && frames < 500) {
      state = stepSpring(state);
      frames++;
    }
    assert.isTrue(state.settled);
    assert.equal(state.position, 0);
    assert.isBelow(frames, 300, "spring should settle within 300 frames");
  });

  test("stepSpring on settled state is no-op", () => {
    const state = createSpringState(0, 0);
    const next = stepSpring(state);
    assert.equal(next.position, 0);
    assert.isTrue(next.settled);
  });

  test("stepSpring with negative position converges to 0", () => {
    let state = createSpringState(-80);
    let frames = 0;
    while (!state.settled && frames < 500) {
      state = stepSpring(state);
      frames++;
    }
    assert.isTrue(state.settled);
    assert.equal(state.position, 0);
  });
});

// ─── Gesture Disambiguation ──────────────────────────────────────────────────

suite("touch-physics: gesture", () => {
  test("createGestureState initializes from pointer info", () => {
    const state = createGestureState({ clientX: 100, clientY: 200 });
    assert.equal(state.startX, 100);
    assert.equal(state.startY, 200);
    assert.isNull(state.resolved);
    assert.equal(state.samples.length, 1);
  });

  test("small movement resolves as tap", () => {
    const state = createGestureState({ clientX: 100, clientY: 200 });
    const moved = updateGesture(state, { clientX: 103, clientY: 202 });
    const result = resolveGesture(moved);
    assert.equal(result.type, "tap");
  });

  test("horizontal drag resolves as drag-x", () => {
    const state = createGestureState({ clientX: 100, clientY: 200 });
    const moved = updateGesture(state, {
      clientX: 100 + GESTURE_THRESHOLD + 5,
      clientY: 202,
    });
    assert.equal(moved.resolved, "drag-x");
    const result = resolveGesture(moved);
    assert.equal(result.type, "drag-x");
  });

  test("vertical drag resolves as drag-y", () => {
    const state = createGestureState({ clientX: 100, clientY: 200 });
    const moved = updateGesture(state, {
      clientX: 102,
      clientY: 200 + GESTURE_THRESHOLD + 5,
    });
    assert.equal(moved.resolved, "drag-y");
  });

  test("gesture stays resolved after initial classification", () => {
    let state = createGestureState({ clientX: 100, clientY: 200 });
    state = updateGesture(state, { clientX: 120, clientY: 201 }); // drag-x
    assert.equal(state.resolved, "drag-x");

    // Further movement doesn't change classification
    state = updateGesture(state, { clientX: 120, clientY: 250 });
    assert.equal(state.resolved, "drag-x");
  });

  test("resolveGesture calculates dx/dy", () => {
    let state = createGestureState({ clientX: 100, clientY: 200 });
    state = updateGesture(state, { clientX: 150, clientY: 210 });
    const result = resolveGesture(state);
    assert.equal(result.dx, 50);
    assert.equal(result.dy, 10);
  });

  test("resolveGesture includes velocity", () => {
    // Use explicit time-stamped samples to avoid performance.now() precision issues
    const state: import("./touch-physics.ts").GestureState = {
      startX: 100, startY: 200, startTime: 0,
      currentX: 200, currentY: 200, currentTime: 50,
      resolved: "drag-x",
      samples: [
        { x: 100, y: 200, time: 0 },
        { x: 150, y: 200, time: 25 },
        { x: 200, y: 200, time: 50 },
      ],
    };
    const result = resolveGesture(state);
    assert.isAbove(Math.abs(result.velocityX), 0);
  });
});

// ─── Axis Rail ───────────────────────────────────────────────────────────────

suite("touch-physics: axis rail", () => {
  test("createAxisRailState starts unlocked", () => {
    const state = createAxisRailState();
    assert.isNull(state.locked);
    assert.equal(state.totalDx, 0);
    assert.equal(state.totalDy, 0);
  });

  test("small movements don't lock", () => {
    let state = createAxisRailState();
    const result = feedAxisRail(state, 3, 2);
    assert.isNull(result.state.locked);
    // Movement passes through un-filtered
    assert.equal(result.movement.x, 3);
    assert.equal(result.movement.y, 2);
  });

  test("horizontal movement locks to x-axis", () => {
    let state = createAxisRailState();
    const result = feedAxisRail(state, GESTURE_THRESHOLD + 5, 2);
    assert.equal(result.state.locked, "x");
  });

  test("vertical movement locks to y-axis", () => {
    let state = createAxisRailState();
    const result = feedAxisRail(state, 2, GESTURE_THRESHOLD + 5);
    assert.equal(result.state.locked, "y");
  });

  test("locked x-axis zeroes y movement", () => {
    let state = createAxisRailState();
    // First move to lock
    let result = feedAxisRail(state, GESTURE_THRESHOLD + 5, 1);
    assert.equal(result.state.locked, "x");

    // Subsequent move with y component
    result = feedAxisRail(result.state, 5, 10);
    assert.equal(result.movement.x, 5);
    assert.equal(result.movement.y, 0);
  });

  test("locked y-axis zeroes x movement", () => {
    let state = createAxisRailState();
    let result = feedAxisRail(state, 1, GESTURE_THRESHOLD + 5);
    assert.equal(result.state.locked, "y");

    result = feedAxisRail(result.state, 10, 5);
    assert.equal(result.movement.x, 0);
    assert.equal(result.movement.y, 5);
  });

  test("resetAxisRail returns fresh state", () => {
    const state = resetAxisRail();
    assert.isNull(state.locked);
    assert.equal(state.totalDx, 0);
  });
});

// ─── Pointer Event Helpers ───────────────────────────────────────────────────

suite("touch-physics: pointer helpers", () => {
  test("normalizePointerEvent extracts clientX/Y from MouseEvent", () => {
    const e = new MouseEvent("mousedown", { clientX: 42, clientY: 84 });
    const info = normalizePointerEvent(e);
    assert.equal(info.clientX, 42);
    assert.equal(info.clientY, 84);
  });
});
