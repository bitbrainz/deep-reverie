import type { Dream } from "./data/dreams";
import { publicAssetPath } from "../app/publicAssetPath";

const preloadCache = new Map<string, Promise<void>>();

export const getDreamDetailUrl = (dream: Pick<Dream, "fileName">) =>
  publicAssetPath(
    `images/details/${dream.fileName.replace(".png", ".webp")}`,
  );

export const preloadDreamArtwork = (dream: Pick<Dream, "fileName">) => {
  const src = getDreamDetailUrl(dream);
  const cached = preloadCache.get(src);
  if (cached) return cached;
  if (typeof Image === "undefined") return Promise.resolve();

  const preload = new Promise<void>((resolve) => {
    const image = new Image();
    const finish = () => resolve();

    image.onload = () => {
      if (typeof image.decode !== "function") {
        finish();
        return;
      }
      void image.decode().catch(() => undefined).then(finish);
    };
    image.onerror = finish;
    image.src = src;
  });

  preloadCache.set(src, preload);
  return preload;
};
