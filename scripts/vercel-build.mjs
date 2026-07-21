#!/usr/bin/env node
/**
 * Vercel / local production build.
 * Vite writes the SPA into `public/` (Vercel Project Output Directory).
 * Do NOT write `.vercel/output` here — that switches Vercel into Build Output
 * API mode and then fails Project Settings checks for `public`.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const publicDir = path.join(root, "public");

execSync("npx vite build", { stdio: "inherit", cwd: root });

const indexPath = path.join(publicDir, "index.html");
if (!fs.existsSync(indexPath)) {
  console.error("Build failed: public/index.html was not created.");
  process.exit(1);
}

const entries = fs.readdirSync(publicDir);
console.log(`Build ready: public/ (${entries.length} entries, index.html ✓)`);
