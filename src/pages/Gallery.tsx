import { useRef, useState } from "react";
import { DREAMS, Dream } from "../dreams/data/dreams";
import Card from "../components/Card";
import { DetailsDrawer } from "../components/DetailsDrawer";
import { AppBar } from "../components/AppBar";

const Gallery = () => {
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const openingCardRef = useRef<HTMLButtonElement | null>(null);
  const selectedIndex = selectedDream
    ? DREAMS.findIndex((dream) => dream.id === selectedDream.id)
    : -1;

  const selectAdjacentDream = (offset: number) => {
    const nextIndex = (selectedIndex + offset + DREAMS.length) % DREAMS.length;
    setSelectedDream(DREAMS[nextIndex]);
  };

  const closeDetails = () => {
    setSelectedDream(null);
    window.requestAnimationFrame(() => openingCardRef.current?.focus());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AppBar />
      <main className="mx-auto max-w-[1600px] px-4 pb-16 pt-8 sm:px-6 lg:px-10">
        <header className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-violet-300">
            A machine-imagined future
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Dream archive</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
            Explore visions of a future shaped by human hope and artificial imagination.
            Select any artwork to enter its story.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {DREAMS.map((dream) => (
            <Card
              key={dream.id}
              imageUrl={`/images/thumbnails/${dream.fileName}`}
              title={dream.title}
              tagline={dream.tagline}
              onClick={(event) => {
                openingCardRef.current = event.currentTarget;
                setSelectedDream(dream);
              }}
            />
          ))}
        </div>
      </main>

      <DetailsDrawer
        dream={selectedDream}
        open={selectedDream !== null}
        onClose={closeDetails}
        onPrevious={() => selectAdjacentDream(-1)}
        onNext={() => selectAdjacentDream(1)}
      />
    </div>
  );
};

export default Gallery;
