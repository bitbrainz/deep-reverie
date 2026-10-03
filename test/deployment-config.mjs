import assert from "node:assert/strict";
import { access, readFile, readdir } from "node:fs/promises";
import { test } from "node:test";
import { resolveConfig } from "vite";

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const githubPagesActions =
  /actions\/(?:configure-pages|deploy-pages|upload-pages-artifact)|github-pages/i;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

test("the production build targets Cloudflare Pages defaults", async () => {
  const config = await resolveConfig({}, "build");

  assert.equal(packageJson.scripts.build, "tsc -b && vite build");
  assert.equal(config.build.outDir, "dist");
  assert.equal(config.base, "/");
  assert.equal(config.appType, "spa");
});

test("GitHub Pages deployment hooks stay removed", async () => {
  assert.equal(packageJson.homepage, undefined);
  assert.equal(packageJson.scripts.postbuild, undefined);
  assert.equal(await exists("scripts/create-pages-fallback.mjs"), false);
  assert.equal(await exists("public/404.html"), false);

  const workflowDirectory = ".github/workflows";
  const workflowNames = (await exists(workflowDirectory))
    ? await readdir(workflowDirectory)
    : [];

  for (const workflowName of workflowNames) {
    const workflow = await readFile(`${workflowDirectory}/${workflowName}`, "utf8");
    assert.doesNotMatch(workflow, githubPagesActions, workflowName);
  }
});
