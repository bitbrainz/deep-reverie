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
