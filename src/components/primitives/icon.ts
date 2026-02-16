import { LitElement, html, css } from "lit";
import {
  mdiHome,
  mdiArrowLeft,
  mdiArrowRight,
  mdiArrowUp,
  mdiArrowDown,
  mdiMenu,
  mdiCog,
  mdiMagnify,
  mdiRefresh,
  mdiPlus,
  mdiMinus,
  mdiDelete,
  mdiPencil,
  mdiContentSave,
  mdiClose,
  mdiCheck,
  mdiCloseCircle,
  mdiDotsVertical,
  mdiPin,
  mdiPinOff,
  mdiHeart,
  mdiHeartOutline,
  mdiShareVariant,
  mdiDownload,
  mdiUpload,
  mdiEmail,
  mdiMessageText,
  mdiPhone,
  mdiCamera,
  mdiVideo,
  mdiMusic,
  mdiPlay,
  mdiPause,
  mdiStop,
  mdiSkipPrevious,
  mdiSkipNext,
  mdiVolumeHigh,
  mdiVolumeOff,
  mdiStar,
  mdiStarOutline,
  mdiAccount,
  mdiAccountGroup,
  mdiCalendar,
  mdiClock,
  mdiMapMarker,
  mdiMap,
  mdiEarth,
  mdiWifi,
  mdiBluetooth,
  mdiBattery,
  mdiBatteryCharging,
  mdiAlert,
  mdiAlertCircle,
  mdiInformation,
  mdiHelpCircle,
  mdiShopping,
  mdiCart,
  mdiTag,
  mdiBookmark,
  mdiFlag,
  mdiSync,
  mdiUndo,
  mdiRedo,
  mdiContentCut,
  mdiContentCopy,
  mdiContentPaste,
  mdiSelectAll,
  mdiMagnifyPlus,
  mdiMagnifyMinus,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiCrop,
  mdiRotate3dVariant,
  mdiFilter,
  mdiSort,
  mdiFolder,
  mdiFileDocument,
  mdiFile,
  mdiFormatListBulleted,
  mdiGrid,
  mdiViewGrid,
  mdiEye,
  mdiEyeOff,
  mdiPrinter,
  mdiSend,
  mdiPaperclip,
  mdiLink,
  mdiLinkOff,
  mdiLock,
  mdiLockOpen,
  mdiKey,
  mdiShield,
  mdiArrowAll,
  mdiResize,
  mdiOpenInNew,
  mdiFolderOpen,
  mdiImport,
  mdiExport,
  mdiTimer,
  mdiTimerSand,
  mdiAirplane,
  mdiTrain,
  mdiBus,
  mdiCar,
  mdiWalk,
  mdiCardAccountDetails,
  mdiAccountCircle,
  mdiMicrophone,
  mdiMicrophoneOff,
  mdiPhoneForward,
  mdiPhoneHangup,
  mdiVoicemail,
  mdiKeyboard,
  mdiEmoticon,
  mdiChevronDown,
  mdiChevronUp,
  mdiCheckCircle,
} from "@mdi/js";

