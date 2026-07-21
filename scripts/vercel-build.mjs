#!/usr/bin/env node
/**
 * Production build for Vercel.
 * Writes ./web (vite outDir) and mirrors to ./public so Project Settings
 * that still require "public" also succeed.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const webDir = path.join(root, "web");
const publicDir = path.join(root, "public");

execSync("npx vite build", { stdio: "inherit", cwd: root });

const indexPath = path.join(webDir, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("Build failed: web/index.html was not created.");
  process.exit(1);
}

fs.rmSync(publicDir, { recursive: true, force: true });
fs.cpSync(webDir, publicDir, { recursive: true });

console.log(
  `Build ready: web/ + public/ (${fs.readdirSync(webDir).length} entries, index.html ✓)`,
);
