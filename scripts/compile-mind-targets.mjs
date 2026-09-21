import { spawn } from "node:child_process";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createCanvas, loadImage } from "canvas";
import { OfflineCompiler } from "mind-ar/src/image-target/offline-compiler.js";

const root = process.cwd();
const scriptPath = fileURLToPath(import.meta.url);
const sourceDirectory = path.join(root, "public/images/saturated");
const outputDirectory = path.join(root, "public/targets");
const chunk = process.argv.includes("--chunk")
  ? Number(process.argv[process.argv.indexOf("--chunk") + 1])
  : undefined;

const runCompiler = (args) =>
  new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["--max-old-space-size=2048", scriptPath, ...args], {
      stdio: "inherit",
    });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`Compiler exited with ${code}`))
    );
  });

if (chunk === undefined) {
  await Promise.all(
    Array.from({ length: 6 }, (_, index) => runCompiler(["--chunk", String(index)]))
  );
  process.exit(0);
}
const filenames = (await readdir(sourceDirectory))
  .filter((name) => name.endsWith(".png"))
  .sort((left, right) => Number(left.split("_")[0]) - Number(right.split("_")[0]));

if (filenames.length !== 54) {
  throw new Error(`Expected 54 canonical targets, found ${filenames.length}`);
}

const selectedFilenames = filenames.slice(chunk * 9, (chunk + 1) * 9);

const images = [];
for (const filename of selectedFilenames) {
  const source = await loadImage(path.join(sourceDirectory, filename));
  const canvas = createCanvas(256, 256);
  canvas.getContext("2d").drawImage(source, 0, 0, 256, 256);
  images.push(canvas);
}

const compiler = new OfflineCompiler();
await compiler.compileImageTargets(images, (progress) => {
  process.stdout.write(`\rCompiling ${progress.toFixed(1)}%`);
});
const chunkOutput = path.join(
  outputDirectory,
  `deep-reverie-v1-${chunk}.mind`
);
await writeFile(chunkOutput, compiler.exportData());
process.stdout.write(`\nWrote ${chunkOutput} (${selectedFilenames.length} targets)\n`);
