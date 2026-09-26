import { describe, expect, it } from "vitest";
import { DREAMS } from "../dreams/data/dreams";
import {
  createDreamField,
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
});
