import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";

const dreamSource = await readFile("src/dreams/data/dreams.ts", "utf8");
const gallerySource = await readFile("src/pages/Gallery.tsx", "utf8");
const cardSource = await readFile("src/components/Card.tsx", "utf8");
const experienceSource = await readFile("src/pages/DreamExperience.tsx", "utf8");
const documentSource = await readFile("index.html", "utf8");
const faviconSource = await readFile("public/favicon.svg", "utf8");
const dreamFiles = [
  ...dreamSource.matchAll(/fileName: "([^"]+\.png)"/g),
].map((match) => match[1]);

const readWebpDimensions = async (path) => {
  const source = await readFile(path);
  const chunk = source.toString("ascii", 12, 16);

  if (chunk === "VP8 ") {
    return {
      width: source.readUInt16LE(26) & 0x3fff,
      height: source.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    const bits = source.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >>> 14) & 0x3fff) + 1,
    };
  }
  if (chunk === "VP8X") {
    return {
      width: source.readUIntLE(24, 3) + 1,
      height: source.readUIntLE(27, 3) + 1,
    };
  }

  throw new Error(`${path} does not contain a supported WebP chunk`);
};

test("every artwork has budgeted WebP gallery and detail assets", async () => {
  assert.equal(dreamFiles.length, 54);

  for (const fileName of dreamFiles) {
    const webpName = fileName.replace(".png", ".webp");
    const thumbnail = await stat(`public/images/thumbnails/${webpName}`);
    const highDensityThumbnail = await stat(
      `public/images/thumbnails-2x/${webpName}`,
    );
    const detailPath = `public/images/details/${webpName}`;
    const detail = await stat(detailPath);
    const detailDimensions = await readWebpDimensions(detailPath);

    assert.ok(thumbnail.size < 25_000, `${webpName} thumbnail exceeds 25 KB`);
    assert.ok(highDensityThumbnail.size < 100_000, `${webpName} 2x thumbnail exceeds 100 KB`);
    assert.ok(detail.size < 350_000, `${webpName} detail exceeds 350 KB`);
    assert.deepEqual(
      detailDimensions,
      { width: 1024, height: 1024 },
      `${webpName} detail must retain a 1024px mobile-quality source`,
    );
  }
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

test("the document uses the lightweight Deep Reverie favicon", () => {
  assert.match(
    documentSource,
    /<link rel="icon" type="image\/svg\+xml" href="%BASE_URL%favicon\.svg" \/>/,
  );
  assert.doesNotMatch(documentSource, /vite\.svg/);
  assert.match(faviconSource, /viewBox="0 0 64 64"/);
  assert.match(faviconSource, /#080612/);
  assert.match(faviconSource, /#ffe16a/);
  assert.ok(Buffer.byteLength(faviconSource) < 2_000, "favicon.svg exceeds 2 KB");
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
