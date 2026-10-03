import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BlacklightComparison } from "./BlacklightComparison";

const rect = (left: number, width: number) =>
  ({
    x: left,
    y: 0,
    top: 0,
    right: left + width,
    bottom: 200,
    left,
    width,
    height: 200,
    toJSON: () => ({}),
  }) as DOMRect;

describe("BlacklightComparison", () => {
  it("moves the comparison from taps and drags anywhere on the image", () => {
    render(<BlacklightComparison src="/art.webp" alt="Artwork" />);
    const stage = document.querySelector<HTMLElement>(
      ".blacklight-comparison__stage",
    );
    expect(stage).not.toBeNull();
    vi.spyOn(stage!, "getBoundingClientRect").mockReturnValue(rect(100, 200));

    fireEvent(
      stage!,
      Object.assign(
        new MouseEvent("pointerdown", { bubbles: true, clientX: 150 }),
        { pointerId: 7 },
      ),
    );
    expect(screen.getByRole("slider", { name: "Blacklight comparison position" })).toHaveValue(
      "25",
    );

    fireEvent(
      stage!,
      Object.assign(
        new MouseEvent("pointermove", { bubbles: true, clientX: 250 }),
        { pointerId: 7 },
      ),
    );
    expect(screen.getByRole("slider", { name: "Blacklight comparison position" })).toHaveValue(
      "75",
    );
    expect(document.querySelector(".blacklight-comparison__divider")).toHaveStyle({
      left: "75%",
    });
  });

  it("keeps the range input available for keyboard control", () => {
    render(<BlacklightComparison src="/art.webp" alt="Artwork" />);
    const slider = screen.getByRole("slider", {
      name: "Blacklight comparison position",
    });

    fireEvent.change(slider, { target: { value: "32" } });
    expect(slider).toHaveValue("32");
  });
});
