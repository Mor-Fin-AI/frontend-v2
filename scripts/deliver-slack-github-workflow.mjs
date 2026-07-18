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
  fetchAgentContext,
  loadGithubReviewContextBlock,
  resolveAgent,
  runAgentTurn,
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
const PATCH_VOTE_WORKFLOWS = new Set(["mor-suggestion", "mor-codefix"]);
const PATCH_VOTERS = ["mor-hermes", "mor-ops", "mor-dd-risk"];
const PATCH_VOTE_WEIGHTS = {
  "mor-hermes": 3,
  "mor-ops": 2,
  "mor-dd-risk": 3,
};
const PATCH_VOTE_STATE_DIR = path.join(
  REPO_ROOT,
  "integrations/openclaw/state/github-workflow-votes",
);

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

function sanitizeThreadKey(value) {
  const raw = String(value ?? "").trim();
  return raw ? raw.replace(/[^a-zA-Z0-9_.-]+/g, "-") : `run-${Date.now()}`;
}

function truncateField(value, max = 240) {
  return String(value ?? "")
    .replace(/\|/g, "/")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function buildTranscriptText(transcript) {
  return transcript
    .map((entry) => `### ${entry.name} (${entry.id})\n${entry.text}`)
    .join("\n\n");
}

function parsePatchOptions(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("PATCH_OPTION|"))
    .map((line) => {
      const parts = line.split("|");
      if (parts.length < 7) return null;
      const [, id, title, risk, files, summary, tests] = parts;
      return {
        id: truncateField(id, 24).toUpperCase(),
        title: truncateField(title, 120),
        risk: truncateField(risk, 16).toUpperCase() || "MEDIUM",
        files: truncateField(files, 180),
        summary: truncateField(summary, 220),
        tests: truncateField(tests, 160),
      };
    })
    .filter(Boolean)
    .slice(0, 3);
}

function parseVote(text, validCandidateIds) {
  const lines = String(text ?? "").split(/\r?\n/);
  const read = (prefix) => {
    const line = lines.find((entry) => entry.toUpperCase().startsWith(prefix));
    return line ? line.slice(prefix.length).trim() : "";
  };

  const candidateId = read("VOTE:").toUpperCase();
  if (!validCandidateIds.has(candidateId)) return null;

  const confidenceRaw = Number.parseInt(read("CONFIDENCE:"), 10);
  const vetoRaw = read("VETO:").toUpperCase();
  return {
    candidateId,
    confidence: Number.isFinite(confidenceRaw)
      ? Math.max(0, Math.min(100, confidenceRaw))
      : 60,
    rationale: truncateField(read("RATIONALE:"), 240),
    veto: vetoRaw === "YES",
  };
}

function summarizeCandidates(candidates) {
  return candidates
    .map(
      (candidate) =>
        `*${candidate.id}* — ${candidate.title} _(risk: ${candidate.risk}; files: ${candidate.files || "n/a"})_\n• ${candidate.summary}\n• Tests: ${candidate.tests || "not specified"}`,
    )
    .join("\n\n");
}

function computeVoteOutcome(candidates, votes) {
  if (!votes.length) {
    return {
      scoreboard: candidates.map((candidate) => ({
        ...candidate,
        score: 0,
        voters: [],
        vetoedBy: [],
      })),
      status: "NO_VOTES",
      selected: null,
      reason: "No valid agent votes were recorded.",
    };
  }

  const scoreboard = candidates.map((candidate) => ({
    ...candidate,
    score: 0,
    voters: [],
    vetoedBy: [],
  }));
  const byId = new Map(scoreboard.map((candidate) => [candidate.id, candidate]));

  for (const vote of votes) {
    const candidate = byId.get(vote.candidateId);
    if (!candidate) continue;
    candidate.score += PATCH_VOTE_WEIGHTS[vote.agentId] ?? 1;
    candidate.voters.push(`${vote.agentName}${vote.rationale ? ` — ${vote.rationale}` : ""}`);
    if (vote.veto) candidate.vetoedBy.push(vote.agentName);
  }

  const sorted = [...scoreboard].sort((left, right) => right.score - left.score);
  const top = sorted[0] ?? null;
  const tied =
    top && sorted.filter((candidate) => candidate.score === top.score).map((candidate) => candidate.id);

  if (!top) {
    return {
      scoreboard,
      status: "NO_VOTES",
      selected: null,
      reason: "No valid agent votes were recorded.",
    };
  }

  if (top.vetoedBy.length > 0) {
    return {
      scoreboard,
      status: "BLOCKED_VETO",
      selected: null,
      reason: `${top.id} was vetoed by ${top.vetoedBy.join(", ")}. Human review is required before applying any patch.`,
    };
  }

  if ((tied?.length ?? 0) > 1) {
    return {
      scoreboard,
      status: "BLOCKED_TIE",
      selected: null,
      reason: `Tie between ${tied.join(", ")}. Human selection is required.`,
    };
  }

  return {
    scoreboard,
    status: "SELECTED",
    selected: top,
    reason: `${top.id} received the highest weighted vote total.`,
  };
}

