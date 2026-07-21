#!/usr/bin/env node
/**
 * Production build for Vercel (@vercel/static-build) and local preview.
 * Output: ./web/index.html
 *
 * Using vercel.json "builds" ignores conflicting Project Settings
 * (Output Directory / Framework Preset).
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "web");

execSync("npx vite build", { stdio: "inherit", cwd: root });

const indexPath = path.join(outDir, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("Build failed: web/index.html was not created.");
  process.exit(1);
}

console.log(
  `Build ready: web/ (${fs.readdirSync(outDir).length} entries, index.html ✓)`,
);
