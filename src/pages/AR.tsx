import { useCallback, useEffect, useRef, useState } from "react";
// MindAR 1.2.5 exposes its bundled image Controller as `C`; the version and
// generated filename are intentionally pinned together in package.json.
import {
  C as Controller,
  type MindARUpdate,
} from "mind-ar/dist/controller-mGt1s8dJ.js";
import { AppBar } from "../components/AppBar";
import { DetailsDrawer } from "../components/DetailsDrawer";
import {
  dreamForTargetIndex,
  PILOT_TARGET_ASSET,
} from "../ar/pilotTargets";
import {
  INITIAL_RECOGNITION_STATE,
  TARGET_LOSS_GRACE_MS,
  transitionRecognition,
  type RecognitionEvent,
} from "../ar/recognitionState";

type ARStatus =
  | "idle"
  | "loading"
  | "scanning"
  | "permission-denied"
  | "unsupported"
  | "initialization-failed";

const stopStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};

const waitForVideo = (video: HTMLVideoElement, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
      resolve();
      return;
    }

    const cleanUp = () => {
      video.removeEventListener("loadedmetadata", onLoaded);
      signal.removeEventListener("abort", onAbort);
    };
    const onLoaded = () => {
      cleanUp();
      resolve();
    };
    const onAbort = () => {
      cleanUp();
      reject(new DOMException("AR initialization cancelled", "AbortError"));
    };

    video.addEventListener("loadedmetadata", onLoaded, { once: true });
    signal.addEventListener("abort", onAbort, { once: true });
  });

const statusCopy: Record<ARStatus, { title: string; detail: string }> = {
  idle: {
    title: "Ready to scan",
    detail: "Start the camera, then point it at one of the pilot artworks.",
  },
  loading: {
    title: "Preparing image tracking",
    detail: "Loading the on-device target bundle and warming up the camera.",
  },
  scanning: {
    title: "Scanning for an artwork",
    detail: "Hold a pilot artwork steady and keep the full image in frame.",
  },
  "permission-denied": {
    title: "Camera permission denied",
    detail: "Allow camera access in your browser settings, then try again.",
  },
  unsupported: {
    title: "Camera AR is not supported",
    detail: "Use a current mobile browser over HTTPS with camera access.",
  },
  "initialization-failed": {
    title: "AR could not start",
    detail: "Close other camera apps, check your connection, and try again.",
  },
};

