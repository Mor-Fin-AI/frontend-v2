#!/usr/bin/env node
/**
 * Install MOR OpenClaw cron jobs — each agent posts to Slack on its own schedule.
 * Specialists use deliver-slack-agent.mjs (custom name + avatar + assistant thread).
 * Main orchestrator jobs spawn all specialists and synthesize.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const MANIFEST_PATH = path.join(REPO_ROOT, "docs/agents/manifest.json");
const CONFIG_PATH =
  process.env.OPENCLAW_CONFIG_PATH ??
  path.join(REPO_ROOT, "integrations/openclaw/openclaw.json");

for (const envPath of [
  path.join(REPO_ROOT, "integrations/openclaw/subagents.env"),
  path.join(REPO_ROOT, "openclaw/.env"),
]) {
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
}

const STATE_DIR =
  process.env.OPENCLAW_STATE_DIR ??
  path.join(REPO_ROOT, "integrations/openclaw/state");

const SLACK_USER = process.env.SLACK_ALERT_USER_ID ?? "";
const SLACK_CHANNEL = process.env.SLACK_ALERT_CHANNEL_ID ?? "";
const TZ = process.env.MOR_CRON_TZ ?? process.env.TZ ?? "";
const FORCE = process.argv.includes("--force");
const CLEANUP_LEGACY = !process.argv.includes("--no-cleanup-legacy");
const DEVICE_AUTH_PATH = path.join(STATE_DIR, "identity", "device-auth.json");
const DEVICE_ID_PATH = path.join(STATE_DIR, "identity", "device.json");
const DEVICE_AUTH_BACKUP = `${DEVICE_AUTH_PATH}.cron-install-backup`;
const DEVICE_ID_BACKUP = `${DEVICE_ID_PATH}.cron-install-backup`;

function gatewayToken() {
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    return cfg.gateway?.auth?.token ?? process.env.OPENCLAW_GATEWAY_TOKEN ?? "";
  } catch {
    return process.env.OPENCLAW_GATEWAY_TOKEN ?? "";
  }
}

const GATEWAY_TOKEN = gatewayToken();

if (!SLACK_USER && !SLACK_CHANNEL) {
  console.error("Set SLACK_ALERT_USER_ID (DM) or SLACK_ALERT_CHANNEL_ID (channel)");
  process.exit(1);
}

const DELIVER_TO = SLACK_CHANNEL ? SLACK_CHANNEL : SLACK_USER;
const SLACK_TO_ARG = SLACK_CHANNEL ? `channel:${SLACK_CHANNEL}` : `user:${SLACK_USER}`;

const EXTRA_JOBS = [
  {
    id: "mor-cron-engineering-standup",
    name: "MOR Engineering Standup",
    agentId: "main",
    schedule: "0 8 * * 1-5",
    kind: "roundtable",
    prompt:
      "MOR engineering standup roundtable: overnight signal changes, data freshness, route quality shifts, risk posture, top 3 engineering actions. No revenue or PnL rollup. Never execute trades.",
  },
  {
    id: "mor-cron-engineering-digest",
    name: "MOR Engineering Digest",
    agentId: "main",
    schedule: "0 18 * * 1-5",
    kind: "roundtable",
    prompt:
      "MOR engineering digest roundtable: what improved/degraded in intelligence quality, agent disagreements, failure diagnostics, tomorrow engineering priorities. No financial performance rollup. Never execute trades.",
  },
  {
    id: "mor-cron-risk-watch",
    name: "MOR Risk Watch (30m)",
    agentId: "mor-dd-risk",
    schedule: "*/30 * * * *",
    kind: "deliver",
    prompt:
      "MOR DD/Risk watch: GET /api/agents/context. Borrow/lending health, utilization, failure rate. Output APPROVE, REDUCE, or BLOCK. No PnL rollup.",
  },
];

/** Legacy ad-hoc jobs (wrong channel / too aggressive) — removed on install when CLEANUP_LEGACY. */
const LEGACY_JOB_PATTERNS = [
  /proj-agent/i,
  /every 30s/i,
  /every 1m/i,
  /every 2m/i,
  /mor-pnl-report-every-2m/i,
  /morning standup/i,
  /evening rollup/i,
  /pnl route alert/i,
  /full intelligence brief/i,
  /revenue/i,
  /profit rollup/i,
];

