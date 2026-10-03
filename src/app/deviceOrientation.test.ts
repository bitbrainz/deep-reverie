import { describe, expect, it } from "vitest";
import {
  clampPitch,
  headingFromEvent,
  normalizeDegrees,
  signedAngularDifference,
  stabilizePitch,
} from "./deviceOrientation";

describe("device orientation helpers", () => {
  it("keeps relative heading stable across the north seam", () => {
    expect(signedAngularDifference(2, 358)).toBe(4);
    expect(signedAngularDifference(358, 2)).toBe(-4);
    expect(normalizeDegrees(-10)).toBe(350);
  });

  it("prefers the iOS compass heading when available", () => {
    const event = { alpha: 100, webkitCompassHeading: 42 } as DeviceOrientationEvent & {
      webkitCompassHeading: number;
    };
    expect(headingFromEvent(event)).toBe(42);
  });

  it("limits extreme tilt without changing heading", () => {
    expect(clampPitch(80)).toBe(55);
    expect(clampPitch(-80)).toBe(-55);
  });

  it("dampens vertical motion, ignores noise, and limits sudden jumps", () => {
    expect(stabilizePitch(0, 10)).toBe(1.32);
    expect(stabilizePitch(5, 9.3)).toBe(5);
    expect(stabilizePitch(10, -100)).toBe(7);
    expect(stabilizePitch(-10, 100)).toBe(-7);
  });
});
