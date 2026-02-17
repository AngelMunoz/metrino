import { LitElement, html, css } from "lit";
import { baseTypography } from "../../styles/shared.ts";

export class MetroMediaElement extends LitElement {
  static properties = {
    src: { type: String, reflect: true },
    type: { type: String, reflect: true },
    autoplay: { type: Boolean, reflect: true },
    controls: { type: Boolean, reflect: true },
    muted: { type: Boolean, reflect: true },
    loop: { type: Boolean, reflect: true },
    poster: { type: String, reflect: true },
  };

  declare src: string;
  declare type: "audio" | "video";
  declare autoplay: boolean;
  declare controls: boolean;
  declare muted: boolean;
  declare loop: boolean;
  declare poster: string;

  #mediaElement: HTMLAudioElement | HTMLVideoElement | null = null;

  static styles = [
    baseTypography,
    css`
      :host {
        display: block;
        max-width: 100%;
      }
      .media-container {
        background: var(--metro-background, #1f1f1f);
        max-width: 100%;
      }
      video,
      audio {
        max-width: 100%;
        display: block;
      }
      video {
        width: 100%;
        background: #000;
      }
      audio {
        width: 100%;
      }
      audio::-webkit-media-controls-panel,
      video::-webkit-media-controls-panel {
        background: var(--metro-background, #1f1f1f);
      }
      audio::-webkit-media-controls-current-time-display,
      video::-webkit-media-controls-current-time-display,
      audio::-webkit-media-controls-time-remaining-display,
      video::-webkit-media-controls-time-remaining-display {
        color: var(--metro-foreground, #ffffff);
      }
      audio::-webkit-media-controls-play-button,
      video::-webkit-media-controls-play-button {
        filter: invert(1);
      }
      audio::-webkit-media-controls-mute-button,
      video::-webkit-media-controls-mute-button {
        filter: invert(1);
      }
      audio::-webkit-media-controls-volume-slider,
      video::-webkit-media-controls-volume-slider,
      audio::-webkit-media-controls-timeline,
      video::-webkit-media-controls-timeline {
        accent-color: var(--metro-accent, #0078d4);
      }
      audio::-webkit-media-controls-fullscreen-button,
      video::-webkit-media-controls-fullscreen-button {
        filter: invert(1);
      }
    `,
  ];

  constructor() {
    super();
    this.src = "";
    this.type = "video";
    this.autoplay = false;
    this.controls = true;
    this.muted = false;
    this.loop = false;
    this.poster = "";
  }

  render() {
    if (this.type === "audio") {
      return html`
        <div class="media-container">
          <audio
            id="media"
            src=${this.src || ""}
            ?autoplay=${this.autoplay}
            ?controls=${this.controls}
            ?muted=${this.muted}
            ?loop=${this.loop}
            @play=${this.#handlePlay}
            @pause=${this.#handlePause}
            @ended=${this.#handleEnded}
            @timeupdate=${this.#handleTimeUpdate}
            @volumechange=${this.#handleVolumeChange}
          ></audio>
        </div>
      `;
    }
    return html`
      <div class="media-container">
        <video
          id="media"
          src=${this.src || ""}
          poster=${this.poster || ""}
          ?autoplay=${this.autoplay}
          ?controls=${this.controls}
          ?muted=${this.muted}
          ?loop=${this.loop}
          @play=${this.#handlePlay}
          @pause=${this.#handlePause}
          @ended=${this.#handleEnded}
          @timeupdate=${this.#handleTimeUpdate}
          @volumechange=${this.#handleVolumeChange}
        ></video>
      </div>
    `;
  }

  firstUpdated(): void {
    this.#mediaElement = this.renderRoot.querySelector("#media") as HTMLAudioElement | HTMLVideoElement;
  }

  #handlePlay(e: Event): void {
    this.dispatchEvent(new CustomEvent("play", {
      detail: { originalEvent: e },
      bubbles: true,
      composed: true,
    }));
  }

  #handlePause(e: Event): void {
    this.dispatchEvent(new CustomEvent("pause", {
      detail: { originalEvent: e },
      bubbles: true,
      composed: true,
    }));
  }

  #handleEnded(e: Event): void {
    this.dispatchEvent(new CustomEvent("ended", {
      detail: { originalEvent: e },
      bubbles: true,
      composed: true,
    }));
  }

  #handleTimeUpdate(e: Event): void {
    const target = e.target as HTMLMediaElement;
    this.dispatchEvent(new CustomEvent("timeupdate", {
      detail: {
        currentTime: target.currentTime,
        duration: target.duration,
        originalEvent: e,
      },
      bubbles: true,
      composed: true,
    }));
  }

  #handleVolumeChange(e: Event): void {
    const target = e.target as HTMLMediaElement;
    this.dispatchEvent(new CustomEvent("volumechange", {
      detail: {
        volume: target.volume,
        muted: target.muted,
        originalEvent: e,
      },
      bubbles: true,
      composed: true,
    }));
  }

  play(): void {
    this.#mediaElement?.play();
  }

  pause(): void {
    this.#mediaElement?.pause();
  }

  seek(time: number): void {
    if (this.#mediaElement) {
      this.#mediaElement.currentTime = time;
    }
  }
}

customElements.define("metro-media-element", MetroMediaElement);

declare global {
  interface HTMLElementTagNameMap {
    "metro-media-element": MetroMediaElement;
  }
}
