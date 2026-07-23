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

export const WISTIA_EMBED_CLASS =
  `wistia_embed wistia_async_${WISTIA_MEDIA_ID}` +
  " seo=false videoFoam=true autoPlay=true muted=true silentAutoPlay=allow";

/** Script síncrono no <head>, antes do E-v1.js. */
export function getWistiaQueueInitScript(): string {
  return `
window._wq = window._wq || [];
window.__vslOnReady = null;
window._wq.push({
  id: ${JSON.stringify(WISTIA_MEDIA_ID)},
  options: {
    autoPlay: true,
    muted: true,
    silentAutoPlay: "allow",
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

function loadWistiaScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Wistia) return Promise.resolve();

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>('script[src*="E-v1.js"]');
    if (existing) {
      if (window.Wistia) resolve();
      else existing.addEventListener("load", () => resolve(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://fast.wistia.net/assets/external/E-v1.js";
    script.async = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

export function ensureWistiaScriptLoaded() {
  void loadWistiaScript();
}
