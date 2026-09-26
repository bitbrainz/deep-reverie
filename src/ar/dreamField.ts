import type { Dream } from "../dreams/data/dreams";

export const DREAM_FIELD_HALF_FOV = 52;
export const MAX_VISIBLE_SHARDS = 5;

const GOLDEN_ANGLE = 137.507764;
const SCREEN_LANES = [34, 62, 20, 76, 48] as const;

export type DreamShard = {
  dream: Dream;
  yaw: number;
  depth: number;
};

export type ProjectedDreamShard = DreamShard & {
  angularDistance: number;
  left: number;
  top: number;
  scale: number;
};

export const normalizeDegrees = (degrees: number) =>
  ((degrees % 360) + 360) % 360;

export const signedAngularDifference = (target: number, heading: number) =>
  ((normalizeDegrees(target) - normalizeDegrees(heading) + 540) % 360) - 180;

export const headingForKeyboardKey = (
  heading: number,
  key: string,
  step = 36,
) => {
  if (key === "ArrowLeft") return normalizeDegrees(heading - step);
  if (key === "ArrowRight") return normalizeDegrees(heading + step);
  return null;
};

export const createDreamField = (dreams: readonly Dream[]): DreamShard[] =>
  dreams.map((dream, index) => ({
    dream,
    yaw: normalizeDegrees(index * GOLDEN_ANGLE),
    depth: index % 3,
  }));

export const projectDreamField = (
  field: readonly DreamShard[],
  heading: number,
  maxVisible = MAX_VISIBLE_SHARDS,
): ProjectedDreamShard[] =>
  {
    const selected = field
    .map((shard) => ({
      ...shard,
      angularDistance: signedAngularDifference(shard.yaw, heading),
    }))
    .filter(
      ({ angularDistance }) =>
        Math.abs(angularDistance) <= DREAM_FIELD_HALF_FOV,
    )
    .sort(
      (left, right) =>
        Math.abs(left.angularDistance) - Math.abs(right.angularDistance),
    )
    .slice(0, maxVisible);
    const topByDreamId = new Map(
      [...selected]
        .sort((left, right) => left.angularDistance - right.angularDistance)
        .map((shard, index) => [
          shard.dream.id,
          SCREEN_LANES[index % SCREEN_LANES.length],
        ]),
    );

    return selected.map((shard) => ({
      ...shard,
      left: 50 + (shard.angularDistance / DREAM_FIELD_HALF_FOV) * 45,
      top: topByDreamId.get(shard.dream.id) ?? 48,
      scale: 1 - shard.depth * 0.1,
    }));
  }
