import { LitElement } from "lit";
import type { CSSResultGroup, HTMLTemplateResult } from "lit";
type AnimationType = "metro-animate-fade-in" | "metro-animate-fade-out" | "metro-animate-slide-up" | "metro-animate-slide-left" | "metro-animate-slide-right" | "metro-animate-slide-down" | "metro-animate-tile-flip" | "metro-animate-progress-ring" | "metro-entrance-stagger" | "metro-animate-turnstile-in" | "metro-animate-turnstile-out" | "metro-animate-continuum-enter" | "metro-animate-continuum-exit" | "metro-turnstile-feather" | "metro-theme-transition";
type EasingType = "metro-easing" | "linear" | "ease-in" | "ease-out";
export declare class MetrinoAnimationsPage extends LitElement {
    #private;
    static styles: CSSResultGroup;
    static properties: {
        selectedAnimation: {
            type: StringConstructor;
        };
        duration: {
            type: NumberConstructor;
        };
        easing: {
            type: StringConstructor;
        };
        staggerEnabled: {
            type: BooleanConstructor;
        };
        isPlaying: {
            type: BooleanConstructor;
        };
    };
    selectedAnimation: AnimationType;
    duration: number;
    easing: EasingType;
    staggerEnabled: boolean;
    isPlaying: boolean;
    constructor();
    render(): HTMLTemplateResult;
}
export {};
//# sourceMappingURL=animations.d.ts.map