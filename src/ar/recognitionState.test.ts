import { describe, expect, it } from "vitest";
import {
  INITIAL_RECOGNITION_STATE,
  TARGET_LOSS_GRACE_MS,
  transitionRecognition,
} from "./recognitionState";

describe("recognition state", () => {
  it("selects a found target", () => {
    expect(
      transitionRecognition(INITIAL_RECOGNITION_STATE, {
        type: "target-found",
        targetIndex: 5,
        at: 100,
      }),
    ).toEqual({ activeTargetIndex: 5, clearAt: null });
  });

  it("keeps the drawer stable during brief target loss", () => {
    const found = { activeTargetIndex: 5, clearAt: null };
    const lost = transitionRecognition(found, {
      type: "target-lost",
      targetIndex: 5,
      at: 100,
    });
    const beforeGrace = transitionRecognition(lost, {
      type: "grace-elapsed",
      at: 100 + TARGET_LOSS_GRACE_MS - 1,
    });
    const foundAgain = transitionRecognition(beforeGrace, {
      type: "target-found",
      targetIndex: 5,
      at: 100 + TARGET_LOSS_GRACE_MS - 1,
    });

    expect(beforeGrace.activeTargetIndex).toBe(5);
    expect(foundAgain).toEqual({ activeTargetIndex: 5, clearAt: null });
  });

  it("clears selection after the loss grace expires", () => {
    const lost = transitionRecognition(
      { activeTargetIndex: 2, clearAt: null },
      { type: "target-lost", targetIndex: 2, at: 400 },
    );

    expect(
      transitionRecognition(lost, {
        type: "grace-elapsed",
        at: 400 + TARGET_LOSS_GRACE_MS,
      }),
    ).toEqual(INITIAL_RECOGNITION_STATE);
  });

  it("ignores loss events for a non-active target", () => {
    const state = { activeTargetIndex: 2, clearAt: null };
    expect(
      transitionRecognition(state, {
        type: "target-lost",
        targetIndex: 7,
        at: 500,
      }),
    ).toBe(state);
  });
});
