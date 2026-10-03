import type { OrientationPermissionConstructor } from "./deviceOrientation";

export type ExperienceAccessResult =
  | { kind: "granted"; stream: MediaStream; motionAvailable: boolean }
  | { kind: "unsupported" | "denied"; detail: string };

type ExperienceAccessListener = (result: ExperienceAccessResult) => void;

let preparedRequest: Promise<ExperienceAccessResult> | null = null;
let preparedResult: ExperienceAccessResult | null = null;
const preparedListeners = new Set<ExperienceAccessListener>();

const notifyPreparedListener = () => {
  if (!preparedResult) return;
  const listener = preparedListeners.values().next().value;
  if (!listener) return;

  const result = preparedResult;
  preparedListeners.delete(listener);
  preparedRequest = null;
  preparedResult = null;
  listener(result);
};

export const requestExperienceAccess = async (): Promise<ExperienceAccessResult> => {
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    return {
      kind: "unsupported",
      detail: "A secure browser with rear-camera access is required.",
    };
  }

  let motionPermission = Promise.resolve<"granted" | "denied">("denied");
  let cameraPermission: Promise<MediaStream>;
  if ("DeviceOrientationEvent" in window) {
    const orientationConstructor =
      DeviceOrientationEvent as OrientationPermissionConstructor;
    try {
      motionPermission = orientationConstructor.requestPermission
        ? orientationConstructor.requestPermission()
        : Promise.resolve<"granted">("granted");
    } catch (error) {
      motionPermission = Promise.reject(error);
    }
  }
  try {
    cameraPermission = navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
  } catch (error) {
    cameraPermission = Promise.reject(error);
  }
  const [motionResult, cameraResult] = await Promise.allSettled([
    motionPermission,
    cameraPermission,
  ]);

  const cameraGranted = cameraResult.status === "fulfilled";
  if (!cameraGranted) {
    return {
      kind: "denied",
      detail: "Allow camera access in your browser settings, then try again.",
    };
  }

  const motionAvailable =
    motionResult.status === "fulfilled" && motionResult.value === "granted";
  return { kind: "granted", stream: cameraResult.value, motionAvailable };
};

export const prepareExperienceAccess = () => {
  if (!preparedRequest && !preparedResult) {
    preparedRequest = requestExperienceAccess();
    void preparedRequest.then((result) => {
      preparedResult = result;
      queueMicrotask(notifyPreparedListener);
    });
  }
  return preparedRequest ?? Promise.resolve(preparedResult!);
};

export const hasPreparedExperienceAccess = () =>
  preparedRequest !== null || preparedResult !== null;

export const subscribeToPreparedExperienceAccess = (
  listener: ExperienceAccessListener,
) => {
  preparedListeners.add(listener);
  queueMicrotask(notifyPreparedListener);

  return () => {
    preparedListeners.delete(listener);
  };
};
