import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";

const dreamSource = await readFile("src/dreams/data/dreams.ts", "utf8");
const gallerySource = await readFile("src/pages/Gallery.tsx", "utf8");
const cardSource = await readFile("src/components/Card.tsx", "utf8");
const experienceSource = await readFile("src/pages/DreamExperience.tsx", "utf8");
const artworkSource = await readFile("src/dreams/dreamArtwork.ts", "utf8");
const dreamFiles = [
  ...dreamSource.matchAll(/fileName: "([^"]+\.png)"/g),
].map((match) => match[1]);

const readLossyWebpDimensions = (image) => {
  assert.equal(image.toString("ascii", 0, 4), "RIFF");
  assert.equal(image.toString("ascii", 8, 12), "WEBP");
  assert.equal(image.toString("ascii", 12, 16), "VP8 ");
  assert.deepEqual([...image.subarray(23, 26)], [0x9d, 0x01, 0x2a]);
  return {
    width: image.readUInt16LE(26) & 0x3fff,
    height: image.readUInt16LE(28) & 0x3fff,
  };
};

test("every artwork has budgeted WebP gallery and detail assets", async () => {
  assert.equal(dreamFiles.length, 54);

  for (const fileName of dreamFiles) {
    const webpName = fileName.replace(".png", ".webp");
    const thumbnail = await stat(`public/images/thumbnails/${webpName}`);
    const highDensityThumbnail = await stat(
      `public/images/thumbnails-2x/${webpName}`,
    );
    const sourceDetail = await stat(`public/images/saturated/${webpName}`);
    const popupPath = `public/images/details/${webpName}`;
    const popupDetail = await stat(popupPath);
    const popupDimensions = readLossyWebpDimensions(await readFile(popupPath));

    assert.ok(thumbnail.size < 25_000, `${webpName} thumbnail exceeds 25 KB`);
    assert.ok(highDensityThumbnail.size < 100_000, `${webpName} 2x thumbnail exceeds 100 KB`);
    assert.ok(sourceDetail.size < 1_000_000, `${webpName} source detail exceeds 1 MB`);
    assert.ok(popupDetail.size < 160_000, `${webpName} popup detail exceeds 160 KB`);
    assert.deepEqual(popupDimensions, { width: 768, height: 768 });
  }

  assert.match(artworkSource, /images\/details\//);
  assert.doesNotMatch(artworkSource, /images\/saturated\//);
});

test("homepage hero stays below its transfer budget", async () => {
  const hero = await stat("public/images/hero.webp");
  assert.ok(hero.size < 400_000, "hero.webp exceeds 400 KB");
});

test("about page installation photo stays below its transfer budget", async () => {
  const installationPhoto = await stat("public/images/deep-reverie-at-lumiere.webp");
  assert.ok(
    installationPhoto.size < 250_000,
    "deep-reverie-at-lumiere.webp exceeds 250 KB",
  );
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

test("the live cylinder uses lightweight thumbnail artwork", () => {
  assert.match(experienceSource, /images\/thumbnails\//);
  assert.doesNotMatch(experienceSource, /images\/thumbnails-2x\//);
  assert.doesNotMatch(experienceSource, /images\/saturated\//);
  assert.match(experienceSource, /loading="eager"/);
  assert.doesNotMatch(experienceSource, /loading=.*lazy/);
});
