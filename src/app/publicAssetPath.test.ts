import { describe, expect, it } from "vitest";
import { publicAssetPath } from "./publicAssetPath";

describe("publicAssetPath", () => {
  it("keeps public assets inside the configured deployment base", () => {
    expect(
      publicAssetPath("/images/hero.webp", "/deep-reverie/"),
    ).toBe("/deep-reverie/images/hero.webp");
  });

  it("uses root-relative assets during local development", () => {
    expect(publicAssetPath("audio/narrations/dream.mp3", "/")).toBe(
      "/audio/narrations/dream.mp3",
    );
  });
});
