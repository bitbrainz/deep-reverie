import { Camera } from "../prediction/Camera";
import { PredictionDebugger } from "../prediction/PredictionDebugger";

export const Debug = ({
  videoRef,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) => {
  return (
    <>
      <Camera videoRef={videoRef} />
      <PredictionDebugger />
    </>
  );
};
