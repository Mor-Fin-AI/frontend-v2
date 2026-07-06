#!/usr/bin/env node
/**
 * GitHub ↔ Slack workflow delivery.
 * Workflows: mor-agents | mor-audit | mor-suggestion | mor-codefix
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import {
  loadConfig,
  resolveSlackChannel,
  isSlackPublicChannel,
  resolveActiveThreadTs,
  deliverAgentToSlack,
  runCommanderSynthesis,
  runHermesMorCollaboration,
  runMorResponseToHermes,
  fetchHermesContext,
  fetchMorContext,
  loadGithubReviewContextBlock,
} from "./mor-slack-delivery-lib.mjs";
import {
  loadWorkflowPrompt,
  resolveWorkflowChannel,
  workflowInstructions,
  WORKFLOW_AGENT_PLANS,
} from "./mor-github-slack-lib.mjs";
import { postSlackMessage } from "./mor-slack-delivery-lib.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const CONFIG_PATH =
  process.env.OPENCLAW_CONFIG_PATH ??
  path.join(REPO_ROOT, "integrations/openclaw/openclaw.json");

for (const envPath of [
  path.join(REPO_ROOT, ".env"),
  path.join(REPO_ROOT, "integrations/openclaw/subagents.env"),
  path.join(REPO_ROOT, "openclaw/.env"),
]) {
  if (fs.existsSync(envPath)) dotenv.config({ path: envPath });
}

function parseArgs(argv) {
  let workflow = "";
  let message = "";
  let channelId = "";
  let threadTs = "";

  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--workflow") workflow = argv[++i] ?? "";
    else if (arg === "--channel") channelId = argv[++i] ?? "";
    else if (arg === "--thread-ts") threadTs = argv[++i] ?? "";
    else if (arg === "--review-context") {
      process.env.GITHUB_REVIEW_CONTEXT_PATH = argv[++i] ?? "";
    } else positional.push(arg);
  }

  message = positional.join(" ").trim();
  if (!channelId && workflow) {
    channelId = resolveWorkflowChannel(workflow) ?? "";
  }

  return { workflow, message, channelId, threadTs };
}

async function runSequenceWorkflow({
  cfg,
  token,
  channel,
  threadTs: initialThreadTs,
  message,
  workflow,
  plan,
  promptBlock,
}) {
  const transcript = [];
  let threadTs = initialThreadTs ?? "";

  const implicitGithubReviewContext =
    !process.env.GITHUB_REVIEW_CONTEXT_PATH?.trim() && !message.includes("## GitHub code review context")
      ? loadGithubReviewContextBlock(REPO_ROOT)
      : "";

  const topic = [
    workflowInstructions(workflow),
    promptBlock ? `## Workflow prompt\n${promptBlock.slice(0, 6000)}` : "",
    message,
    implicitGithubReviewContext,
  ]
    .filter(Boolean)
    .join("\n\n");

  for (const agentId of plan.agents) {
    console.log(`→ ${workflow}: ${agentId}`);
    const contextBlock =
      agentId === "mor-hermes" ? await fetchHermesContext() : await fetchMorContext();

    const entry = await deliverAgentToSlack({
      cfg,
      agentId,
      message: topic,
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

  if (plan.morResponse) {
    await runMorResponseToHermes({
      cfg,
      transcript,
      userTopic: message,
      token,
      channel,
      threadTs: threadTs || undefined,
      responders: ["mor-ops"],
    });
  }

  if (plan.synthesize) {
    await runCommanderSynthesis({
      cfg,
      transcript,
      userTopic: message,
      token,
      channel,
      threadTs: threadTs || undefined,
    });
  }

  return { transcript, threadTs };
}

async function main() {
  const { workflow, message, channelId: channelArg, threadTs: threadTsArg } = parseArgs(
    process.argv.slice(2),
  );

  if (!workflow || (!WORKFLOW_AGENT_PLANS[workflow] && workflow !== "mor-github-events")) {
    console.error(
      "Usage: deliver-slack-github-workflow.mjs --workflow <mor-agents|mor-audit|mor-suggestion|mor-codefix> [message] [--channel C…] [--thread-ts TS]",
    );
    process.exit(1);
  }

  const token = process.env.SLACK_BOT_TOKEN?.trim();
  if (!token) {
    console.error("SLACK_BOT_TOKEN required");
    process.exit(1);
  }

  const channel = await resolveSlackChannel({
    channelId: channelArg,
    userId: "",
    token,
  });

  if (workflow === "mor-github-events") {
    await postSlackMessage({
      channel,
      text: [
        ":github: *MOR GitHub Events*",
        "This channel receives PR, issue, and push notifications from `POST /api/github/webhook`.",
        "Configure `SLACK_CHANNEL_MOR_GITHUB_EVENTS` and `GITHUB_WEBHOOK_SECRET` in env.",
        "Optional auto-triggers: `GITHUB_AUTO_REVIEW_CODE`, `GITHUB_AUTO_AUDIT_PR`, `GITHUB_AUTO_SUGGESTION`, `GITHUB_AUTO_CODEFIX`, `GITHUB_AUTO_AGENTS_ISSUES`, `GITHUB_AUTO_SUGGESTION_ISSUES`.",
        "Set `GITHUB_TOKEN` so agents receive PR diffs and file snippets for code review.",
        message ? `\n_Manual note:_ ${message}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      name: "MOR GitHub",
      avatar:
        "https://ui-avatars.com/api/?name=GH&background=24292f&color=fff&size=128&bold=true",
      token,
      threadTs: threadTsArg || undefined,
    });
    console.log(`Posted GitHub events status to ${channel}`);
    return;
  }

  let threadTs = threadTsArg;
  if (!threadTs && isSlackPublicChannel(channel)) {
    threadTs = await resolveActiveThreadTs(channel, "", token);
  }

  const cfg = loadConfig(CONFIG_PATH);
  const promptBlock = loadWorkflowPrompt(workflow, REPO_ROOT);
  const topic =
    message.trim() ||
    `MOR ${workflow} workflow — review linked GitHub context and post structured output.`;

  const plan = WORKFLOW_AGENT_PLANS[workflow];

  if (plan.mode === "collab") {
    await runHermesMorCollaboration({
      cfg,
      channel,
      token,
      threadTs,
      message: `${workflowInstructions(workflow)}\n\n${topic}`,
      synthesize: true,
      hermesReview: true,
      morResponse: true,
    });
    console.log(`Delivered ${workflow} collaboration to ${channel}`);
    return;
  }

  await runSequenceWorkflow({
    cfg,
    token,
    channel,
    threadTs,
    message: topic,
    workflow,
    plan,
    promptBlock,
  });
  console.log(`Delivered ${workflow} sequence to ${channel}`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
