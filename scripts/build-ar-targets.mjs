import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "@napi-rs/canvas";
import sharp from "sharp";
import { CompilerBase } from "mind-ar/src/image-target/compiler-base.js";
import { buildTrackingImageList } from "mind-ar/src/image-target/image-list.js";
import { extractTrackingFeatures } from "mind-ar/src/image-target/tracker/extract-utils.js";
import "mind-ar/src/image-target/detector/kernels/cpu/index.js";

class PortableOfflineCompiler extends CompilerBase {
  createProcessCanvas(image) {
    return createCanvas(image.width, image.height);
  }

  async compileTrack({ progressCallback, targetImages, basePercent }) {
    const percentPerImage = (100 - basePercent) / targetImages.length;
    let percent = 0;
    const trackingData = [];

    for (const targetImage of targetImages) {
      const imageList = buildTrackingImageList(targetImage);
      const percentPerAction = percentPerImage / imageList.length;
      trackingData.push(
        extractTrackingFeatures(imageList, () => {
          percent += percentPerAction;
          progressCallback(basePercent + percent);
        }),
      );
    }

    return trackingData;
  }
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, "config/ar-pilot-targets.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const workDirectory = path.join(
  root,
  ".cache/ar-targets",
  `v${manifest.version}`,
);
const outputDirectory = path.join(root, "public/ar");
const outputPath = path.join(outputDirectory, manifest.asset);

if (manifest.targets.length !== 10) {
  throw new Error(`Expected exactly 10 pilot targets, got ${manifest.targets.length}`);
}

await mkdir(workDirectory, { recursive: true });
await mkdir(outputDirectory, { recursive: true });

const images = [];
for (const target of manifest.targets) {
  const sourcePath = path.join(
    root,
    "public/images/saturated",
    target.fileName,
  );
  const processedPath = path.join(
    workDirectory,
    `${String(target.targetIndex).padStart(2, "0")}-${path.parse(target.fileName).name}.jpg`,
  );

  await sharp(sourcePath)
    .resize({
      width: manifest.preprocessing.maxWidth,
      height: manifest.preprocessing.maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: manifest.preprocessing.quality,
      chromaSubsampling: manifest.preprocessing.chromaSubsampling,
      mozjpeg: true,
    })
    .toFile(processedPath);

  images.push(await loadImage(processedPath));
}

const compiler = new PortableOfflineCompiler();
let lastReported = -1;
await compiler.compileImageTargets(images, (progress) => {
  const rounded = Math.floor(progress / 10) * 10;
  if (rounded !== lastReported) {
    lastReported = rounded;
    console.log(`Compiling targets: ${Math.min(rounded, 100)}%`);
  }
});

await writeFile(outputPath, compiler.exportData());
console.log(`Wrote ${path.relative(root, outputPath)}`);
