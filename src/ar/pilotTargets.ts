import manifest from "../../config/ar-pilot-targets.json";
import { DREAMS, type Dream } from "../dreams/data/dreams";

export type PilotTarget = (typeof manifest.targets)[number];

export const PILOT_TARGETS = manifest.targets;
export const PILOT_TARGET_ASSET = manifest.asset;

export const isPilotTargetIndex = (targetIndex: number) =>
  Number.isInteger(targetIndex) &&
  targetIndex >= 0 &&
  targetIndex < PILOT_TARGETS.length;

export const dreamForTargetIndex = (targetIndex: number): Dream | undefined => {
  if (!isPilotTargetIndex(targetIndex)) return undefined;

  const target = PILOT_TARGETS[targetIndex];
  return DREAMS.find((dream) => dream.id === target.dreamId);
};
