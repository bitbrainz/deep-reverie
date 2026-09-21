import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { AppBar } from "../components/AppBar";
import { DetailsDrawer } from "../components/DetailsDrawer";
import {
  dreamForTargetIndex,
  TARGET_ASSET_VERSION,
  TARGET_BUNDLE_COUNT,
  TARGET_COUNT,
  TARGETS_PER_BUNDLE,
} from "../ar/targetMapping";
import {
  initialTrackingState,
  TARGET_LOSS_GRACE_MS,
  trackingReducer,
} from "../ar/trackingState";

type MindARAnchor = {
  onTargetFound: (() => void) | null;
  onTargetLost: (() => void) | null;
};

type MindARInstance = {
  addAnchor: (targetIndex: number) => MindARAnchor;
  start: () => Promise<void>;
  stop: () => void;
  renderer?: { dispose: () => void; setAnimationLoop: (callback: null) => void };
  video?: HTMLVideoElement;
};

type MindARConstructor = new (options: {
  container: HTMLElement;
  imageTargetSrc: string;
  maxTrack: number;
  uiLoading: "no";
  uiScanning: "no";
  uiError: "no";
  missTolerance: number;
}) => MindARInstance;

const stopMindAR = (instance: MindARInstance | null, container: HTMLElement | null) => {
  try {
    instance?.renderer?.setAnimationLoop(null);
    instance?.stop();
  } catch {
    // A partially started session may not have a controller to stop yet.
  }
  instance?.renderer?.dispose();
  container?.querySelectorAll("video").forEach((video) => {
    const stream = video.srcObject as MediaStream | null;
    stream?.getTracks().forEach((track) => track.stop());
    video.remove();
  });
  container?.querySelectorAll("canvas").forEach((canvas) => canvas.remove());
};

const cameraErrorMessage = (error: unknown) => {
  if (error instanceof DOMException && error.name === "NotAllowedError") {
    return "Camera permission was denied. Allow camera access in your browser settings, then try again.";
  }
  if (error instanceof DOMException && error.name === "NotFoundError") {
    return "No camera was found on this device.";
  }
  return "The camera or image tracker could not start. Reload the page and try again.";
};

