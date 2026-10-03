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

        <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-5 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8 lg:px-12">
          <h1 id="home-title" className="text-sm font-bold uppercase tracking-[0.2em] text-white drop-shadow-lg sm:text-base">
            Deep Reverie
          </h1>
          <a
            href="#the-artist"
            className="inline-flex min-h-11 items-center border-b border-[#ffe16a]/70 text-xs font-extrabold uppercase tracking-[0.16em] text-[#ffe16a] drop-shadow-lg transition hover:border-[#fff3b0] hover:text-[#fff3b0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffe16a] focus-visible:ring-offset-4 focus-visible:ring-offset-[#080612] motion-reduce:transition-none sm:text-sm"
          >
            By Bitbrainz ↓
          </a>
        </header>

        <div className="absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-3xl px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:pb-8">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/app"
              className="group flex min-h-24 items-center gap-4 rounded-[14px] bg-[#ffe16a] px-5 text-[#211600] shadow-[0_18px_55px_rgba(255,211,73,0.24)] transition hover:bg-[#fff0a3] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#fff6ca] motion-reduce:transition-none"
              aria-label="Explore in AR — camera and volume required"
            >
              <ARIcon />
              <span className="min-w-0 flex-1">
                <span className="block text-xl font-extrabold tracking-[-0.025em]">Explore in AR</span>
                <span className="mt-0.5 block text-sm font-medium text-[#5a4300]">Camera and volume required</span>
              </span>
              <span className="transition-transform group-hover:translate-x-1 motion-reduce:transition-none">
                <ArrowIcon />
              </span>
            </Link>

            <Link
              to="/gallery"
              className="group flex min-h-24 items-center gap-4 rounded-[14px] border border-[#ffe16a] bg-[#c58d14]/95 px-5 text-[#1f1500] shadow-[0_18px_55px_rgba(255,196,45,0.2)] backdrop-blur-md transition hover:bg-[#e0ad2c] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#ffe99a] motion-reduce:transition-none"
              aria-label="Browse the Artwork — view the complete gallery"
            >
              <GalleryIcon />
              <span className="min-w-0 flex-1">
                <span className="block text-xl font-extrabold tracking-[-0.025em]">Browse the Artwork</span>
                <span className="mt-0.5 block text-sm font-semibold text-[#493200]">View the complete gallery</span>
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
            <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-[#ffe16a]">Deep Reverie</p>
            <h2 className="mt-5 max-w-xl text-5xl font-bold leading-[0.94] tracking-[-0.055em] sm:text-7xl">
              The <span className="font-serif font-normal italic text-[#ffe16a]">Project</span>
            </h2>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#d8d1e7]">
              “Deep Reverie” immerses audiences in a glowing dreamscape of UV-reactive tapestries and augmented reality. From a distance, the installation appears as a luminous geometric mural. Up close, each diamond-shaped image reveals a different AI-generated dream of the future. Audiences can scan a QR code to open an AR experience and access more information about each dream. These interactions invite visitors to move through the work, explore at their own pace and consider how artificial intelligence might imagine humanity’s hopes, fears and possible futures. What stories, values and choices from the present may become memories of the future? Blending digital art, light and emerging technologies, “Deep Reverie” turns public space into a luminous daydream about what our world might become.
            </p>
          </div>

          <div>
            <InstallationImage crop="tight" className="mb-6 rounded-[14px]" />
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

      <section id="the-artist" className="scroll-mt-0 bg-[#ffe16a] px-5 py-16 text-[#211600] sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.55fr_1.45fr] lg:gap-20">
          <p className="text-xs font-extrabold uppercase tracking-[0.28em]">The Artist</p>
          <div>
            <h2 className="text-5xl font-extrabold tracking-[-0.055em] sm:text-7xl">Bitbrainz</h2>
            <p className="mt-6 max-w-4xl text-lg leading-8 sm:text-xl">
              Bitbrainz is an art collective that creates interactive public art powered by emerging technologies. The collective uses computer engineering and emerging technologies to build magical and accessible human-machine experiences. Their work has appeared in parks, community spaces and public events, and includes these installations: “Deep Reverie”, “Mobius Ensemble”, “Virtual Visage” and “Bloom Promenade”. Bitbrainz also created the Bolton Fire Bell, a permanent light sculpture for the City of Bolton.
            </p>
            <a
              href="https://bitbrainz.com/projects/deep-reverie/"
              className="mt-8 inline-flex min-h-11 items-center border-b-2 border-[#211600] text-sm font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#211600] focus-visible:ring-offset-4 focus-visible:ring-offset-[#ffe16a]"
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
