import { useRef } from "react";
import { Camera } from "../prediction/Camera";
import { PredictionDebugger } from "../prediction/PredictionDebugger";
import { PredictionProvider } from "../prediction/PredictionContext";

const Debug = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <PredictionProvider videoRef={videoRef}>
      <Camera videoRef={videoRef} />
      <PredictionDebugger />
    </PredictionProvider>
  );
};

export default Debug;
