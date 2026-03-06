import { type TemplateResult } from "lit";
export type ComponentDemo = {
    title: string;
    description?: string;
    render: () => TemplateResult;
    code?: string;
};
export declare function sectionHeader(title: string, description?: string): TemplateResult;
export declare function demoItem(label: string, content: TemplateResult, options?: {
    wide?: boolean;
    xwide?: boolean;
    full?: boolean;
}): TemplateResult;
export declare function demoRow(items: TemplateResult[]): TemplateResult;
export declare function demoGrid(items: TemplateResult[], options?: {
    columns?: string;
}): TemplateResult;
export declare function codeBlock(code: string): TemplateResult;
export declare function interactiveDemo(content: TemplateResult, options?: {
    height?: string;
}): TemplateResult;
export declare function iconSample(icon: string, size?: "small" | "normal" | "medium" | "large" | "xlarge"): TemplateResult;
export declare function tileRow(items: TemplateResult[]): TemplateResult;
export declare function componentSection(title: string, demos: ComponentDemo[]): TemplateResult;
//# sourceMappingURL=index.d.ts.map