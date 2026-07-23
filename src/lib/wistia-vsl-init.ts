import { WISTIA_MEDIA_ID } from "@/lib/vsl-config";

export interface WistiaVideo {
  time(): number;
  duration(): number;
  state(): string;
  play(): void;
  unmute(): void;
  isMuted(): boolean;
  volume(value?: number): number;
  bind(event: string, callback: (...args: unknown[]) => void): void;
  unbind(event: string, callback?: (...args: unknown[]) => void): void;
}

type ReadyHandler = (video: WistiaVideo) => void;

let readyHandler: ReadyHandler | null = null;

export function registerWistiaVslReady(handler: ReadyHandler | null) {
  readyHandler = handler;

  if (typeof window === "undefined" || !handler) {
    if (typeof window !== "undefined") {
      window.__vslOnReady = null;
    }
    return;
  }

  window.__vslOnReady = handler;

  const existing = window.Wistia?.api?.(WISTIA_MEDIA_ID);
  if (existing) {
    handler(existing);
  }
}

export const WISTIA_IFRAME_SRC =
  `https://fast.wistia.net/embed/iframe/${WISTIA_MEDIA_ID}` +
  "?autoPlay=true" +
  "&muted=false" +
  "&silentAutoPlay=false" +
  "&volume=100" +
  "&videoFoam=true" +
  "&controlsVisibleOnLoad=false" +
  "&playbar=false" +
  "&smallPlayButton=false" +
  "&fullscreenButton=false" +
  "&settingsControl=false" +
  "&playSuspendedOffScreen=false" +
  "&playsinline=true";

/** Script síncrono no <head>, antes do E-v1.js — obrigatório para autoplay com som. */
export function getWistiaQueueInitScript(): string {
  return `
window._wq = window._wq || [];
window.__vslOnReady = null;
window._wq.push({
  id: ${JSON.stringify(WISTIA_MEDIA_ID)},
  options: {
    autoPlay: true,
    muted: false,
    silentAutoPlay: false,
    volume: 1,
    controlsVisibleOnLoad: false,
    playbar: false,
    smallPlayButton: false,
    fullscreenButton: false,
    settingsControl: false,
    playSuspendedOffScreen: false,
    playsinline: true
  },
  onReady: function(video) {
    if (window.__vslOnReady) window.__vslOnReady(video);
  }
});
`.trim();
}

declare global {
  interface Window {
    _wq?: Array<Record<string, unknown>>;
    __vslOnReady?: ReadyHandler | null;
    Wistia?: {
      api?: (id: string) => WistiaVideo | null;
    };
  }
}

export function ensureVslReadyBridge() {
  registerWistiaVslReady(readyHandler);
}
