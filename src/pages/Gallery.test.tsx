import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Gallery from "./Gallery";

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

class ImageMock {
  static instances: ImageMock[] = [];
  static autoLoad = true;

  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  decode = vi.fn(() => Promise.resolve());
  private source = "";

  constructor() {
    ImageMock.instances.push(this);
  }

  set src(value: string) {
    this.source = value;
    if (ImageMock.autoLoad) queueMicrotask(() => this.onload?.());
  }

  get src() {
    return this.source;
  }

  finishLoading() {
    this.onload?.();
  }
}

describe("Gallery", () => {
  beforeEach(() => {
    AudioMock.instances = [];
    AudioMock.rejectPlayback = false;
    ImageMock.instances = [];
    ImageMock.autoLoad = true;
    vi.stubGlobal("Audio", AudioMock);
    vi.stubGlobal("Image", ImageMock);
  });

  it("shows each title below its artwork in one accessible gallery control", () => {
    const { container } = render(<Gallery />);
    const card = screen.getByRole("button", { name: "View Virtual Reality" });
    const artwork = card.querySelector("img");
    const artworkFrame = artwork?.parentElement;
    const caption = screen.getByText("Virtual Reality");

    expect(container.querySelector("main")?.previousElementSibling).toBeNull();
    expect(card).toContainElement(artwork);
    expect(card).toContainElement(caption);
    expect(artworkFrame).toHaveClass("aspect-square");
    expect(artworkFrame?.nextElementSibling).toBe(caption);
    expect(card).toHaveClass("focus-visible:ring-2");
    expect(screen.queryByText("Immersive digital worlds for all")).not.toBeInTheDocument();
  });

  it("waits for the selected detail image before opening the drawer", async () => {
    ImageMock.autoLoad = false;
    render(<Gallery />);

    fireEvent.click(screen.getByRole("button", { name: "View Deep Reverie" }));
    expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    expect(ImageMock.instances.at(-1)?.src).toContain(
      "/images/saturated/54_Title.webp",
    );

    ImageMock.instances.at(-1)?.finishLoading();
    expect(await screen.findByTestId("content")).toBeVisible();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts each adjacent dream at the top of the details pane", async () => {
    render(<Gallery />);

    fireEvent.click(screen.getByRole("button", { name: "View Virtual Reality" }));
    await screen.findByRole("heading", { name: "Virtual Reality" });

    const detailsPane = screen.getByRole("article").parentElement as HTMLElement;
    detailsPane.scrollTop = 600;

    fireEvent.click(screen.getByRole("button", { name: "Next →" }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Work-Life Balance" })).toBeVisible(),
    );
    expect(detailsPane.scrollTop).toBe(0);

    detailsPane.scrollTop = 400;
    fireEvent.click(screen.getByRole("button", { name: "← Previous" }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Virtual Reality" })).toBeVisible(),
    );
    expect(detailsPane.scrollTop).toBe(0);
  });

  it("returns focus to the opening artwork after browsing and dismissing details", async () => {
    render(<Gallery />);
    const opener = screen.getByRole("button", { name: "View Virtual Reality" });

    opener.focus();
    fireEvent.click(opener);
    const closeButton = await screen.findByRole("button", { name: "Close dream details" });
    await waitFor(() => expect(closeButton).toHaveFocus());

    fireEvent.click(screen.getByRole("button", { name: "Next →" }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Work-Life Balance" })).toBeVisible(),
    );

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(opener).toHaveFocus());
  });

  it("plays the selected artwork narration and stops it when browsing", async () => {
    render(<Gallery />);

    fireEvent.click(screen.getByRole("button", { name: "View Virtual Reality" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Play narration for Virtual Reality" }),
    );

    expect(AudioMock.instances).toHaveLength(1);
    expect(
      AudioMock.instances[0].src.endsWith(
        "/audio/narrations/01-virtual-reality.mp3",
      ),
    ).toBe(true);
    expect(AudioMock.instances[0].play).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("button", { name: "Stop narration for Virtual Reality" }),
    ).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Next →" }));
    await waitFor(() => expect(AudioMock.instances[0].pause).toHaveBeenCalledOnce());

    fireEvent.click(
      screen.getByRole("button", { name: "Play narration for Work-Life Balance" }),
    );
    expect(
      AudioMock.instances[1].src.endsWith(
        "/audio/narrations/02-work-life-balance.mp3",
      ),
    ).toBe(true);
  });

  it("shows a retry state when narration playback fails", async () => {
    AudioMock.rejectPlayback = true;
    render(<Gallery />);

    fireEvent.click(screen.getByRole("button", { name: "View Virtual Reality" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "Play narration for Virtual Reality" }),
    );

    expect(
      await screen.findByText("Narration is unavailable right now. Please try again."),
    ).toBeVisible();
    expect(screen.getByRole("heading", { name: "Virtual Reality" })).toBeVisible();
    expect(screen.getByText("Try narration again")).toBeVisible();
  });
});