const iconMap: Record<string, string> = {
  home: mdiHome,
  back: mdiArrowLeft,
  forward: mdiArrowRight,
  up: mdiArrowUp,
  down: mdiArrowDown,
  menu: mdiMenu,
  settings: mdiCog,
  search: mdiMagnify,
  refresh: mdiRefresh,
  add: mdiPlus,
  remove: mdiMinus,
  delete: mdiDelete,
  edit: mdiPencil,
  save: mdiContentSave,
  cancel: mdiClose,
  accept: mdiCheck,
  check: mdiCheck,
  close: mdiClose,
  clear: mdiCloseCircle,
  more: mdiDotsVertical,
  pin: mdiPin,
  unpin: mdiPinOff,
  favorite: mdiHeart,
  unfavorite: mdiHeartOutline,
  share: mdiShareVariant,
  download: mdiDownload,
  upload: mdiUpload,
  mail: mdiEmail,
  message: mdiMessageText,
  phone: mdiPhone,
  camera: mdiCamera,
  video: mdiVideo,
  music: mdiMusic,
  play: mdiPlay,
  pause: mdiPause,
  stop: mdiStop,
  previous: mdiSkipPrevious,
  next: mdiSkipNext,
  volume: mdiVolumeHigh,
  mute: mdiVolumeOff,
  star: mdiStar,
  "star-empty": mdiStarOutline,
  user: mdiAccount,
  users: mdiAccountGroup,
  calendar: mdiCalendar,
  clock: mdiClock,
  location: mdiMapMarker,
  map: mdiMap,
  globe: mdiEarth,
  wifi: mdiWifi,
  bluetooth: mdiBluetooth,
  battery: mdiBattery,
  "battery-charging": mdiBatteryCharging,
  warning: mdiAlert,
  error: mdiAlertCircle,
  info: mdiInformation,
  help: mdiHelpCircle,
  shop: mdiShopping,
  cart: mdiCart,
  tag: mdiTag,
  bookmark: mdiBookmark,
  flag: mdiFlag,
  sync: mdiSync,
  undo: mdiUndo,
  redo: mdiRedo,
  cut: mdiContentCut,
  copy: mdiContentCopy,
  paste: mdiContentPaste,
  "select-all": mdiSelectAll,
  "zoom-in": mdiMagnifyPlus,
  "zoom-out": mdiMagnifyMinus,
  fullscreen: mdiFullscreen,
  "fullscreen-exit": mdiFullscreenExit,
  crop: mdiCrop,
  rotate: mdiRotate3dVariant,
  filter: mdiFilter,
  sort: mdiSort,
  folder: mdiFolder,
  document: mdiFileDocument,
  page: mdiFile,
  list: mdiFormatListBulleted,
  grid: mdiGrid,
  tiles: mdiViewGrid,
  view: mdiEye,
  preview: mdiEye,
  print: mdiPrinter,
  send: mdiSend,
  attach: mdiPaperclip,
  link: mdiLink,
  unlink: mdiLinkOff,
  lock: mdiLock,
  unlock: mdiLockOpen,
  key: mdiKey,
  shield: mdiShield,
  important: mdiAlert,
  priority: mdiFlag,
  move: mdiArrowAll,
  resize: mdiResize,
  "new-window": mdiOpenInNew,
  open: mdiFolderOpen,
  import: mdiImport,
  export: mdiExport,
  go: mdiArrowRight,
  stopwatch: mdiTimer,
  timer: mdiTimerSand,
  world: mdiEarth,
  plane: mdiAirplane,
  train: mdiTrain,
  bus: mdiBus,
  car: mdiCar,
  walk: mdiWalk,
  contact: mdiAccount,
  contacts: mdiAccountGroup,
  "contact-info": mdiCardAccountDetails,
  "contact-presence": mdiAccountCircle,
  "video-chat": mdiVideo,
  audio: mdiVolumeHigh,
  microphone: mdiMicrophone,
  "microphone-off": mdiMicrophoneOff,
  call: mdiPhone,
  "call-forward": mdiPhoneForward,
  "hang-up": mdiPhoneHangup,
  voicemail: mdiVoicemail,
  text: mdiMessageText,
  keyboard: mdiKeyboard,
  emoji: mdiEmoticon,
  eye: mdiEye,
  "eye-off": mdiEyeOff,
  "chevron-down": mdiChevronDown,
  "chevron-up": mdiChevronUp,
  success: mdiCheckCircle,
};

const baseStyles = css`
  :host {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    color: currentColor;
  }
  svg {
    width: 1em;
    height: 1em;
    fill: currentColor;
    vertical-align: middle;
  }
  :host([size="small"]) {
    font-size: 12px;
  }
  :host([size="normal"]) {
    font-size: 16px;
  }
  :host([size="medium"]) {
    font-size: 20px;
  }
  :host([size="large"]) {
    font-size: 24px;
  }
  :host([size="xlarge"]) {
    font-size: 32px;
  }
`;

export class MetroIcon extends LitElement {
  static properties = {
    icon: { type: String, reflect: true },
    size: { type: String, reflect: true },
  };

  declare icon: string;
  declare size: "small" | "normal" | "medium" | "large" | "xlarge";

  static styles = baseStyles;

  constructor() {
    super();
    this.icon = "";
    this.size = "normal";
  }

  render() {
    const path = iconMap[this.icon];
    if (!path) {
      return html`<svg viewBox="0 0 24 24"></svg>`;
    }
    return html`<svg viewBox="0 0 24 24"><path d=${path}></path></svg>`;
  }
}

customElements.define("metro-icon", MetroIcon);

export { iconMap };

declare global {
  interface HTMLElementTagNameMap {
    "metro-icon": MetroIcon;
  }
}
