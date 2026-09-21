import { useId, useRef, useState } from "react";

const clamp = (value: number) => Math.max(0, Math.min(255, value));

const hueDistance = (hue: number, target: number) => {
  const distance = Math.abs(hue - target);
  return Math.min(distance, 360 - distance);
};

const hueGlow = (hue: number, target: number, width: number) => {
  const distance = hueDistance(hue, target);
  return Math.exp(-(distance * distance) / (2 * width * width));
};

const rgbToHsv = (red: number, green: number, blue: number) => {
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

const emulateBlacklight = (imageData: ImageData) => {
  const pixels = imageData.data;

  for (let index = 0; index < pixels.length; index += 4) {
    const red = pixels[index];
    const green = pixels[index + 1];
    const blue = pixels[index + 2];
    const { hue, saturation, value } = rgbToHsv(red, green, blue);

    // Based on the supplied UV-print chart: lime/yellow and warm inks fluoresce
    // most, magenta reacts moderately, while blue-rich and pastel inks recede.
    const lime = hueGlow(hue, 80, 42);
    const warm = hueGlow(hue, 22, 30);
    const magenta = hueGlow(hue, 330, 24) * 0.5;
    const cyan = hueGlow(hue, 175, 32) * 0.28;
    const reactivity = Math.max(lime, warm, magenta, cyan);
    const chromaGlow = reactivity * Math.pow(saturation, 0.72) * value;
    const whiteGlow = Math.pow(value, 2) * Math.pow(1 - saturation, 3) * 0.23;
    const base = value * (0.035 + saturation * 0.055);
    const boost = chromaGlow * 1.65;

    pixels[index] = clamp(red * base + red * boost + whiteGlow * 35);
    pixels[index + 1] = clamp(green * base + green * boost + whiteGlow * 80);
    pixels[index + 2] = clamp(
      blue * base + blue * boost + whiteGlow * 180 + value * 12,
    );
  }

  return imageData;
};

export const BlacklightComparison = ({ src, alt }: { src: string; alt: string }) => {
  const [position, setPosition] = useState(50);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instructionsId = useId();

  const renderBlacklight = (image: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas || !image.naturalWidth || !image.naturalHeight) return;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;

    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    context.putImageData(emulateBlacklight(imageData), 0, 0);
  };

  return (
    <figure className="blacklight-comparison">
      <div className="blacklight-comparison__stage">
        <img src={src} alt={alt} onLoad={(event) => renderBlacklight(event.currentTarget)} />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="blacklight-comparison__canvas"
          style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        />
        <div
          aria-hidden="true"
          className="blacklight-comparison__divider"
          style={{ left: `${position}%` }}
        >
          <span>↔</span>
        </div>
        <input
          className="blacklight-comparison__range"
          type="range"
          min="0"
          max="100"
          value={position}
          aria-label="Blacklight comparison position"
          aria-describedby={instructionsId}
          onChange={(event) => setPosition(Number(event.currentTarget.value))}
        />
        <span aria-hidden="true" className="blacklight-comparison__label blacklight-comparison__label--left">
          Blacklight
        </span>
        <span aria-hidden="true" className="blacklight-comparison__label blacklight-comparison__label--right">
          Normal
        </span>
      </div>
      <figcaption id={instructionsId}>
        Drag the divider or use the arrow keys to compare blacklight and normal views.
      </figcaption>
    </figure>
  );
};
