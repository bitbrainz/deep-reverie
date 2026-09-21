import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Gallery from "./Gallery";

describe("Gallery", () => {
  it("returns focus to the opening artwork after browsing and dismissing details", async () => {
    render(<Gallery />);
    const opener = screen.getByRole("button", { name: "View Virtual Reality" });

    opener.focus();
    fireEvent.click(opener);
    fireEvent.click(await screen.findByRole("button", { name: "Next →" }));
    expect(screen.getByRole("heading", { name: "Work-Life Balance" })).toBeVisible();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(opener).toHaveFocus());
  });
});
