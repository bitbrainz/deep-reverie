import { describe, expect, it } from "vitest";
import { mapBlacklightPixel } from "./blacklightTransform";

const luminance = ([red, green, blue]: readonly number[]) =>
  red * 0.2126 + green * 0.7152 + blue * 0.0722;

describe("mapBlacklightPixel", () => {
  it("makes UV-reactive lime brighter than blue-rich ink", () => {
    const lime = mapBlacklightPixel([170, 255, 20]);
    const blue = mapBlacklightPixel([25, 80, 255]);

    expect(luminance(lime)).toBeGreaterThan(luminance(blue) * 3.2);
  });

  it("renders saturated warm ink as strong warm fluorescence", () => {
    const warm = mapBlacklightPixel([255, 55, 10]);
    const blue = mapBlacklightPixel([25, 80, 255]);

    expect(luminance(warm)).toBeGreaterThan(luminance(blue) * 2);
    expect(warm[0]).toBeGreaterThan(warm[2] * 3);
  });

  it("shifts white toward a weak blue glow", () => {
    const white = mapBlacklightPixel([255, 255, 255]);

    expect(luminance(white)).toBeGreaterThan(10);
    expect(luminance(white)).toBeLessThan(45);
    expect(white[2]).toBeGreaterThan(white[0] * 2);
  });

  it("keeps pastel ink subdued under blacklight", () => {
    const pastelLime = mapBlacklightPixel([205, 235, 185]);
    const saturatedLime = mapBlacklightPixel([170, 255, 20]);

    expect(luminance(pastelLime)).toBeLessThan(45);
    expect(luminance(pastelLime)).toBeLessThan(luminance(saturatedLime) / 3);
  });

  it("keeps magenta visible but weaker than warm and lime inks", () => {
    const magenta = mapBlacklightPixel([235, 15, 180]);
    const warm = mapBlacklightPixel([255, 55, 10]);
    const lime = mapBlacklightPixel([170, 255, 20]);

    expect(magenta[0]).toBeGreaterThan(magenta[2]);
    expect(luminance(magenta)).toBeLessThan(luminance(warm));
    expect(luminance(magenta)).toBeLessThan(luminance(lime));
  });

  it("keeps a representative palette dark overall", () => {
    const palette = [
      [170, 255, 20],
      [255, 55, 10],
      [25, 80, 255],
      [205, 235, 185],
      [255, 255, 255],
      [85, 85, 85],
    ] as const;
    const inputAverage =
      palette.reduce((sum, color) => sum + luminance(color), 0) / palette.length;
    const outputAverage =
      palette.reduce(
        (sum, color) => sum + luminance(mapBlacklightPixel(color)),
        0,
      ) / palette.length;

    expect(outputAverage).toBeLessThan(inputAverage * 0.55);
  });
});
