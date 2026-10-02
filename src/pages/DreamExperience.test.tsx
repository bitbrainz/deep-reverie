import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

describe("DreamExperience", () => {
  beforeEach(() => {
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
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    stopTrack.mockReset();
    getUserMedia.mockReset();
  });

  const startWithHeading = async (alpha = 270) => {
    fireEvent.click(screen.getByRole("button", { name: "Start the experience" }));
    await screen.findByRole("button", { name: "Finding your direction…" });
    fireEvent(
      window,
      new DeviceOrientationEventMock("deviceorientation", { alpha, beta: 90 }),
    );
    await screen.findByRole("button", { name: "Recenter" });
  };

  it("requests permissions and renders the complete live dream collection", async () => {
    render(<DreamExperience />);
    await startWithHeading();

    expect(DeviceOrientationEventMock.requestPermission).toHaveBeenCalledOnce();
    expect(getUserMedia).toHaveBeenCalledWith({
      audio: false,
      video: expect.objectContaining({ facingMode: { ideal: "environment" } }),
    });
    expect(screen.getAllByRole("button", { name: /^Open dream \d+:/ })).toHaveLength(
      DREAMS.length,
    );
    expect(
      screen.getByRole("button", {
        name: `Open dream 54: ${DREAMS[DREAMS.length - 1].title}`,
      }),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "What does AI dream of?" })).toBeVisible();
  });

  it("uses the first heading as forward and recenters without reloading", async () => {
    render(<DreamExperience />);
    await startWithHeading(270);
    const world = screen.getByTestId("dream-cylinder-world");
    expect(world).toContainElement(screen.getByLabelText("About the dream cylinder"));
    expect(world).toHaveStyle({ transform: "rotateX(0deg) rotateY(0deg)" });

    fireEvent(
      window,
      new DeviceOrientationEventMock("deviceorientation", { alpha: 250, beta: 80 }),
    );
    expect(world).toHaveStyle({ transform: "rotateX(10deg) rotateY(-20deg)" });

    fireEvent.click(screen.getByRole("button", { name: "Recenter" }));
    expect(world).toHaveStyle({ transform: "rotateX(0deg) rotateY(0deg)" });
  });

  it("replaces the open gallery explainer when another diamond is selected", async () => {
    render(<DreamExperience />);
    await startWithHeading();
    fireEvent.click(screen.getByRole("button", { name: /Open dream 01:/ }));
    expect(await screen.findByRole("heading", { name: "Virtual Reality" })).toBeVisible();

    const nextDiamond = document.querySelector<HTMLButtonElement>(
      '[aria-label^="Open dream 18:"]',
    );
    expect(nextDiamond).not.toBeNull();
    fireEvent.click(nextDiamond!);
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Animal Protection" })).toBeVisible(),
    );
    expect(screen.queryByRole("heading", { name: "Virtual Reality" })).not.toBeInTheDocument();
  });

  it("shows clear denied and unsupported states", async () => {
    DeviceOrientationEventMock.requestPermission.mockResolvedValueOnce("denied");
    const { unmount } = render(<DreamExperience />);
    fireEvent.click(screen.getByRole("button", { name: "Start the experience" }));
    expect(await screen.findByText(/Allow motion access/)).toBeVisible();
    expect(stopTrack).toHaveBeenCalled();
    unmount();

    vi.unstubAllGlobals();
    render(<DreamExperience />);
    fireEvent.click(screen.getByRole("button", { name: "Start the experience" }));
    expect(
      screen.getByText(/does not provide the motion sensor needed/),
    ).toBeVisible();
  });
});
