import { DREAMS, Dream } from "../dreams/data/dreams";

export const TARGET_ASSET_VERSION = "v1";
export const TARGET_COUNT = 54;
export const TARGETS_PER_BUNDLE = 9;
export const TARGET_BUNDLE_COUNT = TARGET_COUNT / TARGETS_PER_BUNDLE;
export const TARGET_DREAMS = [...DREAMS].sort((left, right) => left.id - right.id);

if (TARGET_DREAMS.length !== TARGET_COUNT) {
  throw new Error(
    `Target mapping expected ${TARGET_COUNT} Dreams, found ${TARGET_DREAMS.length}`
  );
}

export const dreamForTargetIndex = (targetIndex: number): Dream | undefined =>
  Number.isInteger(targetIndex) && targetIndex >= 0
    ? TARGET_DREAMS[targetIndex]
    : undefined;

export const dreamForBundleTarget = (
  bundleIndex: number,
  targetIndex: number
): Dream | undefined =>
  dreamForTargetIndex(bundleIndex * TARGETS_PER_BUNDLE + targetIndex);
