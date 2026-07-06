#!/usr/bin/env node
/**
 * Hermes ↔ MOR Intelligence collaboration on Slack.
 * MOR specialists → Hermes mentor review → MOR response → Commander synthesis.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import {
  MOR_INTEL_ORDER,
  loadConfig,
  resolveSlackChannel,
  isSlackPublicChannel,
  resolveActiveThreadTs,
  runHermesMorCollaboration,
} from "./mor-slack-delivery-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH =
  process.env.OPENCLAW_CONFIG_PATH ??
  path.join(REPO_ROOT, "integrations/openclaw/openclaw.json");

for (const envPath of [
  path.join(REPO_ROOT, "integrations/openclaw/subagents.env"),
  path.join(REPO_ROOT, "openclaw/.env"),
]) {
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
}

function parseArgs(argv) {
  let message = "";
  let to = process.env.SLACK_ALERT_USER_ID ?? "";
  let channelId = process.env.SLACK_CHANNEL_ID ?? "";
  let threadTs = process.env.SLACK_THREAD_TS ?? "";
  let agents = [...MOR_INTEL_ORDER];
  let synthesize = true;
  let hermesReview = true;
  let morResponse = true;

  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--to") to = argv[++i] ?? "";
    else if (arg === "--channel") channelId = argv[++i] ?? "";
    else if (arg === "--thread-ts") threadTs = argv[++i] ?? "";
    else if (arg === "--agents") {
      agents = (argv[++i] ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (arg === "--no-synthesize") synthesize = false;
    else if (arg === "--no-hermes-review") hermesReview = false;
    else if (arg === "--no-mor-response") morResponse = false;
    else positional.push(arg);
  }

  message =
    positional.join(" ").trim() ||
    "Hermes ↔ MOR collaboration: engineering intelligence dialogue with mentor review.";

  return { message, to, channelId, threadTs, agents, synthesize, hermesReview, morResponse };
}

async function main() {
  const {
    message,
    to,
    channelId: channelIdArg,
    threadTs: threadTsArg,
    agents,
    synthesize,
    hermesReview,
    morResponse,
  } = parseArgs(process.argv.slice(2));

  if (!to && !channelIdArg) {
    console.error("Set SLACK_ALERT_USER_ID or pass --to <slack-user-id> or --channel <C…>");
    process.exit(1);
  }
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) {
    console.error("SLACK_BOT_TOKEN is required");
    process.exit(1);
  }

  const cfg = loadConfig(CONFIG_PATH);
  const channel = await resolveSlackChannel({ channelId: channelIdArg, userId: to, token });
  const threadTs =
    threadTsArg ||
    (isSlackPublicChannel(channel) ? "" : await resolveActiveThreadTs(channel, to, token));

  console.log(
    `→ Hermes ↔ MOR collab (${isSlackPublicChannel(channel) ? "channel" : "DM"}): ${agents.length} specialists`,
  );

  const { transcript } = await runHermesMorCollaboration({
    cfg,
    message,
    to,
    token,
    channel,
    threadTs: threadTs || undefined,
    agents,
    hermesReview,
    morResponse,
    synthesize,
  });

  console.log(
    `OK — ${transcript.length} posts in Hermes ↔ MOR dialogue${synthesize ? " + Commander synthesis" : ""}.`,
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
