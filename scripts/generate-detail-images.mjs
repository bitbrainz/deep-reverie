import { spawnSync } from "node:child_process";
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const sourceDirectory = "public/images/saturated";
const outputDirectory = "public/images/details";
const sourceFiles = (await readdir(sourceDirectory))
  .filter((fileName) => fileName.endsWith(".webp"))
  .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

await mkdir(outputDirectory, { recursive: true });

for (const fileName of sourceFiles) {
  const result = spawnSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      path.join(sourceDirectory, fileName),
      "-vf",
      "scale=768:768:flags=lanczos",
      "-c:v",
      "libwebp",
      "-quality",
      "76",
      "-compression_level",
      "6",
      path.join(outputDirectory, fileName),
    ],
    { stdio: "inherit" },
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed while generating ${fileName}`);
  }
}

console.log(`Generated ${sourceFiles.length} optimized detail images.`);
