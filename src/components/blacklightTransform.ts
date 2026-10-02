import {
  CALIBRATION_COLUMN_COUNT,
  CALIBRATION_NEUTRAL_COUNT,
  CALIBRATION_ROW_COUNT,
  getCalibrationGrid,
  getCalibrationNeutralRamp,
} from "./blacklightCalibration";

export type Rgb = readonly [red: number, green: number, blue: number];

type MutableRgb = [red: number, green: number, blue: number];

const HUE_START = 240;
const HUE_STEP = 10;
const LUT_SIZE = 25;
const SATURATION_ROWS = 10;
const VALUE_START_ROW = 10;

const clampUnit = (value: number) => Math.max(0, Math.min(1, value));
const clampByte = (value: number) =>
  Math.round(Math.max(0, Math.min(255, value)));

const srgbToLinear = (value: number) => {
  const channel = value / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
};

const linearToSrgb = (value: number) => {
  const channel = clampUnit(value);
  return 255 *
    (channel <= 0.0031308
      ? channel * 12.92
      : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055);
};

const toLinearTable = (source: Uint8Array) =>
  Float32Array.from(source, srgbToLinear);

const blacklightGrid = toLinearTable(getCalibrationGrid("blacklight"));
const neutralRamp = toLinearTable(getCalibrationNeutralRamp("blacklight"));

const mix = (start: number, end: number, amount: number) =>
  start + (end - start) * amount;

const mixRgb = (start: MutableRgb, end: MutableRgb, amount: number): MutableRgb => [
  mix(start[0], end[0], amount),
  mix(start[1], end[1], amount),
  mix(start[2], end[2], amount),
];

const readColor = (table: Float32Array, index: number): MutableRgb => [
  table[index],
  table[index + 1],
  table[index + 2],
];

const sampleNeutral = (value: number) => {
  const position = (1 - clampUnit(value)) * (CALIBRATION_NEUTRAL_COUNT - 1);
  const start = Math.floor(position);
  const end = Math.min(CALIBRATION_NEUTRAL_COUNT - 1, start + 1);
  return mixRgb(
    readColor(neutralRamp, start * 3),
    readColor(neutralRamp, end * 3),
    position - start,
  );
};

const sampleGrid = (hue: number, row: number): MutableRgb => {
  const huePosition = ((HUE_START - hue + 360) % 360) / HUE_STEP;
  const columnStart = Math.floor(huePosition);
  const columnEnd = Math.min(CALIBRATION_COLUMN_COUNT - 1, columnStart + 1);
  const hueAmount = huePosition - columnStart;
  const rowPosition = Math.max(0, Math.min(CALIBRATION_ROW_COUNT - 1, row));
  const rowStart = Math.floor(rowPosition);
  const rowEnd = Math.min(CALIBRATION_ROW_COUNT - 1, rowStart + 1);
  const rowAmount = rowPosition - rowStart;

  const at = (rowIndex: number, columnIndex: number) =>
    readColor(
      blacklightGrid,
      (rowIndex * CALIBRATION_COLUMN_COUNT + columnIndex) * 3,
    );

  return mixRgb(
    mixRgb(at(rowStart, columnStart), at(rowStart, columnEnd), hueAmount),
    mixRgb(at(rowEnd, columnStart), at(rowEnd, columnEnd), hueAmount),
    rowAmount,
  );
};

const fullFluorescence = (hue: number) =>
  mixRgb(
    sampleGrid(hue, SATURATION_ROWS - 1),
    sampleGrid(hue, VALUE_START_ROW),
    0.5,
  );

const sampleSaturationCurve = (hue: number, saturation: number) => {
  const amount = clampUnit(saturation);
  if (amount === 0) return sampleNeutral(1);
  if (amount >= 1) return fullFluorescence(hue);

  const position = amount * 10;
  const control = (index: number) => {
    if (index === 0) return sampleNeutral(1);
    if (index === 10) return fullFluorescence(hue);
    return sampleGrid(hue, index - 1);
  };
  const start = Math.floor(position);

  return mixRgb(control(start), control(start + 1), position - start);
};

const sampleValueCurve = (hue: number, value: number) => {
  const amount = clampUnit(value);
  if (amount === 0) return sampleNeutral(0);
  if (amount >= 1) return fullFluorescence(hue);

  const position = amount * 10;
  const control = (index: number) => {
    if (index === 0) return sampleNeutral(0);
    if (index === 10) return fullFluorescence(hue);
    return sampleGrid(hue, CALIBRATION_ROW_COUNT - index);
  };
  const start = Math.floor(position);

  return mixRgb(control(start), control(start + 1), position - start);
};

