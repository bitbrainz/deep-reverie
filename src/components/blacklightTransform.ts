export type Rgb = readonly [red: number, green: number, blue: number];

const clamp = (value: number) => Math.round(Math.max(0, Math.min(255, value)));

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

export const mapBlacklightPixel = ([red, green, blue]: Rgb): Rgb => {
  const { hue, saturation, value } = toHsv([red, green, blue]);
  const isNeutral = saturation < 0.18;
  const isLime = hue >= 45 && hue < 150;
  const isCyan = hue >= 150 && hue < 205;
  const isMagenta = hue >= 300 && hue < 345;
  const isWarm = hue < 45 || hue >= 345;
  const reactivity = isLime
    ? 0.95
    : isWarm
      ? 0.85
      : isMagenta
        ? 0.38
        : isCyan
          ? 0.24
          : 0.1;
  const chromaResponse = reactivity * Math.pow(saturation, 1.7) * value;
  const whiteResponse = 0.22 * value * Math.pow(1 - saturation, 4);
  const response = chromaResponse + whiteResponse;
  const emission: Rgb = isNeutral
    ? [20, 38, 105]
    : isLime
      ? [135, 255, 12]
      : isWarm
        ? [255, 75, 6]
        : isMagenta
          ? [215, 18, 175]
          : isCyan
            ? [10, 125, 135]
            : [20, 32, 92];

  return [
    clamp(3 + emission[0] * response),
    clamp(4 + emission[1] * response),
    clamp(14 + emission[2] * response),
  ];
};

export const emulateBlacklight = (imageData: ImageData) => {
  const pixels = imageData.data;

  for (let index = 0; index < pixels.length; index += 4) {
    const [red, green, blue] = mapBlacklightPixel([
      pixels[index],
      pixels[index + 1],
      pixels[index + 2],
    ]);
    pixels[index] = red;
    pixels[index + 1] = green;
    pixels[index + 2] = blue;
  }

  return imageData;
};
