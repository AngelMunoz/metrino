/**
 * API Documentation Viewer Component
 * 
 * Renders Custom Elements Manifest (CEM) data for Metrino components
 * in a Metro Design Language styled interface.
 */

import { LitElement, html, css } from "lit";

interface CEMDeclaration {
  kind: string;
  name: string;
  description?: string;
  cssProperties?: Array<{
    name: string;
    description?: string;
    default?: string;
  }>;
  cssParts?: Array<{
    name: string;
    description?: string;
  }>;
  slots?: Array<{
    name: string;
    description?: string;
  }>;
  events?: Array<{
    name: string;
    description?: string;
    type?: {
      text: string;
    };
  }>;
  attributes?: Array<{
    name: string;
    description?: string;
    type?: {
      text: string;
    };
    default?: string;
    fieldName?: string;
  }>;
  members?: Array<{
    kind: string;
    name: string;
    description?: string;
    type?: {
      text: string;
    };
    default?: string;
    attribute?: string;
    privacy?: string;
    static?: boolean;
    parameters?: Array<{
      name: string;
      type?: {
        text: string;
      };
      description?: string;
    }>;
    return?: {
      type?: {
        text: string;
      };
      description?: string;
    };
  }>;
}

interface CEMModule {
  path: string;
  declarations: CEMDeclaration[];
}

interface CEMSchema {
  schemaVersion: string;
  modules: CEMModule[];
}

