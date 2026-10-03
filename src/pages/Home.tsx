import { Link } from "react-router";
import { InstallationImage } from "../components/InstallationImage";

const INSTALLATION_FILM_URL = "https://www.youtube.com/watch?v=597IAhuQfZ4";

const ArrowIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ARIcon = () => (
  <span
    aria-hidden="true"
    className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] border-2 border-current text-sm font-black tracking-[-0.04em]"
  >
    AR
  </span>
);

const GalleryIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 48 48" className="h-11 w-11 fill-none stroke-current stroke-[2.4]">
    <rect x="7" y="8" width="34" height="32" rx="2" />
    <circle cx="32" cy="17" r="3" />
    <path d="m10 36 10-11 7 7 5-5 7 8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Home = () => {
  return (
    <main className="min-h-screen bg-[#080612] text-white selection:bg-fuchsia-400 selection:text-[#130923]">
      <a
        href="#about-the-art"
        className="sr-only z-50 rounded bg-white px-4 py-2 font-semibold text-slate-950 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to the art
      </a>

      <section className="relative isolate min-h-[100svh] overflow-hidden" aria-labelledby="home-title">
        <img
          src="/images/hero.webp"
          alt="A neon dreamscape surrounding a reclining robot beneath the words Deep Reverie"
          className="absolute inset-0 h-full w-full object-cover object-center"
          fetchPriority="high"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(8,6,18,0.2)_0%,rgba(8,6,18,0)_42%,rgba(8,6,18,0.28)_62%,#080612_100%)]"
        />

        <header className="absolute inset-x-0 top-0 z-10 flex items-center px-5 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8 lg:px-12">
          <h1 id="home-title" className="text-sm font-bold uppercase tracking-[0.2em] text-white drop-shadow-lg sm:text-base">
            Deep Reverie
          </h1>
        </header>

        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-3xl px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/app"
              className="group flex min-h-24 items-center gap-4 rounded-[14px] bg-[#c8b9ff] px-5 text-[#11091f] shadow-[0_18px_55px_rgba(24,10,45,0.4)] transition hover:bg-[#d8ceff] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/90 motion-reduce:transition-none"
              aria-label="Explore in AR — camera and volume required"
            >
              <ARIcon />
              <span className="min-w-0 flex-1">
                <span className="block text-xl font-extrabold tracking-[-0.025em]">Explore in AR</span>
                <span className="mt-0.5 block text-sm font-medium text-[#392b52]">Camera and volume required</span>
              </span>
              <span className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none">
                <ArrowIcon />
              </span>
            </Link>

            <Link
              to="/gallery"
              className="group flex min-h-24 items-center gap-4 rounded-[14px] border border-[#d36dff] bg-[#1a102b]/95 px-5 text-[#f3efff] shadow-[0_18px_55px_rgba(5,3,12,0.45)] backdrop-blur-md transition hover:border-[#e3a3ff] hover:bg-[#28173f] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#e3a3ff] motion-reduce:transition-none"
              aria-label="Browse the Artwork — view the complete gallery"
            >
              <GalleryIcon />
              <span className="min-w-0 flex-1">
                <span className="block text-xl font-extrabold tracking-[-0.025em]">Browse the Artwork</span>
                <span className="mt-0.5 block text-sm font-medium text-[#cfc4e7]">View the complete gallery</span>
              </span>
              <span className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none">
                <ArrowIcon />
              </span>
            </Link>
          </div>

          <a
            href="#about-the-art"
            className="mx-auto mt-4 grid h-9 w-12 place-items-center rounded-full text-white/90 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white motion-reduce:transition-none"
            aria-label="Scroll to learn about the art"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
              <path d="m5 9 7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </section>

      <section id="about-the-art" className="scroll-mt-0 bg-[#080612] px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#db73ff]">About the art</p>
            <h2 className="mt-5 max-w-xl text-5xl font-bold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
              A future, <span className="font-serif font-normal italic text-[#c8b9ff]">dreamed</span> by a machine.
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#d8d1e7]">
              What future would artificial intelligence imagine for us? Deep Reverie brings together 54 luminous visions of tomorrow.
            </p>
          </div>

          <div>
            <InstallationImage className="mb-6 rounded-[14px]" />
            <div className="aspect-video overflow-hidden rounded-[14px] border border-white/10 bg-black shadow-[0_30px_90px_rgba(94,48,164,0.2)]">
              <iframe
                className="h-full w-full"
                src="https://www.youtube-nocookie.com/embed/597IAhuQfZ4"
                title="Deep Reverie installation film"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#a9a0bb]">
              <p>Deep Reverie at Lumière · Toronto, 2025</p>
              <a
                href={INSTALLATION_FILM_URL}
                className="font-semibold text-[#c8b9ff] underline decoration-[#7c5bb6] underline-offset-4 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8b9ff]"
              >
                Watch on YouTube ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#b8a6f4] px-5 py-16 text-[#130923] sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.55fr_1.45fr] lg:gap-20">
          <p className="text-xs font-extrabold uppercase tracking-[0.28em]">About the artist</p>
          <div>
            <h2 className="text-5xl font-extrabold tracking-[-0.055em] sm:text-7xl">Bitbrainz</h2>
            <p className="mt-6 max-w-3xl text-lg leading-8 sm:text-xl">
              A creative practice working across emerging technology and interactive art.
            </p>
            <a
              href="https://bitbrainz.com/projects/deep-reverie/"
              className="mt-8 inline-flex min-h-11 items-center border-b-2 border-[#130923] text-sm font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#130923] focus-visible:ring-offset-4 focus-visible:ring-offset-[#b8a6f4]"
            >
              Visit Bitbrainz ↗
            </a>
          </div>
        </div>
      </section>

      <footer className="flex flex-col gap-2 bg-[#080612] px-5 py-8 text-sm text-[#9f96b0] sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p>Deep Reverie · Bitbrainz · 2025</p>
        <a href="#home-title" className="font-semibold text-[#d8d1e7] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8b9ff]">
          Back to top ↑
        </a>
      </footer>
    </main>
  );
};
