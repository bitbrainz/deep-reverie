import { useState } from "react";
import { Link } from "react-router";

const INSTALLATION_FILM_URL = "https://www.youtube.com/watch?v=597IAhuQfZ4";

const InstallationImage = () => {
  const [unavailable, setUnavailable] = useState(false);

  return (
    <figure className="relative m-0 overflow-hidden bg-violet-950/30 shadow-[0_30px_90px_rgba(76,29,149,0.28)] lg:translate-y-10">
      {unavailable ? (
        <div
          role="status"
          className="grid aspect-[4/3] place-items-center border border-violet-300/20 px-8 text-center text-sm text-violet-100"
        >
          Installation photograph unavailable. The film and complete dream archive remain available below.
        </div>
      ) : (
        <img
          src="/images/deep-reverie-at-lumiere.webp"
          alt="Deep Reverie's vivid neon artwork glowing in a geometric outdoor frame at night"
          className="aspect-[4/3] h-full w-full object-cover object-[68%_center] sm:aspect-[3/2]"
          fetchPriority="high"
          onError={() => setUnavailable(true)}
        />
      )}
      <figcaption className="flex items-center justify-between gap-6 border-t border-violet-200/15 bg-slate-950/95 px-4 py-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-violet-200 sm:px-6">
        <span>Lumière: The Art of Light</span>
        <span className="text-slate-400">Toronto · 2025</span>
      </figcaption>
    </figure>
  );
};

const About = () => {
  return (
    <div className="min-h-screen overflow-hidden bg-[#060611] text-slate-50 selection:bg-fuchsia-500 selection:text-white">
      <a
        href="#about-content"
        className="sr-only z-50 rounded bg-white px-4 py-2 font-semibold text-slate-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to the art
      </a>

      <header className="border-b border-white/10">
        <nav
          aria-label="Primary navigation"
          className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 sm:px-8"
        >
          <Link
            to="/"
            className="text-lg font-bold tracking-[-0.04em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
          >
            Deep Reverie<span className="text-fuchsia-400">.</span>
          </Link>
          <div className="flex items-center gap-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 sm:gap-8">
            <Link className="transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300" to="/gallery">
              Archive
            </Link>
            <Link className="text-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300" to="/about" aria-current="page">
              About
            </Link>
          </div>
        </nav>
      </header>

      <main id="about-content">
        <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1280px] items-center gap-14 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.9fr_1.25fr] lg:gap-20">
          <div className="relative z-10">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-fuchsia-400">
              About the art
            </p>
            <h1 className="max-w-xl text-5xl font-semibold leading-[0.92] tracking-[-0.065em] sm:text-7xl lg:text-[6.7rem]">
              A future,<br />
              <span className="font-serif font-normal italic text-violet-300">dreamed</span> by a machine.
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-slate-300 sm:text-xl">
              Deep Reverie asks a deceptively simple question: if artificial intelligence could dream, what future would it imagine for us?
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/gallery"
                className="inline-flex min-h-12 items-center bg-violet-400 px-6 text-sm font-bold text-violet-950 transition hover:bg-violet-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#060611]"
              >
                Explore all 54 visions
              </Link>
              <a
                href="#installation-film"
                className="inline-flex min-h-12 items-center border border-white/25 px-6 text-sm font-bold text-white transition hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
              >
                Watch the film ↓
              </a>
            </div>
          </div>
          <InstallationImage />
          <div aria-hidden="true" className="absolute -right-40 top-12 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-[120px]" />
        </section>

        <section className="border-y border-white/10 bg-[#0b0a1b]">
          <div className="mx-auto grid max-w-[1280px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[0.6fr_1.4fr] lg:gap-24">
            <div>
              <p className="text-[clamp(6rem,16vw,12rem)] font-semibold leading-none tracking-[-0.09em] text-violet-300">54</p>
              <p className="mt-2 max-w-xs text-xs font-bold uppercase tracking-[0.24em] text-fuchsia-400">visions of tomorrow</p>
            </div>
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Hope rendered in ultraviolet.</h2>
              <div className="mt-8 grid gap-8 text-base leading-8 text-slate-300 sm:grid-cols-2">
                <p>
                  The archive moves through futures both intimate and planetary: empathy, health, creativity, clean energy, exploration, privacy, and peace. Each image pairs a vivid visual world with an AI-voiced reflection on what that future could mean.
                </p>
                <p>
                  In the physical installation, the dream panels gather inside a geometric frame and flare under ultraviolet light. From a distance they form one luminous object; up close, each panel opens a different conversation about technology and human choice.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="installation-film" className="mx-auto max-w-[1280px] px-5 py-20 sm:px-8 sm:py-28">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-fuchsia-400">Installation film</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">See the work after dark.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-400">
              Presented at Lumière: The Art of Light in Trillium Park, Toronto, March 10–April 4, 2025.
            </p>
          </div>
          <div className="aspect-video overflow-hidden border border-white/10 bg-slate-950 shadow-[0_30px_100px_rgba(124,58,237,0.16)]">
            <iframe
              className="h-full w-full"
              src="https://www.youtube-nocookie.com/embed/597IAhuQfZ4"
              title="Deep Reverie installation film"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <p className="mt-4 text-right text-sm text-slate-400">
            If the film does not load, {" "}
            <a className="font-semibold text-violet-300 underline decoration-violet-500 underline-offset-4 hover:text-violet-200" href={INSTALLATION_FILM_URL}>
              watch it on YouTube ↗
            </a>
          </p>
        </section>

        <section className="border-t border-white/10 bg-violet-400 text-violet-950">
          <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.55fr_1.45fr] lg:gap-24">
            <p className="text-xs font-bold uppercase tracking-[0.28em]">About the artist</p>
            <div>
              <h2 className="text-4xl font-semibold tracking-tight sm:text-6xl">Bitbrainz</h2>
              <p className="mt-6 max-w-3xl text-lg leading-8 sm:text-xl">
                Bitbrainz is a creative practice working across emerging technology and interactive art. Its products, experiments, and collaborations use technology with curiosity and care—inviting people to look closer, take part, and imagine what comes next.
              </p>
              <a
                className="mt-9 inline-flex min-h-11 items-center border-b-2 border-violet-950 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-950"
                href="https://bitbrainz.com/projects/deep-reverie/"
              >
                Visit the Bitbrainz project page ↗
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-10 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>Deep Reverie · Bitbrainz · 2025</p>
        <Link className="font-semibold text-slate-300 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300" to="/">
          Return home ↑
        </Link>
      </footer>
    </div>
  );
};

export default About;