function loadManifestJobs() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  const fromManifest = (manifest.slack?.alertCronJobs ?? []).map((job) => ({
    id: job.id,
    name: job.name,
    agentId: job.agentId,
    schedule: job.schedule,
    prompt: job.prompt,
    kind:
      job.delivery === "roundtable"
        ? "roundtable"
        : job.delivery === "slack-deliver" || (job.agentId !== "main" && job.agentId)
          ? "deliver"
          : job.agentId === "main"
            ? "roundtable"
            : "deliver",
  }));

  const githubWorkflowJobs = (manifest.githubSlack?.cronJobs ?? []).map((job) => ({
    id: job.id,
    name: job.name,
    agentId: job.agentId ?? "main",
    schedule: job.schedule,
    prompt: job.prompt,
    workflowId: job.workflowId,
    kind: "github-workflow",
  }));

  return [...fromManifest, ...EXTRA_JOBS, ...githubWorkflowJobs];
}

function withSharedSecretGatewayAuth(fn) {
  const moved = [];
  try {
    for (const [from, to] of [
      [DEVICE_AUTH_PATH, DEVICE_AUTH_BACKUP],
      [DEVICE_ID_PATH, DEVICE_ID_BACKUP],
    ]) {
      if (fs.existsSync(from)) {
        fs.renameSync(from, to);
        moved.push([from, to]);
      }
    }
    return fn();
  } finally {
    for (const [from, to] of moved) {
      if (fs.existsSync(to)) {
        fs.renameSync(to, from);
      }
    }
  }
}

