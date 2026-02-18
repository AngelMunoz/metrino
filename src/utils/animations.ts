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
  | "tile-flip";

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
