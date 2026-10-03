import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Drawer } from "vaul";
import { Dream } from "../dreams/data/dreams";
import { getNarrationUrl } from "../dreams/data/narrations";
import { BlacklightComparison } from "./BlacklightComparison";
import { getDreamDetailUrl } from "../dreams/dreamArtwork";

type DetailsDrawerProps = PropsWithChildren<{
  dream: Dream | null | undefined;
  open: boolean;
  onClose?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  backgroundInteractive?: boolean;
}>;

const DetailSection = ({ title, children }: PropsWithChildren<{ title: string }>) => (
  <section className="border-t border-slate-200 pt-5">
    <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">{title}</h2>
    <p className="mt-2 text-[15px] leading-7 text-slate-700">{children}</p>
  </section>
);

export const DetailsDrawer = ({
  children,
  dream,
  open,
  onClose,
  onPrevious,
  onNext,
  backgroundInteractive = false,
}: DetailsDrawerProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const detailsScrollRef = useRef<HTMLDivElement>(null);
  const activeNarrationRef = useRef<{
    audio: HTMLAudioElement;
    dreamId: number;
  } | null>(null);
  const [playback, setPlayback] = useState<{
    dreamId: number | null;
    status: "idle" | "playing" | "error";
  }>({ dreamId: null, status: "idle" });
  const [showScrollCue, setShowScrollCue] = useState(false);
  const selectedDreamId = dream?.id;
  const RootPrimitive = backgroundInteractive ? Dialog.Root : Drawer.Root;
  const PortalPrimitive = backgroundInteractive ? Dialog.Portal : Drawer.Portal;
  const OverlayPrimitive = backgroundInteractive ? Dialog.Overlay : Drawer.Overlay;
  const ContentPrimitive = backgroundInteractive ? Dialog.Content : Drawer.Content;
  const TitlePrimitive = backgroundInteractive ? Dialog.Title : Drawer.Title;
  const DescriptionPrimitive = backgroundInteractive
    ? Dialog.Description
    : Drawer.Description;
  const ClosePrimitive = backgroundInteractive ? Dialog.Close : Drawer.Close;
  const narrationUrl = dream ? getNarrationUrl(dream.id) : null;
  const narrationAvailable = narrationUrl !== null && typeof Audio !== "undefined";
  const playbackStatus =
    playback.dreamId === selectedDreamId ? playback.status : "idle";

  const stopActiveNarration = useCallback(() => {
    const activeNarration = activeNarrationRef.current;
    if (!activeNarration) return;

    activeNarrationRef.current = null;
    activeNarration.audio.onended = null;
    activeNarration.audio.onerror = null;
    activeNarration.audio.pause();

    try {
      activeNarration.audio.currentTime = 0;
    } catch {
      // A failed media resource may not expose a seekable timeline.
    }
  }, []);

  useEffect(() => {
    return stopActiveNarration;
  }, [selectedDreamId, open, stopActiveNarration]);

  useEffect(() => {
    if (!open || backgroundInteractive) return;

    const page = document.documentElement;
    const previousOverflow = page.style.overflow;
    const previousOverscrollBehavior = page.style.overscrollBehavior;
    page.style.overflow = "hidden";
    page.style.overscrollBehavior = "none";

    return () => {
      page.style.overflow = previousOverflow;
      page.style.overscrollBehavior = previousOverscrollBehavior;
    };
  }, [backgroundInteractive, open]);

  const toggleNarration = () => {
    if (!dream || !narrationUrl || !narrationAvailable) return;

    if (playbackStatus === "playing") {
      stopActiveNarration();
      setPlayback({ dreamId: dream.id, status: "idle" });
      return;
    }

    stopActiveNarration();

    let audio: HTMLAudioElement;
    try {
      audio = new Audio(narrationUrl);
    } catch {
      setPlayback({ dreamId: dream.id, status: "error" });
      return;
    }

    activeNarrationRef.current = { audio, dreamId: dream.id };
    setPlayback({ dreamId: dream.id, status: "playing" });

    const markUnavailable = () => {
      if (activeNarrationRef.current?.audio !== audio) return;

      stopActiveNarration();
      setPlayback({ dreamId: dream.id, status: "error" });
    };

    audio.onended = () => {
      if (activeNarrationRef.current?.audio !== audio) return;

      activeNarrationRef.current = null;
      setPlayback({ dreamId: dream.id, status: "idle" });
    };
    audio.onerror = markUnavailable;

    try {
      void audio.play().catch(markUnavailable);
    } catch {
      markUnavailable();
    }
  };

  useLayoutEffect(() => {
    if (detailsScrollRef.current) {
      detailsScrollRef.current.scrollTop = 0;
    }
    setShowScrollCue(open && selectedDreamId !== undefined);
  }, [open, selectedDreamId]);

  return (
  <RootPrimitive
    open={open}
    modal={!backgroundInteractive}
    onOpenChange={(nextOpen) => {
      if (!nextOpen) onClose?.();
    }}
  >
    {children}
    <PortalPrimitive>
      <OverlayPrimitive
        className={`fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm ${backgroundInteractive ? "pointer-events-none" : ""}`}
      />
      <ContentPrimitive
        data-testid="content"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          closeButtonRef.current?.focus();
        }}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col overflow-hidden rounded-t-[28px] bg-slate-50 shadow-2xl outline-none sm:inset-y-5 sm:left-auto sm:right-5 sm:max-h-none sm:w-[min(720px,calc(100vw-40px))] sm:rounded-[28px]"
      >
        <TitlePrimitive className="sr-only">
          {dream ? `${dream.title} details` : "Dream details"}
        </TitlePrimitive>
        <DescriptionPrimitive className="sr-only">
          {dream
            ? `${dream.tagline}. Read the vision, its importance, AI's role, and a description of the artwork.`
            : "Details about the selected dream."}
        </DescriptionPrimitive>
        <div
          ref={detailsScrollRef}
          className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
          onScroll={(event) => {
            if (event.currentTarget.scrollTop > 0) setShowScrollCue(false);
          }}
        >
          <div className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-slate-50/95 px-4 backdrop-blur sm:px-6">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Dream details
            </span>
            <ClosePrimitive
              ref={closeButtonRef}
              className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-xl leading-none text-slate-800 transition hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
              aria-label="Close dream details"
            >
              <span aria-hidden="true">×</span>
            </ClosePrimitive>
          </div>

          {dream ? (
            <article>
              <div className="relative overflow-hidden bg-slate-900">
                <BlacklightComparison
                  src={getDreamDetailUrl(dream)}
                  alt={dream.title}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent px-5 pb-10 pt-20 text-white sm:px-8 sm:pb-10">
                  <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                    {dream.title}
                  </h1>
                  <p className="mt-2 text-sm text-slate-200 sm:text-base">{dream.tagline}</p>
                </div>
              </div>

              <div className="px-5 pt-6 sm:px-8">
                <button
                  type="button"
                  onClick={toggleNarration}
                  disabled={!narrationAvailable}
                  aria-label={
                    !narrationAvailable
                      ? `Narration unavailable for ${dream.title}`
                      : playbackStatus === "playing"
                        ? `Stop narration for ${dream.title}`
                        : `Play narration for ${dream.title}`
                  }
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-violet-100 px-5 text-sm font-semibold text-violet-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
                >
                  <span aria-hidden="true">{playbackStatus === "playing" ? "■" : "▶"}</span>
                  {!narrationAvailable
                    ? "Narration unavailable"
                    : playbackStatus === "playing"
                      ? "Stop narration"
                      : playbackStatus === "error"
                        ? "Try narration again"
                        : "Play narration"}
                </button>
                {playbackStatus === "error" ? (
                  <p className="mt-2 text-sm text-rose-700" role="status">
                    Narration is unavailable right now. Please try again.
                  </p>
                ) : null}
              </div>

              <div className="space-y-6 px-5 py-7 sm:px-8 sm:py-8">
                <DetailSection title="The vision">{dream.explanation}</DetailSection>
                <DetailSection title="Why it matters">{dream.importance}</DetailSection>
                <DetailSection title="AI's role">{dream.aiRole}</DetailSection>
                <DetailSection title="About the artwork">{dream.imageDescription}</DetailSection>
              </div>
            </article>
          ) : (
            <p className="p-8 text-slate-600">Select a dream to explore its story.</p>
          )}
        </div>

        {showScrollCue ? (
          <div
            className={`pointer-events-none absolute inset-x-0 z-30 flex justify-center ${dream && onPrevious && onNext ? "bottom-20" : "bottom-4"}`}
            role="status"
            aria-label="More dream details below"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[#f2d795]/50 bg-[#080711]/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#faf8ff] shadow-lg backdrop-blur">
              <span aria-hidden="true" className="text-base leading-none text-[#f2d795]">↓</span>
              Scroll to explore
            </span>
          </div>
        ) : null}

        {dream && onPrevious && onNext ? (
          <nav className="flex shrink-0 gap-3 border-t border-slate-200 bg-white p-4 sm:px-6" aria-label="Browse dreams">
            <button
              type="button"
              onClick={onPrevious}
              className="min-h-11 flex-1 rounded-full border border-slate-300 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={onNext}
              className="min-h-11 flex-1 rounded-full bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
            >
              Next →
            </button>
          </nav>
        ) : null}
      </ContentPrimitive>
    </PortalPrimitive>
  </RootPrimitive>
  );
};
