import { DREAMS, Dream } from "../dreams/data/dreams";

export type Prediction = { className: string; probability: number };

export const MIN_RECOGNITION_CONFIDENCE = 0.75;

const normalizeLabel = (value: string) =>
  value.trim().replace(/\.[^.]+$/, "").toLocaleLowerCase();

const dreamsByLabel = new Map(
  DREAMS.map((dream) => [normalizeLabel(dream.fileName), dream])
);

export const findDreamByLabel = (label: string): Dream | undefined =>
  dreamsByLabel.get(normalizeLabel(label));

export const findUnsupportedLabels = (labels: string[]): string[] =>
  labels.filter((label) => !findDreamByLabel(label));

export const selectStablePrediction = (
  frames: Prediction[][],
  minimumConfidence = MIN_RECOGNITION_CONFIDENCE
): Prediction | undefined => {
  if (frames.length === 0) return undefined;

  const totals = new Map<string, { total: number; samples: number }>();
  frames.forEach((frame) => {
    frame.forEach(({ className, probability }) => {
      const current = totals.get(className) ?? { total: 0, samples: 0 };
      current.total += probability;
      current.samples += 1;
      totals.set(className, current);
    });
  });

  const best = Array.from(totals, ([className, value]) => ({
    className,
    probability: value.total / value.samples,
  })).reduce<Prediction | undefined>(
    (currentBest, candidate) =>
      !currentBest || candidate.probability > currentBest.probability
        ? candidate
        : currentBest,
    undefined
  );

  return best && best.probability >= minimumConfidence ? best : undefined;
};
