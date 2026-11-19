import { prefersReducedMotion } from "./reduced-motion.ts";

/**
 * One continuum flight: the clone of a tapped item, held at the place the item was
 * drawn, that travels to where the tapped thing lands.
 */
export interface ContinuumFlight {
  /**
   * Slides the held clone from the item's origin to `target`.
   * @param target - Where the item lands; only its box is read
   * @returns resolves when the clone has landed and been removed
   */
  flyTo(target: Element): Promise<void>;
  /** Removes the clone and settles a pending `flyTo`. Safe to call twice. */
  cancel(): void;
}

/**
 * The continuum moved the tapped item itself, so the flight is a translate and nothing
 * else: no scale, no rotation. `0:0:0.15` and `ExponentialEase` come from the four
 * continuum storyboards of the Windows Phone toolkit reproduction —
 * https://gist.github.com/bjcull/1345156 (`ContinuumTransition.cs`), whose ForwardIn
 * storyboard carries the item from `TranslateX 130 / TranslateY -70` to `0,0`. The
 * archived WinJS reference describes the same shape: `continuumForwardIn` "translating
 * an incoming item into place" —
 * https://learn.microsoft.com/en-us/previous-versions/windows/apps/dn596131(v=win.10).
 */
const FLIGHT_DURATION_MS = 150;

/**
 * Bounds the wait for `transitionend`: a clone that never paints never reports it.
 */
const SETTLE_GUARD_MS = 250;

/**
 * `ExponentialEase` with `EasingMode="EaseOut" Exponent="3"` is exponential, and CSS has
 * no exponential easing function, so this is the published easeOutExpo approximation of
 * that curve — an approximation, not the original. It is the same curve the
 * `metro-continuum-enter`/`-exit` keyframes in `styles/animations.css` run at.
 */
const FLIGHT_EASING = "cubic-bezier(0.19, 1, 0.22, 1)";

/** Above app content layers, below the browser's own transition snapshots. */
const FLIGHT_Z_INDEX = "1200";

/** Marks the clone so a caller can tell a flight from the page's own content. */
const FLIGHT_ATTRIBUTE = "data-continuum-flight";

/** Flights currently holding a clone on the body. */
let activeFlights = 0;

/** Mints the per-clone snapshot name; names must not repeat across flights. */
let flightSerial = 0;

/**
 * Whether a continuum flight is in the air. The flight rides over the page turnstile
 * as its own snapshot group, so callers can tell a tap-driven navigation from a plain
 * one while the clone is held.
 * @returns true while at least one flight holds a clone
 */
export function continuumInFlight(): boolean {
  return activeFlights > 0;
}

const BOX_SIDES = ["top", "right", "bottom", "left"] as const;

/**
 * What the clone is painted with. The clone leaves the shadow tree that drew the origin,
 * so none of the rules that styled it there reach it here; these are copied from the
 * origin's own computed style, element by element, and are what makes the flight look
 * like the item the user tapped rather than an unstyled box.
 */
const CLONE_PAINT_PROPERTIES: string[] = [
  "display",
  "box-sizing",
  "visibility",
  "opacity",
  "color",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "letter-spacing",
  "line-height",
  "text-align",
  "text-transform",
  "white-space",
  "text-overflow",
  "overflow",
  "border-radius",
  "background-color",
  "background-image",
  "box-shadow",
  ...BOX_SIDES.flatMap((side) => [
    `padding-${side}`,
    `border-${side}-width`,
    `border-${side}-style`,
    `border-${side}-color`
  ])
];

/**
 * How the flight rides over the app's page transition. The defaults match the library
 * root turnstile in `styles/animations.css` (500ms in, ease-out page curve); an app that
 * overrides its page transition passes its own values so the clone lands with the page
 * instead of against a hardcoded assumption.
 */
export interface ContinuumOptions {
  /** Duration of the page transition the flight rides over, in ms. */
  pageTransitionMs?: number;
  /** Easing of the page transition the flight rides over. */
  pageTransitionEasing?: string;
}

/**
 * Holds a copy of `origin` where the origin is drawn, ready to fly to wherever the tap
 * leads. Nothing moves until {@link ContinuumFlight.flyTo} is called, so the caller owns
 * the moment the destination is known — which for a navigation is only after the new
 * page has rendered.
 *
 * Under `prefers-reduced-motion` no clone is made and nothing travels: the returned
 * flight settles immediately, because the policy is to skip motion rather than run it
 * faster.
 *
 * @param origin - The element the user tapped; its box is the start of the flight
 * @param options - Page transition the flight rides over; library turnstile by default
 * @returns the flight
 */
