import { AppBar } from "../components/AppBar";
import { DetailsDrawer } from "../components/DetailsDrawer";
import { Camera, CameraState } from "../prediction/Camera";
import {
  usePredictedDream,
  usePredictionStatus,
} from "../prediction/PredictionContext";
import { useState } from "react";

export const AR = ({
  videoRef,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) => {
  const dream = usePredictedDream();
  const { modelStatus, modelError, recognitionError } = usePredictionStatus();
  const [cameraState, setCameraState] = useState<CameraState>("idle");
  const [cameraError, setCameraError] = useState<string>();

  const handleCameraState = (state: CameraState, error?: string) => {
    setCameraState(state);
    setCameraError(error);
  };

  const statusMessage =
    cameraError ??
    modelError ??
    recognitionError ??
    (modelStatus === "loading"
      ? "Loading the Deep Reverie image model…"
      : cameraState === "active" && !dream
      ? "Point the camera at a Deep Reverie image. Recognition happens automatically."
      : undefined);

  return (
    <div className="min-h-dvh bg-slate-950 text-white">
      <AppBar />
      <DetailsDrawer dream={dream} open={!!dream}>
        <main className="relative flex min-h-[calc(100dvh-52px)] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_#164e63,_#020617_60%)] p-6">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-5 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.32em] text-cyan-200">
              Live image recognition
            </p>
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Find the dream inside the image
            </h1>
            <p className="max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
              Start your camera, then frame one of the supported Deep Reverie
              artworks.
            </p>
            <div className="relative mt-2 aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-[2rem] border border-cyan-200/20 bg-slate-900/80 shadow-2xl shadow-cyan-950">
              <div className="absolute inset-4 rounded-[1.4rem] border border-dashed border-cyan-200/30" />
              <div className="relative flex h-full items-center justify-center">
                <Camera videoRef={videoRef} onStateChange={handleCameraState} />
              </div>
            </div>
            {statusMessage && (
              <p
                role={
                  cameraError || modelError || recognitionError
                    ? "alert"
                    : "status"
                }
                className={`max-w-xl rounded-full px-4 py-2 text-sm ${
                  cameraError || modelError || recognitionError
                    ? "bg-rose-950/80 text-rose-100"
                    : "bg-slate-900/70 text-slate-200"
                }`}
              >
                {statusMessage}
              </p>
            )}
          </div>
        </main>
      </DetailsDrawer>
    </div>
  );
};
