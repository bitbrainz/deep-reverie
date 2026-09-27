import { useEffect, useRef, useState } from "react";
import { AppBar } from "../components/AppBar";
import { DetailsDrawer } from "../components/DetailsDrawer";
import { Camera } from "../prediction/Camera";
// import { PredictionDebugger } from "../prediction/PredictionDebugger";
import {
  PredictionProvider,
  usePredictedDream,
} from "../prediction/PredictionContext";

export const ARContent = ({
  videoRef,
}: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
}) => {
  const dream = usePredictedDream();
  const [dismissedDreamId, setDismissedDreamId] = useState<number | null>(null);

  useEffect(() => {
    if (!dream) setDismissedDreamId(null);
  }, [dream]);

  const isDetailsOpen = Boolean(dream && dream.id !== dismissedDreamId);

  return (
    <div className="bg-gray-900">
      <AppBar />
      <DetailsDrawer
        dream={dream}
        open={isDetailsOpen}
        onClose={() => {
          if (dream) setDismissedDreamId(dream.id);
        }}
      >
        <div className=" bg-gray-100">
          <Camera videoRef={videoRef} />
          {/* <PredictionDebugger /> */}
        </div>
      </DetailsDrawer>
    </div>
  );
};

const AR = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <PredictionProvider videoRef={videoRef}>
      <ARContent videoRef={videoRef} />
    </PredictionProvider>
  );
};

export default AR;
