import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DREAMS } from "../dreams/data/dreams";
import { DetailsDrawer } from "./DetailsDrawer";

describe("DetailsDrawer narration", () => {
  it("keeps artwork details usable when a narration mapping is missing", () => {
    render(
      <DetailsDrawer
        dream={{ ...DREAMS[0], id: 999 }}
        open
      />,
    );

    expect(screen.getByRole("heading", { name: "Virtual Reality" })).toBeVisible();
    expect(screen.queryByText(/^Dream \d+$/)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Narration unavailable for Virtual Reality" }),
    ).toBeDisabled();
  });

  it("shows a restrained scroll cue until the visitor begins scrolling", () => {
    render(<DetailsDrawer dream={DREAMS[0]} open />);

    const cue = screen.getByRole("status", { name: "More dream details below" });
    const scroller = screen.getByTestId("content").querySelector(".overflow-y-auto");
    expect(cue).toHaveTextContent("Scroll to explore");
    expect(scroller).not.toBeNull();

    Object.defineProperty(scroller, "scrollTop", {
      configurable: true,
      value: 12,
    });
    fireEvent.scroll(scroller!);

    expect(
      screen.queryByRole("status", { name: "More dream details below" }),
    ).not.toBeInTheDocument();
  });
});
