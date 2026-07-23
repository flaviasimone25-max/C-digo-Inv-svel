import "@/lib/wistia-vsl-init";
import { useEffect, useRef, type ReactNode } from "react";
import { REVEAL_AT_SECONDS } from "@/lib/vsl-config";
import {
  ensureVslReadyBridge,
  registerWistiaVslReady,
  WISTIA_IFRAME_SRC,
  type WistiaVideo,
} from "@/lib/wistia-vsl-init";
import {
  trackVslPlay,
  trackVslProgressMilestone,
  trackVslRevealPoint,
  VSL_PROGRESS_MILESTONES,
} from "@/lib/meta-pixel";

function isPlayingState(state: string): boolean {
  return state === "playing" || state === "play" || state === "buffering";
}

function startPlaybackWithSound(player: WistiaVideo) {
  const attempt = () => {
    player.volume(1);
    player.unmute();
    if (!isPlayingState(player.state())) {
      player.play();
    }
  };

  attempt();
  for (const delay of [50, 150, 400, 800, 1500, 3000]) {
    window.setTimeout(attempt, delay);
  }
}

function VslPlayerShell({ children }: { children: ReactNode }) {
  return (
    <div id="vsl-section" className="vsl-player-wrap">
      <div className="vsl-player-frame">{children}</div>
    </div>
  );
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

  useEffect(() => {
    ensureVslReadyBridge();

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

      startPlaybackWithSound(video);
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

    const onSilentPlaybackModeChange = (inSilentMode: unknown) => {
      if (!video) return;
      if (inSilentMode === true || inSilentMode === "true") {
        startPlaybackWithSound(video);
      }
    };

    registerWistiaVslReady((player) => {
      video = player;
      startPlaybackWithSound(player);

      player.bind("play", onPlay);
      player.bind("pause", onPause);
      player.bind("secondchange", onSecondChange);
      player.bind("end", onEnd);
      player.bind("silentplaybackmodechange", onSilentPlaybackModeChange);
    });

    return () => {
      registerWistiaVslReady(null);
      stopPolling();
      if (video) {
        video.unbind("play", onPlay);
        video.unbind("pause", onPause);
        video.unbind("secondchange", onSecondChange);
        video.unbind("end", onEnd);
        video.unbind("silentplaybackmodechange", onSilentPlaybackModeChange);
      }
    };
  }, []);

  return (
    <VslPlayerShell>
      <iframe
        src={WISTIA_IFRAME_SRC}
        title="Código Invisível — VSL"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
        style={{ position: "relative" }}
      />
    </VslPlayerShell>
  );
}
