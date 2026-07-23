import { Volume2 } from "lucide-react";
import "@/lib/wistia-vsl-init";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
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
  player.volume(1);
  player.unmute();
  if (!isPlayingState(player.state())) {
    player.play();
  }
}

function shouldShowSoundPrompt(player: WistiaVideo): boolean {
  return player.isMuted();
}

interface VslPlayerShellProps {
  children: ReactNode;
  showSoundPrompt: boolean;
  onEnableSound: () => void;
}

function VslPlayerShell({ children, showSoundPrompt, onEnableSound }: VslPlayerShellProps) {
  return (
    <div id="vsl-section" className="vsl-player-wrap">
      <div className="vsl-player-frame">
        {children}
        {showSoundPrompt && (
          <button
            type="button"
            className="vsl-sound-overlay"
            onClick={onEnableSound}
            aria-label="Toque na tela para ativar o som"
          >
            <span className="vsl-sound-overlay__icon-wrap" aria-hidden="true">
              <Volume2 className="vsl-sound-overlay__icon" />
            </span>
            <span className="vsl-sound-overlay__label">Toque na tela para ativar o som</span>
          </button>
        )}
      </div>
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

  const videoRef = useRef<WistiaVideo | null>(null);
  const [showSoundPrompt, setShowSoundPrompt] = useState(true);

  const syncSoundPrompt = useCallback((player: WistiaVideo) => {
    setShowSoundPrompt(shouldShowSoundPrompt(player));
  }, []);

  const handleEnableSound = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    startPlaybackWithSound(video);
    setShowSoundPrompt(false);
  }, []);

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

      syncSoundPrompt(video);
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
        setShowSoundPrompt(true);
      }
    };

    registerWistiaVslReady((player) => {
      video = player;
      videoRef.current = player;

      startPlaybackWithSound(player);
      window.setTimeout(() => syncSoundPrompt(player), 400);
      window.setTimeout(() => syncSoundPrompt(player), 1200);

      player.bind("play", onPlay);
      player.bind("pause", onPause);
      player.bind("secondchange", onSecondChange);
      player.bind("end", onEnd);
      player.bind("silentplaybackmodechange", onSilentPlaybackModeChange);
    });

    return () => {
      registerWistiaVslReady(null);
      videoRef.current = null;
      stopPolling();
      if (video) {
        video.unbind("play", onPlay);
        video.unbind("pause", onPause);
        video.unbind("secondchange", onSecondChange);
        video.unbind("end", onEnd);
        video.unbind("silentplaybackmodechange", onSilentPlaybackModeChange);
      }
    };
  }, [syncSoundPrompt]);

  return (
    <VslPlayerShell showSoundPrompt={showSoundPrompt} onEnableSound={handleEnableSound}>
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
