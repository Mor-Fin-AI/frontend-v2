#!/usr/bin/env node
/**
 * Vercel production build.
 * Outputs to `public/` (matches Vercel Project Settings Output Directory)
 * and also writes Build Output API files for functions + routes.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import * as esbuild from "esbuild";

const root = process.cwd();
const publicDir = path.join(root, "public");
const outputDir = path.join(root, ".vercel", "output");
const staticDir = path.join(outputDir, "static");
const funcDir = path.join(outputDir, "functions", "api", "[...path].func");

execSync("npx vite build", { stdio: "inherit", cwd: root });

if (!fs.existsSync(path.join(publicDir, "index.html"))) {
  console.error("Build failed: public/index.html was not created.");
  process.exit(1);
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(staticDir, { recursive: true });
fs.cpSync(publicDir, staticDir, { recursive: true });

fs.mkdirSync(funcDir, { recursive: true });
await esbuild.build({
  entryPoints: [path.join(root, "api", "[...path].ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: path.join(funcDir, "index.js"),
  banner: {
    js: "import { createRequire as __createRequire } from 'module'; const require = __createRequire(import.meta.url);",
  },
  logLevel: "info",
});

fs.writeFileSync(
  path.join(funcDir, ".vc-config.json"),
  `${JSON.stringify(
    {
      runtime: "nodejs20.x",
      handler: "index.js",
      launcherType: "Nodejs",
      shouldAddHelpers: true,
      supportsResponseStreaming: true,
    },
    null,
    2,
  )}\n`,
);

fs.writeFileSync(
  path.join(outputDir, "config.json"),
  `${JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: "filesystem" },
        { src: "/api(?:/(.*))?", dest: "/api/[...path]" },
        { src: "/(.*)", dest: "/index.html" },
      ],
    },
    null,
    2,
  )}\n`,
);

console.log(
  `Build ready:\n- public/index.html ✓\n- .vercel/output/static ✓\n- api/[...path].func ✓`,
);
