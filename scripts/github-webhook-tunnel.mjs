#!/usr/bin/env node
/**
 * Expose local API (port 3001) for GitHub webhooks via ngrok.
 * Prints the webhook URL to paste into GitHub → Settings → Webhooks.
 */
import { spawn, spawnSync } from "node:child_process";

const PORT = Number(process.env.GITHUB_TUNNEL_PORT ?? 3001);
const NGROK_API = "http://127.0.0.1:4040/api/tunnels";
const MAX_WAIT_MS = 30_000;

function ensureNgrok() {
  const check = spawnSync("ngrok", ["version"], { encoding: "utf8" });
  if (check.error || check.status !== 0) {
    console.error(`
ngrok is not installed.

Install:
  brew install ngrok

Or sign up at https://ngrok.com and follow their install docs.
Then run: npm run github:tunnel
`);
    process.exit(1);
  }
}

async function waitForTunnel() {
  const started = Date.now();
  while (Date.now() - started < MAX_WAIT_MS) {
    try {
      const res = await fetch(NGROK_API);
      if (!res.ok) {
        await sleep(400);
        continue;
      }
      const data = await res.json();
      const tunnels = data.tunnels ?? [];
      const https =
        tunnels.find((t) => t.proto === "https" && String(t.public_url).startsWith("https://")) ??
        tunnels.find((t) => String(t.public_url).startsWith("https://"));
      if (https?.public_url) return String(https.public_url).replace(/\/$/, "");
    } catch {
      // ngrok API not ready yet
    }
    await sleep(400);
  }
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkLocalApi() {
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/api/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  ensureNgrok();

  const apiUp = await checkLocalApi();
  if (!apiUp) {
    console.warn(`Warning: API not responding on http://localhost:${PORT}`);
    console.warn("Start it first: npm run dev:server   (or npm run dev)\n");
  } else {
    console.log(`API OK on http://localhost:${PORT}\n`);
  }

  console.log(`Starting ngrok tunnel → localhost:${PORT} ...\n`);

  const ngrok = spawn("ngrok", ["http", String(PORT)], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  let authHintPrinted = false;
  ngrok.stderr.on("data", (chunk) => {
    const line = String(chunk).trim();
    if (line) console.error(`[ngrok] ${line}`);
    if (!authHintPrinted && line.includes("ERR_NGROK_4018")) {
      authHintPrinted = true;
      console.error(`
ngrok needs a free account token (one-time setup):

  1. Sign up: https://dashboard.ngrok.com/signup
  2. Copy authtoken: https://dashboard.ngrok.com/get-started/your-authtoken
  3. Run: ngrok config add-authtoken <YOUR_TOKEN>
  4. Retry: npm run github:tunnel

No ngrok account? Use smee.io instead:
  1. https://smee.io/new → copy URL → SMEE_WEBHOOK_URL in .env
  2. npm run github:tunnel:smee
`);
    }
  });

  ngrok.on("error", (err) => {
    console.error(`Failed to start ngrok: ${err.message}`);
    process.exit(1);
  });

  ngrok.on("exit", (code) => {
    if (code !== 0 && code !== null) {
      console.error(`ngrok exited with code ${code}`);
      process.exit(code ?? 1);
    }
  });

  const publicUrl = await waitForTunnel();
  if (!publicUrl) {
    console.error("Timed out waiting for ngrok tunnel. Check ngrok auth: ngrok config add-authtoken <token>");
    ngrok.kill("SIGTERM");
    process.exit(1);
  }

  const webhookUrl = `${publicUrl}/api/github/webhook`;

  console.log("═".repeat(60));
  console.log("GitHub webhook URL (paste into GitHub → Settings → Webhooks):");
  console.log();
  console.log(`  ${webhookUrl}`);
  console.log();
  console.log("Settings:");
  console.log("  Content type: application/json");
  console.log("  Secret:       same as GITHUB_WEBHOOK_SECRET in .env");
  console.log("  Events:       Pull requests, Issues, Pushes, Issue comments (or all)");
  console.log();
  console.log("Local dashboard: http://127.0.0.1:4040");
  console.log("═".repeat(60));
  console.log("\nTunnel running. Press Ctrl+C to stop.\n");

  process.on("SIGINT", () => {
    ngrok.kill("SIGTERM");
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    ngrok.kill("SIGTERM");
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
