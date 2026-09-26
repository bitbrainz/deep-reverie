import type { Dream } from "../dreams/data/dreams";

export const DREAM_FIELD_HALF_FOV = 52;
export const MAX_VISIBLE_SHARDS = 5;

const GOLDEN_ANGLE = 137.507764;
const WORLD_PITCH_LANES = [12, -12, 25, -25, 0, 36] as const;
const FIELD_HORIZON = 48;
const VIEW_PITCH_SCALE = 0.75;

export type DreamShard = {
  dream: Dream;
  yaw: number;
  pitch: number;
  depth: number;
  entranceOrder: number;
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

export const createDreamField = (dreams: readonly Dream[]): DreamShard[] => {
  const placements = dreams.map((dream, index) => ({
    dream,
    yaw: normalizeDegrees(index * GOLDEN_ANGLE),
    depth: index % 3,
    entranceOrder: index % WORLD_PITCH_LANES.length,
  }));

  const pitchByDreamId = new Map(
    [...placements]
      .sort((left, right) => left.yaw - right.yaw)
      .map((shard, index) => [
        shard.dream.id,
        WORLD_PITCH_LANES[index % WORLD_PITCH_LANES.length],
      ]),
  );

  return placements.map((shard) => ({
    ...shard,
    pitch: pitchByDreamId.get(shard.dream.id) ?? 0,
  }));
};

export const projectDreamField = (
  field: readonly DreamShard[],
  heading: number,
  maxVisible = MAX_VISIBLE_SHARDS,
  viewPitch = 0,
): ProjectedDreamShard[] =>
  field
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
    .slice(0, maxVisible)
    .map((shard) => ({
      ...shard,
      left: 50 + (shard.angularDistance / DREAM_FIELD_HALF_FOV) * 45,
      top: FIELD_HORIZON - shard.pitch + viewPitch * VIEW_PITCH_SCALE,
      scale: 1 - shard.depth * 0.1,
    }));
