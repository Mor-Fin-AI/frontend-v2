#!/usr/bin/env node
/**
 * Production build for Vercel.
 * Output: ./public (must NOT be gitignored — Vercel skips gitignored output dirs)
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outDir = path.join(root, "public");

execSync("npx vite build", { stdio: "inherit", cwd: root });

const indexPath = path.join(outDir, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("Build failed: public/index.html was not created.");
  process.exit(1);
}

console.log(
  `Build ready: public/ (${fs.readdirSync(outDir).length} entries, index.html ✓)`,
);
