import React, { useState } from "react";
import { DREAMS, Dream } from "../dreams/data/dreams";
import Card from "../components/Card";
import { Drawer } from "vaul";
import { DetailsDrawer } from "../components/DetailsDrawer";
import { AppBar } from "../components/AppBar";

const Gallery = () => {
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);

  const handleTileClick = (dream: Dream) => {
    setSelectedDream(dream);
  };

  return (
    <div className="bg-gray-900">
      <AppBar />
      <DetailsDrawer
        dream={selectedDream}
        open={!!selectedDream}
        onClose={() => setSelectedDream(null)}
      >
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4 p-2">
          {DREAMS.map((dream, index) => (
            <>
              {!selectedDream ? (
                <Drawer.Trigger>
                  <Card
                    key={index}
                    imageUrl={`/images/thumbnails/${dream.fileName}`}
                    onClick={() => handleTileClick(dream)}
                  />
                </Drawer.Trigger>
              ) : (
                <Card
                  key={index}
                  imageUrl={`/images/thumbnails/${dream.fileName}`}
                  onClick={() => handleTileClick(dream)}
                />
              )}
            </>
          ))}
        </div>
      </DetailsDrawer>
    </div>
  );
};

export default Gallery;
