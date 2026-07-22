import { useEffect, useRef, useState } from "react";
import {
  REVEAL_AT_SECONDS,
  WISTIA_MEDIA_ID,
  WISTIA_SHARE_URL,
} from "@/lib/vsl-config";
import {
  trackVslPlay,
  trackVslProgressMilestone,
  trackVslRevealPoint,
  VSL_PROGRESS_MILESTONES,
} from "@/lib/meta-pixel";

interface WistiaVideo {
  time(): number;
  duration(): number;
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

function isPlayingState(state: string): boolean {
  return state === "playing" || state === "play" || state === "buffering";
}

async function resolveMediaIdFromShareUrl(shareUrl: string): Promise<string | null> {
  try {
    const endpoint = `https://fast.wistia.com/oembed?url=${encodeURIComponent(shareUrl)}&format=json`;
    const response = await fetch(endpoint);
    if (!response.ok) return null;

    const data = (await response.json()) as { html?: string };
    const match = data.html?.match(/embed\/iframe\/([a-z0-9]+)/i);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

interface WistiaVslProps {
  onReachThreshold: () => void;
  trackThreshold?: boolean;
}

export function WistiaVsl({ onReachThreshold, trackThreshold = true }: WistiaVslProps) {
  const onReachThresholdRef = useRef(onReachThreshold);
  const trackThresholdRef = useRef(trackThreshold);
  onReachThresholdRef.current = onReachThreshold;
  trackThresholdRef.current = trackThreshold;

  const [mediaId, setMediaId] = useState<string | null>(null);
  const [useShareIframe, setUseShareIframe] = useState(false);

  useEffect(() => {
    let cancelled = false;

    resolveMediaIdFromShareUrl(WISTIA_SHARE_URL).then((resolvedId) => {
      if (cancelled) return;

      if (resolvedId) {
        setMediaId(resolvedId);
        return;
      }

      setMediaId(WISTIA_MEDIA_ID);
      setUseShareIframe(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!useShareIframe) return;

    let thresholdReached = false;
    let playTracked = false;
    let revealPointTracked = false;
    const milestonesFired = new Set<number>();

    const handleMessage = (event: MessageEvent) => {
      if (!String(event.origin).includes("wistia")) return;

      let payload: Record<string, unknown> | null = null;
      try {
        payload =
          typeof event.data === "string"
            ? (JSON.parse(event.data) as Record<string, unknown>)
            : (event.data as Record<string, unknown>);
      } catch {
        return;
      }

      const eventName = String(payload.event ?? payload.method ?? "");
      const currentTime = Number(payload.time ?? payload.seconds ?? 0);
      const duration = Number(payload.duration ?? REVEAL_AT_SECONDS);

      if (eventName === "play" && !playTracked) {
        playTracked = true;
        trackVslPlay(currentTime);
      }

      if (currentTime > 0) {
        for (const milestone of VSL_PROGRESS_MILESTONES) {
          if (milestonesFired.has(milestone)) continue;
          const thresholdTime = (duration * milestone) / 100;
          if (currentTime >= thresholdTime) {
            milestonesFired.add(milestone);
            trackVslProgressMilestone(milestone, currentTime, duration);
          }
        }

        if (!revealPointTracked && currentTime >= REVEAL_AT_SECONDS) {
          revealPointTracked = true;
          trackVslRevealPoint(currentTime);
        }

        if (trackThresholdRef.current && !thresholdReached && currentTime >= REVEAL_AT_SECONDS) {
          thresholdReached = true;
          onReachThresholdRef.current();
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [useShareIframe]);

  useEffect(() => {
    if (!mediaId || useShareIframe) return;
    loadWistiaScript();
  }, [mediaId, useShareIframe]);

  useEffect(() => {
    if (!mediaId || useShareIframe) return;

    let mounted = true;
    let video: WistiaVideo | null = null;
    let thresholdReached = false;
    let playTracked = false;
    let revealPointTracked = false;
    let pollInterval: ReturnType<typeof setInterval> | null = null;
    const milestonesFired = new Set<number>();

    const tryRevealThreshold = (player: WistiaVideo) => {
      if (
        trackThresholdRef.current &&
        !thresholdReached &&
        player.time() >= REVEAL_AT_SECONDS
      ) {
        thresholdReached = true;
        onReachThresholdRef.current();
      }
    };

    const trackMilestonesWhilePlaying = (player: WistiaVideo) => {
      if (!isPlayingState(player.state())) return;

      const currentTime = player.time();
      const duration = player.duration() || REVEAL_AT_SECONDS;

      for (const milestone of VSL_PROGRESS_MILESTONES) {
        if (milestonesFired.has(milestone)) continue;
        const thresholdTime = (duration * milestone) / 100;
        if (currentTime >= thresholdTime) {
          milestonesFired.add(milestone);
          trackVslProgressMilestone(milestone, currentTime, duration);
        }
      }

      if (!revealPointTracked && currentTime >= REVEAL_AT_SECONDS) {
        revealPointTracked = true;
        trackVslRevealPoint(currentTime);
      }
    };

    const checkProgress = (player: WistiaVideo) => {
      trackMilestonesWhilePlaying(player);
      tryRevealThreshold(player);
    };

    const stopPolling = () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
    };

    const startPolling = () => {
      stopPolling();
      pollInterval = setInterval(() => {
        if (!video) return;
        checkProgress(video);
      }, 1000);
    };

    const onPlay = () => {
      if (!video) return;

      if (!playTracked) {
        playTracked = true;
        trackVslPlay(video.time());
      }

      checkProgress(video);
      startPolling();
    };

    const onPause = () => {
      stopPolling();
      if (!video) return;
      tryRevealThreshold(video);
    };

    const onSecondChange = () => {
      if (!video) return;
      checkProgress(video);
    };

    const onEnd = () => {
      stopPolling();
      if (!video) return;
      tryRevealThreshold(video);
    };

    const initPlayer = () => {
      window._wq = window._wq || [];
      window._wq.push({
        id: mediaId,
        onReady: (player) => {
          if (!mounted) return;
          video = player;
          player.bind("play", onPlay);
          player.bind("pause", onPause);
          player.bind("secondchange", onSecondChange);
          player.bind("end", onEnd);
        },
      });
    };

    loadWistiaScript().then(() => {
      if (!mounted) return;
      initPlayer();
    });

    return () => {
      mounted = false;
      stopPolling();
      if (video) {
        video.unbind("play", onPlay);
        video.unbind("pause", onPause);
        video.unbind("secondchange", onSecondChange);
        video.unbind("end", onEnd);
      }
    };
  }, [mediaId, useShareIframe]);

  if (!mediaId) {
    return (
      <div id="vsl-section" className="vsl-player-wrap">
        <div className="vsl-player-frame flex items-center justify-center text-[var(--cream)]/70 text-sm">
          Carregando vídeo…
        </div>
      </div>
    );
  }

  if (useShareIframe) {
    return (
      <div id="vsl-section" className="vsl-player-wrap">
        <div className="vsl-player-frame">
          <iframe
            src={`${WISTIA_SHARE_URL}`}
            title="Código Invisível — VSL"
            allow="autoplay; fullscreen"
            allowFullScreen
            className="h-full w-full border-0"
            style={{ position: "relative" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div id="vsl-section" className="vsl-player-wrap">
      <div className="vsl-player-frame">
        <div
          className={`wistia_embed wistia_async_${mediaId} seo=false videoFoam=true`}
          style={{ height: "100%", width: "100%", position: "relative" }}
        >
          &nbsp;
        </div>
      </div>
    </div>
  );
}
