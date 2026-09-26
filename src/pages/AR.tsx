import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { AppBar } from "../components/AppBar";
import { DetailsDrawer } from "../components/DetailsDrawer";
import { DREAMS, type Dream } from "../dreams/data/dreams";
import {
  createDreamField,
  normalizeDegrees,
  projectDreamField,
} from "../ar/dreamField";

type CameraStatus = "idle" | "loading" | "active" | "fallback";
type LookMode = "pending" | "motion" | "touch";

type OrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

type OrientationEventConstructor = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const INTRO_DURATION_MS = 3600;

const stopStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};

const headingFromEvent = (event: OrientationEventWithCompass) => {
  if (typeof event.webkitCompassHeading === "number") {
    return normalizeDegrees(event.webkitCompassHeading);
  }

  return event.alpha === null ? null : normalizeDegrees(360 - event.alpha);
};

export const AR = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const initialHeadingRef = useRef<number | null>(null);
  const receivedMotionRef = useRef(false);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startHeading: number;
  } | null>(null);
  const [started, setStarted] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [lookMode, setLookMode] = useState<LookMode>("pending");
  const [heading, setHeading] = useState(0);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const field = useMemo(() => createDreamField(DREAMS), []);
  const visibleShards = useMemo(
    () => projectDreamField(field, heading),
    [field, heading],
  );

  const startCamera = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("fallback");
      return;
    }

    stopStream(streamRef.current);
    setCameraStatus("loading");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      setCameraStatus("active");
    } catch {
      stopStream(streamRef.current);
      streamRef.current = null;
      if (video) video.srcObject = null;
      setCameraStatus("fallback");
    }
  }, []);

  const requestMotion = useCallback(async () => {
    if (!("DeviceOrientationEvent" in window)) {
      setLookMode("touch");
      return;
    }

    try {
      const orientationEvent = DeviceOrientationEvent as OrientationEventConstructor;
      if (
        orientationEvent.requestPermission &&
        (await orientationEvent.requestPermission()) !== "granted"
      ) {
        setLookMode("touch");
        return;
      }
      setLookMode("motion");
    } catch {
      setLookMode("touch");
    }
  }, []);

  const startExperience = () => {
    initialHeadingRef.current = null;
    receivedMotionRef.current = false;
    setStarted(true);
    setShowIntro(true);
    void requestMotion();
    void startCamera();
  };

  useEffect(() => {
    if (!started) return;

    const timer = window.setTimeout(() => setShowIntro(false), INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [started]);

  useEffect(() => {
    if (!started || lookMode !== "motion") return;

    const onOrientation = (rawEvent: DeviceOrientationEvent) => {
      const event = rawEvent as OrientationEventWithCompass;
      const currentHeading = headingFromEvent(event);
      if (currentHeading === null) return;

      receivedMotionRef.current = true;
      if (initialHeadingRef.current === null) {
        initialHeadingRef.current = currentHeading;
      }
      setHeading(
        normalizeDegrees(currentHeading - (initialHeadingRef.current ?? currentHeading)),
      );
    };

    window.addEventListener("deviceorientation", onOrientation, true);
    const fallbackTimer = window.setTimeout(() => {
      if (!receivedMotionRef.current) setLookMode("touch");
    }, 1800);

    return () => {
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("deviceorientation", onOrientation, true);
    };
  }, [lookMode, started]);

  useEffect(
    () => () => {
      stopStream(streamRef.current);
      streamRef.current = null;
    },
    [],
  );

  const onPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (!started || lookMode !== "touch") return;
    if (event.target instanceof Element && event.target.closest("button")) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startHeading: heading,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setHeading(normalizeDegrees(drag.startHeading - (event.clientX - drag.startX) * 0.32));
  };

  const onPointerEnd = (event: ReactPointerEvent<HTMLElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  return (
    <main className="reverie-lens">
      <AppBar />
      <DetailsDrawer
        dream={selectedDream}
        open={Boolean(selectedDream)}
        onClose={() => setSelectedDream(null)}
      >
        <section
          className={`reverie-lens__viewport ${cameraStatus !== "active" ? "reverie-lens__viewport--fallback" : ""}`}
          aria-label="Reverie Lens dream field"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            aria-hidden="true"
            className="reverie-lens__camera"
          />
          <div aria-hidden="true" className="reverie-lens__wash" />

          {!started ? (
            <div className="reverie-lens__welcome">
              <div aria-hidden="true" className="reverie-lens__portal">
                <span />
                <span />
                <span />
              </div>
              <p className="reverie-lens__eyebrow">Deep Reverie presents</p>
              <h1>If AI could dream, what future would it imagine for our world?</h1>
              <p className="reverie-lens__lead">
                Step into a field of possible futures. Turn around to find every dream.
              </p>
              <button
                type="button"
                className="reverie-lens__enter"
                onClick={startExperience}
              >
                Enter the dream field
              </button>
              <p className="reverie-lens__permission-note">
                Uses your camera and phone movement. Images stay on your device.
              </p>
            </div>
          ) : null}

          {started && showIntro ? (
            <div className="reverie-lens__opening" role="status">
              <p>YOUR FORWARD HORIZON</p>
              <h1>If AI could dream…</h1>
              <span>What future would it imagine for our world?</span>
              <button type="button" onClick={() => setShowIntro(false)}>
                Reveal the dreams
              </button>
            </div>
          ) : null}

          {started && !showIntro ? (
            <div className="reverie-lens__field" aria-live="polite">
              {visibleShards.map((shard, index) => (
                <button
                  key={shard.dream.id}
                  type="button"
                  className="dream-shard"
                  style={{
                    left: `${shard.left}%`,
                    top: `${shard.top}%`,
                    transform: `translate(-50%, -50%) scale(${shard.scale})`,
                    animationDelay: `${index * 90}ms`,
                    zIndex: 20 - shard.depth,
                  }}
                  aria-label={`Open dream: ${shard.dream.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedDream(shard.dream);
                  }}
                >
                  <span className="dream-shard__image">
                    <img
                      src={`/images/thumbnails/${shard.dream.fileName}`}
                      alt=""
                      draggable={false}
                    />
                  </span>
                  <span className="dream-shard__title">{shard.dream.title}</span>
                </button>
              ))}
            </div>
          ) : null}

          {started && !showIntro ? (
            <div className="reverie-lens__compass" aria-hidden="true">
              <span style={{ transform: `rotate(${-heading}deg)` }} />
            </div>
          ) : null}

          {started ? (
            <div className="reverie-lens__guide" aria-live="polite">
              <strong>
                {lookMode === "motion" ? "Turn around" : "Drag to look around"}
              </strong>
              <span>Tap a shard to enter its dream</span>
              {cameraStatus === "loading" ? <em>Opening camera…</em> : null}
              {cameraStatus === "fallback" ? (
                <button type="button" onClick={() => void startCamera()}>
                  Camera unavailable · Try again
                </button>
              ) : null}
            </div>
          ) : null}
        </section>
      </DetailsDrawer>
    </main>
  );
};
