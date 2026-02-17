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

export const baseTypography = css`
  :host {
    font-family: var(--metro-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);
  }
`;

export const interactiveHost = css`
  :host {
    cursor: pointer;
    user-select: none;
  }
`;

export const tileSizes = css`
  :host([size="small"]) {
    width: 70px;
    height: 70px;
  }
  :host([size="medium"]) {
    width: 150px;
    height: 150px;
  }
  :host([size="wide"]) {
    width: 310px;
    height: 150px;
  }
  :host([size="large"]) {
    width: 310px;
    height: 310px;
  }
`;

export const inputBase = css`
  :host {
    display: block;
    font-family: var(--metro-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);
  }
  input,
  textarea {
    width: 100%;
    padding: var(--metro-spacing-md, 12px);
    font-size: var(--metro-font-size-normal, 14px);
    font-family: inherit;
    background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
    border: 2px solid transparent;
    border-radius: 0;
    color: var(--metro-foreground, #ffffff);
    outline: none;
    transition: border-color var(--metro-transition-fast, 167ms) ease-out;
    box-sizing: border-box;
  }
  input:focus,
  textarea:focus {
    border-color: var(--metro-accent, #0078d4);
  }
  input::placeholder,
  textarea::placeholder {
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
  }
  input:disabled,
  textarea:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .label {
    display: block;
    margin-bottom: var(--metro-spacing-xs, 4px);
    font-size: var(--metro-font-size-small, 12px);
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
  }
`;

export const toggleControlBase = css`
  :host {
    display: inline-flex;
    align-items: center;
    gap: var(--metro-spacing-sm, 8px);
    cursor: pointer;
    font-family: var(--metro-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);
    font-size: var(--metro-font-size-normal, 14px);
    color: var(--metro-foreground, #ffffff);
  }
  :host([disabled]) {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const tileBase = css`
  :host {
    display: block;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    font-family: var(--metro-font-family, system-ui, -apple-system, "Segoe UI", sans-serif);
  }
`;

export const tileBadge = css`
  .tile-badge {
    position: absolute;
    top: var(--metro-spacing-xs, 4px);
    right: var(--metro-spacing-xs, 4px);
    min-width: 18px;
    height: 18px;
    background: var(--metro-accent, #0078d4);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    padding: 0 4px;
  }
`;

export const transitionFast = css`
  transition-duration: var(--metro-transition-fast, 167ms);
  transition-timing-function: ease-out;
`;

export const hoverHighlight = css`
  :host(:hover) {
    background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
  }
  :host(:active) {
    background: var(--metro-highlight, rgba(255, 255, 255, 0.2));
  }
`;

export const listItemBase = css`
  .list-item-base {
    padding: var(--metro-spacing-md, 12px);
    cursor: pointer;
    color: var(--metro-foreground, #ffffff);
    transition: background-color var(--metro-transition-fast, 167ms) ease-out;
  }
  .list-item-base:hover {
    background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
  }
  .list-item-base.selected {
    background: var(--metro-accent, #0078d4);
  }
`;

export const scrollbarVisible = css`
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: var(--metro-border, rgba(255, 255, 255, 0.2));
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--metro-border, rgba(255, 255, 255, 0.4));
  }
`;

export const scrollbarHidden = css`
  :host {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  :host::-webkit-scrollbar {
    display: none;
  }
`;

export const scrollbarHiddenClass = css`
  .scrollbar-hidden {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .scrollbar-hidden::-webkit-scrollbar {
    display: none;
  }
`;

export const dropdownAnimation = css`
  @keyframes dropdownEnter {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const dialogAnimation = css`
  @keyframes dialogEnter {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

export const modalBackdrop = css`
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
  }
`;

export const closeButton = css`
  .close-btn {
    background: none;
    border: none;
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
    cursor: pointer;
    padding: 4px;
    line-height: 1;
  }
  .close-btn:hover {
    color: var(--metro-foreground, #ffffff);
  }
`;

export const iconButtonBase = css`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 48px;
    min-height: 48px;
    background: transparent;
    border: none;
    color: var(--metro-foreground, #ffffff);
    cursor: pointer;
    transition: background-color var(--metro-transition-fast, 167ms) ease-out;
  }
  :host(:hover) {
    background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
  }
  :host(:active) {
    background: var(--metro-highlight, rgba(255, 255, 255, 0.2));
  }
`;

export const formLabel = css`
  .label {
    display: block;
    margin-bottom: var(--metro-spacing-xs, 4px);
    font-size: var(--metro-font-size-small, 12px);
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.7));
  }
`;

export const pickerRollerBase = css`
  .picker-container {
    display: flex;
    gap: 4px;
    background: var(--metro-background, #1f1f1f);
    border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
    padding: var(--metro-spacing-md, 12px);
    user-select: none;
    touch-action: none;
  }
  .picker-column {
    position: relative;
    height: 180px;
    min-height: 180px;
    flex-shrink: 0;
    overflow: hidden;
    touch-action: none;
  }
  .picker-column::before,
  .picker-column::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 60px;
    pointer-events: none;
    z-index: 1;
  }
  .picker-column::before {
    top: 0;
    background: linear-gradient(to bottom, var(--metro-background, #1f1f1f) 0%, transparent 100%);
  }
  .picker-column::after {
    bottom: 0;
    background: linear-gradient(to top, var(--metro-background, #1f1f1f) 0%, transparent 100%);
  }
  .picker-list {
    list-style: none;
    margin: 0;
    padding: 0;
    position: absolute;
    width: 100%;
    top: calc(50% - 20px);
    transition: transform var(--metro-transition-fast, 167ms) ease-out;
    will-change: transform;
  }
  .picker-item {
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--metro-font-size-normal, 14px);
    color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
    cursor: pointer;
    transition: color var(--metro-transition-fast, 167ms) ease-out;
  }
  .picker-item.selected {
    color: var(--metro-foreground, #ffffff);
    font-size: var(--metro-font-size-medium, 16px);
    font-weight: 600;
  }
  .selection-indicator {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 40px;
    transform: translateY(-50%);
    border-top: 2px solid var(--metro-accent, #0078d4);
    border-bottom: 2px solid var(--metro-accent, #0078d4);
    pointer-events: none;
  }
`;

export const largeTitleTypography = css`
  font-size: var(--metro-font-size-xxlarge, 42px);
  font-weight: 200;
  color: var(--metro-foreground, #ffffff);
`;

export const borderStandard = css`
  border: 2px solid var(--metro-border, rgba(255, 255, 255, 0.2));
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
