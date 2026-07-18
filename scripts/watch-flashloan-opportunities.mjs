#!/usr/bin/env node
/**
 * Real-time flashloan opportunity watcher.
 *
 * Subscribes to new blocks over websocket (per chain, with polling fallback),
 * re-runs the read-only live quote scan, and pushes qualified opportunities to
 * Slack immediately — triggering the multi-agent discussion thread.
 *
 * Recommend-only: never signs, submits, or executes transactions.
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { createPublicClient, webSocket } from "viem";
import { arbitrum, base, optimism } from "viem/chains";
import {
  loadConfig,
  postSlackMessage,
  resolveAgent,
  resolveSlackChannel,
} from "./mor-slack-delivery-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const DELIVER_SCRIPT = path.join(__dirname, "deliver-slack-flashloan-opportunities.mjs");
const CONFIG_PATH =
  process.env.OPENCLAW_CONFIG_PATH ??
  path.join(REPO_ROOT, "integrations/openclaw/openclaw.json");

for (const envPath of [
  path.join(REPO_ROOT, "integrations/openclaw/subagents.env"),
  path.join(REPO_ROOT, ".env"),
  path.join(REPO_ROOT, "openclaw/.env"),
]) {
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
}

const WS_CHAINS = [
  {
    id: "arbitrum",
    chain: arbitrum,
    wsEnv: "ARBITRUM_WS_URL",
    defaultWs: "wss://arbitrum-one-rpc.publicnode.com",
  },
  {
    id: "base",
    chain: base,
    wsEnv: "BASE_WS_URL",
    defaultWs: "wss://base-rpc.publicnode.com",
  },
  {
    id: "optimism",
    chain: optimism,
    wsEnv: "OPTIMISM_WS_URL",
    defaultWs: "wss://optimism-rpc.publicnode.com",
  },
];

function parseArgs(argv) {
  const options = {
    to: process.env.SLACK_ALERT_USER_ID ?? "",
    channelId: process.env.SLACK_ALERT_CHANNEL_ID ?? "",
    providerId: process.env.FLASHLOAN_PROVIDER_ID ?? "aave-v3",
    intervalMs: Math.max(
      10_000,
      Number(process.env.FLASHLOAN_WATCH_INTERVAL_MS ?? 30_000) || 30_000,
    ),
    cooldownMs: Math.max(
      60_000,
      Number(process.env.FLASHLOAN_WATCH_COOLDOWN_MS ?? 900_000) || 900_000,
    ),
    once: false,
    discuss: true,
    startupPing: true,
  };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--to") options.to = argv[++index] ?? "";
    else if (arg === "--channel") options.channelId = argv[++index] ?? "";
    else if (arg === "--provider") options.providerId = argv[++index] ?? "aave-v3";
    else if (arg === "--interval") {
      options.intervalMs = Math.max(10_000, (Number(argv[++index]) || 30) * 1000);
    } else if (arg === "--once") options.once = true;
    else if (arg === "--no-discuss") options.discuss = false;
    else if (arg === "--no-startup-ping") options.startupPing = false;
  }
  return options;
}

function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

/** route → last alert timestamp, so repeat quotes do not spam Slack. */
const alertedRoutes = new Map();

function filterNewOpportunities(opportunities, cooldownMs) {
  const now = Date.now();
  const fresh = [];
  for (const opportunity of opportunities) {
    const key = `${opportunity.chain ?? "?"}:${opportunity.route}`;
    const lastAlerted = alertedRoutes.get(key) ?? 0;
    if (now - lastAlerted >= cooldownMs) {
      alertedRoutes.set(key, now);
      fresh.push(opportunity);
    }
  }
  return fresh;
}

