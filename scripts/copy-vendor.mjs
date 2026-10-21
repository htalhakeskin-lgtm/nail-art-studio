/**
 * Copies browser files that a bundler cannot serve itself into public/vendor (git-ignored).
 * MapLibre starts its tile worker from a URL next to its own module; Turbopack's chunks break
 * that URL, so the worker is served from /vendor and set with maplibregl.setWorkerUrl().
 * The version is in the file name, so a dependency update never hits a stale browser cache.
 * Runs before `dev` and `build` (package.json).
 */
import { copyFile, mkdir, readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const target = path.join(root, "public", "vendor");
const maplibre = path.join(root, "node_modules", "maplibre-gl");
const { version } = JSON.parse(await readFile(path.join(maplibre, "package.json"), "utf8"));

await mkdir(target, { recursive: true });
for (const file of await readdir(target)) {
  if (file.startsWith("maplibre-gl-worker-")) await rm(path.join(target, file));
}
await copyFile(
  path.join(maplibre, "dist", "maplibre-gl-worker.mjs"),
  path.join(target, `maplibre-gl-worker-${version}.mjs`),
);
console.log(`✓ public/vendor/maplibre-gl-worker-${version}.mjs`);
