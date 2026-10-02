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
      <ARDreamPopover dream={DREAMS[0]} side="right" onClose={vi.fn()} />,
    );

    expect(screen.getByRole("dialog", { name: "Virtual Reality" })).toBeVisible();
    expect(screen.getByText("AR · Dream 01")).toBeVisible();
    expect(AudioMock.instances).toHaveLength(1);
    expect(AudioMock.instances[0].src).toContain(
      "/audio/narrations/01-virtual-reality.mp3",
    );
    expect(AudioMock.instances[0].play).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("button", { name: "Stop narration for Virtual Reality" }),
    ).toBeVisible();
  });

  it("stops the old narration when the selected dream changes", async () => {
    const { rerender } = render(
      <ARDreamPopover dream={DREAMS[0]} side="right" onClose={vi.fn()} />,
    );

    rerender(
      <ARDreamPopover dream={DREAMS[1]} side="left" onClose={vi.fn()} />,
    );

    await waitFor(() => expect(AudioMock.instances[0].pause).toHaveBeenCalledOnce());
    expect(AudioMock.instances).toHaveLength(2);
    expect(AudioMock.instances[1].src).toContain(
      "/audio/narrations/02-work-life-balance.mp3",
    );
    expect(AudioMock.instances[1].play).toHaveBeenCalledOnce();
  });

  it("offers retry when automatic playback is interrupted", async () => {
    AudioMock.rejectPlayback = true;
    render(
      <ARDreamPopover dream={DREAMS[0]} side="right" onClose={vi.fn()} />,
    );

    expect(
      await screen.findByText("Narration could not start. Tap Retry to try again."),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Play narration for Virtual Reality" }),
    ).toHaveTextContent("Retry");
  });

  it("closes through its own control", () => {
    const onClose = vi.fn();
    render(
      <ARDreamPopover dream={DREAMS[0]} side="right" onClose={onClose} />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Close Virtual Reality AR dream" }),
    );
    expect(onClose).toHaveBeenCalledOnce();
    expect(AudioMock.instances[0].pause).toHaveBeenCalledOnce();
  });
});
