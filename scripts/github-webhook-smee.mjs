#!/usr/bin/env node
/**
 * Forward GitHub webhooks via smee.io (no ngrok account required).
 *
 * 1. Open https://smee.io/new → copy your channel URL
 * 2. Add to .env: SMEE_WEBHOOK_URL=https://smee.io/xxxxxxxx
 * 3. GitHub webhook Payload URL = that same smee.io URL
 * 4. npm run github:tunnel:smee
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

for (const envPath of [path.join(REPO_ROOT, ".env"), path.join(REPO_ROOT, "openclaw/.env")]) {
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
}

const PORT = Number(process.env.GITHUB_TUNNEL_PORT ?? 3001);
const smeeUrl = process.env.SMEE_WEBHOOK_URL?.trim();
const target = `http://127.0.0.1:${PORT}/api/github/webhook`;

async function checkLocalApi() {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  if (!smeeUrl || !smeeUrl.startsWith("https://smee.io/")) {
    console.error(`
SMEE_WEBHOOK_URL is not set.

Steps:
  1. Open https://smee.io/new
  2. Copy the channel URL (https://smee.io/xxxxxxxx)
  3. Add to .env:
       SMEE_WEBHOOK_URL=https://smee.io/xxxxxxxx
  4. In GitHub → Settings → Webhooks, set Payload URL to that SAME smee.io URL
  5. Run: npm run github:tunnel:smee
`);
    process.exit(1);
  }

  const apiUp = await checkLocalApi();
  if (!apiUp) {
    console.warn(`Warning: API not responding on http://localhost:${PORT}`);
    console.warn("Start it first: npm run dev:server\n");
  } else {
    console.log(`API OK on http://localhost:${PORT}\n`);
  }

  console.log("═".repeat(60));
  console.log("GitHub webhook URL (paste into GitHub → Settings → Webhooks):");
  console.log();
  console.log(`  ${smeeUrl}`);
  console.log();
  console.log(`Forwarding → ${target}`);
  console.log("Secret: same as GITHUB_WEBHOOK_SECRET in .env");
  console.log("═".repeat(60));
  console.log("\nStarting smee client… Press Ctrl+C to stop.\n");

  const child = spawn(
    "npx",
    ["--yes", "smee-client", "--url", smeeUrl, "--target", target, "--path", "/api/github/webhook"],
    { stdio: "inherit", cwd: REPO_ROOT },
  );

  child.on("exit", (code) => process.exit(code ?? 0));
  process.on("SIGINT", () => child.kill("SIGTERM"));
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
