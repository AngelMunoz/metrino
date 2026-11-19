import { assert } from "chai";
import {
  createInertiaState,
  stepInertia,
  frameDeltaMs,
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

/** Duration (ms) of one frame at 60fps, the rate the physics are tuned for. */
const FRAME_MS = 1000 / 60;

/** A fling of about 600 px/s, expressed in px/ms. */
const FLING_VELOCITY = 0.6;

/**
 * Run the inertia integrator over `deltas` and return the travelled distance.
 */
function inertiaDistance(v0: number, deltas: readonly number[]): number {
  let state = createInertiaState(v0, 0);
  for (const dt of deltas) state = stepInertia(state, dt);
  return state.position;
}

/**
 * Run the spring integrator over `deltas` and return the position.
 */
function springPosition(x0: number, deltas: readonly number[]): number {
  let state = createSpringState(x0);
  for (const dt of deltas) state = stepSpring(state, dt);
  return state.position;
}

function repeat(dt: number, times: number): number[] {
  return Array.from({ length: times }, () => dt);
}

// ─── Inertia ─────────────────────────────────────────────────────────────────

suite("touch-physics: inertia", () => {
  test("createInertiaState sets initial values", () => {
    const state = createInertiaState(FLING_VELOCITY, 50);
    assert.equal(state.velocity, FLING_VELOCITY);
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
    const s0 = createInertiaState(FLING_VELOCITY, 0);
    const s1 = stepInertia(s0, FRAME_MS);
    assert.isBelow(Math.abs(s1.velocity), Math.abs(s0.velocity));
    assert.approximately(s1.velocity, FLING_VELOCITY * INERTIA_FRICTION, 0.0001);
  });

  test("stepInertia moves the position by the elapsed time", () => {
    const s0 = createInertiaState(FLING_VELOCITY, 0);
    const s1 = stepInertia(s0, FRAME_MS);
    assert.approximately(s1.position, FLING_VELOCITY * FRAME_MS, 0.5);
  });

  test("stepInertia eventually stops", () => {
    let state = createInertiaState(FLING_VELOCITY, 0);
    let frames = 0;
    while (state.moving && frames < 1000) {
      state = stepInertia(state, FRAME_MS);
      frames++;
    }
    assert.isFalse(state.moving);
    assert.equal(state.velocity, 0, "stopped velocity is zeroed");
    assert.isBelow(frames, 500, "should settle within 500 frames");
  });

  test("stepInertia on stopped state is no-op", () => {
    const state = createInertiaState(0, 100);
    const next = stepInertia(state, FRAME_MS);
    assert.equal(next.position, 100);
    assert.equal(next.velocity, 0);
  });

  test("stepInertia with negative velocity works", () => {
    const s0 = createInertiaState(-FLING_VELOCITY, 0);
    const s1 = stepInertia(s0, FRAME_MS);
    assert.isAbove(s1.velocity, -FLING_VELOCITY);
    assert.isBelow(s1.position, 0);
  });

  test("predictInertiaDistance sums the decay", () => {
    const dist = predictInertiaDistance(FLING_VELOCITY);
    assert.isAbove(dist, 0);

    // Cross-check the closed form against the geometric series it summarises.
    let series = 0;
    let decay = 1;
    for (let frame = 0; frame < 5000; frame++) {
      decay *= INERTIA_FRICTION;
      series += FLING_VELOCITY * FRAME_MS * decay;
    }
    assert.approximately(dist, series, 0.5);

    // Verify against stepping. The formula runs the decay to zero, the
    // integrator stops at INERTIA_MIN_VELOCITY, so the two differ by the
    // distance that leftover velocity would still have carried.
    let state = createInertiaState(FLING_VELOCITY, 0);
    let frames = 0;
    while (state.moving && frames < 5000) {
      state = stepInertia(state, FRAME_MS);
      frames++;
    }
    const leftover =
      (INERTIA_MIN_VELOCITY * FRAME_MS * INERTIA_FRICTION) /
      (1 - INERTIA_FRICTION);
    assert.closeTo(dist, state.position, leftover);
  });

  test("predictInertiaDistance returns 0 for sub-threshold velocity", () => {
    assert.equal(predictInertiaDistance(0), 0);
    assert.equal(predictInertiaDistance(INERTIA_MIN_VELOCITY * 0.1), 0);
  });

  test("calculateVelocity returns px per millisecond", () => {
    const samples = [
      { x: 0, y: 0, time: 0 },
      { x: 100, y: 0, time: 100 },
    ];
    // 100px over 100ms is 1px/ms
    assert.approximately(calculateVelocity(samples, "x"), 1, 0.0001);
  });

  test("calculateVelocity returns 0 for single sample", () => {
    assert.equal(calculateVelocity([{ x: 0, y: 0, time: 0 }]), 0);
  });

  test("calculateVelocity y-axis", () => {
    const samples = [
      { x: 0, y: 0, time: 0 },
      { x: 0, y: 50, time: 100 },
    ];
    assert.approximately(calculateVelocity(samples, "y"), 0.5, 0.0001);
  });
});

// ─── Frame-rate independence ─────────────────────────────────────────────────

suite("touch-physics: frame-rate independence", () => {
  // The same wall-clock time split into 60fps frames (6 × 16.67 ms), 30fps
  // frames (3 × 33.33 ms) or one dropped frame (1 × 100 ms) has to move the
  // content the same distance, or a fling lands somewhere else on a slow
  // device than on a fast one.
  const frameSplits: number[][] = [repeat(16.67, 6), repeat(33.33, 3), [100]];

  test("inertia displacement is the same whatever the frame rate", () => {
    const distances = frameSplits.map((deltas) =>
      inertiaDistance(FLING_VELOCITY, deltas)
    );
    const spread = Math.max(...distances) - Math.min(...distances);
    assert.isBelow(
      spread,
      Math.max(...distances) * 0.02,
      `distances differed by more than 2%: ${distances.join(", ")}`
    );
  });

  test("spring position is the same whatever the frame rate", () => {
    const positions = frameSplits.map((deltas) => springPosition(100, deltas));
    const spread = Math.max(...positions) - Math.min(...positions);
    assert.isBelow(
      spread,
      Math.max(...positions) * 0.02,
      `positions differed by more than 2%: ${positions.join(", ")}`
    );
  });

  test("frameDeltaMs uses the reference frame for the first step", () => {
    assert.approximately(frameDeltaMs(null, 1234), FRAME_MS, 0.01);
  });

  test("frameDeltaMs clamps a dropped frame", () => {
    assert.equal(frameDeltaMs(0, 500), 64);
    assert.equal(frameDeltaMs(100, 40), 0);
    assert.equal(frameDeltaMs(0, 33.33), 33.33);
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
    const state = createSpringState(0.1, 0.01);
    assert.isTrue(state.settled);
  });

  test("createSpringState is not settled while the release is still fast", () => {
    // 0.4 px/ms is 6.7 px per frame, above the settle threshold.
    assert.isFalse(createSpringState(0.1, 0.4).settled);
  });

  test("stepSpring converges to 0", () => {
    let state = createSpringState(100);
    let frames = 0;
    while (!state.settled && frames < 500) {
      state = stepSpring(state, FRAME_MS);
      frames++;
    }
    assert.isTrue(state.settled);
    assert.equal(state.position, 0);
    assert.equal(state.velocity, 0, "settled velocity is zeroed");
    assert.isBelow(frames, 300, "spring should settle within 300 frames");
  });

  test("stepSpring on settled state is no-op", () => {
    const state = createSpringState(0, 0);
    const next = stepSpring(state, FRAME_MS);
    assert.equal(next.position, 0);
    assert.isTrue(next.settled);
  });

  test("stepSpring with negative position converges to 0", () => {
    let state = createSpringState(-80);
    let frames = 0;
    while (!state.settled && frames < 500) {
      state = stepSpring(state, FRAME_MS);
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
