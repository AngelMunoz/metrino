import { css, type CSSResult } from "lit";

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

export const animationKeyframes: CSSResult = css`
  @keyframes metro-fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes metro-fade-out {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  @keyframes metro-slide-up {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes metro-slide-left {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }
  @keyframes metro-slide-right {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }
  @keyframes metro-turnstile-in {
    from {
      opacity: 0;
      transform: perspective(1000px) rotateY(10deg) scale(0.9);
    }
    to {
      opacity: 1;
      transform: perspective(1000px) rotateY(0deg) scale(1);
    }
  }
  @keyframes metro-turnstile-out {
    from {
      opacity: 1;
      transform: perspective(1000px) rotateY(0deg) scale(1);
    }
    to {
      opacity: 0;
      transform: perspective(1000px) rotateY(-15deg) scale(0.8);
    }
  }
  @keyframes metro-continuum-enter {
    from {
      opacity: 0;
      transform: scale(0.8) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
  @keyframes metro-continuum-exit {
    from {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    to {
      opacity: 0;
      transform: scale(1.2) translateY(-20px);
    }
  }
  @keyframes metro-tile-flip {
    0% { transform: perspective(1000px) rotateX(0deg); }
    50% { transform: perspective(1000px) rotateX(-90deg); }
    100% { transform: perspective(1000px) rotateX(0deg); }
  }
  @keyframes metro-zoom-in {
    from {
      opacity: 0;
      transform: scale(0.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  @keyframes metro-zoom-out {
    from {
      opacity: 1;
      transform: scale(1);
    }
    to {
      opacity: 0;
      transform: scale(0.5);
    }
  }
  @keyframes metro-semantic-zoom-in {
    from {
      opacity: 0;
      transform: scale(0.5);
      filter: blur(4px);
    }
    to {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
    }
  }
  @keyframes metro-semantic-zoom-out {
    from {
      opacity: 1;
      transform: scale(1);
      filter: blur(0);
    }
    to {
      opacity: 0;
      transform: scale(2);
      filter: blur(4px);
    }
  }
`;

export const animationClasses: CSSResult = css`
  .metro-animate-fade-in {
    animation: metro-fade-in 167ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
  .metro-animate-fade-out {
    animation: metro-fade-out 167ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
  .metro-animate-slide-up {
    animation: metro-slide-up 333ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
  .metro-animate-slide-left {
    animation: metro-slide-left 250ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
  .metro-animate-slide-right {
    animation: metro-slide-right 250ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
  .metro-animate-turnstile-in {
    animation: metro-turnstile-in 450ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
  .metro-animate-turnstile-out {
    animation: metro-turnstile-out 350ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
  .metro-animate-continuum-enter {
    animation: metro-continuum-enter 333ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
  .metro-animate-continuum-exit {
    animation: metro-continuum-exit 333ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
  .metro-animate-tile-flip {
    animation: metro-tile-flip 500ms ease-in-out forwards;
  }
  .metro-animate-zoom-in {
    animation: metro-zoom-in 333ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
  .metro-animate-zoom-out {
    animation: metro-zoom-out 333ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
  .metro-animate-semantic-zoom-in {
    animation: metro-semantic-zoom-in 400ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
  .metro-animate-semantic-zoom-out {
    animation: metro-semantic-zoom-out 400ms cubic-bezier(0.1, 0.9, 0.2, 1) forwards;
  }
`;

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

const ANIMATION_DURATIONS: Record<AnimationName, number> = {
  "fade-in": 167,
  "fade-out": 167,
  "slide-up": 333,
  "slide-left": 250,
  "slide-right": 250,
  "turnstile-in": 450,
  "turnstile-out": 350,
  "continuum-enter": 333,
  "continuum-exit": 333,
  "tile-flip": 500,
  "zoom-in": 333,
  "zoom-out": 333,
  "semantic-zoom-in": 400,
  "semantic-zoom-out": 400
};

export function playAnimation(element: Element, animation: AnimationName): Promise<void> {
  return new Promise((resolve) => {
    const className = ANIMATION_CLASS_MAP[animation];
    const duration = ANIMATION_DURATIONS[animation];

    element.classList.remove(className);

    void (element as HTMLElement).offsetWidth;

    element.classList.add(className);

    setTimeout(() => {
      resolve();
    }, duration);
  });
}

export function animateChildren(
  container: Element,
  animation: AnimationName,
  staggerDelay: number = 50
): Promise<void> {
  return new Promise((resolve) => {
    const children = Array.from(container.children);
    const className = ANIMATION_CLASS_MAP[animation];
    const duration = ANIMATION_DURATIONS[animation];

    children.forEach((child) => {
      child.classList.remove(className);
      (child as HTMLElement).style.opacity = "0";
    });

    void (container as HTMLElement).offsetWidth;

    children.forEach((child, index) => {
      setTimeout(() => {
        (child as HTMLElement).style.opacity = "";
        child.classList.add(className);
      }, index * staggerDelay);
    });

    setTimeout(resolve, duration + children.length * staggerDelay);
  });
}

export const METRO_EASING = "cubic-bezier(0.1, 0.9, 0.2, 1)";
export const METRO_EASING_VALUES = [0.1, 0.9, 0.2, 1] as const;

export function supportsViewTransitions(): boolean {
  return typeof document !== "undefined" && "startViewTransition" in document;
}

export interface ViewTransitionConfig {
  update: () => void | Promise<void>;
  types?: string[];
}

export async function withViewTransition(config: ViewTransitionConfig): Promise<void> {
  if (!supportsViewTransitions()) {
    await config.update();
    return;
  }

  const transition = document.startViewTransition!(async () => {
    await config.update();
  });

  if (config.types) {
    transition.ready.then(() => {
      document.documentElement.classList.add(...config.types!);
    });
  }

  await transition.finished;
}

export function createTransition(
  element: HTMLElement,
  type: TransitionType,
  options: TransitionOptions = {}
): Promise<void> {
  const duration = options.duration ?? 333;
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
      element.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ${easing}`;
      if (direction === "forward") {
        element.style.transform = "scale(1) translateY(0)";
        element.style.opacity = "1";
      } else {
        element.style.transform = "scale(1.2) translateY(-20px)";
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
  const duration = options.duration ?? 400;
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
  const duration = options.duration ?? 400;
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
  const duration = options.duration ?? 333;
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

export const viewTransitionStyles: CSSResult = css`
  ::view-transition-old(root) {
    animation-duration: 333ms;
    animation-timing-function: var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
  }
  ::view-transition-new(root) {
    animation-duration: 333ms;
    animation-timing-function: var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
  }
  ::view-transition-old(zoom-out) {
    animation-name: metro-semantic-zoom-out;
    animation-duration: 400ms;
    animation-timing-function: var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
  }
  ::view-transition-new(zoom-in) {
    animation-name: metro-semantic-zoom-in;
    animation-duration: 400ms;
    animation-timing-function: var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
  }
  :root::view-transition-group(semantic-zoom) {
    animation-duration: 400ms;
    animation-timing-function: var(--metro-easing, cubic-bezier(0.1, 0.9, 0.2, 1));
  }
`;
