import { html, type TemplateResult } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";

export type ComponentDemo = {
  title: string;
  description?: string;
  render: () => TemplateResult;
  code?: string;
};

export function sectionHeader(title: string, description?: string): TemplateResult {
  return html`
    <div class="section-header">
      <h2 class="section-title">${title}</h2>
      ${description ? html`<p class="section-desc">${description}</p>` : null}
    </div>
  `;
}

export function demoItem(
  label: string,
  content: TemplateResult,
  options?: { wide?: boolean; xwide?: boolean; full?: boolean }
): TemplateResult {
  const classes: Record<string, boolean> = {
    "demo-item": true,
  };
  if (options?.wide) classes["wide-item"] = true;
  if (options?.xwide) classes["xwide-item"] = true;
  if (options?.full) classes["full-item"] = true;
  
  return html`
    <div class=${classMap(classes)}>
      <div class="demo-label">${label}</div>
      ${content}
    </div>
  `;
}

export function demoRow(items: TemplateResult[]): TemplateResult {
  return html`<div class="demo-row">${items}</div>`;
}

export function demoGrid(
  items: TemplateResult[],
  options?: { columns?: string }
): TemplateResult {
  const style = options?.columns
    ? styleMap({ gridTemplateColumns: options.columns })
    : styleMap({});
  return html`<div class="demo-grid" style=${style}>${items}</div>`;
}

export function codeBlock(code: string): TemplateResult {
  return html`
    <pre class="code-block"><code>${code}</code></pre>
  `;
}

export function interactiveDemo(
  content: TemplateResult,
  options?: { height?: string }
): TemplateResult {
  const style = options?.height
    ? styleMap({ height: options.height })
    : styleMap({});
  return html`<div class="interactive-demo" style=${style}>${content}</div>`;
}

export function iconSample(icon: string, size: "small" | "normal" | "medium" | "large" | "xlarge" = "medium"): TemplateResult {
  return html`
    <div class="icon-sample">
      <metro-icon icon=${icon} size=${size}></metro-icon>
      <span>${icon}</span>
    </div>
  `;
}

export function tileRow(items: TemplateResult[]): TemplateResult {
  return html`<div class="tile-row">${items}</div>`;
}

export function componentSection(
  title: string,
  demos: ComponentDemo[]
): TemplateResult {
  return html`
    <section class="component-section">
      ${sectionHeader(title)}
      ${demos.map((demo) => html`
        <h3 class="component-title">${demo.title}</h3>
        ${demo.description ? html`<p class="component-desc">${demo.description}</p>` : null}
        ${demo.render()}
        ${demo.code ? codeBlock(demo.code) : null}
      `)}
    </section>
  `;
}
