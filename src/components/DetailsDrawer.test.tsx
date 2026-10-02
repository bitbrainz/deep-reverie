import { render, screen } from "@testing-library/react";
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
    expect(
      screen.getByRole("button", { name: "Narration unavailable for Virtual Reality" }),
    ).toBeDisabled();
  });
});
