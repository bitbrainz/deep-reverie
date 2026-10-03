import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DREAMS } from "../dreams/data/dreams";
import { prepareExperienceAccess } from "../app/experienceAccess";
import DreamExperience from "./DreamExperience";

class DeviceOrientationEventMock extends Event {
  static requestPermission = vi.fn<() => Promise<"granted" | "denied">>();
  alpha: number | null;
  beta: number | null;
  gamma: number | null;
  absolute = false;

  constructor(
    type: string,
    init: { alpha?: number; beta?: number; gamma?: number } = {},
  ) {
    super(type);
    this.alpha = init.alpha ?? null;
    this.beta = init.beta ?? null;
    this.gamma = init.gamma ?? null;
  }
}

const stopTrack = vi.fn();
const getUserMedia = vi.fn();
const mediaStream = { getTracks: () => [{ stop: stopTrack }] } as unknown as MediaStream;

class AudioMock {
  static instances: AudioMock[] = [];
  static rejectFirstMusicPlayback = false;

  currentTime = 0;
  loop = false;
  paused = true;
  preload = "";
  volume = 1;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  pause = vi.fn(() => {
    this.paused = true;
  });
  play = vi.fn(() => {
    if (
      AudioMock.rejectFirstMusicPlayback &&
      this.src.includes("/audio/music.mp3") &&
      this.play.mock.calls.length === 1
    ) {
      return Promise.reject(new Error("Autoplay blocked"));
    }
    this.paused = false;
    return Promise.resolve();
  });

  constructor(readonly src: string) {
    AudioMock.instances.push(this);
  }
}

const getAudio = (path: string) => {
  const audio = AudioMock.instances.find(({ src }) => src.includes(path));
  if (!audio) throw new Error(`Missing audio instance for ${path}`);
  return audio;
};

const rect = (left: number, top: number, width: number, height: number) =>
  ({
    x: left,
    y: top,
    top,
    right: left + width,
    bottom: top + height,
    left,
    width,
    height,
    toJSON: () => ({}),
  }) as DOMRect;

