import { describe, expect, it } from "vitest";
import { DREAMS } from "../dreams/data/dreams";
import {
  dreamForBundleTarget,
  dreamForTargetIndex,
  TARGET_COUNT,
} from "./targetMapping";
import { initialTrackingState, trackingReducer } from "./trackingState";

describe("MindAR target mapping", () => {
  it("maps every compiled target index to the same ordered Dream", () => {
    expect(TARGET_COUNT).toBe(54);
    DREAMS.forEach((dream, index) => {
      expect(dreamForTargetIndex(index)?.id).toBe(dream.id);
      expect(dreamForTargetIndex(index)?.fileName).toBe(dream.fileName);
    });
  });

  it("rejects unknown target indexes", () => {
    expect(dreamForTargetIndex(-1)).toBeUndefined();
    expect(dreamForTargetIndex(TARGET_COUNT)).toBeUndefined();
  });

  it("maps bundle-local indexes back to the global Dream order", () => {
    expect(dreamForBundleTarget(0, 8)?.id).toBe(9);
    expect(dreamForBundleTarget(1, 0)?.id).toBe(10);
    expect(dreamForBundleTarget(5, 8)?.id).toBe(54);
  });
});

describe("tracking state", () => {
  it("keeps the found target through a short loss and cancels loss on reacquire", () => {
    const found = trackingReducer(initialTrackingState, {
      type: "FOUND",
      targetIndex: 2,
    });
    const lost = trackingReducer(found, { type: "LOST", targetIndex: 2 });
    expect(lost).toMatchObject({ phase: "found", targetIndex: 2, pendingLoss: true });
    expect(
      trackingReducer(lost, { type: "FOUND", targetIndex: 2 })
    ).toMatchObject({ phase: "found", targetIndex: 2, pendingLoss: false });
  });

  it("returns to scanning only after the loss grace expires", () => {
    const found = trackingReducer(initialTrackingState, {
      type: "FOUND",
      targetIndex: 4,
    });
    const lost = trackingReducer(found, { type: "LOST", targetIndex: 4 });
    expect(
      trackingReducer(lost, { type: "LOSS_EXPIRED", targetIndex: 4 })
    ).toEqual({ phase: "scanning", pendingLoss: false });
  });

  it("ignores stale loss events from another target", () => {
    const found = trackingReducer(initialTrackingState, {
      type: "FOUND",
      targetIndex: 7,
    });
    expect(
      trackingReducer(found, { type: "LOST", targetIndex: 6 })
    ).toEqual(found);
  });
});