export class ApiDocs extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: var(
        --metro-font-family,
        system-ui,
        -apple-system,
        "Segoe UI",
        sans-serif
      );
      color: var(--metro-foreground, #ffffff);
      margin-top: var(--metro-spacing-lg, 16px);
    }

    .api-container {
      border: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      background: var(--metro-background-alt, #2d2d2d);
    }

    .api-header {
      background: var(--metro-highlight, rgba(255, 255, 255, 0.1));
      padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
      border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.2));
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .api-title {
      font-size: var(--metro-font-size-medium, 16px);
      font-weight: 400;
      margin: 0;
      color: var(--metro-accent, #0078d4);
    }

    .api-tag {
      font-size: var(--metro-font-size-small, 12px);
      padding: 2px 8px;
      background: var(--metro-accent, #0078d4);
      color: var(--metro-foreground, #ffffff);
    }

    .api-section {
      padding: var(--metro-spacing-md, 12px) var(--metro-spacing-lg, 16px);
      border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.1));
    }

    .api-section:last-child {
      border-bottom: none;
    }

    .section-title {
      font-size: var(--metro-font-size-small, 12px);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin: 0 0 var(--metro-spacing-md, 12px) 0;
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
    }

    .description {
      font-size: var(--metro-font-size-normal, 14px);
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.8));
      margin: 0 0 var(--metro-spacing-md, 12px) 0;
      line-height: 1.5;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--metro-font-size-small, 12px);
    }

    th {
      text-align: left;
      padding: var(--metro-spacing-sm, 8px);
      border-bottom: 2px solid var(--metro-border, rgba(255, 255, 255, 0.3));
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      font-weight: 400;
      text-transform: uppercase;
      font-size: 11px;
      letter-spacing: 0.5px;
    }

    td {
      padding: var(--metro-spacing-sm, 8px);
      border-bottom: 1px solid var(--metro-border, rgba(255, 255, 255, 0.1));
      vertical-align: top;
    }

    tr:last-child td {
      border-bottom: none;
    }

    .name-cell {
      font-family: "Consolas", "Monaco", monospace;
      color: var(--metro-accent, #0078d4);
      font-weight: 500;
      white-space: nowrap;
    }

    .type-cell {
      font-family: "Consolas", "Monaco", monospace;
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.8));
    }

    .default-cell {
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.6));
      font-style: italic;
    }

    .desc-cell {
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.8));
      line-height: 1.4;
    }

    .required-badge {
      display: inline-block;
      font-size: 10px;
      padding: 1px 4px;
      background: var(--metro-accent, #0078d4);
      color: white;
      margin-left: 4px;
      vertical-align: middle;
    }

    .no-data {
      color: var(--metro-foreground-secondary, rgba(255, 255, 255, 0.5));
      font-style: italic;
      padding: var(--metro-spacing-md, 12px);
      text-align: center;
    }

    .privacy-private {
      text-decoration: line-through;
      opacity: 0.5;
    }

    .signature {
      font-family: "Consolas", "Monaco", monospace;
      background: var(--metro-background, #1f1f1f);
      padding: 2px 6px;
      font-size: 11px;
    }
  `;

  static properties = {
    component: { type: String },
    _manifest: { state: true },
  };

  declare component: string;
  declare _manifest: CEMSchema | null;

  connectedCallback(): void {
    super.connectedCallback();
    this.#loadManifest();
  }

  async #loadManifest(): Promise<void> {
    try {
      const response = await fetch("/custom-elements.json");
      if (response.ok) {
        this._manifest = await response.json();
      }
    } catch (error) {
      console.error("Failed to load CEM manifest:", error);
    }
  }

  private get declaration(): CEMDeclaration | undefined {
    if (!this._manifest) return undefined;
    
    for (const module of this._manifest.modules) {
      const decl = module.declarations?.find(
        (d: CEMDeclaration) => d.name === this.component
      );
      if (decl) return decl;
    }
    return undefined;
  }

  private get componentAttributes() {
    const decl = this.declaration;
    if (!decl) return [];
    
    const attrs = decl.attributes || [];
    const members = decl.members || [];
    
    // Merge attributes with their corresponding properties
    return attrs.map((attr) => {
      const member = members.find(
        (m) => m.kind === "field" && m.name === attr.fieldName
      );
      return {
        ...attr,
        type: attr.type || member?.type,
        default: member?.default,
      };
    });
  }

  private get componentMethods() {
    const decl = this.declaration;
    if (!decl) return [];
    
    return (decl.members || []).filter(
      (m) => m.kind === "method" && m.privacy !== "private" && !m.static && !m.name.startsWith("#")
    );
  }

  private get componentEvents() {
    return this.declaration?.events || [];
  }

  private get componentSlots() {
    return this.declaration?.slots || [];
  }

  private get componentCssProperties() {
    return this.declaration?.cssProperties || [];
  }

  private get componentCssParts() {
    return this.declaration?.cssParts || [];
  }

  render() {
    const decl = this.declaration;

    if (!decl) {
      return html`
        <div class="api-container">
          <div class="api-header">
            <h3 class="api-title">API Reference</h3>
          </div>
          <div class="api-section">
            <div class="no-data">
              ${this._manifest 
                ? `No documentation available for ${this.component}` 
                : "Loading API documentation..."}
            </div>
          </div>
        </div>
      `;
    }

    return html`
      <div class="api-container">
        <div class="api-header">
          <h3 class="api-title">&lt;${this.component}&gt;</h3>
          <span class="api-tag">API Reference</span>
        </div>

        ${decl.description
          ? html`
              <div class="api-section">
                <h4 class="section-title">Description</h4>
                <p class="description">${decl.description}</p>
              </div>
            `
          : null}

        ${this.componentAttributes.length > 0
          ? html`
              <div class="api-section">
                <h4 class="section-title">Attributes & Properties</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Attribute</th>
                      <th>Type</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.componentAttributes.map(
                      (attr) => html`
                        <tr>
                          <td class="name-cell">
                            ${attr.name}
                            ${attr.type?.text?.includes("undefined")
                              ? ""
                              : html`<span class="required-badge">required</span>`}
                          </td>
                          <td class="type-cell">${attr.type?.text || "-"}</td>
                          <td class="default-cell">${attr.default || "-"}</td>
                          <td class="desc-cell">${attr.description || "-"}</td>
                        </tr>
                      `
                    )}
                  </tbody>
                </table>
              </div>
            `
          : null}

        ${this.componentMethods.length > 0
          ? html`
              <div class="api-section">
                <h4 class="section-title">Methods</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Method</th>
                      <th>Parameters</th>
                      <th>Returns</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.componentMethods.map(
                      (method) => html`
                        <tr>
                          <td class="name-cell">${method.name}()</td>
                          <td class="type-cell">
                            ${method.parameters?.length
                              ? method.parameters.map(
                                  (p) => html`
                                    <div>
                                      <span class="signature">${p.name}: ${p.type?.text || "any"}</span>
                                    </div>
                                  `
                                )
                              : "-"}
                          </td>
                          <td class="type-cell">
                            ${method.return?.type?.text || "void"}
                          </td>
                          <td class="desc-cell">${method.description || "-"}</td>
                        </tr>
                      `
                    )}
                  </tbody>
                </table>
              </div>
            `
          : null}

        ${this.componentEvents.length > 0
          ? html`
              <div class="api-section">
                <h4 class="section-title">Events</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Event</th>
                      <th>Detail Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.componentEvents.map(
                      (event) => html`
                        <tr>
                          <td class="name-cell">${event.name}</td>
                          <td class="type-cell">${event.type?.text || "-"}</td>
                          <td class="desc-cell">${event.description || "-"}</td>
                        </tr>
                      `
                    )}
                  </tbody>
                </table>
              </div>
            `
          : null}

        ${this.componentSlots.length > 0
          ? html`
              <div class="api-section">
                <h4 class="section-title">Slots</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.componentSlots.map(
                      (slot) => html`
                        <tr>
                          <td class="name-cell">${slot.name || "(default)"}</td>
                          <td class="desc-cell">${slot.description || "-"}</td>
                        </tr>
                      `
                    )}
                  </tbody>
                </table>
              </div>
            `
          : null}

        ${this.componentCssProperties.length > 0
          ? html`
              <div class="api-section">
                <h4 class="section-title">CSS Custom Properties</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Default</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.componentCssProperties.map(
                      (prop) => html`
                        <tr>
                          <td class="name-cell">${prop.name}</td>
                          <td class="default-cell">${prop.default || "-"}</td>
                          <td class="desc-cell">${prop.description || "-"}</td>
                        </tr>
                      `
                    )}
                  </tbody>
                </table>
              </div>
            `
          : null}

        ${this.componentCssParts.length > 0
          ? html`
              <div class="api-section">
                <h4 class="section-title">CSS Shadow Parts</h4>
                <table>
                  <thead>
                    <tr>
                      <th>Part</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.componentCssParts.map(
                      (part) => html`
                        <tr>
                          <td class="name-cell">${part.name}</td>
                          <td class="desc-cell">${part.description || "-"}</td>
                        </tr>
                      `
                    )}
                  </tbody>
                </table>
              </div>
            `
          : null}
      </div>
    `;
  }
}

customElements.define("api-docs", ApiDocs);
