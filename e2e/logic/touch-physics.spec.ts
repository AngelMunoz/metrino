import { expect, test } from "@playwright/test";
import {
  BOUNDARY_RESISTANCE,
  GESTURE_THRESHOLD,
  INERTIA_FRICTION,
  INERTIA_MIN_VELOCITY,
  calculateVelocity,
  compressBoundary,
  createAxisRailState,
  createGestureState,
  createInertiaState,
  createSpringState,
  feedAxisRail,
  frameDeltaMs,
  predictInertiaDistance,
  resetAxisRail,
  resolveGesture,
  stepInertia,
  stepSpring,
  updateGesture,
} from "../../src/utils/touch-physics.ts";
import type { GestureState } from "../../src/utils/touch-physics.ts";

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

test.describe("touch-physics: inertia", () => {
  test("createInertiaState sets initial values", () => {
    const state = createInertiaState(FLING_VELOCITY, 50);
    expect(state.velocity).toBe(FLING_VELOCITY);
    expect(state.position).toBe(50);
    expect(state.moving).toBe(true);
  });

  test("createInertiaState with zero velocity is not moving", () => {
    const state = createInertiaState(0, 0);
    expect(state.moving).toBe(false);
  });

  test("createInertiaState with sub-threshold velocity is not moving", () => {
    const state = createInertiaState(INERTIA_MIN_VELOCITY * 0.5);
    expect(state.moving).toBe(false);
  });

  test("stepInertia decays velocity", () => {
    const s0 = createInertiaState(FLING_VELOCITY, 0);
    const s1 = stepInertia(s0, FRAME_MS);
    expect(Math.abs(s1.velocity)).toBeLessThan(Math.abs(s0.velocity));
    expect(Math.abs(s1.velocity - FLING_VELOCITY * INERTIA_FRICTION)).toBeLessThanOrEqual(
      0.0001,
    );
  });

  test("stepInertia moves the position by the elapsed time", () => {
    const s0 = createInertiaState(FLING_VELOCITY, 0);
    const s1 = stepInertia(s0, FRAME_MS);
    expect(Math.abs(s1.position - FLING_VELOCITY * FRAME_MS)).toBeLessThanOrEqual(
      0.5,
    );
  });

  test("stepInertia eventually stops", () => {
    let state = createInertiaState(FLING_VELOCITY, 0);
    let frames = 0;
    while (state.moving && frames < 1000) {
      state = stepInertia(state, FRAME_MS);
      frames++;
    }
    expect(state.moving).toBe(false);
    expect(state.velocity).toBe(0);
    expect(frames).toBeLessThan(500);
  });

  test("stepInertia on stopped state is no-op", () => {
    const state = createInertiaState(0, 100);
    const next = stepInertia(state, FRAME_MS);
    expect(next.position).toBe(100);
    expect(next.velocity).toBe(0);
  });

  test("stepInertia with negative velocity works", () => {
    const s0 = createInertiaState(-FLING_VELOCITY, 0);
    const s1 = stepInertia(s0, FRAME_MS);
    expect(s1.velocity).toBeGreaterThan(-FLING_VELOCITY);
    expect(s1.position).toBeLessThan(0);
  });

  test("predictInertiaDistance sums the decay", () => {
    const dist = predictInertiaDistance(FLING_VELOCITY);
    expect(dist).toBeGreaterThan(0);

    // Cross-check the closed form against the geometric series it summarises.
    let series = 0;
    let decay = 1;
    for (let frame = 0; frame < 5000; frame++) {
      decay *= INERTIA_FRICTION;
      series += FLING_VELOCITY * FRAME_MS * decay;
    }
    expect(Math.abs(dist - series)).toBeLessThanOrEqual(0.5);

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
    expect(Math.abs(dist - state.position)).toBeLessThanOrEqual(leftover);
  });

  test("predictInertiaDistance returns 0 for sub-threshold velocity", () => {
    expect(predictInertiaDistance(0)).toBe(0);
    expect(predictInertiaDistance(INERTIA_MIN_VELOCITY * 0.1)).toBe(0);
  });

  test("calculateVelocity returns px per millisecond", () => {
    const samples = [
      { x: 0, y: 0, time: 0 },
      { x: 100, y: 0, time: 100 },
    ];
    // 100px over 100ms is 1px/ms
    expect(Math.abs(calculateVelocity(samples, "x") - 1)).toBeLessThanOrEqual(
      0.0001,
    );
  });

  test("calculateVelocity returns 0 for single sample", () => {
    expect(calculateVelocity([{ x: 0, y: 0, time: 0 }])).toBe(0);
  });

  test("calculateVelocity y-axis", () => {
    const samples = [
      { x: 0, y: 0, time: 0 },
      { x: 0, y: 50, time: 100 },
    ];
    expect(Math.abs(calculateVelocity(samples, "y") - 0.5)).toBeLessThanOrEqual(
      0.0001,
    );
  });
});

