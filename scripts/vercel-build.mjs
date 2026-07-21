#!/usr/bin/env node
/**
 * Production build for Vercel.
 *
 * 1) Vite → ./web
 * 2) Emit Vercel Build Output API → ./.vercel/output
 *
 * Build Output API ignores Project Settings "Output Directory", which was
 * causing empty deploys and platform 404 NOT_FOUND.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const webDir = path.join(root, "web");
const outputRoot = path.join(root, ".vercel", "output");
const staticDir = path.join(outputRoot, "static");

execSync("npx vite build", { stdio: "inherit", cwd: root });

const indexPath = path.join(webDir, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("Build failed: web/index.html was not created.");
  process.exit(1);
}

fs.rmSync(outputRoot, { recursive: true, force: true });
fs.mkdirSync(staticDir, { recursive: true });
fs.cpSync(webDir, staticDir, { recursive: true });

const config = {
  version: 3,
  routes: [
    {
      src: "/assets/(.*)",
      headers: { "cache-control": "public, max-age=31536000, immutable" },
      continue: true,
    },
    { handle: "filesystem" },
    { src: "/(.*)", dest: "/index.html" },
  ],
};

fs.writeFileSync(
  path.join(outputRoot, "config.json"),
  `${JSON.stringify(config, null, 2)}\n`,
);

if (!fs.existsSync(path.join(staticDir, "index.html"))) {
  console.error("Build failed: .vercel/output/static/index.html missing.");
  process.exit(1);
}

console.log(
  `Build Output API ready: .vercel/output/static/ (${fs.readdirSync(staticDir).length} entries)`,
);
