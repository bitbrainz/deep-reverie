import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DREAMS } from "../dreams/data/dreams";
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

class AudioMock {
  static instances: AudioMock[] = [];

  currentTime = 0;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  pause = vi.fn();
  play = vi.fn(() => Promise.resolve());

  constructor(readonly src: string) {
    AudioMock.instances.push(this);
  }
}

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
    DeviceOrientationEventMock.requestPermission.mockResolvedValue("granted");
    getUserMedia.mockResolvedValue({ getTracks: () => [{ stop: stopTrack }] });
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
    fireEvent.click(screen.getByRole("button", { name: "Enter the gallery" }));
    await screen.findByRole("button", { name: "Finding your direction…" });
    fireEvent(
      window,
      new DeviceOrientationEventMock("deviceorientation", { alpha, beta: 90 }),
    );
    await screen.findByRole("button", { name: "Recenter" });
  };

  it("requests permissions and renders the authoritative 50-dream cylinder", async () => {
    render(<DreamExperience />);
    await startWithHeading();

    expect(DeviceOrientationEventMock.requestPermission).toHaveBeenCalledOnce();
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: expect.objectContaining({ facingMode: { ideal: "environment" } }),
    });
    expect(screen.getByText("50 dreams · 360°")).toBeVisible();
    expect(document.querySelectorAll(".dream-diamond")).toHaveLength(50);
    expect(document.querySelectorAll('.dream-diamond img[loading="eager"]')).toHaveLength(50);
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
        name: `Open ${DREAMS.find(({ id }) => id === 50)?.title}`,
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", {
        name: `Open ${DREAMS.find(({ id }) => id === 51)?.title}`,
      }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("About the dream cylinder")).not.toBeInTheDocument();
  });

  it("locks page scrolling for the whole experience and restores it on unmount", () => {
    const { unmount } = render(<DreamExperience />);

    expect(document.documentElement).toHaveClass("dream-experience-active");
    expect(document.body).toHaveClass("dream-experience-active");
    unmount();
    expect(document.documentElement).not.toHaveClass("dream-experience-active");
    expect(document.body).not.toHaveClass("dream-experience-active");
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
    expect(AudioMock.instances).toHaveLength(1);
    expect(AudioMock.instances[0].play).toHaveBeenCalledOnce();

    expect(screen.getByRole("button", { name: "Recenter" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Open Animal Protection" }));
    await waitFor(() =>
      expect(
        screen.getByRole("dialog", { name: "Animal Protection" }),
      ).toBeVisible(),
    );
    expect(AudioMock.instances[0].pause).toHaveBeenCalledOnce();
    expect(AudioMock.instances[1].play).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole("dialog", { name: "Virtual Reality" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open Animal Protection" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("keeps the flat popover beside the moving diamond and closes on click-away", async () => {
    render(<DreamExperience />);
    await startWithHeading();

    const viewport = document.querySelector<HTMLElement>(
      ".dream-experience__viewport",
    );
    const dreamOne = screen.getByRole("button", { name: "Open Virtual Reality" });
    expect(viewport).not.toBeNull();

    let diamondLeft = 80;
    vi.spyOn(viewport!, "getBoundingClientRect").mockReturnValue(
      rect(0, 0, 390, 844),
    );
    vi.spyOn(dreamOne, "getBoundingClientRect").mockImplementation(() =>
      rect(diamondLeft, 260, 120, 160),
    );

    fireEvent.click(dreamOne);
    const popover = await screen.findByTestId("ar-dream-popover");
    expect(popover).toHaveStyle({ left: "212px", visibility: "visible" });

    diamondLeft = 110;
    fireEvent(
      window,
      new DeviceOrientationEventMock("deviceorientation", { alpha: 260, beta: 90 }),
    );
    await waitFor(() =>
      expect(popover).toHaveStyle({ left: "242px", visibility: "visible" }),
    );

    fireEvent.click(viewport!);
    expect(screen.queryByTestId("ar-dream-popover")).not.toBeInTheDocument();
    expect(AudioMock.instances[0].pause).toHaveBeenCalledOnce();
  });

  it("opens the existing scrollable gallery details modal", async () => {
    render(<DreamExperience />);
    await startWithHeading();
    fireEvent.click(screen.getByRole("button", { name: "Open Virtual Reality" }));
    fireEvent.click(await screen.findByRole("button", { name: "View details" }));

    const details = await screen.findByTestId("content");
    expect(details).toBeVisible();
    expect(screen.getByRole("heading", { name: "Virtual Reality details" })).toBeInTheDocument();
    expect(details.querySelector(".overflow-y-auto")).not.toBeNull();
    expect(document.documentElement).toHaveStyle({
      overflow: "hidden",
      overscrollBehavior: "none",
    });
    expect(screen.queryByRole("dialog", { name: "Virtual Reality" })).not.toBeInTheDocument();
    expect(AudioMock.instances[0].pause).toHaveBeenCalledOnce();
  });

  it("shows clear denied and unsupported states", async () => {
    DeviceOrientationEventMock.requestPermission.mockResolvedValueOnce("denied");
    const { unmount } = render(<DreamExperience />);
    fireEvent.click(screen.getByRole("button", { name: "Enter the gallery" }));
    expect(await screen.findByText(/Allow motion access/)).toBeVisible();
    expect(stopTrack).toHaveBeenCalled();
    unmount();

    vi.unstubAllGlobals();
    render(<DreamExperience />);
    fireEvent.click(screen.getByRole("button", { name: "Enter the gallery" }));
    expect(
      screen.getByText(/does not provide the motion sensor needed/),
    ).toBeVisible();
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
