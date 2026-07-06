#!/usr/bin/env node
/**
 * Unified MOR Slack slash dispatcher — channel or DM, specialist or roundtable.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");

for (const envPath of [
  path.join(REPO_ROOT, "integrations/openclaw/subagents.env"),
  path.join(REPO_ROOT, "openclaw/.env"),
]) {
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
}

const SKILL_ROUTES = {
  "mor-pnl": { mode: "agent", agentId: "mor-pnl", followup: "all", hermesReview: true },
  "mor-smart-router": { mode: "agent", agentId: "mor-smart-router", followup: "all", hermesReview: true },
  "mor-risk": { mode: "agent", agentId: "mor-dd-risk", followup: "all", hermesReview: true },
  "mor-liquidity": { mode: "agent", agentId: "mor-liquidity", followup: "all", hermesReview: true },
  "mor-mode": { mode: "agent", agentId: "mor-market-mode", followup: "all", hermesReview: true },
  "mor-capital": { mode: "agent", agentId: "mor-capital-ladder", followup: "all", hermesReview: true },
  "mor-governance": { mode: "agent", agentId: "mor-governance", followup: "all", hermesReview: true },
  "mor-health": { mode: "agent", agentId: "mor-ops", followup: "all", hermesReview: true },
  "mor-brief": { mode: "brief" },
  "mor-finance": { mode: "brief" },
  "mor-roundtable": { mode: "roundtable" },
  "mor-review": { mode: "roundtable" },
  "mor-collab": { mode: "collab" },
  "mor-hermes": { mode: "agent", agentId: "mor-hermes", followup: "none", morResponse: true },
  "mor-agents": { mode: "github-workflow", workflow: "mor-agents" },
  "mor-audit": { mode: "github-workflow", workflow: "mor-audit" },
  "mor-github-events": { mode: "github-events" },
  "mor-suggestion": { mode: "github-workflow", workflow: "mor-suggestion" },
  "mor-codefix": { mode: "github-workflow", workflow: "mor-codefix" },
};

const DEFAULT_MESSAGES = {
  "mor-pnl": "Route quality scan — opportunity scoring, persistence, and failure patterns from /api/agents/context (no revenue rollup).",
  "mor-smart-router": "Smart router scan — ranked routes by execution probability and net profit from /api/agents/context smartRouter.",
  "mor-risk": "DD/Risk check — borrow/lending health, utilization, collateral, failure rate.",
  "mor-liquidity": "Liquidity analysis — pool depth, slippage risk, and safe sizing.",
  "mor-mode": "Market observations — classify deployment tier and cross-chain conditions.",
  "mor-capital": "Capital ladder — tier posture and allocation logic (engineering phase, no PnL rollup).",
  "mor-governance": "Governance scan — proposals, timelocks, and operational impact.",
  "mor-health": "Ops health — API status, data freshness, execution latency, failure diagnostics.",
  "mor-brief": "Engineering intelligence brief — ops, risk, routes, liquidity, data quality (no revenue rollup).",
  "mor-finance": "MOR engineering snapshot — intelligence layer health from live API context.",
  "mor-roundtable": "Engineering roundtable — specialists review, follow up, and summarize tensions.",
  "mor-review": "Full engineering intelligence review — roundtable with Commander synthesis.",
  "mor-collab": "Hermes ↔ MOR collaboration — full engineering dialogue with mentor review.",
  "mor-hermes": "Hermes mentor — code review; MOR Ops & Risk respond in thread.",
  "mor-agents": "MOR Agents channel — Hermes and specialists collaborate on engineering topics.",
  "mor-audit": "MOR Audit channel — code audit review with Hermes and MOR specialists.",
  "mor-github-events": "Post latest GitHub workflow status to mor-github-events channel.",
  "mor-suggestion": "MOR Suggestions channel — agents propose ranked project improvements.",
  "mor-codefix": "MOR Codefix channel — diagnose, plan fix, and prepare PR template (human approval required).",
};

function parseArgs(argv) {
  let skill = "";
  let message = "";
  let to = "";
  let channelId = "";
  let threadTs = "";
  let background = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--skill") skill = argv[++i] ?? "";
    else if (arg === "--to") to = argv[++i] ?? "";
    else if (arg === "--channel") channelId = argv[++i] ?? "";
    else if (arg === "--thread-ts") threadTs = argv[++i] ?? "";
    else if (arg === "--background") background = true;
    else if (!skill && !message) skill = arg;
    else message = message ? `${message} ${arg}` : arg;
  }
  return { skill, message, to, channelId, threadTs, background };
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function buildDeliverArgs({ route, message, to, channelId, threadTs }) {
  const text = message.trim() || DEFAULT_MESSAGES[route.skillName] || "MOR intelligence check.";
  const args = [];

  if (route.mode === "roundtable") {
    args.push(path.join(REPO_ROOT, "scripts/deliver-slack-roundtable.mjs"), text);
  } else if (route.mode === "collab") {
    args.push(path.join(REPO_ROOT, "scripts/deliver-slack-collab.mjs"), text);
  } else if (route.mode === "github-workflow") {
    args.push(
      path.join(REPO_ROOT, "scripts/deliver-slack-github-workflow.mjs"),
      "--workflow",
      route.workflow,
      text,
    );
  } else if (route.mode === "github-events") {
    args.push(
      path.join(REPO_ROOT, "scripts/deliver-slack-github-workflow.mjs"),
      "--workflow",
      "mor-github-events",
      text || "Manual GitHub events channel check — awaiting webhook activity.",
    );
  } else if (route.mode === "brief") {
    const briefMessage = [
      "MOR engineering intelligence brief for Slack (deployment phase — no revenue/PnL rollup):",
      text,
      "Pull GET /api/health and /api/agents/context.",
      "5–8 bullets: data freshness, route quality scores, liquidity, risk label, market tier, capital posture, governance, ops/infra.",
      "Include execution latency or failure patterns if present. End with top 3 engineering actions. Recommend only.",
    ].join(" ");
    args.push(
      path.join(REPO_ROOT, "scripts/deliver-slack-agent.mjs"),
      "main",
      briefMessage,
      "--followup",
      "none",
    );
  } else {
    args.push(
      path.join(REPO_ROOT, "scripts/deliver-slack-agent.mjs"),
      route.agentId,
      text,
      "--followup",
      route.followup ?? "all",
    );
    if (route.agentId === "mor-hermes" && route.morResponse !== false) {
      args.push("--mor-response");
    } else if (route.agentId && route.agentId !== "mor-hermes" && route.agentId !== "main") {
      args.push("--hermes-review");
    }
  }

  if (channelId) args.push("--channel", channelId);
  if (to) args.push("--to", to);
  if (threadTs) args.push("--thread-ts", threadTs);
  return args;
}

export function dispatchMorSlackSlash(params) {
  const skillName = String(params.skillName ?? params.skill ?? "").trim();
  const route = SKILL_ROUTES[skillName];
  if (!route) {
    throw new Error(`Unknown MOR slash skill: ${skillName}`);
  }

  const to = String(params.to ?? params.userId ?? "").trim();
  const channelId = String(params.channelId ?? "").trim();
  if (!to && !channelId) {
    throw new Error("Need --to <user> or --channel <C…>");
  }

  const message = String(params.message ?? params.command ?? "").trim();
  const threadTs = String(params.threadTs ?? "").trim();
  const args = buildDeliverArgs({
    route: { ...route, skillName },
    message,
    to,
    channelId,
    threadTs,
  });

  const child = spawn(process.execPath, args, {
    cwd: REPO_ROOT,
    env: {
      ...process.env,
      MOR_REPO: process.env.MOR_REPO ?? REPO_ROOT,
    },
    detached: Boolean(params.background),
    stdio: params.background ? "ignore" : "inherit",
  });
  if (params.background) child.unref();

  const targetLabel = channelId ? `channel ${channelId}` : `DM ${to}`;
  return {
    skillName,
    mode: route.mode,
    targetLabel,
    pid: child.pid,
    background: Boolean(params.background),
  };
}

async function main() {
  const { skill, message, to, channelId, threadTs, background } = parseArgs(
    process.argv.slice(2),
  );
  if (!skill) {
    console.error(
      "Usage: mor-slack-slash.mjs <skillName> [message] [--channel C…] [--to U…] [--thread-ts TS] [--background]",
    );
    process.exit(1);
  }

  const result = dispatchMorSlackSlash({
    skillName: skill,
    message,
    to,
    channelId,
    threadTs,
    background,
  });
  console.log(
    background
      ? `Started MOR ${result.mode} for ${result.targetLabel} (pid ${result.pid})`
      : `Finished MOR ${result.mode} for ${result.targetLabel}`,
  );
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message ?? err);
    process.exit(1);
  });
}
