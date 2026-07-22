#!/usr/bin/env node
/**
 * Bundle Express for Vercel into api/index.js (CommonJS).
 * Browsers must never receive TypeScript source.
 */
import * as esbuild from "esbuild";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.join(root, "api");
const outfile = path.join(apiDir, "index.js");

fs.mkdirSync(apiDir, { recursive: true });
// Ensure this folder is CommonJS even if the parent package is "type": "module".
fs.writeFileSync(
  path.join(apiDir, "package.json"),
  `${JSON.stringify({ type: "commonjs" }, null, 2)}\n`,
);

await esbuild.build({
  entryPoints: [path.join(root, "vercel-entry.ts")],
  outfile,
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  packages: "external",
  logLevel: "info",
  banner: {
    js: 'var import_meta_url = require("url").pathToFileURL(__filename).href;',
  },
  define: {
    "import.meta.url": "import_meta_url",
  },
});

const bundled = fs.readFileSync(outfile, "utf8");
fs.writeFileSync(
  outfile,
  `${bundled}\nif (module.exports && module.exports.default) {\n  module.exports = module.exports.default;\n}\n`,
);

console.log(`Vercel API bundle ready: ${path.relative(root, outfile)}`);
