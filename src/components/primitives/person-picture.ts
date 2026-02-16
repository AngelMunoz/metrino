import { LitElement, html, css } from "lit";

const baseStyles = css`
  :host {
    display: inline-block;
  }
  .person-picture {
    position: relative;
    border-radius: 50%;
    overflow: hidden;
    background: var(--metro-accent, #0078d4);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    font-weight: 300;
  }
  .person-picture img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .person-initials {
    font-family: var(--metro-font-family, system-ui, -apple-system, sans-serif);
  }
  .presence-indicator {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 25%;
    height: 25%;
    border-radius: 50%;
    border: 2px solid var(--metro-background, #1f1f1f);
  }
  .presence-indicator.available { background: #00a300; }
  .presence-indicator.away { background: #f09609; }
  .presence-indicator.busy { background: #e51400; }
  .presence-indicator.offline { background: var(--metro-foreground-secondary, rgba(255,255,255,0.5)); }
  
  :host([size="small"]) .person-picture { width: 32px; height: 32px; font-size: 12px; }
  :host([size="normal"]) .person-picture { width: 48px; height: 48px; font-size: 16px; }
  :host([size="large"]) .person-picture { width: 64px; height: 64px; font-size: 24px; }
  :host([size="xlarge"]) .person-picture { width: 96px; height: 96px; font-size: 36px; }
`;

export class MetroPersonPicture extends LitElement {
  static properties = {
    src: { type: String, reflect: true },
    displayName: { type: String, reflect: true },
    initials: { type: String, reflect: true },
    presence: { type: String, reflect: true },
    size: { type: String, reflect: true },
  };

  declare src: string;
  declare displayName: string;
  declare initials: string;
  declare presence: "available" | "away" | "busy" | "offline";
  declare size: "small" | "normal" | "large" | "xlarge";

  static styles = baseStyles;

  constructor() {
    super();
    this.src = "";
    this.displayName = "";
    this.initials = "";
    this.presence = "offline";
    this.size = "normal";
  }

  render() {
    const initials = this.initials || this.#getInitials(this.displayName);

    return html`
      <div class="person-picture" title=${this.displayName}>
        ${this.src 
          ? html`<img src="${this.src}" alt="${this.displayName}" @error=${this.#handleImageError} />`
          : html`<span class="person-initials">${initials}</span>`
        }
        ${this.presence !== "offline" 
          ? html`<span class="presence-indicator ${this.presence}"></span>` 
          : ""}
      </div>
    `;
  }

  #getInitials(name: string): string {
    if (!name) return "";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  #handleImageError(): void {
    this.src = "";
  }
}

customElements.define("metro-person-picture", MetroPersonPicture);

declare global {
  interface HTMLElementTagNameMap {
    "metro-person-picture": MetroPersonPicture;
  }
}