export function beginContinuum(
  origin: Element,
  options: ContinuumOptions = {}
): ContinuumFlight {
  if (prefersReducedMotion()) {
    return {
      flyTo: () => Promise.resolve(),
      cancel: () => {}
    };
  }

  const originRect = origin.getBoundingClientRect();
  const clone = createFlightClone(origin, originRect);
  // A light-DOM name keeps the clone out of the root snapshot (Chromium excludes
  // light-DOM names from root but bakes shadow-nested ones in).
  const name = `metro-continuum-flight-${(flightSerial += 1)}`;
  clone.style.setProperty("view-transition-name", name);
  // One painted copy: the old snapshot hides while the new one's group carries the
  // clone from the tap point to the destination across the page swivel. The fade
  // keyframe gives the group the turnstile's duration and dissolves the clone into
  // the arriving page; at full opacity it reads as a box pasted over the transition.
  const pageMs = options.pageTransitionMs ?? 500;
  const pageEasing =
    options.pageTransitionEasing ?? "cubic-bezier(0.25, 0.46, 0.45, 0.94)";
  const freeze = document.createElement("style");
  freeze.textContent =
    `::view-transition-old(${name}) { animation: none; opacity: 0; }` +
    `::view-transition-new(${name}) { animation: metro-continuum-flight-fade ${pageMs}ms linear both; }` +
    `::view-transition-group(${name}) { animation-timing-function: ${pageEasing}; }`;
  document.head.append(freeze);
  document.body.append(clone);
  activeFlights += 1;

  let pending: Promise<void> | undefined;
  let resolveFlight: (() => void) | undefined;
  let guardTimer = 0;
  let landed = false;

  const land = (): void => {
    if (landed) return;
    landed = true;
    activeFlights -= 1;
    window.clearTimeout(guardTimer);
    clone.removeEventListener("transitionend", onTransitionEnd);
    // Idempotent, so a cancel that races the transition cannot throw.
    freeze.remove();
    clone.remove();
    const resolve = resolveFlight;
    resolveFlight = undefined;
    resolve?.();
  };

  function onTransitionEnd(event: TransitionEvent): void {
    if (event.target !== clone) return;
    if (event.propertyName !== "transform") return;
    land();
  }

  return {
    flyTo(target: Element): Promise<void> {
      if (landed) return Promise.resolve();
      if (pending) return pending;

      const box = target.getBoundingClientRect();
      const dx = box.left - originRect.left;
      const dy = box.top - originRect.top;

      // During the page turnstile the live DOM is not painted, so the clone travels as
      // its snapshot group: jumping the live clone before the new snapshot is captured
      // makes the group carry it across the swivel, landing exactly when the page
      // settles. Called from the route's update callback, this runs before that capture.
      if (
        "startViewTransition" in document &&
        document.documentElement.matches(":active-view-transition")
      ) {
        clone.style.transition = "none";
        clone.style.transform = `translate(${dx}px, ${dy}px)`;
        pending = new Promise<void>((resolve) => {
          resolveFlight = resolve;
          const wait = (): void => {
            if (landed) return;
            if (document.documentElement.matches(":active-view-transition")) {
              requestAnimationFrame(wait);
            } else {
              land();
            }
          };
          requestAnimationFrame(wait);
        });
        return pending;
      }

      pending = new Promise<void>((resolve) => {
        resolveFlight = resolve;
        clone.addEventListener("transitionend", onTransitionEnd);

        // One frame at the start position has to be painted before the translate is
        // written, or the two styles are recalculated together and nothing transitions.
        requestAnimationFrame(() => {
          if (landed) return;
          clone.style.transform = `translate(${dx}px, ${dy}px)`;
          clone.style.opacity = "0";
          guardTimer = window.setTimeout(land, SETTLE_GUARD_MS);
        });
      });

      return pending;
    },
    cancel(): void {
      land();
    }
  };
}

/**
 * A detached, inert copy of the origin, fixed over the origin's box and already carrying
 * the transition the flight runs on.
 */
function createFlightClone(origin: Element, rect: DOMRect): HTMLElement {
  const clone = origin.cloneNode(true) as HTMLElement;
  removeIdentifiers(clone);
  copyPaintedStyles(origin, clone);

  const flightStyles: Record<string, string> = {
    position: "fixed",
    // The box below is the origin's border box, so the padding and border copied off
    // the origin have to sit inside it rather than be added to it.
    "box-sizing": "border-box",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    margin: "0",
    "pointer-events": "none",
    "z-index": FLIGHT_Z_INDEX,
    transform: "translate(0px, 0px)",
    transition: `transform ${FLIGHT_DURATION_MS}ms ${FLIGHT_EASING}, opacity ${FLIGHT_DURATION_MS}ms linear`
  };
  for (const [property, value] of Object.entries(flightStyles)) {
    clone.style.setProperty(property, value);
  }

  clone.setAttribute(FLIGHT_ATTRIBUTE, "");
  clone.setAttribute("aria-hidden", "true");

  return clone;
}

/** Keeps the clone from duplicating an id the live page already owns. */
function removeIdentifiers(element: Element): void {
  element.removeAttribute("id");
  for (const child of Array.from(element.querySelectorAll("[id]"))) {
    child.removeAttribute("id");
  }
}

/**
 * Mirrors the painted style of `source` onto its own copy. `cloneNode` reproduces the
 * element tree exactly, so the two walks stay in step.
 */
function copyPaintedStyles(source: Element, clone: Element): void {
  const computed = window.getComputedStyle(source);

  if (clone instanceof HTMLElement || clone instanceof SVGElement) {
    for (const property of CLONE_PAINT_PROPERTIES) {
      clone.style.setProperty(property, computed.getPropertyValue(property));
    }
  }

  const children = source.children;
  const clones = clone.children;
  for (let index = 0; index < children.length && index < clones.length; index += 1) {
    copyPaintedStyles(children[index], clones[index]);
  }
}
