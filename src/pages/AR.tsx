import { AppBar } from "../components/AppBar";
import { DetailsDrawer } from "../components/DetailsDrawer";
import { Camera } from "../prediction/Camera";
import { PredictionDebugger } from "../prediction/PredictionDebugger";
import { usePredictedDream } from "../prediction/PredictionContext";

export const AR = ({ videoRef }: { videoRef: any }) => {
  const dream = usePredictedDream();

  console.log(dream?.title);

  return (
    <div className="bg-gray-900">
      <AppBar />
      <DetailsDrawer dream={dream} open={true}>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 p-2 bg-gray-100">
          <Camera videoRef={videoRef} />
          <PredictionDebugger />
        </div>
      </DetailsDrawer>
    </div>
  );
};
