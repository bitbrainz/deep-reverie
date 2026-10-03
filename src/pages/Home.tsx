import { Link } from "react-router";

export const Home = () => {
  return (
    <div className="relative h-screen w-full">
      <img
        src="/images/hero.webp"
        alt="Deep Reverie Hero"
        className="w-full h-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-5xl font-bold mb-6">Deep Reverie</h1>
        <p className="text-xl max-w-2xl text-center mb-10">
          If AI could dream, what vision of our world's future would it imagine?
          In a world where AI increasingly shapes our reality, Deep Reverie is
          an interactive installation that poses a profound question: What does
          AI dream of? Inspired by the early phases of AI's “deep dreaming”—a
          visual experiment where algorithms produced surreal, dreamlike
          images—Deep Reverie invites visitors to engage with the installation
          and reflect on how far AI has come.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/app"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Start AR Experience
          </Link>
          <Link
            to="/gallery"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            View All Artwork
          </Link>
          <Link
            to="/about"
            className="border border-white/70 bg-black/20 px-4 py-2 font-bold text-white backdrop-blur-sm transition hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            About the Art
          </Link>
        </div>
      </div>
    </div>
  );
};
