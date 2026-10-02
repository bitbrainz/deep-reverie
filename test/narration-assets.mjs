import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";

const dreamSource = await readFile("src/dreams/data/dreams.ts", "utf8");
const narrationSource = await readFile("src/dreams/data/narrations.ts", "utf8");
const dreamIds = [...dreamSource.matchAll(/^    id: (\d+),$/gm)].map((match) =>
  Number(match[1]),
);
const narrationEntries = [
  ...narrationSource.matchAll(/^  (\d+): "([^"]+\.mp3)",$/gm),
].map((match) => ({ id: Number(match[1]), fileName: match[2] }));

test("every artwork maps to one unique narration asset", async () => {
  assert.equal(dreamIds.length, 54);
  assert.equal(narrationEntries.length, 54);
  assert.deepEqual(
    narrationEntries.map(({ id }) => id),
    dreamIds,
  );
  assert.equal(
    new Set(narrationEntries.map(({ fileName }) => fileName)).size,
    narrationEntries.length,
  );

  for (const { id, fileName } of narrationEntries) {
    assert.match(fileName, new RegExp(`^${String(id).padStart(2, "0")}-`));
    const narration = await stat(`public/audio/narrations/${fileName}`);
    assert.ok(narration.size > 100_000, `${fileName} is unexpectedly small`);
  }
});
