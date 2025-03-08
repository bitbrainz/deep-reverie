import { CustomMobileNet, load } from "@teachablemachine/image";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { DREAMS } from "../dreams/data/dreams";

// Initialize the model and webcam
const initializeModel = async () => {
  const MODEL_URL = "https://teachablemachine.withgoogle.com/models/RfJZMLgp4/";
  // const MODEL_URL = "https://teachablemachine.withgoogle.com/models/MZnlyFQgT/";

  const modelURL = MODEL_URL + "model.json";
  const metadataURL = MODEL_URL + "metadata.json";

  // Load the model
  const loadedModel = await load(modelURL, metadataURL);
  return loadedModel;
};

const PredictionContext = createContext<
  { model: CustomMobileNet | undefined; videoRef: any } | undefined
>(undefined);

export const usePrediction = (refreshRate = 100) => {
  const [prediction, setPrediction] =
    useState<{ className: string; probability: number }[]>();
  const context = useContext(PredictionContext);

  useEffect(() => {
    console.log("HERE", context);
    if (!context || !context.model || !context.videoRef.current) {
      console.log("Model not yet initialized");
      return;
    }
    const { model, videoRef } = context;

    let isMounted = true; // Flag to prevent updates after unmount

    const loop = async () => {
      if (!isMounted) return; // Stop if component is unmounted
      const newPrediction = await model.predict(videoRef.current);
      setPrediction(newPrediction);
      setTimeout(loop, refreshRate);
    };

    loop();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [context, context?.model, refreshRate]);

  return prediction;
};

export const useTopPrediction = (refreshRate = 100, history = 2000) => {
  const prediction = usePrediction(refreshRate);
  const [predictionHistory, setPredictionHistory] = useState<
    { className: string; probability: number }[]
  >([]);

  useEffect(() => {
    if (prediction) {
      setPredictionHistory((prevHistory) => {
        const newHistory = [...prevHistory, ...prediction];
        return newHistory.slice(-history); // Keep only the last 50 predictions
      });
    }
  }, [prediction]);

  if (predictionHistory.length === 0) return undefined;

  const predictionCounts = predictionHistory.reduce(
    (acc, { className, probability }) => {
      if (!acc[className]) {
        acc[className] = { count: 0, totalProbability: 0 };
      }
      acc[className].count += 1;
      acc[className].totalProbability += probability;
      return acc;
    },
    {} as Record<string, { count: number; totalProbability: number }>
  );

  const bestPrediction = Object.entries(predictionCounts).reduce(
    (best, [className, { count, totalProbability }]) => {
      const averageProbability = totalProbability / count;
      if (!best || averageProbability > best.averageProbability) {
        return { className, averageProbability };
      }
      return best;
    },
    undefined as { className: string; averageProbability: number } | undefined
  );

  return bestPrediction?.className;
};

export const usePredictedDream = (refreshRate = 100) => {
  const prediction = useTopPrediction(refreshRate);
  if (!prediction) return undefined;

  console.log(prediction);

  const dream = DREAMS.find(
    (dream) => dream.fileName.replace(".png", "") === prediction
  );

  console.log(dream?.title);

  return dream;
};

export const PredictionProvider = ({
  children,
  videoRef,
}: PropsWithChildren<{ videoRef: any }>) => {
  const [model, setModel] = useState<CustomMobileNet>();

  useEffect(() => {
    initializeModel().then((initializedModel) => setModel(initializedModel));
  }, []);

  return (
    <PredictionContext.Provider value={{ model, videoRef }}>
      {children}
    </PredictionContext.Provider>
  );
};
