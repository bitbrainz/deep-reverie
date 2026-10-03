import {
  forwardRef,
  memo,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { Dream } from "../dreams/data/dreams";
import { getNarrationUrl } from "../dreams/data/narrations";

type ARDreamPopoverProps = {
  dream: Dream;
  onDetails: () => void;
};

type PlaybackStatus = "starting" | "playing" | "idle" | "error" | "unavailable";

export const ARDreamPopover = memo(
  forwardRef<HTMLElement, ARDreamPopoverProps>(function ARDreamPopover(
    { dream, onDetails },
    ref,
  ) {
    const titleId = useId();
    const activeAudioRef = useRef<HTMLAudioElement | null>(null);
    const [playbackStatus, setPlaybackStatus] =
      useState<PlaybackStatus>("starting");
    const narrationUrl = getNarrationUrl(dream.id);

    const stopNarration = useCallback(() => {
      const audio = activeAudioRef.current;
      if (!audio) return;

      activeAudioRef.current = null;
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        // A failed media resource may not expose a seekable timeline.
      }
    }, []);

    const startNarration = useCallback(() => {
      stopNarration();
      if (!narrationUrl || typeof Audio === "undefined") {
        setPlaybackStatus("unavailable");
        return;
      }

      let audio: HTMLAudioElement;
      try {
        audio = new Audio(narrationUrl);
      } catch {
        setPlaybackStatus("error");
        return;
      }

      activeAudioRef.current = audio;
      setPlaybackStatus("starting");

      const markUnavailable = () => {
        if (activeAudioRef.current !== audio) return;
        stopNarration();
        setPlaybackStatus("error");
      };

      audio.onended = () => {
        if (activeAudioRef.current !== audio) return;
        activeAudioRef.current = null;
        setPlaybackStatus("idle");
      };
      audio.onerror = markUnavailable;

      try {
        const playback = audio.play();
        setPlaybackStatus("playing");
        void playback.catch(markUnavailable);
      } catch {
        markUnavailable();
      }
    }, [narrationUrl, stopNarration]);

    // Start during the selection commit so mobile browsers retain the tap's
    // transient media-playback permission.
    useLayoutEffect(() => {
      startNarration();
      return stopNarration;
    }, [startNarration, stopNarration]);

    return (
      <aside
        ref={ref}
        className="ar-dream-popover"
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        data-testid="ar-dream-popover"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId}>{dream.title}</h2>
        <p className="ar-dream-popover__tagline">{dream.tagline}</p>
        <p className="ar-dream-popover__copy">{dream.explanation}</p>
        <footer className="ar-dream-popover__footer">
          <span
            className={`ar-dream-popover__status ${playbackStatus === "playing" ? "is-playing" : ""}`}
          >
            <i aria-hidden="true" />
            {playbackStatus === "playing"
              ? "Narrating"
              : playbackStatus === "starting"
                ? "Starting audio"
                : playbackStatus === "error"
                  ? "Audio interrupted"
                  : playbackStatus === "unavailable"
                    ? "Audio unavailable"
                    : "Narration stopped"}
          </span>
          <button
            type="button"
            className="ar-dream-popover__details"
            onClick={onDetails}
          >
            Details
          </button>
        </footer>
        {playbackStatus === "error" ? (
          <p className="ar-dream-popover__error" role="status">
            Narration could not start on this device.
          </p>
        ) : null}
      </aside>
    );
  }),
);