export const AR = () => {
  const [state, dispatch] = useReducer(trackingReducer, initialTrackingState);
  const [selectedBundle, setSelectedBundle] = useState<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const mindarRef = useRef<MindARInstance | null>(null);
  const lossTimerRef = useRef<number | undefined>(undefined);
  const startingRef = useRef(false);

  const clearLossTimer = useCallback(() => {
    if (lossTimerRef.current !== undefined) {
      window.clearTimeout(lossTimerRef.current);
      lossTimerRef.current = undefined;
    }
  }, []);

  const stop = useCallback(() => {
    clearLossTimer();
    stopMindAR(mindarRef.current, containerRef.current);
    mindarRef.current = null;
    startingRef.current = false;
  }, [clearLossTimer]);

  useEffect(() => () => stop(), [stop]);

  const start = async () => {
    if (startingRef.current || mindarRef.current) return;
    if (selectedBundle === undefined) return;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      dispatch({
        type: "ERROR",
        message:
          "This browser cannot start camera-based AR. Use a current browser over HTTPS.",
      });
      return;
    }

    startingRef.current = true;
    dispatch({ type: "START" });
    let instance: MindARInstance | null = null;
    try {
      const module = await import("mind-ar/dist/mindar-image-three.prod.js");
      const MindARThree = module.MindARThree as MindARConstructor;
      const container = containerRef.current;
      if (!container) throw new Error("AR container is unavailable");

      instance = new MindARThree({
        container,
        imageTargetSrc: `/targets/deep-reverie-${TARGET_ASSET_VERSION}-${selectedBundle}.mind`,
        maxTrack: 1,
        uiLoading: "no",
        uiScanning: "no",
        uiError: "no",
        missTolerance: 5,
      });
      mindarRef.current = instance;

      for (
        let localTargetIndex = 0;
        localTargetIndex < TARGETS_PER_BUNDLE;
        localTargetIndex += 1
      ) {
        const targetIndex =
          selectedBundle * TARGETS_PER_BUNDLE + localTargetIndex;
        const anchor = instance.addAnchor(localTargetIndex);
        anchor.onTargetFound = () => {
          clearLossTimer();
          dispatch({ type: "FOUND", targetIndex });
        };
        anchor.onTargetLost = () => {
          dispatch({ type: "LOST", targetIndex });
          clearLossTimer();
          lossTimerRef.current = window.setTimeout(() => {
            dispatch({ type: "LOSS_EXPIRED", targetIndex });
          }, TARGET_LOSS_GRACE_MS);
        };
      }

      await instance.start();
      instance.video?.setAttribute("aria-label", "Live rear camera preview");
      dispatch({ type: "READY" });
    } catch (error) {
      stopMindAR(instance, containerRef.current);
      mindarRef.current = null;
      dispatch({ type: "ERROR", message: cameraErrorMessage(error) });
    } finally {
      startingRef.current = false;
    }
  };

  const retry = () => {
    stop();
    dispatch({ type: "STOP" });
    void start();
  };

  const dream =
    state.targetIndex === undefined
      ? undefined
      : dreamForTargetIndex(state.targetIndex);
  const status =
    state.phase === "loading"
      ? "Loading the on-device artwork tracker and starting the camera…"
      : state.phase === "scanning"
      ? "Scanning for a Deep Reverie artwork. Fill the frame and avoid glare."
      : state.phase === "found"
      ? `Artwork found${state.pendingLoss ? " — holding briefly while tracking recovers" : ""}.`
      : state.error;

  return (
    <div className="min-h-dvh bg-slate-950 text-white">
      <AppBar />
      <DetailsDrawer dream={dream} open={!!dream}>
        <main className="relative flex min-h-[calc(100dvh-52px)] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#164e63,_#020617_60%)] p-6">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-5 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-cyan-200">
              On-device image tracking
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Find the dream inside the image
            </h1>
            <p className="max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
              Start the camera, then frame one of the 54 Deep Reverie artworks.
            </p>
            <div
              ref={containerRef}
              className="relative mt-2 aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-slate-900/80 shadow-2xl shadow-cyan-950 [&_video]:z-0"
            >
              <div className="pointer-events-none absolute inset-4 z-10 rounded-[1.4rem] border border-dashed border-cyan-200/30" />
              {state.phase === "idle" && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-slate-950/55 p-5">
                  <fieldset>
                    <legend className="mb-3 text-sm text-slate-200">
                      Choose the number range printed on the artwork
                    </legend>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from(
                        { length: TARGET_BUNDLE_COUNT },
                        (_, bundleIndex) => {
                          const first = bundleIndex * TARGETS_PER_BUNDLE + 1;
                          const last = first + TARGETS_PER_BUNDLE - 1;
                          return (
                            <button
                              key={bundleIndex}
                              type="button"
                              aria-pressed={selectedBundle === bundleIndex}
                              className={`rounded-full border px-3 py-2 text-xs font-semibold ${
                                selectedBundle === bundleIndex
                                  ? "border-cyan-200 bg-cyan-200 text-slate-950"
                                  : "border-white/30 bg-slate-950/70 text-white hover:bg-white/10"
                              }`}
                              onClick={() => setSelectedBundle(bundleIndex)}
                            >
                              {first}–{last}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </fieldset>
                  <button
                    className="rounded-full bg-white px-6 py-3 font-semibold text-slate-950 shadow-lg transition hover:bg-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
                    onClick={() => void start()}
                    disabled={selectedBundle === undefined}
                  >
                    Start camera
                  </button>
                </div>
              )}
              {state.phase === "loading" && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70">
                  <span className="font-mono text-sm text-cyan-100">Loading tracker…</span>
                </div>
              )}
            </div>
            {status && (
              <p
                role={state.phase === "error" ? "alert" : "status"}
                className={`max-w-xl rounded-2xl px-4 py-2 text-sm ${
                  state.phase === "error"
                    ? "bg-rose-950/80 text-rose-100"
                    : "bg-slate-900/70 text-slate-200"
                }`}
              >
                {status}
              </p>
            )}
            {state.phase === "error" && (
              <button
                className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold hover:bg-white/10"
                onClick={retry}
              >
                Try again
              </button>
            )}
            <details className="w-full max-w-xl rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-left text-xs text-slate-300">
              <summary className="cursor-pointer font-mono uppercase tracking-[0.18em] text-cyan-200">
                Tracker diagnostics
              </summary>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                <dt>Engine</dt>
                <dd>MindAR 1.2.5</dd>
                <dt>Target asset</dt>
                <dd>
                  {TARGET_ASSET_VERSION} · {TARGET_COUNT} targets · bundle {selectedBundle ?? "none"}
                </dd>
                <dt>State</dt>
                <dd>{state.phase}</dd>
                <dt>Target index</dt>
                <dd>{state.targetIndex ?? "none"}</dd>
                <dt>Dream</dt>
                <dd>{dream?.title ?? "none"}</dd>
                <dt>Loss grace</dt>
                <dd>{TARGET_LOSS_GRACE_MS} ms</dd>
              </dl>
            </details>
          </div>
        </main>
      </DetailsDrawer>
    </div>
  );
};
