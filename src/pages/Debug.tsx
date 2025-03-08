import { Camera } from "../prediction/Camera";
import { PredictionDebugger } from "../prediction/PredictionDebugger";

export const Debug = ({ videoRef }: { videoRef: any }) => {
  return (
    <>
      <Camera videoRef={videoRef} />
      <PredictionDebugger />
    </>
  );
};
