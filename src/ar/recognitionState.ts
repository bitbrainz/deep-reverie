export const TARGET_LOSS_GRACE_MS = 1_200;

export type RecognitionState = {
  activeTargetIndex: number | null;
  clearAt: number | null;
};

export type RecognitionEvent =
  | { type: "target-found"; targetIndex: number; at: number }
  | { type: "target-lost"; targetIndex: number; at: number }
  | { type: "grace-elapsed"; at: number };

export const INITIAL_RECOGNITION_STATE: RecognitionState = {
  activeTargetIndex: null,
  clearAt: null,
};

export const transitionRecognition = (
  state: RecognitionState,
  event: RecognitionEvent,
): RecognitionState => {
  if (event.type === "target-found") {
    return { activeTargetIndex: event.targetIndex, clearAt: null };
  }

  if (event.type === "target-lost") {
    if (event.targetIndex !== state.activeTargetIndex) return state;
    return { ...state, clearAt: event.at + TARGET_LOSS_GRACE_MS };
  }

  if (state.clearAt === null || event.at < state.clearAt) return state;
  return INITIAL_RECOGNITION_STATE;
};
