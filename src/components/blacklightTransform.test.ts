import { describe, expect, it } from "vitest";
import {
  CALIBRATION_COLUMN_COUNT,
  CALIBRATION_NEUTRAL_COUNT,
  CALIBRATION_ROW_COUNT,
  getCalibrationGrid,
  getCalibrationNeutralRamp,
} from "./blacklightCalibration";
import { emulateBlacklight, mapBlacklightPixel, type Rgb } from "./blacklightTransform";

const luminance = ([red, green, blue]: Rgb) =>
  red * 0.2126 + green * 0.7152 + blue * 0.0722;

const colorDistance = (first: Rgb, second: Rgb) =>
  Math.sqrt(
    first.reduce(
      (sum, channel, index) => sum + Math.pow(channel - second[index], 2),
      0,
    ),
  );

const hsvToRgb = (hue: number, saturation: number, value: number): Rgb => {
  const chroma = value * saturation;
  const section = hue / 60;
  const second = chroma * (1 - Math.abs((section % 2) - 1));
  const candidates = [
    [chroma, second, 0],
    [second, chroma, 0],
    [0, chroma, second],
    [0, second, chroma],
    [second, 0, chroma],
    [chroma, 0, second],
  ];
  const match = value - chroma;

  const [red, green, blue] = candidates[Math.floor(section) % 6].map((channel) =>
    Math.round((channel + match) * 255),
  );
  return [red, green, blue];
};

describe("Glowtronics calibration data", () => {
  it("contains corresponding digital, daylight, blacklight, and neutral samples", () => {
    for (const grid of ["digital", "daylight", "blacklight"] as const) {
      expect(getCalibrationGrid(grid)).toHaveLength(
        CALIBRATION_COLUMN_COUNT * CALIBRATION_ROW_COUNT * 3,
      );
      expect(getCalibrationNeutralRamp(grid)).toHaveLength(
        CALIBRATION_NEUTRAL_COUNT * 3,
      );
    }
  });

  it("keeps a stable paired sample at cell K19", () => {
    const sample = (grid: "digital" | "daylight" | "blacklight") => {
      const data = getCalibrationGrid(grid);
      const index = (10 * CALIBRATION_COLUMN_COUNT + 18) * 3;
      return Array.from(data.slice(index, index + 3));
    };

    expect(sample("digital")).toEqual([241, 234, 55]);
    expect(sample("daylight")).toEqual([250, 248, 138]);
    expect(sample("blacklight")).toEqual([173, 250, 116]);
  });
});

describe("mapBlacklightPixel", () => {
  it("has stable representative outputs", () => {
    expect([
      mapBlacklightPixel([0, 0, 0]),
      mapBlacklightPixel([85, 85, 85]),
      mapBlacklightPixel([255, 255, 255]),
      mapBlacklightPixel([255, 128, 0]),
      mapBlacklightPixel([128, 255, 0]),
      mapBlacklightPixel([0, 128, 255]),
      mapBlacklightPixel([255, 0, 255]),
    ]).toEqual([
      [0, 0, 22],
      [1, 4, 100],
      [64, 90, 248],
      [254, 188, 39],
      [66, 220, 117],
      [51, 67, 250],
      [156, 78, 254],
    ]);
  });

  it("makes fluorescent yellow-green and orange dominate blue", () => {
    const lime = mapBlacklightPixel([170, 255, 20]);
    const orange = mapBlacklightPixel([255, 55, 10]);
    const blue = mapBlacklightPixel([25, 80, 255]);

    expect(luminance(lime)).toBeGreaterThan(luminance(blue) * 4);
    expect(luminance(orange)).toBeGreaterThan(luminance(blue) * 3);
  });

  it("preserves hue-dependent emission instead of applying a uniform blue cast", () => {
    const white = mapBlacklightPixel([255, 255, 255]);
    const orange = mapBlacklightPixel([255, 128, 0]);
    const lime = mapBlacklightPixel([128, 255, 0]);
    const magenta = mapBlacklightPixel([255, 0, 255]);

    expect(white[2]).toBeGreaterThan(white[0] * 3);
    expect(orange[0]).toBeGreaterThan(orange[2] * 5);
    expect(lime[1]).toBeGreaterThan(lime[0] * 3);
    expect(magenta[0]).toBeGreaterThan(lime[0] * 2);
  });

  it("keeps dark source colors substantially dark", () => {
    const black = mapBlacklightPixel([0, 0, 0]);
    const darkNeutral = mapBlacklightPixel([24, 24, 24]);
    const darkRed = mapBlacklightPixel([40, 3, 3]);

    expect(luminance(black)).toBeLessThan(3);
    expect(luminance(darkNeutral)).toBeLessThan(25);
    expect(luminance(darkRed)).toBeLessThan(35);
  });

  it("interpolates continuously through every measured hue boundary", () => {
    for (let hue = 0; hue < 360; hue += 10) {
      const before = mapBlacklightPixel(hsvToRgb((hue + 359) % 360, 1, 1));
      const after = mapBlacklightPixel(hsvToRgb((hue + 1) % 360, 1, 1));
      expect(colorDistance(before, after)).toBeLessThan(42);
    }
  });
});

describe("emulateBlacklight", () => {
  it("maps pixels deterministically without changing alpha", () => {
    const imageData = {
      data: new Uint8ClampedArray([255, 128, 0, 37, 0, 0, 255, 191]),
    } as ImageData;

    emulateBlacklight(imageData);

    expect(Array.from(imageData.data)).toEqual([
      254, 188, 39, 37, 0, 0, 209, 191,
    ]);
  });
});
