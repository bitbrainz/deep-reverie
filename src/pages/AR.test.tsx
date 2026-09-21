import { createRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DREAMS, Dream } from "../dreams/data/dreams";
import { AR } from "./AR";

const prediction = vi.hoisted(() => ({ dream: undefined as Dream | undefined }));

vi.mock("../prediction/Camera", () => ({
  Camera: () => <div>Camera preview</div>,
}));

vi.mock("../prediction/PredictionContext", () => ({
  usePredictedDream: () => prediction.dream,
}));

describe("AR", () => {
  it("keeps the camera available while no dream has been detected", () => {
    prediction.dream = undefined;
    render(<AR videoRef={createRef<HTMLVideoElement>()} />);

    expect(screen.getByText("Camera preview")).toBeVisible();
    expect(screen.queryByText("Select a dream to explore its story.")).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("allows detected dream details to be dismissed", async () => {
    prediction.dream = DREAMS[0];
    render(<AR videoRef={createRef<HTMLVideoElement>()} />);

    expect(screen.getByRole("dialog")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Close dream details" }));

    await waitFor(() =>
      expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "closed"),
    );
    expect(screen.getByText("Camera preview")).toBeVisible();
  });

  it("reopens the same dream after prediction is lost and detected again", async () => {
    prediction.dream = DREAMS[0];
    const { rerender } = render(<AR videoRef={createRef<HTMLVideoElement>()} />);

    fireEvent.click(screen.getByRole("button", { name: "Close dream details" }));
    await waitFor(() =>
      expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "closed"),
    );

    prediction.dream = undefined;
    rerender(<AR videoRef={createRef<HTMLVideoElement>()} />);
    prediction.dream = DREAMS[0];
    rerender(<AR videoRef={createRef<HTMLVideoElement>()} />);

    await waitFor(() =>
      expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "open"),
    );
  });
});