const toHsv = ([red, green, blue]: Rgb) => {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let hue = 0;

  if (delta) {
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
  }

  return {
    hue: hue < 0 ? hue + 360 : hue,
    saturation: max === 0 ? 0 : delta / max,
    value: max,
  };
};

// A Coons patch joins the measured neutral, saturation, and value boundaries.
// It reproduces every sampled boundary and fills the unsampled S/V interior
// continuously instead of assigning pixels to hard hue or luminance bands.
const mapCalibratedLinear = (color: Rgb): MutableRgb => {
  const { hue, saturation, value } = toHsv(color);
  const neutral = sampleNeutral(value);
  const valueResponse = sampleValueCurve(hue, value);
  const saturationResponse = sampleSaturationCurve(hue, saturation);
  const neutralWhite = sampleNeutral(1);
  const full = fullFluorescence(hue);

  return [0, 1, 2].map((channel) =>
    clampUnit(
      (1 - saturation) * neutral[channel] +
        saturation * valueResponse[channel] +
        value * saturationResponse[channel] -
        value *
          ((1 - saturation) * neutralWhite[channel] +
            saturation * full[channel]),
    ),
  ) as MutableRgb;
};

const createLut = () => {
  const table = new Uint8Array(LUT_SIZE * LUT_SIZE * LUT_SIZE * 3);
  const maximum = LUT_SIZE - 1;

  for (let red = 0; red < LUT_SIZE; red += 1) {
    for (let green = 0; green < LUT_SIZE; green += 1) {
      for (let blue = 0; blue < LUT_SIZE; blue += 1) {
        const mapped = mapCalibratedLinear([
          (red / maximum) * 255,
          (green / maximum) * 255,
          (blue / maximum) * 255,
        ]);
        const index = ((red * LUT_SIZE + green) * LUT_SIZE + blue) * 3;
        table[index] = clampByte(linearToSrgb(mapped[0]));
        table[index + 1] = clampByte(linearToSrgb(mapped[1]));
        table[index + 2] = clampByte(linearToSrgb(mapped[2]));
      }
    }
  }

  return table;
};

const lut = createLut();

const lutColor = (red: number, green: number, blue: number): MutableRgb => {
  const index = ((red * LUT_SIZE + green) * LUT_SIZE + blue) * 3;
  return [lut[index], lut[index + 1], lut[index + 2]];
};

export const mapBlacklightPixel = ([red, green, blue]: Rgb): Rgb => {
  const maximum = LUT_SIZE - 1;
  const positions = [red, green, blue].map(
    (channel) => (Math.max(0, Math.min(255, channel)) / 255) * maximum,
  );
  const starts = positions.map(Math.floor);
  const ends = starts.map((start) => Math.min(maximum, start + 1));
  const amounts = positions.map((position, index) => position - starts[index]);

  const redStart = mixRgb(
    mixRgb(
      lutColor(starts[0], starts[1], starts[2]),
      lutColor(starts[0], starts[1], ends[2]),
      amounts[2],
    ),
    mixRgb(
      lutColor(starts[0], ends[1], starts[2]),
      lutColor(starts[0], ends[1], ends[2]),
      amounts[2],
    ),
    amounts[1],
  );
  const redEnd = mixRgb(
    mixRgb(
      lutColor(ends[0], starts[1], starts[2]),
      lutColor(ends[0], starts[1], ends[2]),
      amounts[2],
    ),
    mixRgb(
      lutColor(ends[0], ends[1], starts[2]),
      lutColor(ends[0], ends[1], ends[2]),
      amounts[2],
    ),
    amounts[1],
  );
  const mapped = mixRgb(redStart, redEnd, amounts[0]);

  return [
    clampByte(mapped[0]),
    clampByte(mapped[1]),
    clampByte(mapped[2]),
  ];
};

export const emulateBlacklight = (imageData: ImageData) => {
  const pixels = imageData.data;

  for (let index = 0; index < pixels.length; index += 4) {
    const [mappedRed, mappedGreen, mappedBlue] = mapBlacklightPixel([
      pixels[index],
      pixels[index + 1],
      pixels[index + 2],
    ]);
    pixels[index] = mappedRed;
    pixels[index + 1] = mappedGreen;
    pixels[index + 2] = mappedBlue;
  }

  return imageData;
};