function runOpenClaw(args) {
  const env = {
    ...process.env,
    OPENCLAW_CONFIG_PATH: CONFIG_PATH,
    OPENCLAW_STATE_DIR: STATE_DIR,
    MOR_REPO: REPO_ROOT,
    ...(GATEWAY_TOKEN ? { OPENCLAW_GATEWAY_TOKEN: GATEWAY_TOKEN } : {}),
  };
  const fullArgs =
    GATEWAY_TOKEN && !args.includes("--token") ? [...args, "--token", GATEWAY_TOKEN] : args;
  const result = spawnSync("openclaw", fullArgs, {
    cwd: REPO_ROOT,
    env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const out = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  return { ok: result.status === 0, out, code: result.status ?? 1 };
}

function runOpenClawCron(args) {
  return withSharedSecretGatewayAuth(() => runOpenClaw(args));
}

function listJobs() {
  const { ok, out } = runOpenClawCron(["cron", "list", "--json"]);
  if (!ok) {
    console.warn("Could not list cron jobs (is the gateway running?):", out.slice(0, 200));
    return [];
  }
  try {
    const parsed = JSON.parse(out);
    return Array.isArray(parsed) ? parsed : (parsed.jobs ?? []);
  } catch {
    return [];
  }
}

function removeJobByName(name, existing) {
  const match = existing.find((j) => j.name === name);
  if (!match?.id) return;
  console.log(`  remove existing: ${name}`);
  runOpenClawCron(["cron", "remove", match.id]);
}

function removeLegacyJobs(existing) {
  if (!CLEANUP_LEGACY) return 0;
  let removed = 0;
  for (const job of existing) {
    if (!LEGACY_JOB_PATTERNS.some((re) => re.test(job.name ?? ""))) continue;
    console.log(`  remove legacy: ${job.name}`);
    const result = runOpenClawCron(["cron", "remove", job.id]);
    if (result.ok) removed++;
  }
  return removed;
}

function installAgentJob(job) {
  const args = [
    "cron",
    "create",
    job.schedule,
    job.prompt,
    "--name",
    job.name,
    "--agent",
    job.agentId,
    "--session",
    "isolated",
    "--announce",
    "--channel",
    "slack",
    "--to",
    SLACK_TO_ARG,
    "--best-effort-deliver",
  ];
  if (TZ) args.push("--tz", TZ);
  return runOpenClawCron(args);
}

function installDeliverJob(job) {
  const argv = [
    "node",
    path.join(REPO_ROOT, "scripts/deliver-slack-agent.mjs"),
    job.agentId,
    job.prompt,
    "--to",
    DELIVER_TO,
    "--no-followup",
  ];

  const args = [
    "cron",
    "create",
    job.schedule,
    "--name",
    job.name,
    "--agent",
    job.agentId,
    "--command-argv",
    JSON.stringify(argv),
    "--command-cwd",
    REPO_ROOT,
    "--no-deliver",
  ];
  if (TZ) args.push("--tz", TZ);
  return runOpenClawCron(args);
}

function installRoundtableJob(job) {
  const argv = [
    "node",
    path.join(REPO_ROOT, "scripts/deliver-slack-roundtable.mjs"),
    job.prompt,
    "--to",
    DELIVER_TO,
  ];

  const args = [
    "cron",
    "create",
    job.schedule,
    "--name",
    job.name,
    "--agent",
    job.agentId,
    "--command-argv",
    JSON.stringify(argv),
    "--command-cwd",
    REPO_ROOT,
    "--no-deliver",
  ];
  if (TZ) args.push("--tz", TZ);
  return runOpenClawCron(args);
}

function installGithubWorkflowJob(job) {
  const argv = [
    "node",
    path.join(REPO_ROOT, "scripts/deliver-slack-github-workflow.mjs"),
    "--workflow",
    job.workflowId,
    job.prompt,
  ];

  const args = [
    "cron",
    "create",
    job.schedule,
    "--name",
    job.name,
    "--agent",
    job.agentId ?? "main",
    "--command-argv",
    JSON.stringify(argv),
    "--command-cwd",
    REPO_ROOT,
    "--no-deliver",
  ];
  if (TZ) args.push("--tz", TZ);
  return runOpenClawCron(args);
}

async function main() {
  let existing = listJobs();
  const legacyRemoved = removeLegacyJobs(existing);
  if (legacyRemoved > 0) {
    existing = listJobs();
    console.log(`Removed ${legacyRemoved} legacy cron job(s)\n`);
  }

  const jobs = loadManifestJobs();
  const existingNames = new Set(existing.map((j) => j.name));

  console.log("MOR cron install");
  console.log(`  Target: ${SLACK_CHANNEL ? `channel ${SLACK_CHANNEL}` : `DM ${SLACK_USER}`}`);
  console.log(`  Jobs:   ${jobs.length}`);
  if (TZ) console.log(`  TZ:     ${TZ}`);
  console.log("");

  let installed = 0;
  let skipped = 0;
  let failed = 0;

  for (const job of jobs) {
    if (existingNames.has(job.name) && !FORCE) {
      console.log(`⊘ skip (exists): ${job.name}`);
      skipped++;
      continue;
    }
    if (existingNames.has(job.name) && FORCE) {
      removeJobByName(job.name, existing);
    }

    console.log(`→ ${job.name}`);
    console.log(`    ${job.schedule} | ${job.agentId} | ${job.kind}`);

    const result =
      job.kind === "deliver"
        ? installDeliverJob(job)
        : job.kind === "roundtable"
          ? installRoundtableJob(job)
          : job.kind === "github-workflow"
            ? installGithubWorkflowJob(job)
            : installAgentJob(job);

    if (result.ok) {
      console.log("    ✓ installed");
      installed++;
      existingNames.add(job.name);
    } else {
      const lines = result.out.split("\n").filter(Boolean);
      const errLine =
        lines.find((line) => /failed|error|rejected|unknown/i.test(line)) ??
        lines.at(-1) ??
        "unknown error";
      console.log(`    ✗ failed: ${errLine}`);
      failed++;
    }
  }

  console.log("");
  console.log(`Done: ${installed} installed, ${skipped} skipped, ${failed} failed`);
  console.log("List: openclaw cron list");
  console.log("Runs: openclaw cron runs --limit 10");
  if (skipped > 0) console.log("Reinstall all: npm run openclaw:cron:install -- --force");

  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
