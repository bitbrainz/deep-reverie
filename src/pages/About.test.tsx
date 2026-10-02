import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import About from "./About";
import { Home } from "./Home";

describe("About the Art", () => {
  it("is reachable through the app route and presents the approved media", async () => {
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: /A future, dreamed by a machine/i })).toBeVisible();
    expect(screen.getByRole("img", { name: /vivid neon artwork/i })).toHaveAttribute(
      "src",
      "/images/deep-reverie-at-lumiere.webp",
    );
    expect(screen.getByTitle("Deep Reverie installation film")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/597IAhuQfZ4",
    );
    expect(screen.getByRole("heading", { name: "Bitbrainz" })).toBeVisible();
  });

  it("links to the page from the home screen", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "About the Art" })).toHaveAttribute("href", "/about");
  });

  it("keeps useful next steps available if the installation image fails", () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    );

    fireEvent.error(screen.getByRole("img", { name: /vivid neon artwork/i }));

    expect(screen.getByRole("status")).toHaveTextContent("Installation photograph unavailable");
    expect(screen.getByRole("link", { name: "Explore all 54 visions" })).toHaveAttribute("href", "/gallery");
    expect(screen.getByRole("link", { name: /watch it on YouTube/i })).toHaveAttribute("href", INSTALLATION_FILM_URL);
  });
});

const INSTALLATION_FILM_URL = "https://www.youtube.com/watch?v=597IAhuQfZ4";
