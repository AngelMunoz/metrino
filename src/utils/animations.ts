import { css, unsafeCSS, type CSSResult } from "lit";
import animationsSource from "../styles/animations.css?inline";
import { prefersReducedMotion } from "./reduced-motion.ts";

export type AnimationName =
  | "fade-in"
  | "fade-out"
  | "slide-up"
  | "slide-left"
  | "slide-right"
  | "turnstile-in"
  | "turnstile-out"
  | "continuum-enter"
  | "continuum-exit"
  | "tile-flip"
  | "zoom-in"
  | "zoom-out"
  | "semantic-zoom-in"
  | "semantic-zoom-out";

export type TransitionType =
  | "fade"
  | "slide"
  | "scale"
  | "zoom"
  | "continuum"
  | "turnstile";

export interface TransitionOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  direction?: "forward" | "backward";
}

export interface ZoomTransitionOptions extends TransitionOptions {
  fromScale?: number;
  toScale?: number;
  origin?: string;
  fade?: boolean;
}

/** The animation rules of a stylesheet, split by what the API publishes. */
export interface AnimationRules {
  keyframes: string;
  classes: string;
}

const KEYFRAME_PREFIX = "metro-";
const ANIMATE_PREFIX = ".metro-animate-";
const KEYFRAMES_RULE = /^@keyframes\b/i;
const GROUPING_AT_RULE = /^@(media|supports|container|layer)\b/i;
const SAFETY_MARGIN_MS = 250;

/**
 * Collects the `@keyframes` blocks and the `.metro-animate-*` rules of a stylesheet, so
 * `styles/animations.css` is the single source for both the names and the geometry that
 * the animation API and the shadow components share.
 *
 * Walks rules by brace depth rather than matching over the text: a `@keyframes` block
 * holds blocks of its own, and a rule can sit inside a grouping at-rule (`@media`), which
 * is scanned one level deeper.
 */
export function extractAnimationRules(source: string): AnimationRules {
  const statements = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const keyframes: string[] = [];
  const classes: string[] = [];
  collectAnimationRules(statements, keyframes, classes);

  return { keyframes: keyframes.join("\n"), classes: classes.join("\n") };
}

function collectAnimationRules(
  statements: string,
  keyframes: string[],
  classes: string[],
): void {
  let index = 0;

  while (index < statements.length) {
    const open = statements.indexOf("{", index);
    if (open === -1) return;

    const close = closingBrace(statements, open);
    if (close === -1) return;

    const block = statements.slice(open + 1, close);
    const prelude = statements.slice(index, open).trim();
    // A block can be preceded by a statement that has none, such as `@import url(...)`.
    const selector = prelude.slice(prelude.lastIndexOf(";") + 1).trim();
    const rule = `${selector} {${block}}`;

    if (KEYFRAMES_RULE.test(selector)) {
      keyframes.push(rule);
    } else if (GROUPING_AT_RULE.test(selector)) {
      collectAnimationRules(block, keyframes, classes);
    } else if (animatesMetroClass(selector)) {
      classes.push(rule);
    }

    index = close + 1;
  }
}

