import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DREAMS } from "../dreams/data/dreams";
import { ARDreamPopover } from "./ARDreamPopover";

class AudioMock {
  static instances: AudioMock[] = [];
  static rejectPlayback = false;

  currentTime = 0;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  pause = vi.fn();
  play = vi.fn(() =>
    AudioMock.rejectPlayback
      ? Promise.reject(new Error("Audio unavailable"))
      : Promise.resolve(),
  );

  constructor(readonly src: string) {
    AudioMock.instances.push(this);
  }
}

describe("ARDreamPopover", () => {
  beforeEach(() => {
    AudioMock.instances = [];
    AudioMock.rejectPlayback = false;
    vi.stubGlobal("Audio", AudioMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders a dedicated AR card and starts narration automatically", () => {
    render(
      <ARDreamPopover
        dream={DREAMS[0]}
        onDetails={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog", { name: "Virtual Reality" })).toBeVisible();
    expect(screen.queryByText("AR · Dream 01")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Close .* AR dream/ })).not.toBeInTheDocument();
    expect(AudioMock.instances).toHaveLength(1);
    expect(AudioMock.instances[0].src).toContain(
      "/audio/narrations/01-virtual-reality.mp3",
    );
    expect(AudioMock.instances[0].play).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "View details" })).toBeVisible();
    expect(screen.queryByRole("button", { name: /Stop narration/ })).not.toBeInTheDocument();
  });

  it("stops the old narration when the selected dream changes", async () => {
    const { rerender } = render(
      <ARDreamPopover dream={DREAMS[0]} onDetails={vi.fn()} />,
    );

    rerender(
      <ARDreamPopover dream={DREAMS[1]} onDetails={vi.fn()} />,
    );

    await waitFor(() => expect(AudioMock.instances[0].pause).toHaveBeenCalledOnce());
    expect(AudioMock.instances).toHaveLength(2);
    expect(AudioMock.instances[1].src).toContain(
      "/audio/narrations/02-work-life-balance.mp3",
    );
    expect(AudioMock.instances[1].play).toHaveBeenCalledOnce();
  });

  it("reports when automatic playback is interrupted without adding playback controls", async () => {
    AudioMock.rejectPlayback = true;
    render(
      <ARDreamPopover dream={DREAMS[0]} onDetails={vi.fn()} />,
    );

    expect(
      await screen.findByText("Narration could not start on this device."),
    ).toBeVisible();
    expect(screen.queryByRole("button", { name: /narration/i })).not.toBeInTheDocument();
  });

  it("opens the full details view through its dedicated action", () => {
    const onDetails = vi.fn();
    render(
      <ARDreamPopover dream={DREAMS[0]} onDetails={onDetails} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "View details" }));
    expect(onDetails).toHaveBeenCalledOnce();
  });

});