export const AR = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef(INITIAL_RECOGNITION_STATE);
  const lossTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<ARStatus>("idle");
  const [sessionRequest, setSessionRequest] = useState(0);
  const [activeTargetIndex, setActiveTargetIndex] = useState<number | null>(null);

  const clearLossTimer = useCallback(() => {
    if (lossTimerRef.current !== null) {
      clearTimeout(lossTimerRef.current);
      lossTimerRef.current = null;
    }
  }, []);

  const commitRecognition = useCallback(
    (event: RecognitionEvent) => {
      const next = transitionRecognition(recognitionRef.current, event);
      recognitionRef.current = next;
      setActiveTargetIndex(next.activeTargetIndex);

      if (event.type === "target-found") {
        clearLossTimer();
      } else if (event.type === "target-lost" && next.clearAt !== null) {
        clearLossTimer();
        lossTimerRef.current = setTimeout(() => {
          const afterGrace = transitionRecognition(recognitionRef.current, {
            type: "grace-elapsed",
            at: Date.now(),
          });
          recognitionRef.current = afterGrace;
          setActiveTargetIndex(afterGrace.activeTargetIndex);
          lossTimerRef.current = null;
        }, TARGET_LOSS_GRACE_MS);
      }
    },
    [clearLossTimer],
  );

  const resetRecognition = useCallback(() => {
    clearLossTimer();
    recognitionRef.current = INITIAL_RECOGNITION_STATE;
    setActiveTargetIndex(null);
  }, [clearLossTimer]);

  useEffect(() => {
    if (sessionRequest === 0) return;

    const video = videoRef.current;
    const abortController = new AbortController();
    const visibleTargets = new Set<number>();
    let stream: MediaStream | null = null;
    let controller: Controller | null = null;

    resetRecognition();

    const stopSession = () => {
      const activeController = controller;
      controller = null;
      activeController?.dispose();
      stopStream(stream);
      stream = null;
      visibleTargets.clear();
      if (video) {
        video.pause();
        video.srcObject = null;
      }
    };

    const onUpdate = (update: MindARUpdate) => {
      if (update.type !== "updateMatrix") return;

      const isVisible = update.worldMatrix !== null;
      const wasVisible = visibleTargets.has(update.targetIndex);
      if (isVisible && !wasVisible) {
        visibleTargets.add(update.targetIndex);
        if (dreamForTargetIndex(update.targetIndex)) {
          commitRecognition({
            type: "target-found",
            targetIndex: update.targetIndex,
            at: Date.now(),
          });
        }
      } else if (!isVisible && wasVisible) {
        visibleTargets.delete(update.targetIndex);
        commitRecognition({
          type: "target-lost",
          targetIndex: update.targetIndex,
          at: Date.now(),
        });
      }
    };

    const start = async () => {
      if (!video || !window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
        setStatus("unsupported");
        return;
      }

      setStatus("loading");
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (abortController.signal.aborted) {
          stopStream(stream);
          return;
        }

        video.srcObject = stream;
        await waitForVideo(video, abortController.signal);
        video.width = video.videoWidth;
        video.height = video.videoHeight;
        await video.play();

        controller = new Controller({
          inputWidth: video.videoWidth,
          inputHeight: video.videoHeight,
          maxTrack: 1,
          warmupTolerance: 3,
          missTolerance: 5,
          onUpdate,
        });

        const targetUrl = `${import.meta.env.BASE_URL}ar/${PILOT_TARGET_ASSET}`;
        const targetResponse = await fetch(targetUrl, {
          signal: abortController.signal,
        });
        if (!targetResponse.ok) {
          throw new Error(`Target bundle request failed: ${targetResponse.status}`);
        }
        const targetBuffer = await targetResponse.arrayBuffer();
        controller.addImageTargetsFromBuffer(targetBuffer);
        await controller.dummyRun(video);

        if (abortController.signal.aborted) return;
        controller.processVideo(video);
        setStatus("scanning");
      } catch (error) {
        if (abortController.signal.aborted) return;
        stopSession();
        const errorName = error instanceof DOMException ? error.name : "";
        setStatus(
          errorName === "NotAllowedError" || errorName === "SecurityError"
            ? "permission-denied"
            : "initialization-failed",
        );
      }
    };

    void start();

    return () => {
      abortController.abort();
      stopSession();
      resetRecognition();
    };
  }, [commitRecognition, resetRecognition, sessionRequest]);

  useEffect(() => clearLossTimer, [clearLossTimer]);

  const selectedDream =
    activeTargetIndex === null
      ? undefined
      : dreamForTargetIndex(activeTargetIndex);
  const copy = statusCopy[status];
  const canRetry =
    status === "permission-denied" || status === "initialization-failed";

  return (
    <main className="h-[100dvh] overflow-hidden bg-gray-950 text-white">
      <AppBar />
      <DetailsDrawer dream={selectedDream} open={Boolean(selectedDream)}>
        <section className="relative h-[calc(100dvh-52px)] overflow-hidden bg-gray-950">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            aria-label="Rear camera view for artwork scanning"
            className="h-full w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 border-[18px] border-black/20" />

          {status === "scanning" && !selectedDream ? (
            <div className="pointer-events-none absolute inset-10 rounded-3xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.12)]" />
          ) : null}

          <div
            className="absolute inset-x-4 bottom-5 rounded-2xl bg-black/75 p-4 shadow-xl backdrop-blur"
            aria-live="polite"
          >
            <p className="text-lg font-semibold">
              {selectedDream ? `${selectedDream.title} recognized` : copy.title}
            </p>
            <p className="mt-1 text-sm text-gray-200">
              {selectedDream
                ? "Opening the matching dream details. Tracking remains on this device."
                : copy.detail}
            </p>

            {status === "idle" || canRetry ? (
              <button
                type="button"
                className="mt-4 rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-white"
                onClick={() => setSessionRequest((request) => request + 1)}
              >
                {status === "idle" ? "Start camera" : "Try again"}
              </button>
            ) : null}
          </div>
        </section>
      </DetailsDrawer>
    </main>
  );
};
