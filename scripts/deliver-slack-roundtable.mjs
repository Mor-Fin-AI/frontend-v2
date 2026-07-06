#!/usr/bin/env node
/**
 * Sequential MOR specialist roundtable on Slack — each agent sees prior posts and follows up.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import {
  VALID_AGENTS,
  ROUNDTABLE_ORDER,
  loadConfig,
  resolveSlackChannel,
  isSlackPublicChannel,
  resolveActiveThreadTs,
  fetchMorContext,
  deliverAgentToSlack,
  runMorResponseToHermes,
  runCommanderSynthesis,
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
  let agents = [...ROUNDTABLE_ORDER];
  let synthesize = true;
  let morResponse = true;

  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--to") to = argv[++i] ?? "";
    else if (arg === "--channel") channelId = argv[++i] ?? "";
    else if (arg === "--thread-ts") threadTs = argv[++i] ?? "";
    else if (arg === "--agents") {
      const raw = argv[++i] ?? "all";
      agents =
        raw === "all"
          ? [...ROUNDTABLE_ORDER]
          : raw
              .split(",")
              .map((s) => s.trim())
              .filter((id) => VALID_AGENTS.has(id) && id !== "main");
    } else if (arg === "--no-synthesize") synthesize = false;
    else if (arg === "--no-mor-response") morResponse = false;
    else positional.push(arg);
  }
  message =
    positional.join(" ").trim() ||
    "MOR roundtable: review live context and follow up on each other.";
  return { message, to, channelId, threadTs, agents, synthesize, morResponse };
}

async function main() {
  const {
    message,
    to,
    channelId: channelIdArg,
    threadTs: threadTsArg,
    agents,
    synthesize,
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
  let threadTs =
    threadTsArg ||
    (isSlackPublicChannel(channel) ? "" : await resolveActiveThreadTs(channel, to, token));
  const contextBlock = await fetchMorContext();
  const transcript = [];

  console.log(`→ Roundtable: ${agents.join(" → ")} (${isSlackPublicChannel(channel) ? "channel" : "DM"})`);
  if (threadTs) console.log(`→ Thread: ${threadTs}`);

  for (const agentId of agents) {
    console.log(`→ Turn: ${agentId}`);
    const entry = await deliverAgentToSlack({
      cfg,
      agentId,
      message,
      to,
      token,
      channel,
      threadTs: threadTs || undefined,
      transcript,
      contextBlock,
    });
    transcript.push(entry);
    if (!threadTs && isSlackPublicChannel(channel) && entry.ts) {
      threadTs = entry.ts;
    }
  }

  if (morResponse && transcript.some((e) => e.id === "mor-hermes")) {
    await runMorResponseToHermes({
      cfg,
      transcript,
      userTopic: message,
      to,
      token,
      channel,
      threadTs: threadTs || undefined,
    });
    console.log("→ MOR specialists responded to Hermes.");
  }

  if (synthesize) {
    await runCommanderSynthesis({
      cfg,
      transcript,
      userTopic: message,
      to,
      token,
      channel,
      threadTs: threadTs || undefined,
    });
  }

  console.log(
    `OK — ${transcript.length} specialist posts${morResponse ? " + MOR↔Hermes dialogue" : ""}${synthesize ? " + Commander synthesis" : ""}.`,
  );
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
