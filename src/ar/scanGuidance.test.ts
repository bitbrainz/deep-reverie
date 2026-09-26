import { describe, expect, it } from "vitest";
import { ACTIVE_SCAN_GUIDANCE, IDLE_SCAN_GUIDANCE } from "./scanGuidance";

describe("AR scan guidance", () => {
  it("does not require the physical print to contain the full source image", () => {
    expect(IDLE_SCAN_GUIDANCE).toContain("clear section");
    expect(ACTIVE_SCAN_GUIDANCE).toContain("Cropped diamond and triangle prints");
    expect(ACTIVE_SCAN_GUIDANCE).toContain("full original image is not required");
    expect(ACTIVE_SCAN_GUIDANCE).not.toContain("keep the full image in frame");
  });
});
