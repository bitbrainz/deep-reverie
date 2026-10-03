import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import About from "./About";
import { Home } from "./Home";

const relativeLuminance = (hex: string) => {
  const channels = hex.match(/[a-f\d]{2}/gi)?.map((channel) => parseInt(channel, 16) / 255) ?? [];
  const [red, green, blue] = channels.map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

const contrastRatio = (foreground: string, background: string) => {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);

  return (Math.max(foregroundLuminance, backgroundLuminance) + 0.05)
    / (Math.min(foregroundLuminance, backgroundLuminance) + 0.05);
};

const blendHex = (foreground: string, opacity: number, background: string) => {
  const parse = (hex: string) => hex.match(/[a-f\d]{2}/gi)?.map((channel) => parseInt(channel, 16)) ?? [];
  const foregroundChannels = parse(foreground);
  const backgroundChannels = parse(background);

  return `#${foregroundChannels
    .map((channel, index) => Math.round(channel * opacity + backgroundChannels[index] * (1 - opacity)))
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
};

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

  it("brings the gallery choices, installation film, and artist onto the home screen", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Explore in AR/ })).toHaveAttribute("href", "/app");
    expect(screen.getByRole("link", { name: /Browse the Artwork/ })).toHaveAttribute(
      "href",
      "/gallery",
    );
    expect(screen.getByRole("link", { name: /By Bitbrainz/ })).toHaveAttribute(
      "href",
      "#the-artist",
    );
    expect(screen.getByRole("img", { name: /vivid neon artwork/i })).toHaveAttribute(
      "src",
      "/images/deep-reverie-at-lumiere.webp",
    );
    expect(screen.getByRole("img", { name: /vivid neon artwork/i })).toHaveClass("scale-[1.5]");
    expect(screen.getByTitle("Deep Reverie installation film")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/597IAhuQfZ4",
    );
    expect(screen.getByRole("heading", { name: "Bitbrainz" })).toBeVisible();
    expect(screen.getByRole("heading", { name: /The Project/i })).toBeVisible();
    expect(screen.getByText(/turns public space into a luminous daydream/i)).toBeVisible();
    expect(screen.getByText(/Bolton Fire Bell/i)).toBeVisible();
    expect(document.body).not.toHaveTextContent(/\b54\b/);
    expect(screen.queryByText("Choose how to explore")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /About the Art & Artists/ })).not.toBeInTheDocument();
  });

  it("keeps the secondary exploration label at WCAG AA contrast over the hero", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const label = screen.getByText("View the complete gallery");
    const action = screen.getByRole("link", { name: /Browse the Artwork/ });
    const compositedBackground = blendHex("#c58d14", 0.95, "#080612");

    expect(action).toHaveClass("bg-[#c58d14]/95");
    expect(label).toHaveClass("text-[#1f1500]");
    expect(contrastRatio("#1f1500", compositedBackground)).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps the home film and gallery available if its installation image fails", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    fireEvent.error(screen.getByRole("img", { name: /vivid neon artwork/i }));

    expect(screen.getByRole("status")).toHaveTextContent("Installation photograph unavailable");
    expect(screen.getByRole("link", { name: /Browse the Artwork/ })).toHaveAttribute(
      "href",
      "/gallery",
    );
    expect(screen.getByRole("link", { name: /Watch on YouTube/i })).toHaveAttribute(
      "href",
      INSTALLATION_FILM_URL,
    );
  });

  it("keeps useful next steps available if the installation image fails", () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    );

    fireEvent.error(screen.getByRole("img", { name: /vivid neon artwork/i }));

    expect(screen.getByRole("status")).toHaveTextContent("Installation photograph unavailable");
    expect(screen.getByRole("link", { name: "Explore the dream archive" })).toHaveAttribute("href", "/gallery");
    expect(document.body).not.toHaveTextContent(/\b54\b/);
    expect(screen.getByRole("link", { name: /watch it on YouTube/i })).toHaveAttribute("href", INSTALLATION_FILM_URL);
  });
});

const INSTALLATION_FILM_URL = "https://www.youtube.com/watch?v=597IAhuQfZ4";
