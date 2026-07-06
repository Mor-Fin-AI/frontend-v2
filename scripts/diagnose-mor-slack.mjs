#!/usr/bin/env node
/**
 * Quick checks for MOR Slack slash setup.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { dispatchMorSlackSlash } from "./mor-slack-slash.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..");

for (const envPath of [
  path.join(REPO, "integrations/openclaw/subagents.env"),
  path.join(REPO, "openclaw/.env"),
]) {
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
}

const user = process.env.SLACK_ALERT_USER_ID ?? "";
const token = process.env.SLACK_BOT_TOKEN ?? "";

console.log("MOR Slack slash diagnostics\n");
console.log(`  MOR_REPO:            ${process.env.MOR_REPO ?? REPO}`);
console.log(`  SLACK_BOT_TOKEN:     ${token ? "set" : "MISSING"}`);
console.log(`  SLACK_ALERT_USER_ID: ${user || "MISSING"}`);
console.log(`  Gateway config:      ${process.env.OPENCLAW_CONFIG_PATH ?? "integrations/openclaw/openclaw.json"}`);

if (!token || !user) {
  console.error("\n❌ Set SLACK_BOT_TOKEN and SLACK_ALERT_USER_ID in openclaw/.env");
  process.exit(1);
}

console.log("\n→ Dispatch test (background mor-pnl)…");
const result = dispatchMorSlackSlash({
  skillName: "mor-pnl",
  message: "diagnostic slash test",
  userId: user,
  background: true,
});
console.log(`  Started pid ${result.pid} → ${result.targetLabel}`);
console.log("\n✅ If gateway is running, check Slack DM for MOR PnL Intel within ~30s.");
console.log("\nSlash commands (underscores):");
for (const cmd of [
  "/mor_pnl",
  "/mor_risk",
  "/mor_roundtable",
  "/mor_review",
  "/mor_brief",
  "/mor_finance",
]) {
  console.log(`  ${cmd}`);
}
console.log("\nIf slash fails in Slack:");
console.log("  1. Reinstall app from docs/agents/slack-app-manifest.json");
console.log("  2. Restart gateway: npm run openclaw:gateway");
console.log("  3. Use /mor_finance (full name), not /mor_finan");
