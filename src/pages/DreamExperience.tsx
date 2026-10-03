import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { ARDreamPopover } from "../components/ARDreamPopover";
import { DetailsDrawer } from "../components/DetailsDrawer";
import { useDreamSelection } from "../dreams/useDreamSelection";
import {
  createDreamCylinderLayout,
  DEFAULT_CYLINDER_LAYOUT,
  isPlacementFrontFacing,
} from "../app/dreamCylinder";
import { CYLINDER_DREAMS } from "../app/dreamCylinderCollection";
import {
  headingFromEvent,
  pitchFromEvent,
  signedAngularDifference,
  stabilizePitch,
  type OrientationEventWithCompass,
} from "../app/deviceOrientation";
import {
  hasPreparedExperienceAccess,
  requestExperienceAccess,
  subscribeToPreparedExperienceAccess,
  type ExperienceAccessResult,
} from "../app/experienceAccess";
import { publicAssetPath } from "../app/publicAssetPath";

const SENSOR_TIMEOUT_MS = 4_000;
const POPOVER_GAP_PX = 12;
const VIEWPORT_EDGE_PX = 16;

type ExperienceStatus =
  | { kind: "idle" }
  | { kind: "requesting" }
  | { kind: "awaiting-orientation" }
  | { kind: "active" }
  | { kind: "unsupported"; detail: string }
  | { kind: "denied"; detail: string }
  | { kind: "sensor-unavailable"; detail: string };

type OrientationSample = { heading: number; pitch: number };

const stopStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};

