import { css } from "lit";

export const focusRing = css`
  :host(:focus) {
    outline: 2px solid var(--metro-accent, #0078d4);
    outline-offset: 2px;
  }
`;

export const pressState = css`
  :host(.pressed) {
    background: var(--metro-highlight-active, rgba(255, 255, 255, 0.08));
  }
`;

export const disabledState = css`
  :host([disabled]) {
    opacity: 0.4;
    cursor: default;
    pointer-events: none;
  }
`;

export const tiltEffect = css`
  :host(.tilt) {
    transform-style: preserve-3d;
    perspective: 1000px;
  }
  :host(.tilt) .tilt-content {
    transition: transform var(--metro-transition-fast, 167ms) ease-out;
    transform-style: preserve-3d;
  }
`;

export function applyTiltEffect(el: HTMLElement): () => void {
  const handlePointerDown = (e: PointerEvent) => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    
    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    el.style.transition = "transform 100ms ease-out";
  };

  const handlePointerUp = () => {
    el.style.transform = "";
    el.style.transition = "transform 167ms ease-out";
  };

  el.addEventListener("pointerdown", handlePointerDown);
  el.addEventListener("pointerup", handlePointerUp);
  el.addEventListener("pointerleave", handlePointerUp);

  return () => {
    el.removeEventListener("pointerdown", handlePointerDown);
    el.removeEventListener("pointerup", handlePointerUp);
    el.removeEventListener("pointerleave", handlePointerUp);
  };
}
