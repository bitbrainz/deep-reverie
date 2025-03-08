import React from "react";
import { usePrediction, useTopPrediction } from "./PredictionContext";

export const PredictionDebugger: React.FC = () => {
  const predictions = usePrediction();
  const topPrediction = useTopPrediction();

  if (!predictions) {
    return <div>No predictions yet</div>;
  }

  return (
    <div>
      <h3>{topPrediction}</h3>
      {predictions
        .filter((prediction) => prediction.probability > 0.1)
        .sort((a, b) => b.probability - a.probability)
        .map((prediction, index) => (
          <div key={index}>
            {prediction.className}: {(prediction.probability * 100).toFixed(1)}%
          </div>
        ))}
    </div>
  );
};
