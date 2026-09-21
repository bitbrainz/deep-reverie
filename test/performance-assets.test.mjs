import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";

const dreamSource = await readFile("src/dreams/data/dreams.ts", "utf8");
const gallerySource = await readFile("src/pages/Gallery.tsx", "utf8");
const cardSource = await readFile("src/components/Card.tsx", "utf8");
const dreamFiles = [
  ...dreamSource.matchAll(/fileName: "([^"]+\.png)"/g),
].map((match) => match[1]);

test("every artwork has budgeted WebP gallery and detail assets", async () => {
  assert.equal(dreamFiles.length, 54);

  for (const fileName of dreamFiles) {
    const webpName = fileName.replace(".png", ".webp");
    const thumbnail = await stat(`public/images/thumbnails/${webpName}`);
    const highDensityThumbnail = await stat(
      `public/images/thumbnails-2x/${webpName}`,
    );
    const detail = await stat(`public/images/saturated/${webpName}`);

    assert.ok(thumbnail.size < 25_000, `${webpName} thumbnail exceeds 25 KB`);
    assert.ok(highDensityThumbnail.size < 100_000, `${webpName} 2x thumbnail exceeds 100 KB`);
    assert.ok(detail.size < 1_000_000, `${webpName} detail exceeds 1 MB`);
  }
});

test("homepage hero stays below its transfer budget", async () => {
  const hero = await stat("public/images/hero.webp");
  assert.ok(hero.size < 400_000, "hero.webp exceeds 400 KB");
});

test("gallery sources cover supported viewport and pixel-density combinations", () => {
  const maxContainerWidth = 1280;
  const sourceWidth = 512;
  const horizontalPadding = 16;
  const gap = 16;
  const supportedDisplays = [
    { name: "iPhone 12", viewport: 390, columns: 3, dpr: 3 },
    { name: "desktop", viewport: 1280, columns: 5, dpr: 2 },
    { name: "wide desktop", viewport: 1536, columns: 5, dpr: 2 },
  ];

  assert.match(gallerySource, /max-w-\[1280px\]/);
  assert.match(cardSource, /thumbnails-2x/);

  for (const display of supportedDisplays) {
    const containerWidth = Math.min(display.viewport, maxContainerWidth);
    const renderedWidth =
      (containerWidth - horizontalPadding - gap * (display.columns - 1)) /
      display.columns;
    assert.ok(
      renderedWidth * display.dpr <= sourceWidth,
      `${display.name} requires more than ${sourceWidth}px`,
    );
  }
});
