import { describe, expect, it } from "vitest";
import { DREAMS } from "../dreams/data/dreams";
import {
  createDreamField,
  headingForKeyboardKey,
  normalizeDegrees,
  projectDreamField,
  signedAngularDifference,
} from "./dreamField";

describe("dream field", () => {
  it("places every canonical dream once around the visitor", () => {
    const field = createDreamField(DREAMS);

    expect(field).toHaveLength(DREAMS.length);
    expect(new Set(field.map(({ dream }) => dream.id)).size).toBe(DREAMS.length);
    expect(field.every(({ yaw }) => yaw >= 0 && yaw < 360)).toBe(true);
    expect(field.every(({ pitch }) => Number.isFinite(pitch))).toBe(true);

    const occupiedQuadrants = new Set(field.map(({ yaw }) => Math.floor(yaw / 90)));
    expect(occupiedQuadrants).toEqual(new Set([0, 1, 2, 3]));
  });

  it("handles the zero-degree seam without hiding nearby shards", () => {
    expect(signedAngularDifference(2, 358)).toBe(4);
    expect(signedAngularDifference(358, 2)).toBe(-4);
    expect(normalizeDegrees(-10)).toBe(350);
  });

  it("shows only the nearest bounded set in the current direction", () => {
    const visible = projectDreamField(createDreamField(DREAMS), 0);

    expect(visible).toHaveLength(5);
    expect(visible[0].dream).toBe(DREAMS[0]);
    expect(visible.every(({ left }) => left >= 5 && left <= 95)).toBe(true);
    expect(
      visible.every(
        ({ angularDistance }) => Math.abs(angularDistance) <= 52,
      ),
    ).toBe(true);
    expect(new Set(visible.map(({ top }) => top)).size).toBe(visible.length);
  });

  it("keeps each dream at a fixed world height while the camera turns", () => {
    const field = createDreamField(DREAMS);
    const initial = projectDreamField(field, 0);
    const turned = projectDreamField(field, 8);
    const initialByDreamId = new Map(
      initial.map((shard) => [shard.dream.id, shard]),
    );
    const retained = turned.filter(({ dream }) => initialByDreamId.has(dream.id));

    expect(retained.length).toBeGreaterThan(0);
    expect(
      retained.every(
        (shard) => shard.top === initialByDreamId.get(shard.dream.id)?.top,
      ),
    ).toBe(true);
    expect(
      retained.every(
        (shard) => shard.left !== initialByDreamId.get(shard.dream.id)?.left,
      ),
    ).toBe(true);
  });

  it("moves the whole world coherently when camera pitch changes", () => {
    const field = createDreamField(DREAMS);
    const level = projectDreamField(field, 0, 5, 0);
    const tilted = projectDreamField(field, 0, 5, 12);

    expect(tilted.map(({ dream }) => dream.id)).toEqual(
      level.map(({ dream }) => dream.id),
    );
    expect(
      tilted.every((shard, index) => shard.top - level[index].top === 9),
    ).toBe(true);
  });

  it("rotates and wraps the fallback field with keyboard controls", () => {
    expect(headingForKeyboardKey(10, "ArrowLeft")).toBe(334);
    expect(headingForKeyboardKey(350, "ArrowRight")).toBe(26);
    expect(headingForKeyboardKey(120, "Enter")).toBeNull();
  });
});
