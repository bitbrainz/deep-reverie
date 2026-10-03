import { DREAMS } from "../dreams/data/dreams";
import Card from "../components/Card";
import { DetailsDrawer } from "../components/DetailsDrawer";
import { useDreamSelection } from "../dreams/useDreamSelection";
import { preloadDreamArtwork } from "../dreams/dreamArtwork";
import { publicAssetPath } from "../app/publicAssetPath";

const Gallery = () => {
  const { selectedDream, selectDream, selectAdjacentDream, closeDetails } =
    useDreamSelection(DREAMS);

  const openDream = async (
    dream: (typeof DREAMS)[number],
    opener: HTMLButtonElement,
  ) => {
    await preloadDreamArtwork(dream);
    selectDream(dream, opener);
  };

  const openAdjacentDream = async (offset: number) => {
    if (!selectedDream) return;
    const selectedIndex = DREAMS.findIndex(({ id }) => id === selectedDream.id);
    const nextIndex = (selectedIndex + offset + DREAMS.length) % DREAMS.length;
    await preloadDreamArtwork(DREAMS[nextIndex]);
    selectAdjacentDream(offset);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-8 sm:px-6 lg:px-10">
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

        <div className="grid grid-cols-3 gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-7 lg:grid-cols-4 xl:grid-cols-5">
          {DREAMS.map((dream, index) => (
            <Card
              key={dream.id}
              imageUrl={publicAssetPath(
                `images/thumbnails/${dream.fileName.replace(".png", ".webp")}`,
              )}
              title={dream.title}
              eager={index < 6}
              onPreload={() => void preloadDreamArtwork(dream)}
              onClick={(event) => {
                void openDream(dream, event.currentTarget);
              }}
            />
          ))}
        </div>
      </main>

      <DetailsDrawer
        dream={selectedDream}
        open={selectedDream !== null}
        onClose={closeDetails}
        onPrevious={() => void openAdjacentDream(-1)}
        onNext={() => void openAdjacentDream(1)}
      />
    </div>
  );
};

export default Gallery;
