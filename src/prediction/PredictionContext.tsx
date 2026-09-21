import { CustomMobileNet, load } from "@teachablemachine/image";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  findDreamByLabel,
  findUnsupportedLabels,
  Prediction,
  selectStablePrediction,
} from "./recognition";

// Deep Reverie v5dayandnight is the production model trained for the final image set.
const MODEL_URL = "https://teachablemachine.withgoogle.com/models/IMZ_m6F48/";

const initializeModel = async () => {
  const loadedModel = await load(
    `${MODEL_URL}model.json`,
    `${MODEL_URL}metadata.json`
  );
  const unsupportedLabels = findUnsupportedLabels(loadedModel.getClassLabels());

  if (unsupportedLabels.length > 0) {
    throw new Error(
      `The recognition model contains unknown Dream labels: ${unsupportedLabels.join(
        ", "
      )}`
    );
  }
  return loadedModel;
};

type PredictionContextValue = {
  model?: CustomMobileNet;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  modelStatus: "loading" | "ready" | "error";
  modelError?: string;
  recognitionError?: string;
  setRecognitionError: (message?: string) => void;
};

const PredictionContext = createContext<PredictionContextValue | undefined>(
  undefined
);

export const usePredictionStatus = () => {
  const context = useContext(PredictionContext);
  if (!context) throw new Error("PredictionProvider is missing");
  return {
    modelStatus: context.modelStatus,
    modelError: context.modelError,
    recognitionError: context.recognitionError,
  };
};

export const usePrediction = (refreshRate = 100) => {
  const [prediction, setPrediction] = useState<Prediction[]>();
  const context = useContext(PredictionContext);
  const model = context?.model;
  const videoRef = context?.videoRef;
  const setRecognitionError = context?.setRecognitionError;

  useEffect(() => {
    if (!model || !videoRef || !setRecognitionError) {
      return;
    }

    let isMounted = true;
    let timeout: number | undefined;

    const loop = async () => {
      if (!isMounted) return;
      const video = videoRef.current;

      if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        timeout = window.setTimeout(loop, refreshRate);
        return;
      }

      try {
        const newPrediction = await model.predict(video);
        if (!isMounted) return;
        setPrediction(newPrediction);
        setRecognitionError(undefined);
      } catch {
        if (!isMounted) return;
        setRecognitionError(
          "Image recognition is temporarily unavailable. Keep the camera open and try again."
        );
      }
      timeout = window.setTimeout(loop, refreshRate);
    };

    void loop();

    return () => {
      isMounted = false;
      if (timeout) window.clearTimeout(timeout);
    };
  }, [model, refreshRate, setRecognitionError, videoRef]);

  return prediction;
};

export const useTopPrediction = (refreshRate = 100, historySize = 8) => {
  const prediction = usePrediction(refreshRate);
  const [predictionHistory, setPredictionHistory] = useState<Prediction[][]>([]);

  useEffect(() => {
    if (prediction) {
      setPredictionHistory((previous) =>
        [...previous, prediction].slice(-historySize)
      );
    }
  }, [historySize, prediction]);

  return useMemo(
    () => selectStablePrediction(predictionHistory)?.className,
    [predictionHistory]
  );
};

export const usePredictedDream = (refreshRate = 100) => {
  const prediction = useTopPrediction(refreshRate, 10);
  if (!prediction) return undefined;

  return findDreamByLabel(prediction);
};

export const PredictionProvider = ({
  children,
  videoRef,
}: PropsWithChildren<{
  videoRef: React.RefObject<HTMLVideoElement | null>;
}>) => {
  const [model, setModel] = useState<CustomMobileNet>();
  const [modelStatus, setModelStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );
  const [modelError, setModelError] = useState<string>();
  const [recognitionError, setRecognitionError] = useState<string>();

  useEffect(() => {
    let mounted = true;
    initializeModel()
      .then((initializedModel) => {
        if (!mounted) return;
        setModel(initializedModel);
        setModelStatus("ready");
      })
      .catch(() => {
        if (!mounted) return;
        setModelStatus("error");
        setModelError(
          "The Deep Reverie recognition model could not be loaded. Check your connection and reload the page."
        );
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <PredictionContext.Provider
      value={{
        model,
        videoRef,
        modelStatus,
        modelError,
        recognitionError,
        setRecognitionError,
      }}
    >
      {children}
    </PredictionContext.Provider>
  );
};
