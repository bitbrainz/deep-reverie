import fs from "node:fs";

const input = process.argv[2];
if (!input) {
  console.error("Usage: node scripts/sample-blacklight-chart.mjs <chart.ppm>");
  process.exit(1);
}

const file = fs.readFileSync(input);
let offset = 0;

const nextToken = () => {
  while (offset < file.length) {
    if (file[offset] === 35) {
      while (offset < file.length && file[offset] !== 10) offset += 1;
    } else if (file[offset] <= 32) {
      offset += 1;
    } else {
      break;
    }
  }
  const start = offset;
  while (offset < file.length && file[offset] > 32 && file[offset] !== 35) {
    offset += 1;
  }
  return file.toString("ascii", start, offset);
};

if (nextToken() !== "P6") throw new Error("Expected a binary P6 PPM image");
const width = Number(nextToken());
const height = Number(nextToken());
if (Number(nextToken()) !== 255) throw new Error("Expected 8-bit PPM channels");
if (file[offset] === 13 && file[offset + 1] === 10) offset += 2;
else if (file[offset] <= 32) offset += 1;
const pixels = file.subarray(offset);
if (pixels.length !== width * height * 3) {
  throw new Error(`Unexpected pixel payload: ${pixels.length} bytes`);
}

if (width !== 2414 || height !== 4574) {
  throw new Error(`Expected the documented 2414x4574 render, got ${width}x${height}`);
}
const radius = 7;
const roundTiesToEven = (value) => {
  const lower = Math.floor(value);
  const fraction = value - lower;
  if (fraction < 0.5) return lower;
  if (fraction > 0.5) return lower + 1;
  return lower % 2 === 0 ? lower : lower + 1;
};
const median = (values) => {
  values.sort((a, b) => a - b);
  const middle = Math.floor(values.length / 2);
  return values.length % 2
    ? values[middle]
    : roundTiesToEven((values[middle - 1] + values[middle]) / 2);
};
const sample = (sourceX, sourceY) => {
  const left = roundTiesToEven(sourceX - radius);
  const right = roundTiesToEven(sourceX + radius + 1);
  const top = roundTiesToEven(sourceY - radius);
  const bottom = roundTiesToEven(sourceY + radius + 1);
  const channels = [[], [], []];
  for (let y = top; y < bottom; y += 1) {
    for (let x = left; x < right; x += 1) {
      const index = (y * width + x) * 3;
      channels[0].push(pixels[index]);
      channels[1].push(pixels[index + 1]);
      channels[2].push(pixels[index + 2]);
    }
  }
  return channels.map(median);
};

const grids = {
  digital: [
    213, 2219,
    [489, 527, 566, 605, 645, 686, 725, 764, 804, 844, 894, 934, 973, 1012, 1052, 1092, 1132, 1172, 1212, 1254],
  ],
  daylight: [
    208, 2217,
    [2028, 2065, 2102, 2142, 2182, 2221, 2260, 2300, 2339, 2378, 2428, 2467, 2506, 2546, 2586, 2626, 2666, 2706, 2746, 2790],
  ],
  blacklight: [
    212, 2213,
    [3490, 3527, 3564, 3603, 3642, 3681, 3720, 3759, 3798, 3838, 3885, 3925, 3964, 4004, 4044, 4084, 4124, 4164, 4204, 4247],
  ],
};
const neutralRamps = {
  digital: [1304, 436, 2220],
  daylight: [2837, 431, 2220],
  blacklight: [4301, 433, 2225],
};
const result = {};

for (const [name, [firstX, lastX, rows]] of Object.entries(grids)) {
  const values = rows.flatMap((y) =>
    Array.from({ length: 37 }, (_, column) =>
      sample(firstX + ((lastX - firstX) * column) / 36, y),
    ).flat(),
  );
  result[name] = Buffer.from(values).toString("base64");
}

for (const [name, [y, firstX, lastX]] of Object.entries(neutralRamps)) {
  const values = Array.from({ length: 33 }, (_, column) =>
    sample(firstX + ((lastX - firstX) * column) / 32, y),
  ).flat();
  result[`${name}_neutral`] = Buffer.from(values).toString("base64");
}

console.log(JSON.stringify({ width, height, patchRadius: radius, ...result }, null, 2));
