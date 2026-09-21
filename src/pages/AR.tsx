import { RefObject, useState } from "react";
import { AppBar } from "../components/AppBar";
import { DetailsDrawer } from "../components/DetailsDrawer";
import { Camera } from "../prediction/Camera";
// import { PredictionDebugger } from "../prediction/PredictionDebugger";
import { usePredictedDream } from "../prediction/PredictionContext";

export const AR = ({ videoRef }: { videoRef: RefObject<HTMLVideoElement | null> }) => {
  const dream = usePredictedDream();
  const [dismissedDreamId, setDismissedDreamId] = useState<number | null>(null);

  const isDetailsOpen = Boolean(dream && dream.id !== dismissedDreamId);

  return (
    <div className="bg-gray-900">
      <AppBar />
      <DetailsDrawer
        dream={dream}
        open={isDetailsOpen}
        onClose={() => setDismissedDreamId(dream?.id ?? null)}
      >
        <div className=" bg-gray-100">
          <Camera videoRef={videoRef} />
          {/* <PredictionDebugger /> */}
        </div>
      </DetailsDrawer>
    </div>
  );
};
