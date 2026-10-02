export type OrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

export type OrientationPermissionConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export const normalizeDegrees = (degrees: number) =>
  ((degrees % 360) + 360) % 360;

export const signedAngularDifference = (current: number, origin: number) =>
  ((normalizeDegrees(current) - normalizeDegrees(origin) + 540) % 360) - 180;

export const headingFromEvent = (event: OrientationEventWithCompass) => {
  if (typeof event.webkitCompassHeading === "number") {
    return normalizeDegrees(event.webkitCompassHeading);
  }

  return event.alpha === null ? null : normalizeDegrees(360 - event.alpha);
};

export const pitchFromEvent = (event: DeviceOrientationEvent) =>
  event.beta === null ? null : 90 - event.beta;

export const clampPitch = (pitch: number, limit = 55) =>
  Math.min(limit, Math.max(-limit, pitch));

const PITCH_SENSITIVITY = 0.55;
const STABLE_PITCH_LIMIT = 32;
const PITCH_EASING = 0.24;
const MAX_PITCH_STEP = 3;
const PITCH_DEAD_ZONE = 0.35;

export const stabilizePitch = (previousPitch: number, rawPitchDelta: number) => {
  const targetPitch = clampPitch(
    rawPitchDelta * PITCH_SENSITIVITY,
    STABLE_PITCH_LIMIT,
  );
  const difference = targetPitch - previousPitch;
  if (Math.abs(difference) < PITCH_DEAD_ZONE) return previousPitch;

  const easedStep = clampPitch(difference * PITCH_EASING, MAX_PITCH_STEP);
  const nextPitch = clampPitch(
    previousPitch + easedStep,
    STABLE_PITCH_LIMIT,
  );
  return Math.round(nextPitch * 100) / 100;
};
