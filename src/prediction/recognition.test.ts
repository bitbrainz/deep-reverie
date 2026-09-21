import { describe, expect, it } from "vitest";
import {
  findDreamByLabel,
  findUnsupportedLabels,
  selectStablePrediction,
} from "./recognition";

describe("Dream recognition", () => {
  it("resolves a model label to its Dream record", () => {
    expect(findDreamByLabel("3_Empathy")?.title).toBe("Empathy Everywhere");
    expect(findDreamByLabel("3_Empathy.png")?.title).toBe(
      "Empathy Everywhere"
    );
  });

  it("rejects model labels that cannot open a Dream", () => {
    expect(findUnsupportedLabels(["3_Empathy", "not-a-dream"])).toEqual([
      "not-a-dream",
    ]);
  });

  it("averages complete prediction frames instead of discarding early labels", () => {
    const result = selectStablePrediction([
      [
        { className: "1_VirtualReality", probability: 0.9 },
        { className: "54_Title", probability: 0.1 },
      ],
      [
        { className: "1_VirtualReality", probability: 0.8 },
        { className: "54_Title", probability: 0.2 },
      ],
    ]);

    expect(result).toEqual({
      className: "1_VirtualReality",
      probability: 0.8500000000000001,
    });
  });

  it("does not recognize low-confidence camera frames", () => {
    expect(
      selectStablePrediction([
        [{ className: "3_Empathy", probability: 0.6 }],
      ])
    ).toBeUndefined();
  });
});
