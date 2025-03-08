export const Home = () => {
  return (
    <div className="relative h-screen w-full">
      <img
        src="/images/hero.png"
        alt="Deep Reverie Hero"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-5xl font-bold mb-6">Deep Reverie</h1>
        <p className="text-xl max-w-2xl text-center">
          Welcome to Deep Reverie - an innovative AI-powered project that uses
          computer vision to analyze and interpret real-time video input. Using
          teachable machine learning models, we create an interactive experience
          that bridges the gap between human gestures and digital responses.
        </p>
        <p>This augmented reality app will require camera access</p>
        <div className="flex space-x-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Start AR Experience
          </button>
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            View All Artwork
          </button>
        </div>
      </div>
    </div>
  );
};
