export const TARGET_LOSS_GRACE_MS = 800;

export type TrackingState = {
  phase: "idle" | "loading" | "scanning" | "found" | "error";
  targetIndex?: number;
  pendingLoss: boolean;
  error?: string;
};

export type TrackingEvent =
  | { type: "START" }
  | { type: "READY" }
  | { type: "FOUND"; targetIndex: number }
  | { type: "LOST"; targetIndex: number }
  | { type: "LOSS_EXPIRED"; targetIndex: number }
  | { type: "ERROR"; message: string }
  | { type: "STOP" };

export const initialTrackingState: TrackingState = {
  phase: "idle",
  pendingLoss: false,
};

export const trackingReducer = (
  state: TrackingState,
  event: TrackingEvent
): TrackingState => {
  switch (event.type) {
    case "START":
      return { phase: "loading", pendingLoss: false };
    case "READY":
      return { phase: "scanning", pendingLoss: false };
    case "FOUND":
      return {
        phase: "found",
        targetIndex: event.targetIndex,
        pendingLoss: false,
      };
    case "LOST":
      return state.phase === "found" && state.targetIndex === event.targetIndex
        ? { ...state, pendingLoss: true }
        : state;
    case "LOSS_EXPIRED":
      return state.pendingLoss && state.targetIndex === event.targetIndex
        ? { phase: "scanning", pendingLoss: false }
        : state;
    case "ERROR":
      return { phase: "error", pendingLoss: false, error: event.message };
    case "STOP":
      return initialTrackingState;
  }
};