function closingBrace(statements: string, open: number): number {
  let depth = 0;

  for (let index = open; index < statements.length; index += 1) {
    if (statements[index] === "{") {
      depth += 1;
    } else if (statements[index] === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }

  return -1;
}

function animatesMetroClass(selector: string): boolean {
  return selector
    .split(",")
    .some((part) => part.trim().startsWith(ANIMATE_PREFIX));
}

const animationRules = extractAnimationRules(animationsSource);

export const animationKeyframes: CSSResult = css`${unsafeCSS(animationRules.keyframes)}`;

export const animationClasses: CSSResult = css`${unsafeCSS(animationRules.classes)}`;

export const animationStyles: CSSResult = css`
  ${animationKeyframes}
  ${animationClasses}
`;

const ANIMATION_CLASS_MAP: Record<AnimationName, string> = {
  "fade-in": "metro-animate-fade-in",
  "fade-out": "metro-animate-fade-out",
  "slide-up": "metro-animate-slide-up",
  "slide-left": "metro-animate-slide-left",
  "slide-right": "metro-animate-slide-right",
  "turnstile-in": "metro-animate-turnstile-in",
  "turnstile-out": "metro-animate-turnstile-out",
  "continuum-enter": "metro-animate-continuum-enter",
  "continuum-exit": "metro-animate-continuum-exit",
  "tile-flip": "metro-animate-tile-flip",
  "zoom-in": "metro-animate-zoom-in",
  "zoom-out": "metro-animate-zoom-out",
  "semantic-zoom-in": "metro-animate-semantic-zoom-in",
  "semantic-zoom-out": "metro-animate-semantic-zoom-out"
};

/**
 * Reference durations in milliseconds, used only to bound the wait for `animationend`.
 * The duration that runs comes from `animations.css`; this table is not what the
 * animation is measured against.
 */
const ANIMATION_DURATIONS: Record<AnimationName, number> = {
  "fade-in": 167,
  "fade-out": 167,
  "slide-up": 333,
  "slide-left": 250,
  "slide-right": 250,
  "turnstile-in": 450,
  "turnstile-out": 350,
  "continuum-enter": 150,
  "continuum-exit": 150,
  "tile-flip": 500,
  "zoom-in": 333,
  "zoom-out": 333,
  "semantic-zoom-in": 400,
  "semantic-zoom-out": 400
};

/** `animationend` reports the keyframe name, which is the class name without `-animate`. */
function keyframeName(animation: AnimationName): string {
  return `${KEYFRAME_PREFIX}${animation}`;
}

export function playAnimation(element: Element, animation: AnimationName): Promise<void> {
  // Reduced motion skips the animation instead of running it faster: the class is
  // never added, so the element rests at the style it already has.
  if (prefersReducedMotion()) return Promise.resolve();

  return new Promise((resolve) => {
    const className = ANIMATION_CLASS_MAP[animation];
    const name = keyframeName(animation);

    element.classList.remove(className);

    void (element as HTMLElement).offsetWidth;

    element.classList.add(className);

    const finish = () => {
      element.removeEventListener("animationend", onEnd);
      window.clearTimeout(safety);
      resolve();
    };
    const onEnd = (event: Event) => {
      if (event.target !== element) return;
      if ((event as AnimationEvent).animationName !== name) return;
      finish();
    };

    // An element that is not rendered never fires `animationend`, so the wait is bounded.
    const safety = window.setTimeout(
      finish,
      ANIMATION_DURATIONS[animation] + SAFETY_MARGIN_MS
    );
    element.addEventListener("animationend", onEnd);
  });
}

export function animateChildren(
  container: Element,
  animation: AnimationName,
  staggerDelay: number = 50
): Promise<void> {
  // Same policy as playAnimation: under reduce nothing is hidden and nothing is
  // staged, the children simply render as they are.
  if (prefersReducedMotion()) return Promise.resolve();

  return new Promise((resolve) => {
    const children = Array.from(container.children);
    const className = ANIMATION_CLASS_MAP[animation];
    const name = keyframeName(animation);

    if (children.length === 0) {
      resolve();
      return;
    }

    children.forEach((child) => {
      child.classList.remove(className);
      (child as HTMLElement).style.opacity = "0";
    });

    void (container as HTMLElement).offsetWidth;

    const staggers: number[] = [];
    let pending = children.length;

    const finish = () => {
      container.removeEventListener("animationend", onEnd);
      staggers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(safety);
      resolve();
    };
    const onEnd = (event: Event) => {
      if ((event as AnimationEvent).animationName !== name) return;
      if (!children.includes(event.target as Element)) return;
      pending -= 1;
      if (pending === 0) finish();
    };

    children.forEach((child, index) => {
      staggers.push(
        window.setTimeout(() => {
          (child as HTMLElement).style.opacity = "";
          child.classList.add(className);
        }, index * staggerDelay)
      );
    });

    const safety = window.setTimeout(
      finish,
      ANIMATION_DURATIONS[animation] +
        children.length * staggerDelay +
        SAFETY_MARGIN_MS
    );
    container.addEventListener("animationend", onEnd);
  });
}

export const METRO_EASING = "cubic-bezier(0.1, 0.9, 0.2, 1)";
export const METRO_EASING_VALUES = [0.1, 0.9, 0.2, 1] as const;

/**
 * Duration the scripted transitions run at. Reduced motion takes it to zero,
 * which leaves the final styles applied in place of the animation; the callers
 * still resolve on their own timer, one frame later.
 * @param options - The caller's options
 * @param fallback - The Metro duration to use when the caller gave none
 * @returns milliseconds
 */
function motionDuration(options: TransitionOptions, fallback: number): number {
  return prefersReducedMotion() ? 0 : (options.duration ?? fallback);
}

export function createTransition(
  element: HTMLElement,
  type: TransitionType,
  options: TransitionOptions = {}
): Promise<void> {
  // The continuum runs at its own 150ms, matching its keyframes; every other scripted
  // transition keeps the slow Metro duration when the caller gives none.
  const duration = motionDuration(options, type === "continuum" ? 150 : 333);
  const easing = options.easing ?? METRO_EASING;
  const direction = options.direction ?? "forward";

  const transitions: Record<TransitionType, () => void> = {
    fade: () => {
      element.style.transition = `opacity ${duration}ms ${easing}`;
      element.style.opacity = direction === "forward" ? "1" : "0";
    },
    slide: () => {
      element.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`;
      element.style.transform = direction === "forward" ? "translateY(0)" : "translateY(40px)";
      element.style.opacity = direction === "forward" ? "1" : "0";
    },
    scale: () => {
      element.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`;
      element.style.transform = direction === "forward" ? "scale(1)" : "scale(0.8)";
      element.style.opacity = direction === "forward" ? "1" : "0";
    },
    zoom: () => {
      element.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`;
      element.style.transform = direction === "forward" ? "scale(1)" : "scale(0.5)";
      element.style.opacity = direction === "forward" ? "1" : "0";
    },
    continuum: () => {
      // Translate only, over the offsets the caller measured from the item's origin,
      // as the keyframes in animations.css do. Scale would describe a different
      // transition than the continuum of the design language.
      const dx = getComputedStyle(element).getPropertyValue("--metro-continuum-dx");
      const dy = getComputedStyle(element).getPropertyValue("--metro-continuum-dy");
      element.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`;
      if (direction === "forward") {
        element.style.transform = "translate(0, 0)";
        element.style.opacity = "1";
      } else {
        element.style.transform = `translate(${dx || "0px"}, ${dy || "0px"})`;
        element.style.opacity = "0";
      }
    },
    turnstile: () => {
      element.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`;
      element.style.transform = direction === "forward"
        ? "perspective(1000px) rotateY(0deg) scale(1)"
        : "perspective(1000px) rotateY(-15deg) scale(0.8)";
      element.style.opacity = direction === "forward" ? "1" : "0";
    }
  };

  return new Promise((resolve) => {
    transitions[type]();
    setTimeout(resolve, duration);
  });
}

export function createZoomTransition(
  element: HTMLElement,
  options: ZoomTransitionOptions = {}
): Promise<void> {
  const duration = motionDuration(options, 400);
  const easing = options.easing ?? METRO_EASING;
  const fromScale = options.fromScale ?? 0.5;
  const toScale = options.toScale ?? 1;
  const origin = options.origin ?? "center center";
  const fade = options.fade ?? true;

  element.style.transformOrigin = origin;
  element.style.transition = `transform ${duration}ms ${easing}${fade ? `, opacity ${duration}ms ${easing}` : ""}`;
  element.style.transform = `scale(${toScale})`;
  if (fade) element.style.opacity = toScale >= 1 ? "1" : "0";

  return new Promise((resolve) => {
    setTimeout(() => {
      element.style.transform = `scale(${fromScale})`;
      if (fade) element.style.opacity = fromScale >= 1 ? "1" : "0";
      void element.offsetWidth;
      element.style.transform = `scale(${toScale})`;
      if (fade) element.style.opacity = toScale >= 1 ? "1" : "0";
      setTimeout(resolve, duration);
    }, 0);
  });
}

export function semanticZoomTransition(
  element: HTMLElement,
  direction: "in" | "out",
  options: TransitionOptions = {}
): Promise<void> {
  const duration = motionDuration(options, 400);
  const easing = options.easing ?? METRO_EASING;

  element.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}, filter ${duration}ms ${easing}`;

  return new Promise((resolve) => {
    if (direction === "in") {
      element.style.transform = "scale(0.5)";
      element.style.opacity = "0";
      element.style.filter = "blur(4px)";
      void element.offsetWidth;
      element.style.transform = "scale(1)";
      element.style.opacity = "1";
      element.style.filter = "blur(0)";
    } else {
      element.style.transform = "scale(1)";
      element.style.opacity = "1";
      element.style.filter = "blur(0)";
      void element.offsetWidth;
      element.style.transform = "scale(2)";
      element.style.opacity = "0";
      element.style.filter = "blur(4px)";
    }
    setTimeout(resolve, duration);
  });
}

export function crossFadeTransition(
  exitingEl: HTMLElement | null,
  enteringEl: HTMLElement,
  options: TransitionOptions = {}
): Promise<void> {
  const duration = motionDuration(options, 333);
  const easing = options.easing ?? METRO_EASING;

  return new Promise((resolve) => {
    if (exitingEl) {
      exitingEl.style.transition = `opacity ${duration}ms ${easing}`;
      exitingEl.style.opacity = "0";
    }

    enteringEl.style.transition = `opacity ${duration}ms ${easing}`;
    enteringEl.style.opacity = "0";
    void enteringEl.offsetWidth;
    enteringEl.style.opacity = "1";

    setTimeout(() => {
      if (exitingEl) {
        exitingEl.style.opacity = "";
        exitingEl.style.transition = "";
      }
      enteringEl.style.opacity = "";
      enteringEl.style.transition = "";
      resolve();
    }, duration);
  });
}
