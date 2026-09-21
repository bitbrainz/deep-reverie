import { describe, expect, it } from "vitest";
import { DREAMS } from "../dreams/data/dreams";
import {
  dreamForTargetIndex,
  isPilotTargetIndex,
  PILOT_TARGETS,
} from "./pilotTargets";

describe("MindAR pilot targets", () => {
  it("selects exactly the first ten dreams in canonical order", () => {
    expect(PILOT_TARGETS).toHaveLength(10);
    expect(PILOT_TARGETS.map(({ targetIndex }) => targetIndex)).toEqual(
      Array.from({ length: 10 }, (_, index) => index),
    );
    expect(PILOT_TARGETS.map(({ dreamId }) => dreamId)).toEqual(
      DREAMS.slice(0, 10).map(({ id }) => id),
    );
  });

  it("includes World Peace without a substitution", () => {
    expect(PILOT_TARGETS[5]).toMatchObject({
      targetIndex: 5,
      dreamId: 6,
      title: "World Peace",
    });
  });

  it("maps known indexes and rejects unsupported indexes", () => {
    expect(dreamForTargetIndex(0)?.title).toBe("Virtual Reality");
    expect(dreamForTargetIndex(9)?.title).toBe("Borderless World");
    expect(dreamForTargetIndex(10)).toBeUndefined();
    expect(dreamForTargetIndex(-1)).toBeUndefined();
    expect(isPilotTargetIndex(1.5)).toBe(false);
  });
});
