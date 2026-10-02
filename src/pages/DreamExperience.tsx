import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { DetailsDrawer } from "../components/DetailsDrawer";
import { DREAMS } from "../dreams/data/dreams";
import { useDreamSelection } from "../dreams/useDreamSelection";
import {
  calculateOverviewWidth,
  createDreamCylinderLayout,
  DEFAULT_CYLINDER_LAYOUT,
} from "../app/dreamCylinder";
import {
  clampPitch,
  headingFromEvent,
  pitchFromEvent,
  signedAngularDifference,
  type OrientationEventWithCompass,
  type OrientationPermissionConstructor,
} from "../app/deviceOrientation";

const CYLINDER_DREAMS = DREAMS.slice(0, 50);
const SENSOR_TIMEOUT_MS = 4_000;

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
  const streamRef = useRef<MediaStream | null>(null);
  const originRef = useRef<OrientationSample | null>(null);
  const latestSampleRef = useRef<OrientationSample | null>(null);
  const [status, setStatus] = useState<ExperienceStatus>({ kind: "idle" });
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0);
  const [showOverview, setShowOverview] = useState(true);
  const { selectedDream, selectDream, selectAdjacentDream, closeDetails } =
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
  const overviewWidthPixels =
    calculateOverviewWidth(layout.radius, DEFAULT_CYLINDER_LAYOUT.overviewAngle) *
    DEFAULT_CYLINDER_LAYOUT.pixelsPerMeter;

  const releaseCamera = useCallback(() => {
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startExperience = useCallback(async () => {
    releaseCamera();
    originRef.current = null;
    latestSampleRef.current = null;
    setHeading(0);
    setPitch(0);
    setShowOverview(true);

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setStatus({
        kind: "unsupported",
        detail: "A secure browser with rear-camera access is required.",
      });
      return;
    }

    if (!("DeviceOrientationEvent" in window)) {
      setStatus({
        kind: "unsupported",
        detail: "This device does not provide the motion sensor needed to look around.",
      });
      return;
    }

    setStatus({ kind: "requesting" });
    const orientationConstructor =
      DeviceOrientationEvent as OrientationPermissionConstructor;
    const motionPermission = orientationConstructor.requestPermission
      ? orientationConstructor.requestPermission()
      : Promise.resolve<"granted">("granted");
    const cameraPermission = navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: "environment" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });
    const [motionResult, cameraResult] = await Promise.allSettled([
      motionPermission,
      cameraPermission,
    ]);

    const motionGranted =
      motionResult.status === "fulfilled" && motionResult.value === "granted";
    const cameraGranted = cameraResult.status === "fulfilled";
    if (!motionGranted || !cameraGranted) {
      if (cameraResult.status === "fulfilled") stopStream(cameraResult.value);
      const blocked = [
        !cameraGranted ? "camera" : null,
        !motionGranted ? "motion" : null,
      ].filter(Boolean);
      setStatus({
        kind: "denied",
        detail: `Allow ${blocked.join(" and ")} access in your browser settings, then try again.`,
      });
      return;
    }

    streamRef.current = cameraResult.value;
    if (videoRef.current) {
      videoRef.current.srcObject = cameraResult.value;
      void videoRef.current.play().catch(() => undefined);
    }
    setStatus({ kind: "awaiting-orientation" });
  }, [releaseCamera]);

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

      setHeading(signedAngularDifference(currentHeading, originRef.current.heading));
      setPitch(clampPitch(currentPitch - originRef.current.pitch));
    };

    window.addEventListener("deviceorientation", onOrientation, true);
    return () => window.removeEventListener("deviceorientation", onOrientation, true);
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
          Math.abs(signedAngularDifference(leftAngle, heading)) -
          Math.abs(signedAngularDifference(rightAngle, heading))
        );
      });

    const selectedFrame = candidates[0];
    if (!selectedFrame) return;
    const dreamId = Number(selectedFrame.dataset.dreamId);
    const dream = CYLINDER_DREAMS.find(({ id }) => id === dreamId);
    if (dream) selectDream(dream, selectedFrame);
  };

  const isActive = status.kind === "active";
  const worldStyle = {
    transform: `rotateX(${pitch}deg) rotateY(${-heading}deg)`,
  } as CSSProperties;

  return (
    <main className="dream-experience">
      <DetailsDrawer
        dream={selectedDream}
        open={selectedDream !== null}
        onClose={closeDetails}
        onPrevious={() => selectAdjacentDream(-1)}
        onNext={() => selectAdjacentDream(1)}
        backgroundInteractive
      >
        <section className="dream-experience__viewport" aria-label="Deep Reverie dream cylinder">
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
              <small>{isActive ? "50 dreams · 360°" : "Rotation gallery"}</small>
            </div>
            {isActive ? (
              <button type="button" onClick={recenter} className="dream-experience__recenter">
                <span aria-hidden="true">◎</span> Recenter
              </button>
            ) : null}
          </header>

          {isActive ? (
            <div
              className={`dream-cylinder ${showOverview ? "dream-cylinder--overview" : ""}`}
              aria-label="Dream artworks"
              role="group"
            >
              <div
                className="dream-cylinder__world"
                style={worldStyle}
                data-testid="dream-cylinder-world"
                onClick={selectDreamAtPoint}
              >
                {layout.placements.map((placement, index) => {
                  const yPixels =
                    -placement.heightFromEye * DEFAULT_CYLINDER_LAYOUT.pixelsPerMeter;
                  return (
                    <button
                      key={placement.dream.id}
                      type="button"
                      className="dream-diamond"
                      data-angle={placement.angle}
                      data-dream-id={placement.dream.id}
                      style={
                        {
                          width: `${frameWidthPixels}px`,
                          height: `${frameHeightPixels}px`,
                          transform: `translate(-50%, -50%) rotateY(${placement.angle}deg) translateZ(${-radiusPixels}px) translateY(${yPixels}px)`,
                          "--dream-index": index,
                        } as CSSProperties
                      }
                      aria-label={`Open dream ${String(placement.dream.id).padStart(2, "0")}: ${placement.dream.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectDream(placement.dream, event.currentTarget);
                      }}
                    >
                      <span className="dream-diamond__image">
                        <img
                          src={`/images/thumbnails-2x/${placement.dream.fileName.replace(".png", ".webp")}`}
                          alt=""
                          draggable={false}
                          loading={index < 8 ? "eager" : "lazy"}
                        />
                      </span>
                      <span className="dream-diamond__number" aria-hidden="true">
                        {String(placement.dream.id).padStart(2, "0")}
                      </span>
                    </button>
                  );
                })}

              </div>
              {showOverview ? (
                <aside
                  className="dream-cylinder__overview"
                  style={{ width: `min(92vw, ${overviewWidthPixels}px)` }}
                  aria-label="About the dream cylinder"
                >
                  <p>Machine-imagined futures</p>
                  <h1>What does AI dream of?</h1>
                  <span>
                    Turn with your phone to travel through fifty visions. Tilt to reach
                    the upper and lower horizons, then touch a diamond to enter its story.
                  </span>
                  <button type="button" onClick={() => setShowOverview(false)}>
                    Explore the circle
                  </button>
                </aside>
              ) : null}
            </div>
          ) : (
            <ExperienceGate status={status} onStart={startExperience} />
          )}

          {isActive ? (
            <div className="dream-experience__guide" aria-live="polite">
              <span aria-hidden="true" />
              Turn to look around · tilt to move between rows
            </div>
          ) : null}
        </section>
      </DetailsDrawer>
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
        <img src="/images/thumbnails-2x/54_Title.webp" alt="" />
      </div>
      <p className="dream-experience__eyebrow">A gallery you enter by turning</p>
      <h1>{isFailure ? "The dream field could not open" : "Face the first horizon"}</h1>
      <p className="dream-experience__gate-copy">
        {isFailure
          ? status.detail
          : "Your current direction becomes forward. The camera stays on your device and movement only rotates the gallery around you."}
      </p>
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
              : "Start the experience"}
      </button>
      <small>Requires rear camera and device motion · no location or mapping</small>
    </div>
  );
};

export default DreamExperience;
