import { useCallback, useEffect, useState } from "react";

export type CameraState = "idle" | "starting" | "active" | "error";

export const Camera = ({
  videoRef,
  onStateChange,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onStateChange?: (state: CameraState, error?: string) => void;
}) => {
  const [cameraState, setCameraState] = useState<CameraState>("idle");

  const updateState = useCallback(
    (state: CameraState, error?: string) => {
      setCameraState(state);
      onStateChange?.(state, error);
    },
    [onStateChange]
  );

  const startCamera = async () => {
    updateState("starting");
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("unsupported");
      }
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false, // No audio
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("webkit-playsinline", "true");
        await videoRef.current.play();
      }
      updateState("active");
    } catch {
      updateState(
        "error",
        "Camera access is unavailable. Allow camera permission in your browser, then try again."
      );
    }
  };

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  }, [videoRef]);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  return (
    <div>
      {cameraState !== "active" && (
        <button
          className="rounded-full bg-white px-6 py-3 font-semibold text-slate-950 shadow-lg transition hover:bg-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200 disabled:cursor-wait disabled:opacity-70"
          onClick={() => void startCamera()}
          disabled={cameraState === "starting"}
        >
          {cameraState === "starting" ? "Starting camera…" : "Start camera"}
        </button>
      )}

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: cameraState === "active" ? "block" : "none",
        }}
      />
    </div>
  );
};
