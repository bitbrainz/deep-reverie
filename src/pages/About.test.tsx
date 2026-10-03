import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";
import * as experienceAccess from "../app/experienceAccess";
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
  afterEach(() => vi.restoreAllMocks());

  it("is reachable through the app route and presents the approved media", async () => {
    render(
      <MemoryRouter initialEntries={["/about"]}>
        <App />
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: /A future, dreamed by a machine/i })).toBeVisible();
    const installationImage = screen.getByRole("img", { name: /vivid neon artwork/i });
    expect(installationImage).toHaveAttribute(
      "src",
      "/images/deep-reverie-at-lumiere.webp",
    );
    expect(installationImage).toHaveClass("aspect-[4/3]", "object-[68%_center]");
    expect(installationImage).not.toHaveClass("scale-[1.85]");
    expect(screen.getByTitle("Deep Reverie installation film")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/597IAhuQfZ4",
    );
    expect(screen.getByRole("heading", { name: "Bitbrainz" })).toBeVisible();
  });

  it("brings the gallery choices, installation film, and artist onto the home screen", () => {
    const prepareAccess = vi
      .spyOn(experienceAccess, "prepareExperienceAccess")
      .mockResolvedValue({
        kind: "unsupported",
        detail: "Test environment",
      });
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Explore in AR/ })).toHaveAttribute("href", "/app");
    fireEvent.click(screen.getByRole("link", { name: /Explore in AR/ }));
    expect(prepareAccess).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: /Browse the Artwork/ })).toHaveAttribute(
      "href",
      "/gallery",
    );
    expect(screen.getByRole("link", { name: /Browse the Artwork/ })).toHaveClass(
      "bg-[#fff0b3]/90",
    );
    expect(screen.getByRole("link", { name: /By Bitbrainz/ })).toHaveAttribute(
      "href",
      "#the-artist",
    );
    expect(screen.getByRole("img", { name: /vivid neon artwork/i })).toHaveAttribute(
      "src",
      "/images/deep-reverie-at-lumiere.webp",
    );
    expect(screen.getByRole("img", { name: /vivid neon artwork/i })).toHaveClass("scale-[1.85]");
    expect(screen.getByTitle("Deep Reverie installation film")).toHaveAttribute(
      "src",
      "https://www.youtube-nocookie.com/embed/597IAhuQfZ4",
    );
    expect(screen.getByRole("heading", { name: "Bitbrainz" })).toBeVisible();
    expect(screen.getByText("Deep Reverie at Lumière · Toronto, 2025")).toBeVisible();
    expect(screen.getByText("Deep Reverie · Bitbrainz · 2024")).toBeVisible();
    const projectHeading = screen.getByRole("heading", {
      name: /A future, dreamed by a machine/i,
    });
    expect(projectHeading).toBeVisible();
    expect(
      screen
        .getByTitle("Deep Reverie installation film")
        .compareDocumentPosition(projectHeading),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(screen.getByText(/turns public space into a luminous daydream/i)).toBeVisible();
    expect(screen.getByText(/Bolton Fire Bell/i)).toBeVisible();
    expect(screen.queryByRole("link", { name: /Visit Bitbrainz/i })).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/\b54\b/);
    expect(screen.queryByText("Choose how to explore")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /About the Art & Artists/ })).not.toBeInTheDocument();
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

  it("keeps both gallery-action text treatments above WCAG AA contrast", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const action = screen.getByRole("link", { name: /Browse the Artwork/ });
    const title = screen.getByText("Browse the Artwork");
    const supportingText = screen.getByText("View the complete gallery");
    const compositedBackground = blendHex("#fff0b3", 0.9, "#080612");

    expect(action).toHaveClass("bg-[#fff0b3]/90", "text-[#211600]");
    expect(supportingText).toHaveClass("text-[#5a4300]");
    expect(contrastRatio("#211600", compositedBackground)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio("#5a4300", compositedBackground)).toBeGreaterThanOrEqual(4.5);
    expect(title).toBeVisible();
  });

  it("keeps both exploration actions compact, tappable, and visually distinct", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    );

    const primaryAction = screen.getByRole("link", { name: /Explore in AR/ });
    const secondaryAction = screen.getByRole("link", { name: /Browse the Artwork/ });

    expect(primaryAction.parentElement).toHaveClass("grid", "sm:grid-cols-2");
    expect(primaryAction).toHaveClass(
      "min-h-16",
      "gap-3",
      "px-4",
      "py-2.5",
      "bg-[#ffe16a]",
      "shadow-[0_10px_30px_rgba(255,211,73,0.22)]",
      "focus-visible:ring-4",
      "motion-reduce:transition-none",
    );
    expect(secondaryAction).toHaveClass(
      "min-h-16",
      "gap-3",
      "px-4",
      "py-2.5",
      "border-[#ffe16a]/80",
      "bg-[#fff0b3]/90",
      "shadow-[0_6px_20px_rgba(255,218,83,0.12)]",
      "focus-visible:ring-4",
      "motion-reduce:transition-none",
    );

    expect(primaryAction.querySelector("[aria-hidden='true']")).toHaveClass("h-9", "w-9");
    expect(secondaryAction.querySelector("svg[aria-hidden='true']")).toHaveClass("h-9", "w-9");
    expect(primaryAction.lastElementChild).toHaveClass("motion-reduce:transition-none");
    expect(secondaryAction.lastElementChild).toHaveClass("motion-reduce:transition-none");
    expect(screen.getByText("Explore in AR")).toHaveClass("text-lg", "leading-tight");
    expect(screen.getByText("Camera and volume required")).toHaveClass("text-xs", "leading-4");
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
