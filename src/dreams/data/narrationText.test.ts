import { describe, expect, it } from "vitest";
import { DREAMS } from "./dreams";
import { NARRATION_FILE_BY_DREAM_ID } from "./narrations";
import {
  NARRATION_TEXT_BY_DREAM_ID,
  getNarrationText,
} from "./narrationText";

describe("narration text", () => {
  it("provides substantive read-along copy for every narrated dream", () => {
    const narratedIds = Object.keys(NARRATION_FILE_BY_DREAM_ID).map(Number);

    expect(narratedIds).toHaveLength(54);
    expect(Object.keys(NARRATION_TEXT_BY_DREAM_ID).map(Number)).toEqual(
      narratedIds,
    );
    narratedIds.forEach((dreamId) => {
      expect(getNarrationText(dreamId)?.length).toBeGreaterThan(500);
    });
  });

  it("keeps the AR collection's dream IDs mapped to narration text", () => {
    DREAMS.forEach(({ id }) => {
      expect(getNarrationText(id)).not.toBeNull();
    });
  });

  it("returns null for an unknown dream", () => {
    expect(getNarrationText(999)).toBeNull();
  });
});
