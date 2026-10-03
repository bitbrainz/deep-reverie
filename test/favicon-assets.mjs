import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";

const indexSource = await readFile("index.html", "utf8");
const faviconSource = await readFile("public/favicon.svg", "utf8");

test("the document head references the branded SVG favicon", () => {
  assert.match(
    indexSource,
    /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg" \/>/,
  );
});

test("the favicon stays small, self-contained, and visibly branded", async () => {
  const favicon = await stat("public/favicon.svg");

  assert.ok(favicon.size < 2_000, "favicon.svg exceeds 2 KB");
  assert.match(faviconSource, /viewBox="0 0 64 64"/);
  assert.match(faviconSource, /fill="#080612"/);
  assert.match(faviconSource, /fill="#FFE16A"/);
  assert.match(faviconSource, /<title>Deep Reverie<\/title>/);
  assert.doesNotMatch(faviconSource, /<(?:image|script)\b/);
});