test.describe("touch-physics: frame-rate independence", () => {
  // The same wall-clock time split into 60fps frames (6 × 16.67 ms), 30fps
  // frames (3 × 33.33 ms) or one dropped frame (1 × 100 ms) has to move the
  // content the same distance, or a fling lands somewhere else on a slow
  // device than on a fast one.
  const frameSplits: number[][] = [repeat(16.67, 6), repeat(33.33, 3), [100]];

  test("inertia displacement is the same whatever the frame rate", () => {
    const distances = frameSplits.map((deltas) =>
      inertiaDistance(FLING_VELOCITY, deltas),
    );
    const spread = Math.max(...distances) - Math.min(...distances);
    expect(spread).toBeLessThan(Math.max(...distances) * 0.02);
  });

  test("spring position is the same whatever the frame rate", () => {
    const positions = frameSplits.map((deltas) => springPosition(100, deltas));
    const spread = Math.max(...positions) - Math.min(...positions);
    expect(spread).toBeLessThan(Math.max(...positions) * 0.02);
  });

  test("frameDeltaMs uses the reference frame for the first step", () => {
    expect(Math.abs(frameDeltaMs(null, 1234) - FRAME_MS)).toBeLessThanOrEqual(
      0.01,
    );
  });

  test("frameDeltaMs clamps a dropped frame", () => {
    expect(frameDeltaMs(0, 500)).toBe(64);
    expect(frameDeltaMs(100, 40)).toBe(0);
    expect(frameDeltaMs(0, 33.33)).toBe(33.33);
  });
});

test.describe("touch-physics: boundary spring", () => {
  test("compressBoundary reduces overscroll", () => {
    const result = compressBoundary(100);
    expect(result).toBe(100 * BOUNDARY_RESISTANCE);
    expect(result).toBeLessThan(100);
  });

  test("compressBoundary with zero overscroll returns 0", () => {
    expect(compressBoundary(0)).toBe(0);
  });

  test("compressBoundary with negative overscroll", () => {
    const result = compressBoundary(-100);
    expect(result).toBeGreaterThan(-100);
    expect(result).toBeLessThan(0);
  });

  test("createSpringState with position away from 0 is not settled", () => {
    const state = createSpringState(50);
    expect(state.settled).toBe(false);
    expect(state.position).toBe(50);
  });

  test("createSpringState near zero is settled", () => {
    const state = createSpringState(0.1, 0.01);
    expect(state.settled).toBe(true);
  });

  test("createSpringState is not settled while the release is still fast", () => {
    // 0.4 px/ms is 6.7 px per frame, above the settle threshold.
    expect(createSpringState(0.1, 0.4).settled).toBe(false);
  });

  test("stepSpring converges to 0", () => {
    let state = createSpringState(100);
    let frames = 0;
    while (!state.settled && frames < 500) {
      state = stepSpring(state, FRAME_MS);
      frames++;
    }
    expect(state.settled).toBe(true);
    expect(state.position).toBe(0);
    expect(state.velocity).toBe(0);
    expect(frames).toBeLessThan(300);
  });

  test("stepSpring on settled state is no-op", () => {
    const state = createSpringState(0, 0);
    const next = stepSpring(state, FRAME_MS);
    expect(next.position).toBe(0);
    expect(next.settled).toBe(true);
  });

  test("stepSpring with negative position converges to 0", () => {
    let state = createSpringState(-80);
    let frames = 0;
    while (!state.settled && frames < 500) {
      state = stepSpring(state, FRAME_MS);
      frames++;
    }
    expect(state.settled).toBe(true);
    expect(state.position).toBe(0);
  });
});

