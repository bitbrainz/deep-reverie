import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Gallery from "./Gallery";

describe("Gallery", () => {
  it("returns focus to the opening artwork after browsing and dismissing details", async () => {
    render(<Gallery />);
    const opener = screen.getByRole("button", { name: "View Virtual Reality" });

    opener.focus();
    fireEvent.click(opener);
    const closeButton = await screen.findByRole("button", { name: "Close dream details" });
    await waitFor(() => expect(closeButton).toHaveFocus());

    fireEvent.click(screen.getByRole("button", { name: "Next →" }));
    expect(screen.getByRole("heading", { name: "Work-Life Balance" })).toBeVisible();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(opener).toHaveFocus());
  });
});
