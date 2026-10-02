import { useCallback, useRef, useState } from "react";
import type { Dream } from "./data/dreams";

export const useDreamSelection = (dreams: readonly Dream[]) => {
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const openingControlRef = useRef<HTMLButtonElement | null>(null);

  const selectDream = useCallback((dream: Dream, opener?: HTMLButtonElement | null) => {
    if (opener) openingControlRef.current = opener;
    setSelectedDream(dream);
  }, []);

  const selectAdjacentDream = useCallback(
    (offset: number) => {
      if (dreams.length === 0) return;
      const selectedIndex = selectedDream
        ? dreams.findIndex((dream) => dream.id === selectedDream.id)
        : -1;
      const nextIndex = (selectedIndex + offset + dreams.length) % dreams.length;
      setSelectedDream(dreams[nextIndex]);
    },
    [dreams, selectedDream],
  );

  const closeDetails = useCallback(() => {
    setSelectedDream(null);
    window.requestAnimationFrame(() => openingControlRef.current?.focus());
  }, []);

  return { selectedDream, selectDream, selectAdjacentDream, closeDetails };
};
