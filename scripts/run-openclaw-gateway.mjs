#!/usr/bin/env node
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const INTEGRATION_DIR = path.join(REPO_ROOT, "integrations/openclaw");
const CONFIG_PATH = path.join(INTEGRATION_DIR, "openclaw.json");
const STATE_DIR = path.join(INTEGRATION_DIR, "state");
const SUBAGENTS_ENV = path.join(INTEGRATION_DIR, "subagents.env");
const OPENCLAW_DIR = path.join(REPO_ROOT, "openclaw");
const PORT = process.env.OPENCLAW_PORT ?? "18789";

if (!fs.existsSync(CONFIG_PATH)) {
  console.error("Missing integrations/openclaw/openclaw.json — run: npm run openclaw:setup");
  process.exit(1);
}

if (fs.existsSync(SUBAGENTS_ENV)) {
  dotenv.config({ path: SUBAGENTS_ENV });
}
const ROOT_ENV = path.join(REPO_ROOT, ".env");
if (fs.existsSync(ROOT_ENV)) {
  dotenv.config({ path: ROOT_ENV });
}
const OPENCLAW_ENV = path.join(OPENCLAW_DIR, ".env");
if (fs.existsSync(OPENCLAW_ENV)) {
  dotenv.config({ path: OPENCLAW_ENV });
}

const env = {
  ...process.env,
  OPENCLAW_CONFIG_PATH: CONFIG_PATH,
  OPENCLAW_STATE_DIR: STATE_DIR,
  MOR_REPO: process.env.MOR_REPO ?? REPO_ROOT,
  MOR_API_BASE: process.env.MOR_API_BASE ?? "http://localhost:3001/api",
  MOR_DASHBOARD_URL: process.env.MOR_DASHBOARD_URL ?? "http://localhost:5173",
};

function run(cmd, args, cwd) {
  const child = spawn(cmd, args, { cwd, env, stdio: "inherit", shell: false });
  child.on("exit", (code) => process.exit(code ?? 0));
}

const localCli = path.join(OPENCLAW_DIR, "openclaw.mjs");
if (process.env.OPENCLAW_USE_LOCAL === "1" && fs.existsSync(localCli)) {
  run(process.execPath, [localCli, "gateway", "--port", PORT], OPENCLAW_DIR);
} else {
  run("openclaw", ["gateway", "--port", PORT], REPO_ROOT);
}