describe("DreamExperience", () => {
  beforeEach(() => {
    AudioMock.instances = [];
    AudioMock.rejectFirstMusicPlayback = false;
    DeviceOrientationEventMock.requestPermission.mockResolvedValue("granted");
    getUserMedia.mockResolvedValue(mediaStream);
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });
    vi.stubGlobal("DeviceOrientationEvent", DeviceOrientationEventMock);
    vi.stubGlobal("Audio", AudioMock);
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    stopTrack.mockReset();
    getUserMedia.mockReset();
  });

  const startWithHeading = async (alpha = 270) => {
    const addEventListener = vi.spyOn(window, "addEventListener");
    fireEvent.click(screen.getByRole("button", { name: "Enter the gallery" }));
    await screen.findByRole("button", { name: "Finding your direction…" });
    await waitFor(() =>
      expect(addEventListener).toHaveBeenCalledWith(
        "deviceorientation",
        expect.any(Function),
        true,
      ),
    );
    fireEvent(
      window,
      new DeviceOrientationEventMock("deviceorientation", { alpha, beta: 90 }),
    );
    await screen.findByRole("button", { name: "Recenter" });
  };

  it("uses the homepage permission gesture instead of showing a second entry CTA", async () => {
    void prepareExperienceAccess();
    render(<DreamExperience />);

    expect(
      screen.queryByRole("button", { name: "Enter the gallery" }),
    ).not.toBeInTheDocument();
    await screen.findByRole("button", { name: "Finding your direction…" });
    fireEvent(
      window,
      new DeviceOrientationEventMock("deviceorientation", {
        alpha: 270,
        beta: 90,
      }),
    );

    expect(await screen.findByRole("button", { name: "Recenter" })).toBeVisible();
    expect(DeviceOrientationEventMock.requestPermission).toHaveBeenCalledOnce();
    expect(getUserMedia).toHaveBeenCalledOnce();
  });

  it("requests permissions and renders the complete 51-dream cylinder", async () => {
    render(<DreamExperience />);
    await startWithHeading();

    expect(DeviceOrientationEventMock.requestPermission).toHaveBeenCalledOnce();
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: expect.objectContaining({ facingMode: { ideal: "environment" } }),
    });
    expect(screen.getByText("AI Dreams")).toBeVisible();
    expect(document.querySelectorAll(".dream-diamond")).toHaveLength(51);
    expect(document.querySelectorAll('.dream-diamond img[loading="eager"]')).toHaveLength(51);
    expect(
      screen
        .getByRole("button", { name: "Open Animal Protection" })
        .closest(".dream-placement")
        ?.getAttribute("style"),
    ).toContain("translateY(0px)");
    expect(document.querySelector(".dream-diamond__number")).not.toBeInTheDocument();
    expect(document.querySelector(".dream-diamond img")).toHaveAttribute(
      "src",
      expect.stringContaining("/images/thumbnails/"),
    );
    expect(
      screen.getByRole("button", {
        name: `Open ${DREAMS.find(({ id }) => id === 51)?.title}`,
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", {
        name: `Open ${DREAMS.find(({ id }) => id === 52)?.title}`,
      }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("status", {
        name: "Turn around to view the gallery. Tap on a diamond to hear about it.",
      }),
    ).toBeVisible();
    expect(screen.getByText("Turn around to view the gallery")).toBeVisible();
    expect(screen.getByText("Tap on a diamond to hear about it")).toBeVisible();
    expect(screen.queryByTestId("ambient-particles")).not.toBeInTheDocument();
    expect(document.querySelector(".dream-experience__particle")).toBeNull();
    expect(screen.queryByLabelText("About the dream cylinder")).not.toBeInTheDocument();
  });

  it("locks page scrolling for the whole experience and restores it on unmount", () => {
    const { unmount } = render(<DreamExperience />);
    const music = getAudio("/audio/music.mp3");

    expect(document.documentElement).toHaveClass("dream-experience-active");
    expect(document.body).toHaveClass("dream-experience-active");
    expect(music.loop).toBe(true);
    expect(music.preload).toBe("auto");
    expect(music.volume).toBe(0.3);
    expect(music.play).toHaveBeenCalledOnce();
    unmount();
    expect(music.pause).toHaveBeenCalledOnce();
    expect(music.currentTime).toBe(0);
    expect(document.documentElement).not.toHaveClass("dream-experience-active");
    expect(document.body).not.toHaveClass("dream-experience-active");
  });

  it("retries background music from the entry gesture and ducks it for narration", async () => {
    AudioMock.rejectFirstMusicPlayback = true;
    render(<DreamExperience />);
    const music = getAudio("/audio/music.mp3");

    await startWithHeading();
    expect(music.play).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole("button", { name: "Open Virtual Reality" }));
    await screen.findByRole("dialog", { name: "Virtual Reality" });
    const narration = getAudio("/audio/narrations/01-virtual-reality.mp3");
    expect(music.volume).toBe(0.2);

    narration.onended?.();
    expect(music.volume).toBe(0.3);
  });

  it("uses the first heading as forward and recenters without reloading", async () => {
    render(<DreamExperience />);
    await startWithHeading(270);
    const world = screen.getByTestId("dream-cylinder-world");
    expect(world).toHaveStyle({ transform: "rotateX(0deg) rotateY(0deg)" });

    fireEvent(
      window,
      new DeviceOrientationEventMock("deviceorientation", { alpha: 250, beta: 80 }),
    );
    await waitFor(() =>
      expect(world).toHaveStyle({ transform: "rotateX(-1.32deg) rotateY(20deg)" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Recenter" }));
    expect(world).toHaveStyle({ transform: "rotateX(0deg) rotateY(0deg)" });
  });

  it("culls rear-facing diamonds instead of relying on GPU backface rendering", async () => {
    render(<DreamExperience />);
    await startWithHeading(270);

    const dreamOne = screen.getByRole("button", { name: "Open Virtual Reality" });
    const dreamTen = document.querySelector<HTMLButtonElement>(
      '[data-dream-id="10"]',
    );
    expect(dreamTen).not.toBeNull();
    expect(dreamOne).toBeVisible();
    expect(dreamTen).not.toBeVisible();

    fireEvent(
      window,
      new DeviceOrientationEventMock("deviceorientation", { alpha: 100, beta: 90 }),
    );

    await waitFor(() => {
      expect(dreamOne).not.toBeVisible();
      expect(dreamTen).toBeVisible();
    });
  });

  it("coalesces high-frequency heading samples to the newest animation frame", async () => {
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      frames.push(callback);
      return frames.length;
    });
    render(<DreamExperience />);
    await startWithHeading(270);
    const baselineFrameCount = frames.length;

    fireEvent(
      window,
      new DeviceOrientationEventMock("deviceorientation", { alpha: 260, beta: 90 }),
    );
    fireEvent(
      window,
      new DeviceOrientationEventMock("deviceorientation", { alpha: 250, beta: 90 }),
    );
    fireEvent(
      window,
      new DeviceOrientationEventMock("deviceorientation", { alpha: 240, beta: 90 }),
    );

    expect(frames).toHaveLength(baselineFrameCount + 1);
    act(() => frames.at(-1)?.(16));
    expect(screen.getByTestId("dream-cylinder-world")).toHaveStyle({
      transform: "rotateX(0deg) rotateY(30deg)",
    });
  });

  it("shows a replaceable AR popover and automatically changes narration", async () => {
    render(<DreamExperience />);
    await startWithHeading();
    fireEvent.click(screen.getByRole("button", { name: "Open Virtual Reality" }));
    expect(
      await screen.findByRole("dialog", { name: "Virtual Reality" }),
    ).toBeVisible();
    expect(document.querySelector(".dream-placement .ar-dream-popover")).toBeNull();
    expect(screen.getByRole("button", { name: "Open Virtual Reality" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Open Virtual Reality" })).toHaveClass(
      "dream-diamond--selected",
    );
    expect(screen.getByTestId("dream-cylinder-stage")).not.toHaveClass(
      "dream-cylinder__stage--selected",
    );
    const firstNarration = getAudio(
      "/audio/narrations/01-virtual-reality.mp3",
    );
    expect(firstNarration.play).toHaveBeenCalledOnce();

    expect(screen.getByRole("button", { name: "Recenter" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Open Animal Protection" }));
    await waitFor(() =>
      expect(
        screen.getByRole("dialog", { name: "Animal Protection" }),
      ).toBeVisible(),
    );
    const secondNarration = getAudio(
      "/audio/narrations/18-animal-protection.mp3",
    );
    expect(firstNarration.pause).toHaveBeenCalledOnce();
    expect(secondNarration.play).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole("dialog", { name: "Virtual Reality" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open Animal Protection" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("selects a visible diamond when perspective hit testing resolves to the stage", async () => {
    render(<DreamExperience />);
    await startWithHeading();

    const stage = screen.getByTestId("dream-cylinder-stage");
    const dream = screen.getByRole("button", { name: "Open Virtual Reality" });
    vi.spyOn(dream, "getBoundingClientRect").mockReturnValue(
      rect(100, 200, 120, 160),
    );

    fireEvent.click(stage, { clientX: 160, clientY: 280 });

    expect(
      await screen.findByRole("dialog", { name: "Virtual Reality" }),
    ).toBeVisible();
    expect(dream).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps the flat popover tethered, replaces transformed selections, and dismisses empty space", async () => {
    render(<DreamExperience />);
    await startWithHeading();

    const viewport = document.querySelector<HTMLElement>(
      ".dream-experience__viewport",
    );
    const dreamOne = screen.getByRole("button", { name: "Open Virtual Reality" });
    expect(viewport).not.toBeNull();

    let diamondLeft = 80;
    let diamondTop = 260;
    const measureViewport = vi
      .spyOn(viewport!, "getBoundingClientRect")
      .mockReturnValue(rect(0, 0, 390, 844));
    vi.spyOn(dreamOne, "getBoundingClientRect").mockImplementation(() =>
      rect(diamondLeft, diamondTop, 120, 160),
    );

    fireEvent.click(dreamOne);
    const popover = await screen.findByTestId("ar-dream-popover");
    const tether = screen.getByTestId("ar-dream-tether");
    expect(popover).toHaveStyle({
      transform: "translate3d(212px, 246.39999999999998px, 0)",
      visibility: "visible",
      width: "238px",
    });
    expect(tether).toHaveStyle({
      left: "140px",
      top: "246.39999999999998px",
      width: "72px",
      height: "36px",
      transform: "none",
      visibility: "visible",
    });

    const measurePopover = vi
      .spyOn(popover, "getBoundingClientRect")
      .mockReturnValue(rect(0, 0, 238, 300));
    fireEvent(window, new Event("resize"));
    expect(measurePopover).toHaveBeenCalledOnce();
    measurePopover.mockClear();
    measureViewport.mockClear();

    diamondLeft = 90;
    fireEvent(
      window,
      new DeviceOrientationEventMock("deviceorientation", { alpha: 260, beta: 90 }),
    );
    await waitFor(() =>
      expect(popover).toHaveStyle({
        transform: "translate3d(222px, 190px, 0)",
        visibility: "visible",
      }),
    );
    expect(tether).toHaveStyle({
      left: "150px",
      top: "190px",
      width: "72px",
      height: "92.39999999999998px",
      visibility: "visible",
    });
    expect(measurePopover).not.toHaveBeenCalled();
    expect(measureViewport).not.toHaveBeenCalled();

    diamondLeft = -180;
    diamondTop = -240;
    fireEvent(
      window,
      new DeviceOrientationEventMock("deviceorientation", { alpha: 250, beta: 90 }),
    );
    await waitFor(() =>
      expect(popover).toHaveStyle({
        transform: "translate3d(-48px, -310px, 0)",
        visibility: "visible",
      }),
    );
    expect(tether).toHaveStyle({
      left: "-120px",
      top: "-310px",
      width: "72px",
      height: "92.4px",
      visibility: "visible",
    });

    const world = screen.getByTestId("dream-cylinder-world");
    const otherDream = screen.getByRole("button", { name: "Open Animal Protection" });
    vi.spyOn(otherDream, "getBoundingClientRect").mockReturnValue(
      rect(0, 0, 200, 200),
    );

    fireEvent.click(world, { clientX: 100, clientY: 100 });
    expect(
      await screen.findByRole("dialog", { name: "Animal Protection" }),
    ).toBeVisible();
    expect(screen.getByTestId("ar-dream-tether")).toBeInTheDocument();
    expect(
      getAudio("/audio/narrations/01-virtual-reality.mp3").pause,
    ).toHaveBeenCalledOnce();
    const replacementNarration = getAudio(
      "/audio/narrations/18-animal-protection.mp3",
    );
    expect(replacementNarration.play).toHaveBeenCalledOnce();
    expect(getAudio("/audio/music.mp3").volume).toBe(0.2);

    const hiddenDream = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".dream-diamond"),
    ).find(
      (diamond) =>
        diamond.closest<HTMLElement>(".dream-placement")?.style.visibility ===
        "hidden",
    );
    expect(hiddenDream).toBeDefined();
    vi.spyOn(hiddenDream!, "getBoundingClientRect").mockReturnValue(
      rect(200, 200, 200, 200),
    );

    fireEvent.click(world, { clientX: 300, clientY: 300 });
    expect(screen.queryByTestId("ar-dream-popover")).not.toBeInTheDocument();
    expect(screen.queryByTestId("ar-dream-tether")).not.toBeInTheDocument();
    expect(replacementNarration.pause).toHaveBeenCalledOnce();
    expect(getAudio("/audio/music.mp3").volume).toBe(0.3);
  });

  it("opens the existing scrollable gallery details modal", async () => {
    render(<DreamExperience />);
    await startWithHeading();
    fireEvent.click(screen.getByRole("button", { name: "Open Virtual Reality" }));
    fireEvent.click(await screen.findByRole("button", { name: "Details" }));

    const details = await screen.findByTestId("content");
    expect(details).toBeVisible();
    expect(screen.getByRole("heading", { name: "Virtual Reality details" })).toBeInTheDocument();
    expect(details.querySelector(".overflow-y-auto")).not.toBeNull();
    expect(document.documentElement).toHaveStyle({
      overflow: "hidden",
      overscrollBehavior: "none",
    });
    expect(screen.queryByRole("dialog", { name: "Virtual Reality" })).not.toBeInTheDocument();
    expect(
      getAudio("/audio/narrations/01-virtual-reality.mp3").pause,
    ).toHaveBeenCalledOnce();
  });

  it("opens a static gallery when motion access is denied", async () => {
    DeviceOrientationEventMock.requestPermission.mockResolvedValueOnce("denied");
    render(<DreamExperience />);
    fireEvent.click(screen.getByRole("button", { name: "Enter the gallery" }));

    expect(await screen.findByText("AI Dreams")).toBeVisible();
    expect(screen.getByRole("status", { name: "Tap on a diamond to hear about it." })).toBeVisible();
    expect(screen.queryByRole("button", { name: "Recenter" })).not.toBeInTheDocument();
    expect(screen.queryByText("The gallery could not open")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^Open / })).toHaveLength(26);
    expect(document.querySelector("video")?.srcObject).toBe(mediaStream);
  });

  it("shows a clear error only when camera access fails", async () => {
    getUserMedia.mockRejectedValueOnce(new Error("Camera denied"));
    render(<DreamExperience />);
    fireEvent.click(screen.getByRole("button", { name: "Enter the gallery" }));

    expect(await screen.findByText(/Allow camera access/)).toBeVisible();
    expect(screen.getByText("The gallery could not open")).toBeVisible();
  });

  it("uses the concise approved entry copy", () => {
    render(<DreamExperience />);

    expect(screen.getAllByText("Augmented Reality Gallery")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "Face forward" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Enter the gallery" })).toBeVisible();
    expect(screen.getByText("Camera and volume required")).toBeVisible();
    expect(screen.queryByText(/location or mapping/i)).not.toBeInTheDocument();
  });
});
