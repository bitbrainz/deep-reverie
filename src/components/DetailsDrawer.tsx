import { PropsWithChildren, useEffect, useLayoutEffect, useRef } from "react";
import { Drawer } from "vaul";
import { Dream } from "../dreams/data/dreams";
import { BlacklightComparison } from "./BlacklightComparison";

type DetailsDrawerProps = PropsWithChildren<{
  dream: Dream | null | undefined;
  open: boolean;
  onClose?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
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
}: DetailsDrawerProps) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const detailsScrollRef = useRef<HTMLDivElement>(null);
  const selectedDreamId = dream?.id;
  const canSpeak =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [dream, open]);

  const readDream = () => {
    if (!dream || !canSpeak) return;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance(`${dream.title}. ${dream.imageDescription}`),
    );
  };

  useLayoutEffect(() => {
    if (detailsScrollRef.current) {
      detailsScrollRef.current.scrollTop = 0;
    }
  }, [selectedDreamId]);

  return (
  <Drawer.Root
    open={open}
    onOpenChange={(nextOpen) => {
      if (!nextOpen) onClose?.();
    }}
  >
    {children}
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-40 bg-slate-950/75 backdrop-blur-sm" />
      <Drawer.Content
        data-testid="content"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          closeButtonRef.current?.focus();
        }}
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[94dvh] flex-col overflow-hidden rounded-t-[28px] bg-slate-50 shadow-2xl outline-none sm:inset-y-5 sm:left-auto sm:right-5 sm:max-h-none sm:w-[min(720px,calc(100vw-40px))] sm:rounded-[28px]"
      >
        <Drawer.Title className="sr-only">
          {dream ? `${dream.title} details` : "Dream details"}
        </Drawer.Title>
        <Drawer.Description className="sr-only">
          {dream
            ? `${dream.tagline}. Read the vision, its importance, AI's role, and a description of the artwork.`
            : "Details about the selected dream."}
        </Drawer.Description>
        <div
          ref={detailsScrollRef}
          className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain"
        >
          <div className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-slate-50/95 px-4 backdrop-blur sm:px-6">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Dream details
            </span>
            <Drawer.Close
              ref={closeButtonRef}
              className="grid h-10 w-10 place-items-center rounded-full bg-slate-200 text-xl leading-none text-slate-800 transition hover:bg-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
              aria-label="Close dream details"
            >
              <span aria-hidden="true">×</span>
            </Drawer.Close>
          </div>

          {dream ? (
            <article>
              <div className="relative overflow-hidden bg-slate-900">
                <BlacklightComparison
                  src={`/images/saturated/${dream.fileName.replace(".png", ".webp")}`}
                  alt={dream.title}
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent px-5 pb-10 pt-20 text-white sm:px-8 sm:pb-10">
                  <p className="text-sm text-violet-200">Dream {String(dream.id).padStart(2, "0")}</p>
                  <h1 className="mt-1 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                    {dream.title}
                  </h1>
                  <p className="mt-2 text-sm text-slate-200 sm:text-base">{dream.tagline}</p>
                </div>
              </div>

              <div className="px-5 pt-6 sm:px-8">
                <button
                  type="button"
                  onClick={readDream}
                  disabled={!canSpeak}
                  aria-label={
                    canSpeak
                      ? `Read ${dream.title} aloud`
                      : "Speech synthesis is unavailable in this browser"
                  }
                  title={
                    canSpeak
                      ? `Read ${dream.title} aloud`
                      : "Speech synthesis is unavailable in this browser"
                  }
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-violet-100 px-5 text-sm font-semibold text-violet-950 transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-2"
                >
                  <span aria-hidden="true">▶</span>
                  {canSpeak ? "Read artwork aloud" : "Speech unavailable"}
                </button>
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
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>
  );
};