test.describe("touch-physics: gesture", () => {
  test("createGestureState initializes from pointer info", () => {
    const state = createGestureState({ clientX: 100, clientY: 200 });
    expect(state.startX).toBe(100);
    expect(state.startY).toBe(200);
    expect(state.resolved).toBeNull();
    expect(state.samples.length).toBe(1);
  });

  test("small movement resolves as tap", () => {
    const state = createGestureState({ clientX: 100, clientY: 200 });
    const moved = updateGesture(state, { clientX: 103, clientY: 202 });
    const result = resolveGesture(moved);
    expect(result.type).toBe("tap");
  });

  test("horizontal drag resolves as drag-x", () => {
    const state = createGestureState({ clientX: 100, clientY: 200 });
    const moved = updateGesture(state, {
      clientX: 100 + GESTURE_THRESHOLD + 5,
      clientY: 202,
    });
    expect(moved.resolved).toBe("drag-x");
    const result = resolveGesture(moved);
    expect(result.type).toBe("drag-x");
  });

  test("vertical drag resolves as drag-y", () => {
    const state = createGestureState({ clientX: 100, clientY: 200 });
    const moved = updateGesture(state, {
      clientX: 102,
      clientY: 200 + GESTURE_THRESHOLD + 5,
    });
    expect(moved.resolved).toBe("drag-y");
  });

  test("gesture stays resolved after initial classification", () => {
    let state = createGestureState({ clientX: 100, clientY: 200 });
    state = updateGesture(state, { clientX: 120, clientY: 201 }); // drag-x
    expect(state.resolved).toBe("drag-x");

    // Further movement doesn't change classification
    state = updateGesture(state, { clientX: 120, clientY: 250 });
    expect(state.resolved).toBe("drag-x");
  });

  test("resolveGesture calculates dx/dy", () => {
    let state = createGestureState({ clientX: 100, clientY: 200 });
    state = updateGesture(state, { clientX: 150, clientY: 210 });
    const result = resolveGesture(state);
    expect(result.dx).toBe(50);
    expect(result.dy).toBe(10);
  });

  test("resolveGesture includes velocity", () => {
    // Use explicit time-stamped samples to avoid performance.now() precision issues
    const state: GestureState = {
      startX: 100,
      startY: 200,
      startTime: 0,
      currentX: 200,
      currentY: 200,
      currentTime: 50,
      resolved: "drag-x",
      samples: [
        { x: 100, y: 200, time: 0 },
        { x: 150, y: 200, time: 25 },
        { x: 200, y: 200, time: 50 },
      ],
    };
    const result = resolveGesture(state);
    expect(Math.abs(result.velocityX)).toBeGreaterThan(0);
  });
});

test.describe("touch-physics: axis rail", () => {
  test("createAxisRailState starts unlocked", () => {
    const state = createAxisRailState();
    expect(state.locked).toBeNull();
    expect(state.totalDx).toBe(0);
    expect(state.totalDy).toBe(0);
  });

  test("small movements don't lock", () => {
    const state = createAxisRailState();
    const result = feedAxisRail(state, 3, 2);
    expect(result.state.locked).toBeNull();
    // Movement passes through un-filtered
    expect(result.movement.x).toBe(3);
    expect(result.movement.y).toBe(2);
  });

  test("horizontal movement locks to x-axis", () => {
    const state = createAxisRailState();
    const result = feedAxisRail(state, GESTURE_THRESHOLD + 5, 2);
    expect(result.state.locked).toBe("x");
  });

  test("vertical movement locks to y-axis", () => {
    const state = createAxisRailState();
    const result = feedAxisRail(state, 2, GESTURE_THRESHOLD + 5);
    expect(result.state.locked).toBe("y");
  });

  test("locked x-axis zeroes y movement", () => {
    const state = createAxisRailState();
    // First move to lock
    let result = feedAxisRail(state, GESTURE_THRESHOLD + 5, 1);
    expect(result.state.locked).toBe("x");

    // Subsequent move with y component
    result = feedAxisRail(result.state, 5, 10);
    expect(result.movement.x).toBe(5);
    expect(result.movement.y).toBe(0);
  });

  test("locked y-axis zeroes x movement", () => {
    const state = createAxisRailState();
    let result = feedAxisRail(state, 1, GESTURE_THRESHOLD + 5);
    expect(result.state.locked).toBe("y");

    result = feedAxisRail(result.state, 10, 5);
    expect(result.movement.x).toBe(0);
    expect(result.movement.y).toBe(5);
  });

  test("resetAxisRail returns fresh state", () => {
    const state = resetAxisRail();
    expect(state.locked).toBeNull();
    expect(state.totalDx).toBe(0);
  });
});

test.describe("touch-physics: pointer helpers", () => {
  test("normalizePointerEvent extracts clientX/Y from MouseEvent", async ({
    page,
  }) => {
    // MouseEvent only exists beside a real DOM, so this one case runs in
    // the demo page against the real module; the math above stays in the
    // worker because it never touches a DOM API.
    await page.goto("/");
    const info = await page.evaluate(async () => {
      const mod = (await import(
        "/src/utils/touch-physics.ts" as string
      )) as typeof import("../../src/utils/touch-physics.ts");
      const event = new MouseEvent("mousedown", { clientX: 42, clientY: 84 });
      return mod.normalizePointerEvent(event);
    });
    expect(info.clientX).toBe(42);
    expect(info.clientY).toBe(84);
  });
});