async function evaluateOpportunities(apiBase) {
  const response = await fetch(`${apiBase}/agents/flashloan-opportunities/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ forceRefresh: true }),
  });
  if (!response.ok) {
    throw new Error(`evaluate HTTP ${response.status}`);
  }
  return response.json();
}

function deliverToSlack(options) {
  return new Promise((resolve, reject) => {
    const args = [DELIVER_SCRIPT, "--provider", options.providerId];
    if (options.channelId) args.push("--channel", options.channelId);
    if (options.to) args.push("--to", options.to);
    if (!options.discuss) args.push("--no-discuss");
    const child = spawn(process.execPath, args, {
      cwd: REPO_ROOT,
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`deliver exited ${code}`)),
    );
    child.on("error", reject);
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const apiBase = (process.env.MOR_API_BASE ?? "http://localhost:3001/api").replace(
    /\/$/,
    "",
  );
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN is required");
  if (!options.to && !options.channelId) {
    throw new Error("Set SLACK_ALERT_USER_ID or SLACK_ALERT_CHANNEL_ID");
  }

  // Websocket block streams — each new block can trigger an early rescan.
  const wsStatus = [];
  let scanRequested = false;
  const requestScan = () => {
    scanRequested = true;
  };
  const unwatchers = [];
  for (const entry of WS_CHAINS) {
    const wsUrl = process.env[entry.wsEnv]?.trim() || entry.defaultWs;
    try {
      const client = createPublicClient({
        chain: entry.chain,
        transport: webSocket(wsUrl, { retryCount: 3 }),
      });
      const unwatch = client.watchBlockNumber({
        emitOnBegin: false,
        onBlockNumber: () => requestScan(),
        onError: () => {},
      });
      unwatchers.push(unwatch);
      wsStatus.push(`${entry.id}: websocket`);
    } catch {
      wsStatus.push(`${entry.id}: polling`);
    }
  }

  log(`Watcher online — ${wsStatus.join(" · ")}`);
  log(
    `Scan every ${options.intervalMs / 1000}s (block-stream triggered, debounced) · re-alert cooldown ${options.cooldownMs / 60000}m`,
  );

  if (options.startupPing) {
    try {
      const cfg = loadConfig(CONFIG_PATH);
      const agent = resolveAgent(cfg, "mor-smart-router");
      const channel = await resolveSlackChannel({
        channelId: options.channelId,
        userId: options.to,
        token,
      });
      await postSlackMessage({
        channel,
        text: [
          "*Flashloan Opportunity Watcher* — online (recommend only)",
          `Streams: ${wsStatus.join(" · ")}`,
          `Scanning Arbitrum, Base, Optimism every ${options.intervalMs / 1000}s; qualified opportunities post here instantly and open an agent discussion.`,
        ].join("\n"),
        name: agent.name,
        avatar: agent.avatar,
        token,
      });
    } catch (error) {
      log(`Startup ping failed: ${error.message}`);
    }
  }

  let scanning = false;
  let lastScanAt = 0;

  const runScan = async (reason) => {
    if (scanning) return;
    scanning = true;
    lastScanAt = Date.now();
    try {
      const result = await evaluateOpportunities(apiBase);
      const found = result.opportunitiesFound ?? 0;
      const scanned = result.liveQuoteScan
        ? `${result.liveQuoteScan.quotesSucceeded}/${result.liveQuoteScan.quotesAttempted} quotes · chains ${(result.liveQuoteScan.chainsScanned ?? []).join(",")}`
        : "no live scan";
      log(`Scan (${reason}): ${found} qualified · ${scanned}`);

      if (found > 0) {
        const fresh = filterNewOpportunities(
          result.opportunities ?? [],
          options.cooldownMs,
        );
        if (fresh.length > 0) {
          log(
            `→ Posting ${fresh.length} new opportunity route(s) to Slack + agent discussion`,
          );
          await deliverToSlack(options);
        } else {
          log("→ Opportunities still in cooldown; not re-posting.");
        }
      }
    } catch (error) {
      log(`Scan failed: ${error.message}`);
    } finally {
      scanning = false;
    }
  };

  await runScan("startup");
  if (options.once) {
    for (const unwatch of unwatchers) unwatch();
    return;
  }

  // Debounce loop: new blocks request a scan; at most one scan per interval.
  setInterval(() => {
    if (Date.now() - lastScanAt < options.intervalMs) return;
    const reason = scanRequested ? "block-stream" : "interval";
    scanRequested = false;
    void runScan(reason);
  }, 1_000);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
