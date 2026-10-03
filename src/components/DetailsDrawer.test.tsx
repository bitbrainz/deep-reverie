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

  it("shows an explicit scroll cue until the visitor starts reading", () => {
    render(<DetailsDrawer dream={DREAMS[0]} open />);

    expect(
      screen.getByRole("button", { name: "Scroll to read the full story" }),
    ).toBeVisible();

    const detailsPane = screen.getByRole("article").parentElement as HTMLElement;
    detailsPane.scrollTop = 40;
    fireEvent.scroll(detailsPane);

    expect(
      screen.queryByRole("button", { name: "Scroll to read the full story" }),
    ).not.toBeInTheDocument();
  });
});
