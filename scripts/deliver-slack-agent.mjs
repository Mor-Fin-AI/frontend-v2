#!/usr/bin/env node
/**
 * Deliver a Slack DM as a MOR specialist (custom name + avatar).
 * With default follow-ups, peer specialists post in the same thread and reference each other.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import {
  VALID_AGENTS,
  loadConfig,
  resolveSlackChannel,
  isSlackPublicChannel,
  resolveActiveThreadTs,
  fetchMorContext,
  fetchHermesContext,
  fetchAgentContext,
  deliverAgentToSlack,
  resolveFollowupAgents,
  runHermesReviewPass,
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
  const positional = [];
  let to = process.env.SLACK_ALERT_USER_ID ?? "";
  let channelId = process.env.SLACK_CHANNEL_ID ?? "";
  let threadTs = process.env.SLACK_THREAD_TS ?? "";
  let followup = "auto";
  let hermesReview = true;
  let morResponse = true;
  let synthesize = true;

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--to") to = argv[++i] ?? "";
    else if (argv[i] === "--channel") channelId = argv[++i] ?? "";
    else if (argv[i] === "--thread-ts") threadTs = argv[++i] ?? "";
    else if (argv[i] === "--followup") followup = argv[++i] ?? "all";
    else if (argv[i] === "--no-followup") followup = "none";
    else if (argv[i] === "--hermes-review") hermesReview = true;
    else if (argv[i] === "--no-hermes-review") hermesReview = false;
    else if (argv[i] === "--mor-response") morResponse = true;
    else if (argv[i] === "--no-mor-response") morResponse = false;
    else if (argv[i] === "--no-synthesize") synthesize = false;
    else positional.push(argv[i]);
  }
  return {
    agentId: positional[0] ?? "",
    message: positional[1] ?? "",
    to,
    channelId,
    threadTs,
    followup,
    hermesReview,
    morResponse,
    synthesize,
  };
}

async function main() {
  const {
    agentId,
    message,
    to,
    channelId: channelIdArg,
    threadTs: threadTsArg,
    followup,
    hermesReview,
    morResponse,
    synthesize,
  } = parseArgs(process.argv.slice(2));
  if (!agentId || !message) {
    console.error(
      'Usage: deliver-slack-agent.mjs <agentId> "<message>" [--channel C…] [--to SLACK_USER_ID] [--thread-ts TS] [--followup all|auto|none|id1,id2]',
    );
    process.exit(1);
  }
  if (!VALID_AGENTS.has(agentId)) {
    console.error(`Invalid agentId. Use one of: ${[...VALID_AGENTS].join(", ")}`);
    process.exit(1);
  }
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
  const contextBlock = await fetchAgentContext(agentId);
  const transcript = [];

  console.log(`→ Running ${agentId} turn… (${isSlackPublicChannel(channel) ? "channel" : "DM"})`);
  const primary = await deliverAgentToSlack({
    cfg,
    agentId,
    message,
    to,
    token,
    channel,
    threadTs: threadTs || undefined,
    transcript: [],
    contextBlock,
  });
  transcript.push(primary);
  if (!threadTs && isSlackPublicChannel(channel) && primary.ts) {
    threadTs = primary.ts;
  }
  console.log("OK — custom Slack identity confirmed.");
  console.log(primary.text);

  const peers =
    agentId === "main"
      ? []
      : resolveFollowupAgents(agentId, followup === "all" ? "all" : followup);

  if (!peers.length) return;

  const followupPrompt = `Follow up on the thread above. User topic: ${message}. Reference prior specialists by name and add your domain view.`;
  console.log(`→ Follow-ups: ${peers.join(", ")}`);

  for (const peerId of peers) {
    const entry = await deliverAgentToSlack({
      cfg,
      agentId: peerId,
      message: followupPrompt,
      to,
      token,
      channel,
      threadTs: threadTs || undefined,
      transcript,
      contextBlock: await fetchAgentContext(peerId),
    });
    transcript.push(entry);
  }

  if (peers.length) {
    console.log(`→ ${peers.length} follow-up post(s) in thread.`);
  }

  if (agentId === "mor-hermes" && morResponse) {
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
    if (synthesize && transcript.length > 1) {
      await runCommanderSynthesis({
        cfg,
        transcript,
        userTopic: message,
        to,
        token,
        channel,
        threadTs: threadTs || undefined,
      });
      console.log("→ Commander conclusion posted.");
    }
    return;
  }

  if (
    hermesReview &&
    agentId !== "mor-hermes" &&
    agentId !== "main" &&
    !transcript.some((e) => e.id === "mor-hermes")
  ) {
    const hermesEntry = await runHermesReviewPass({
      cfg,
      transcript,
      userTopic: message,
      to,
      token,
      channel,
      threadTs: threadTs || undefined,
    });
    if (hermesEntry) {
      transcript.push(hermesEntry);
      console.log("→ Hermes mentor review posted.");
    }
  }

  if (synthesize && transcript.length > 1) {
    await runCommanderSynthesis({
      cfg,
      transcript,
      userTopic: message,
      to,
      token,
      channel,
      threadTs: threadTs || undefined,
    });
    console.log("→ Commander conclusion posted.");
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
