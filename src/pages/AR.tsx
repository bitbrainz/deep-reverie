import { useRef } from "react";
import { AppBar } from "../components/AppBar";
import { DetailsDrawer } from "../components/DetailsDrawer";
import { Camera } from "../prediction/Camera";
// import { PredictionDebugger } from "../prediction/PredictionDebugger";
import {
  PredictionProvider,
  usePredictedDream,
} from "../prediction/PredictionContext";

const ARContent = ({ videoRef }: { videoRef: React.RefObject<HTMLVideoElement | null> }) => {
  const dream = usePredictedDream();

  console.log(dream?.title);

  return (
    <div className="bg-gray-900">
      <AppBar />
      <DetailsDrawer dream={dream} open={true}>
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
