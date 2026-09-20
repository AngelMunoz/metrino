import { readFileSync, writeFileSync } from "node:fs";

const manifestPath = process.argv[2] ?? "public/custom-elements.json";
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

if (Array.isArray(manifest.modules)) {
  manifest.modules.sort((a, b) => (a.path ?? "").localeCompare(b.path ?? ""));
}

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
