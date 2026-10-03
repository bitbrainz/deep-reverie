import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { test } from "node:test";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));

test("the production build is portable to the Cloudflare Pages root", () => {
  assert.equal(packageJson.scripts.build, "tsc -b && vite build");
  assert.equal(packageJson.scripts.postbuild, undefined);
  assert.equal(packageJson.homepage, undefined);
});

test("the repository does not include a GitHub Pages deployment workflow", async () => {
  await assert.rejects(access(".github/workflows/deploy-pages.yml"));
});

test("Cloudflare Pages can apply its native SPA fallback", async () => {
  await assert.rejects(access("scripts/create-pages-fallback.mjs"));
});
