import { useEffect, useRef } from "react";
import { REVEAL_AT_SECONDS, WISTIA_MEDIA_ID } from "@/lib/vsl-config";

interface WistiaVideo {
  time(): number;
  state(): string;
  bind(event: string, callback: (...args: unknown[]) => void): void;
  unbind(event: string, callback?: (...args: unknown[]) => void): void;
}

declare global {
  interface Window {
    _wq?: Array<{ id: string; onReady: (video: WistiaVideo) => void }>;
    Wistia?: unknown;
  }
}

let wistiaScriptPromise: Promise<void> | null = null;

function loadWistiaScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Wistia) return Promise.resolve();
  if (wistiaScriptPromise) return wistiaScriptPromise;

  wistiaScriptPromise = new Promise((resolve) => {
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

  return wistiaScriptPromise;
}

interface WistiaVslProps {
  onReachThreshold: () => void;
  /** Quando false, o player é exibido mas não monitora o tempo de liberação. */
  trackThreshold?: boolean;
}

export function WistiaVsl({ onReachThreshold, trackThreshold = true }: WistiaVslProps) {
  const onReachThresholdRef = useRef(onReachThreshold);
  onReachThresholdRef.current = onReachThreshold;

  useEffect(() => {
    loadWistiaScript();
  }, []);

  useEffect(() => {
    if (!trackThreshold) return;

    let mounted = true;
    let video: WistiaVideo | null = null;
    let thresholdReached = false;

    const checkPlaybackTime = (player: WistiaVideo) => {
      if (thresholdReached || player.state() !== "playing") return;
      if (player.time() >= REVEAL_AT_SECONDS) {
        thresholdReached = true;
        onReachThresholdRef.current();
      }
    };

    const onPlay = () => {
      if (!video) return;
      checkPlaybackTime(video);
    };

    const onSecondChange = () => {
      if (!video) return;
      checkPlaybackTime(video);
    };

    const initPlayer = () => {
      window._wq = window._wq || [];
      window._wq.push({
        id: WISTIA_MEDIA_ID,
        onReady: (player) => {
          if (!mounted) return;
          video = player;
          player.bind("play", onPlay);
          player.bind("secondchange", onSecondChange);
        },
      });
    };

    loadWistiaScript().then(() => {
      if (!mounted) return;
      initPlayer();
    });

    return () => {
      mounted = false;
      if (video) {
        video.unbind("play", onPlay);
        video.unbind("secondchange", onSecondChange);
      }
    };
  }, [trackThreshold]);

  return (
    <div className="vsl-player-wrap">
      <div className="vsl-player-frame">
        <div
          className={`wistia_embed wistia_async_${WISTIA_MEDIA_ID} seo=false videoFoam=true`}
          style={{ height: "100%", width: "100%", position: "relative" }}
        >
          &nbsp;
        </div>
      </div>
    </div>
  );
}