const DreamExperience = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewportRef = useRef<HTMLElement>(null);
  const selectedDiamondRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLElement>(null);
  const popoverSizeRef = useRef({ width: 0, height: 0 });
  const viewportGeometryRef = useRef<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const orientationFrameRef = useRef<number | null>(null);
  const originRef = useRef<OrientationSample | null>(null);
  const latestSampleRef = useRef<OrientationSample | null>(null);
  const [status, setStatus] = useState<ExperienceStatus>(() =>
    hasPreparedExperienceAccess()
      ? { kind: "requesting" }
      : { kind: "idle" },
  );
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const { selectedDream, selectDream, closeDetails } =
    useDreamSelection(CYLINDER_DREAMS);
  const layout = useMemo(
    () => createDreamCylinderLayout(CYLINDER_DREAMS, DEFAULT_CYLINDER_LAYOUT),
    [],
  );
  const radiusPixels = layout.radius * DEFAULT_CYLINDER_LAYOUT.pixelsPerMeter;
  const frameWidthPixels =
    DEFAULT_CYLINDER_LAYOUT.frameWidth * DEFAULT_CYLINDER_LAYOUT.pixelsPerMeter;
  const frameHeightPixels =
    DEFAULT_CYLINDER_LAYOUT.frameHeight * DEFAULT_CYLINDER_LAYOUT.pixelsPerMeter;

  useLayoutEffect(() => {
    const page = document.documentElement;
    const body = document.body;
    page.classList.add("dream-experience-active");
    body.classList.add("dream-experience-active");

    return () => {
      page.classList.remove("dream-experience-active");
      body.classList.remove("dream-experience-active");
    };
  }, []);

  const releaseCamera = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const applyAccessResult = useCallback((result: ExperienceAccessResult) => {
    if (result.kind !== "granted") {
      setStatus(result);
      return;
    }

    streamRef.current = result.stream;
    if (videoRef.current) {
      videoRef.current.srcObject = result.stream;
      void videoRef.current.play().catch(() => undefined);
    }
    setStatus({ kind: "awaiting-orientation" });
  }, []);

  const startExperience = useCallback(async () => {
    releaseCamera();
    originRef.current = null;
    latestSampleRef.current = null;
    setHeading(0);
    setPitch(0);

    setStatus({ kind: "requesting" });
    applyAccessResult(await requestExperienceAccess());
  }, [applyAccessResult, releaseCamera]);

  useEffect(() => {
    if (!hasPreparedExperienceAccess()) return;

    return subscribeToPreparedExperienceAccess((result) => {
      releaseCamera();
      originRef.current = null;
      latestSampleRef.current = null;
      setHeading(0);
      setPitch(0);
      applyAccessResult(result);
    });
  }, [applyAccessResult, releaseCamera]);

  useEffect(() => {
    if (
      status.kind !== "awaiting-orientation" &&
      status.kind !== "active"
    ) {
      return;
    }

    const onOrientation = (rawEvent: DeviceOrientationEvent) => {
      const currentHeading = headingFromEvent(
        rawEvent as OrientationEventWithCompass,
      );
      if (currentHeading === null) return;
      const currentPitch = pitchFromEvent(rawEvent) ?? 0;
      const sample = { heading: currentHeading, pitch: currentPitch };
      latestSampleRef.current = sample;

      if (originRef.current === null) {
        originRef.current = sample;
        setHeading(0);
        setPitch(0);
        setStatus({ kind: "active" });
        return;
      }

      if (orientationFrameRef.current !== null) return;
      orientationFrameRef.current = window.requestAnimationFrame(() => {
        orientationFrameRef.current = null;
        const latestSample = latestSampleRef.current;
        const origin = originRef.current;
        if (!latestSample || !origin) return;

        setHeading(signedAngularDifference(latestSample.heading, origin.heading));
        const rawPitchDelta = latestSample.pitch - origin.pitch;
        setPitch((previousPitch) => stabilizePitch(previousPitch, rawPitchDelta));
      });
    };

    window.addEventListener("deviceorientation", onOrientation, true);
    return () => {
      window.removeEventListener("deviceorientation", onOrientation, true);
      if (orientationFrameRef.current !== null) {
        window.cancelAnimationFrame(orientationFrameRef.current);
        orientationFrameRef.current = null;
      }
    };
  }, [status.kind]);

  useEffect(() => {
    if (status.kind !== "awaiting-orientation") return;
    const timeout = window.setTimeout(() => {
      releaseCamera();
      setStatus({
        kind: "sensor-unavailable",
        detail: "Motion access was allowed, but no orientation data arrived from this device.",
      });
    }, SENSOR_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [releaseCamera, status.kind]);

  useEffect(() => releaseCamera, [releaseCamera]);

  const recenter = () => {
    if (!latestSampleRef.current) return;
    originRef.current = latestSampleRef.current;
    setHeading(0);
    setPitch(0);
  };

  const openDream = (
    dream: (typeof CYLINDER_DREAMS)[number],
    opener?: HTMLButtonElement | null,
  ) => {
    setShowDetails(false);
    selectDream(dream, opener);
  };

  const closeSelectedDream = () => {
    setShowDetails(false);
    closeDetails();
  };

  const showSelectedDetails = useCallback(() => setShowDetails(true), []);

  const positionPopover = useCallback(() => {
    const viewport = viewportRef.current;
    const diamond = selectedDiamondRef.current;
    const popover = popoverRef.current;
    if (!viewport || !diamond || !popover) return;

    const placement = diamond.closest<HTMLElement>(".dream-placement");
    const isVisible = placement?.style.visibility !== "hidden";
    popover.style.visibility = isVisible ? "visible" : "hidden";
    if (!isVisible) return;

    let viewportGeometry = viewportGeometryRef.current;
    if (!viewportGeometry) {
      const viewportRect = viewport.getBoundingClientRect();
      viewportGeometry = {
        left: viewportRect.left,
        top: viewportRect.top,
        width: viewportRect.width,
        height: viewportRect.height,
      };
      viewportGeometryRef.current = viewportGeometry;
    }
    const diamondRect = diamond.getBoundingClientRect();
    let popoverSize = popoverSizeRef.current;
    if (!popoverSize.width || !popoverSize.height) {
      const popoverRect = popover.getBoundingClientRect();
      popoverSize = { width: popoverRect.width, height: popoverRect.height };
      popoverSizeRef.current = popoverSize;
    }
    const centeredTop =
      diamondRect.top - viewportGeometry.top +
      (diamondRect.height - popoverSize.height) / 2;
    const maximumTop = Math.max(
      VIEWPORT_EDGE_PX,
      viewportGeometry.height - popoverSize.height - VIEWPORT_EDGE_PX,
    );

    const rightSide =
      diamondRect.right - viewportGeometry.left + POPOVER_GAP_PX;
    const leftSide =
      diamondRect.left -
      viewportGeometry.left -
      popoverSize.width -
      POPOVER_GAP_PX;
    const maximumLeft = Math.max(
      VIEWPORT_EDGE_PX,
      viewportGeometry.width - popoverSize.width - VIEWPORT_EDGE_PX,
    );
    const left =
      rightSide <= maximumLeft
        ? rightSide
        : leftSide >= VIEWPORT_EDGE_PX
          ? leftSide
          : Math.min(Math.max(rightSide, VIEWPORT_EDGE_PX), maximumLeft);
    const top = Math.min(Math.max(centeredTop, VIEWPORT_EDGE_PX), maximumTop);
    popover.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  }, []);

  useLayoutEffect(() => {
    popoverSizeRef.current = { width: 0, height: 0 };
    positionPopover();
  }, [positionPopover, selectedDream, showDetails]);

  useLayoutEffect(() => {
    positionPopover();
  }, [heading, pitch, positionPopover]);

  useEffect(() => {
    const handleResize = () => {
      popoverSizeRef.current = { width: 0, height: 0 };
      viewportGeometryRef.current = null;
      positionPopover();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [positionPopover]);

  const selectDreamAtPoint = (event: ReactMouseEvent<HTMLDivElement>) => {
    const candidates = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>(".dream-diamond"),
    )
      .filter((diamond) => {
        const rect = diamond.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        const normalizedX = (event.clientX - rect.left) / rect.width;
        const normalizedY = (event.clientY - rect.top) / rect.height;
        return (
          normalizedX >= 0 &&
          normalizedX <= 1 &&
          normalizedY >= 0 &&
          normalizedY <= 1 &&
          Math.abs(normalizedX * 2 - 1) + Math.abs(normalizedY * 2 - 1) <= 1
        );
      })
      .sort((left, right) => {
        const leftAngle = Number(left.dataset.angle);
        const rightAngle = Number(right.dataset.angle);
        return (
          Math.abs(signedAngularDifference(leftAngle, -heading)) -
          Math.abs(signedAngularDifference(rightAngle, -heading))
        );
      });

    const selectedFrame = candidates[0];
    if (!selectedFrame) return;
    const dreamId = Number(selectedFrame.dataset.dreamId);
    const dream = CYLINDER_DREAMS.find(({ id }) => id === dreamId);
    if (dream) {
      event.stopPropagation();
      openDream(dream, selectedFrame);
    }
  };

  const isActive = status.kind === "active";
  const worldStyle = {
    transform: `rotateX(${-pitch}deg) rotateY(${heading}deg)`,
  } as CSSProperties;

  return (
    <main className="dream-experience">
      <section
        ref={viewportRef}
        className="dream-experience__viewport"
        aria-label="Deep Reverie dream cylinder"
        onClick={(event) => {
          if (!selectedDream || showDetails) return;
          const target = event.target;
          if (
            target instanceof Element &&
            target.closest(".dream-diamond, .ar-dream-popover")
          ) {
            return;
          }
          closeSelectedDream();
        }}
      >
          <video
            ref={videoRef}
            className="dream-experience__camera"
            autoPlay
            muted
            playsInline
            aria-hidden="true"
          />
          <div className="dream-experience__veil" aria-hidden="true" />

          <header className="dream-experience__header">
            <div>
              <span>Deep Reverie</span>
              <small>
                {isActive
                  ? "AI Dreams"
                  : "Augmented Reality Gallery"}
              </small>
            </div>
            {isActive ? (
              <button type="button" onClick={recenter} className="dream-experience__recenter">
                <span aria-hidden="true">◎</span> Recenter
              </button>
            ) : null}
          </header>

          {isActive ? (
            <div
              className="dream-cylinder"
              aria-label="Dream artworks"
              role="group"
            >
              <div
                className="dream-cylinder__world"
                style={worldStyle}
                data-testid="dream-cylinder-world"
                onClick={(event) => {
                  // When a card is open, the next background tap is always a
                  // dismissal. Do not let the manual diamond hit-test replace
                  // the selection before the outer click-away handler runs.
                  if (selectedDream) return;
                  selectDreamAtPoint(event);
                }}
              >
                {layout.placements.map((placement, index) => {
                  const yPixels =
                    -placement.verticalOffset * DEFAULT_CYLINDER_LAYOUT.pixelsPerMeter;
                  const isFrontFacing = isPlacementFrontFacing(
                    placement.angle,
                    heading,
                  );
                  const isSelected = selectedDream?.id === placement.dream.id;
                  return (
                    <div
                      key={placement.dream.id}
                      className="dream-placement"
                      style={
                        {
                          width: `${frameWidthPixels}px`,
                          height: `${frameHeightPixels}px`,
                          transform: `translate(-50%, -50%) rotateY(${placement.angle}deg) translateZ(${-radiusPixels}px) translateY(${yPixels}px)`,
                          visibility: isFrontFacing ? "visible" : "hidden",
                        } as CSSProperties
                      }
                    >
                      <button
                        ref={isSelected ? selectedDiamondRef : null}
                        type="button"
                        className={`dream-diamond ${isSelected ? "dream-diamond--selected" : ""}`}
                        data-angle={placement.angle}
                        data-dream-id={placement.dream.id}
                        style={{ "--dream-index": index } as CSSProperties}
                        aria-hidden={isFrontFacing ? undefined : true}
                        tabIndex={isFrontFacing ? 0 : -1}
                        aria-pressed={isSelected}
                        aria-label={`Open ${placement.dream.title}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          openDream(placement.dream, event.currentTarget);
                        }}
                      >
                        <span className="dream-diamond__image">
                          <img
                            src={publicAssetPath(
                              `images/thumbnails/${placement.dream.fileName.replace(".png", ".webp")}`,
                            )}
                            alt=""
                            draggable={false}
                            loading="eager"
                            decoding="async"
                          />
                        </span>
                      </button>
                    </div>
                  );
                })}

              </div>
            </div>
          ) : (
            <ExperienceGate status={status} onStart={startExperience} />
          )}

          {selectedDream && !showDetails ? (
            <ARDreamPopover
              ref={popoverRef}
              dream={selectedDream}
              onDetails={showSelectedDetails}
            />
          ) : null}

          {isActive ? (
            <div className="dream-experience__guide">
              <svg
                aria-hidden="true"
                className="dream-experience__guide-orbit"
                viewBox="0 0 48 48"
              >
                <path d="M8 24c0-7 7-12 16-12 6.8 0 12.6 2.9 15 7" />
                <path d="m35 14 4 5-6 2" />
                <path d="M40 24c0 7-7 12-16 12-6.8 0-12.6-2.9-15-7" />
                <path d="m13 34-4-5 6-2" />
              </svg>
              <span>
                <strong>The gallery surrounds you</strong>
                <small>Turn slowly with your phone to discover every artwork</small>
              </span>
            </div>
          ) : null}
      </section>
      <DetailsDrawer
        dream={selectedDream}
        open={showDetails && selectedDream !== null}
        onClose={closeSelectedDream}
      />
    </main>
  );
};

const ExperienceGate = ({
  status,
  onStart,
}: {
  status: ExperienceStatus;
  onStart: () => void;
}) => {
  const isWaiting =
    status.kind === "requesting" || status.kind === "awaiting-orientation";
  const isFailure =
    status.kind === "unsupported" ||
    status.kind === "denied" ||
    status.kind === "sensor-unavailable";

  return (
    <div className="dream-experience__gate">
      <div className="dream-experience__gate-diamond" aria-hidden="true">
        <img src={publicAssetPath("images/thumbnails/54_Title.webp")} alt="" />
      </div>
      <p className="dream-experience__eyebrow">Augmented Reality Gallery</p>
      <h1>{isFailure ? "The gallery could not open" : "Face forward"}</h1>
      {isFailure ? <p className="dream-experience__gate-copy">{status.detail}</p> : null}
      <button
        type="button"
        onClick={onStart}
        disabled={isWaiting}
        className="dream-experience__start"
      >
        {status.kind === "requesting"
          ? "Requesting access…"
          : status.kind === "awaiting-orientation"
            ? "Finding your direction…"
            : isFailure
              ? "Try again"
              : "Enter the gallery"}
      </button>
      <small>Camera and volume required</small>
    </div>
  );
};

export default DreamExperience;