async function generatePatchOptions({ cfg, workflow, message, transcript }) {
  const agentId = "mor-hermes";
  const agent = resolveAgent(cfg, agentId);
  const text = await runAgentTurn({
    agent,
    agentId,
    transcript,
    contextBlock: await fetchAgentContext(agentId),
    message: [
      "Create 1 to 3 concrete patch candidates from the GitHub review discussion below.",
      "Return ONLY lines in this exact format:",
      "PATCH_OPTION|<ID>|<Title>|<Risk LOW/MEDIUM/HIGH>|<Files comma-separated>|<Summary>|<Tests>",
      "Rules: IDs must be A, B, C. Do not use pipe characters inside fields. If there is only one realistic patch, return one line only.",
      `Workflow: ${workflow}`,
      `User request: ${message}`,
      "Transcript:",
      buildTranscriptText(transcript),
    ].join("\n\n"),
  });
  return parsePatchOptions(text);
}

async function collectPatchVotes({ cfg, message, transcript, candidates, token, channel, threadTs }) {
  const candidateIds = new Set(candidates.map((candidate) => candidate.id));
  const votes = [];

  for (const agentId of PATCH_VOTERS) {
    const entry = await deliverAgentToSlack({
      cfg,
      agentId,
      message: [
        "Vote for the best reviewed patch option.",
        "Respond in exactly this format:",
        "VOTE: <ID>",
        "CONFIDENCE: <0-100>",
        "RATIONALE: <one short sentence>",
        "VETO: <YES or NO>",
        "Only use VETO: YES if the patch should be blocked for operational or risk reasons.",
        `User request: ${message}`,
        "Patch options:",
        summarizeCandidates(candidates),
      ].join("\n\n"),
      token,
      channel,
      threadTs,
      transcript,
      contextBlock: await fetchAgentContext(agentId),
    });
    transcript.push(entry);

    const vote = parseVote(entry.text, candidateIds);
    if (vote) {
      votes.push({
        ...vote,
        agentId,
        agentName: entry.name,
      });
    }
  }

  return votes;
}

function writePatchVoteState({ workflow, threadTs, message, candidates, votes, outcome }) {
  fs.mkdirSync(PATCH_VOTE_STATE_DIR, { recursive: true });
  const statePath = path.join(
    PATCH_VOTE_STATE_DIR,
    `${workflow}-${sanitizeThreadKey(threadTs)}.json`,
  );

  fs.writeFileSync(
    statePath,
    JSON.stringify(
      {
        workflow,
        threadTs,
        message,
        generatedAt: new Date().toISOString(),
        candidates,
        votes,
        outcome,
      },
      null,
      2,
    ),
  );

  return statePath;
}

async function runPatchVoteWorkflow({ cfg, workflow, message, transcript, channel, token, threadTs }) {
  const candidates = await generatePatchOptions({ cfg, workflow, message, transcript });
  if (!candidates.length) return null;

  const commander = resolveAgent(cfg, "main");
  const candidateMessage = [
    `*Patch options for ${workflow}*`,
    "Agents reviewed the thread and extracted the following implementation candidates:",
    summarizeCandidates(candidates),
    candidates.length === 1
      ? "Only one viable patch path was identified, so the vote will confirm or block it."
      : "Voting round starting now.",
  ].join("\n\n");

  const candidatePost = await postSlackMessage({
    channel,
    text: candidateMessage,
    name: commander.name,
    avatar: commander.avatar,
    token,
    threadTs,
  });
  transcript.push({
    id: "main",
    name: commander.name,
    text: candidateMessage,
    ts: candidatePost.ts,
  });

  const votes = await collectPatchVotes({
    cfg,
    message,
    transcript,
    candidates,
    token,
    channel,
    threadTs,
  });
  const outcome = computeVoteOutcome(candidates, votes);
  const statePath = writePatchVoteState({ workflow, threadTs, message, candidates, votes, outcome });

  const scoreboardLines = outcome.scoreboard.map((candidate) => {
    const status = candidate.vetoedBy.length ? ` — vetoed by ${candidate.vetoedBy.join(", ")}` : "";
    return `• *${candidate.id}* ${candidate.title} — score ${candidate.score}${status}`;
  });

  const resultText = [
    `*Patch vote result for ${workflow}*`,
    ...scoreboardLines,
    outcome.selected
      ? `*Selected patch:* ${outcome.selected.id} — ${outcome.selected.title}`
      : "*Selected patch:* none",
    `*Status:* ${outcome.status}`,
    `*Reason:* ${outcome.reason}`,
    `*State file:* ${path.relative(REPO_ROOT, statePath)}`,
  ].join("\n");

  const resultPost = await postSlackMessage({
    channel,
    text: resultText,
    name: commander.name,
    avatar: commander.avatar,
    token,
    threadTs,
  });
  const resultEntry = { id: "main", name: commander.name, text: resultText, ts: resultPost.ts };
  transcript.push(resultEntry);
  return resultEntry;
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
  const hasGithubReviewContext = Boolean(
    implicitGithubReviewContext ||
      process.env.GITHUB_REVIEW_CONTEXT_PATH?.trim() ||
      message.includes("## GitHub code review context"),
  );

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

  if (PATCH_VOTE_WORKFLOWS.has(workflow) && hasGithubReviewContext) {
    await runPatchVoteWorkflow({
      cfg,
      workflow,
      message,
      transcript,
      channel,
      token,
      threadTs: threadTs || undefined,
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
