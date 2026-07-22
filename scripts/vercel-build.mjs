#!/usr/bin/env node
/**
 * Frontend production build for Vercel.
 * Builds apps/web → apps/web/public, then mirrors to ./public
 * so Project Settings that still require "public" also succeed.
 * Do NOT gitignore either output directory.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const webRoot = path.join(repoRoot, "apps/web");
const webOut = path.join(webRoot, "public");
const rootPublic = path.join(repoRoot, "public");

execSync("npx vite build", { stdio: "inherit", cwd: webRoot });

const indexPath = path.join(webOut, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("Build failed: apps/web/public/index.html was not created.");
  process.exit(1);
}

fs.rmSync(rootPublic, { recursive: true, force: true });
fs.cpSync(webOut, rootPublic, { recursive: true });

console.log(
  `Build ready: apps/web/public/ + public/ (${fs.readdirSync(webOut).length} entries, index.html ✓)`,
);
