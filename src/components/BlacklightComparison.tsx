import { useId, useRef, useState } from "react";
import { emulateBlacklight } from "./blacklightTransform";

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
