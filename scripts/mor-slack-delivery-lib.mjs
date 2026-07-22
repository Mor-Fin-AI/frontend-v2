import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

export const VALID_AGENTS = new Set([
  "main",
  "mor-pnl",
  "mor-smart-router",
  "mor-liquidity",
  "mor-dd-risk",
  "mor-market-mode",
  "mor-capital-ladder",
  "mor-governance",
  "mor-ops",
  "mor-hermes",
]);

/** Default Slack roundtable order — each agent sees all prior posts in the thread. */
export const ROUNDTABLE_ORDER = [
  "mor-ops",
  "mor-dd-risk",
  "mor-pnl",
  "mor-smart-router",
  "mor-liquidity",
  "mor-market-mode",
  "mor-capital-ladder",
  "mor-governance",
  "mor-hermes",
];

/** Peers that typically follow up when one specialist speaks first. */
export const FOLLOWUP_PEERS = {
  "mor-ops": ["mor-dd-risk", "mor-governance", "mor-hermes"],
  "mor-dd-risk": ["mor-capital-ladder", "mor-ops", "mor-pnl"],
  "mor-pnl": ["mor-liquidity", "mor-dd-risk", "mor-market-mode", "mor-smart-router"],
  "mor-smart-router": ["mor-pnl", "mor-liquidity", "mor-dd-risk"],
  "mor-liquidity": ["mor-dd-risk", "mor-pnl", "mor-capital-ladder", "mor-smart-router"],
  "mor-market-mode": ["mor-capital-ladder", "mor-pnl", "mor-dd-risk"],
  "mor-capital-ladder": ["mor-dd-risk", "mor-market-mode", "mor-governance"],
  "mor-governance": ["mor-dd-risk", "mor-capital-ladder", "mor-ops", "mor-hermes"],
  "mor-hermes": ["mor-ops", "mor-dd-risk"],
};

export const COLLABORATION_INSTRUCTIONS = `## Slack collaboration (required when other specialists already posted)

When prior MOR specialist messages appear below:
1. **Name them** — reference by Slack display name (e.g. "*MOR Risk Guard* said BLOCK — I agree because…")
2. **Follow up** — add your domain; do not repeat their bullets
3. **Resolve tension** — if you disagree, cite evidence from live context
4. **Hand off** — one line on what still needs verification (optional)

Keep 4–8 bullets. Recommend only — never execute trades.`;

export const ENGINEERING_SLACK_INSTRUCTIONS = `## Slack engineering intelligence phase

Focus on engineering signals: route quality scores, liquidity, risk posture, data freshness, execution latency, failure diagnostics, infrastructure health, cross-chain observations, and agent-to-agent synthesis.

Do NOT lead with daily revenue, realized PnL rollups, or treasury balance headlines. Financial metrics may support evidence only. Suggest prompt/workflow improvements when outputs were weak.`;

export const HERMES_SLACK_INSTRUCTIONS = `## Hermes mentor mode

You are Hermes — engineering mentor only. Output labels: REVIEW, OPTIMIZE, EXPLAIN_FAILURE, TEMPLATE.

Review code/prompts/workflows; suggest optimizations and templates. Never claim you modified production code or deployed anything. No financial execution.`;

export const MOR_RESPOND_TO_HERMES_INSTRUCTIONS = `## Responding to Hermes (mentor dialogue)

Hermes posted a mentor review in this thread. You are a MOR intelligence specialist — respond to Hermes directly:

1. **Name Hermes** and cite their specific REVIEW/OPTIMIZE/TEMPLATE points
2. **Agree or disagree** with evidence from live context (not speculation)
3. **Qualify** what is actionable now vs needs human approval
4. Do not claim code changes were made. Recommend only — never execute trades.`;

/** MOR specialists in engineering roundtable (excludes Hermes + Commander). */
export const MOR_INTEL_ORDER = ROUNDTABLE_ORDER.filter((id) => id !== "mor-hermes");

/** Default MOR agents that respond after Hermes mentor pass. */
export const MOR_HERMES_RESPONDERS = ["mor-ops", "mor-dd-risk"];

export const HERMES_REVIEW_PROMPT =
  "Hermes mentor pass: review all prior MOR specialist posts in this thread. Output REVIEW findings, OPTIMIZE suggestions, EXPLAIN_FAILURE for data anomalies, and TEMPLATE blocks where helpful. Reference each specialist by name. No production changes claimed.";

export const MOR_RESPONSE_TO_HERMES_PROMPT =
  "Respond to Hermes mentor review above. Address their REVIEW/OPTIMIZE points with your domain evidence. Agree, disagree, or qualify — cite live context. User topic:";

export function loadConfig(configPath) {
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

export function resolveAgent(cfg, agentId) {
  const agent = cfg.agents?.list?.find((a) => a.id === agentId);
  if (!agent) throw new Error(`Unknown agent: ${agentId}`);
  const ident = agent.identity ?? {};
  return {
    id: agentId,
    model: agent.model ?? cfg.agents?.defaults?.model ?? "gpt-4.1-mini",
    name: ident.name ?? agent.name ?? agentId,
    theme: ident.theme ?? "",
    avatar: ident.avatar ?? "",
    workspace: agent.workspace ?? "",
  };
}

export async function slackApi(token, method, body = {}) {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(
      Object.fromEntries(Object.entries(body).map(([key, value]) => [key, String(value)])),
    ),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`Slack ${method}: ${data.error}`);
  return data;
}

export async function openSlackDm(userId, token) {
  const data = await slackApi(token, "conversations.open", { users: userId });
  return data.channel.id;
}

/** Slack channel id (C…/G…) or DM channel opened for userId. */
export async function resolveSlackChannel({ channelId, userId, token }) {
  const id = String(channelId ?? "").trim();
  if (/^[CG][A-Z0-9]+$/i.test(id)) return id;
  if (!userId) {
    throw new Error("Set SLACK_ALERT_USER_ID or pass --to <slack-user-id> or --channel <C…>");
  }
  return openSlackDm(userId.replace(/^slack:/, ""), token);
}

export function isSlackPublicChannel(channelId) {
  return /^[CG][A-Z0-9]+$/i.test(String(channelId ?? "").trim());
}

export async function resolveActiveThreadTs(channelId, userId, token) {
  const data = await slackApi(token, "conversations.history", {
    channel: channelId,
    limit: 50,
  });
  const messages = data.messages ?? [];

  for (const message of messages) {
    if (message.assistant_thread?.thread_ts) {
      return String(message.assistant_thread.thread_ts);
    }
    if (message.user === userId && message.thread_ts) {
      return String(message.thread_ts);
    }
  }

  for (const message of messages) {
    if (message.user === userId && message.ts) return String(message.ts);
    if (message.thread_ts) return String(message.thread_ts);
  }

  return "";
}

export async function postSlackMessage({ channel, text, name, avatar, token, threadTs }) {
  const body = { channel, text, username: name };
  if (avatar) body.icon_url = avatar;
  if (threadTs) body.thread_ts = threadTs;
  const data = await slackApi(token, "chat.postMessage", body);
  return { message: data.message, ts: String(data.ts ?? data.message?.ts ?? "") };
}

export async function fetchMorContext() {
  const base = (process.env.MOR_API_BASE ?? "http://localhost:3001/api").replace(/\/$/, "");
  const parts = [];
  try {
    const healthRes = await fetch(`${base}/health`);
    if (healthRes.ok) parts.push(`## API health\n${await healthRes.text()}`);
  } catch (err) {
    parts.push(`## API health\nunavailable: ${err.message}`);
  }
  try {
    const ctxRes = await fetch(`${base}/agents/context`);
    if (ctxRes.ok) {
      parts.push(`## Live context (GET /api/agents/context)\n${await ctxRes.text()}`);
    } else {
      parts.push(`## Live context\nHTTP ${ctxRes.status}`);
    }
  } catch (err) {
    parts.push(`## Live context\nunavailable: ${err.message}`);
  }
  return parts.join("\n\n");
}

const HERMES_REVIEW_PATHS = [
  "docs/agents/prompts",
  "docs/agents/manifest.json",
  "apps/api/services/agentsContextService.ts",
  "apps/api/services/lendingService.ts",
  "apps/api/services/arbitrageService.ts",
  "scripts/mor-slack-delivery-lib.mjs",
  "scripts/deliver-slack-agent.mjs",
  "integrations/openclaw/openclaw.template.json",
];

export function loadGithubReviewContextBlock(repoRoot = process.cwd()) {
  const contextPath =
    process.env.GITHUB_REVIEW_CONTEXT_PATH?.trim() ||
    path.join(repoRoot, "integrations/openclaw/state/github-review-context.json");

  if (!fs.existsSync(contextPath)) return "";

  try {
    const ctx = JSON.parse(fs.readFileSync(contextPath, "utf8"));
    const parts = [
      "## GitHub code review context",
      `Repository: ${ctx.repository ?? "unknown"}`,
      `Event: ${ctx.event ?? ""}${ctx.action ? ` (${ctx.action})` : ""}`,
      `Title: ${ctx.title ?? ""}`,
      ctx.url ? `URL: ${ctx.url}` : "",
      "",
      "### Changed files",
      ctx.diffStat || ctx.changedFiles?.map((f) => f.path).join(", ") || "(none)",
      "",
      "### Unified diff (truncated)",
      ctx.diffSnippet ? `\`\`\`diff\n${String(ctx.diffSnippet).slice(0, 14000)}\n\`\`\`` : "(add GITHUB_TOKEN for PR diffs)",
    ];

    if (Array.isArray(ctx.fileSnippets) && ctx.fileSnippets.length > 0) {
      parts.push("", "### File snippets");
      for (const file of ctx.fileSnippets.slice(0, 6)) {
        parts.push(`#### ${file.path}`, "```", String(file.content).slice(0, 4000), "```");
      }
    }

    parts.push("", "Review the actual code above — cite file paths and line-level issues.");
    return parts.filter(Boolean).join("\n");
  } catch {
    return "";
  }
}

export async function fetchHermesContext() {
  const repo = process.env.MOR_REPO ?? process.cwd();
  const parts = [await fetchMorContext()];

  const githubReview = loadGithubReviewContextBlock(repo);
  if (githubReview) parts.push(githubReview);

  const paths = HERMES_REVIEW_PATHS.map((rel) => `- ${path.join(repo, rel)}`).join("\n");
  parts.push(`## Repository review targets (MOR_REPO)\n${paths}`);

  try {
    const diff = execSync("git diff --stat HEAD", {
      cwd: repo,
      encoding: "utf8",
      timeout: 5000,
    }).trim();
    if (diff) {
      parts.push(`## Git diff stat (working tree)\n\`\`\`\n${diff.slice(0, 2500)}\n\`\`\``);
    }
  } catch {
    // git unavailable or not a repo
  }

  return parts.join("\n\n");
}

export async function fetchAgentContext(agentId) {
  const repo = process.env.MOR_REPO ?? process.cwd();
  const githubReview = loadGithubReviewContextBlock(repo);
  if (agentId === "mor-hermes") return fetchHermesContext();
  const base = await fetchMorContext();
  if (!githubReview) return base;
  return `${base}\n\n${githubReview}`;
}

export function formatTranscript(transcript) {
  if (!transcript.length) return "";
  return transcript
    .map((entry) => `### ${entry.name} (${entry.id})\n${entry.text}`)
    .join("\n\n");
}

export async function runAgentTurn({ agent, agentId, message, contextBlock, transcript = [] }) {
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!openaiKey && !anthropicKey) return message;

  const prior = formatTranscript(transcript);
  const respondingToHermes =
    agentId !== "mor-hermes" && transcriptHasHermes(transcript);
  const system = [
    `You are ${agent.name}.`,
    agent.theme ? agent.theme : "",
    "MOR Finance intelligence — recommend only, never execute trades.",
    "Never access private keys, sign transactions, deploy contracts, or move treasury funds.",
    ENGINEERING_SLACK_INSTRUCTIONS,
    agentId === "mor-hermes" ? HERMES_SLACK_INSTRUCTIONS : "",
    respondingToHermes ? MOR_RESPOND_TO_HERMES_INSTRUCTIONS : "",
    "Check dataQuality in context; if recommendPaused or stale flags, cap confidence at 50 and prefer PAUSE/MAINTAIN.",
    "Use the live context below when present. If context is missing or stale, say so.",
    prior ? COLLABORATION_INSTRUCTIONS : "",
    "Reply concisely in Slack mrkdwn. No preamble about being an AI.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const userParts = [message];
  if (prior) userParts.push(`---\n## Prior specialist posts this round\n${prior}`);
  if (contextBlock) userParts.push(`---\n${contextBlock}`);
  const userContent = userParts.join("\n\n");

  const errors = [];

  if (openaiKey) {
    try {
      const model = agent.model.replace(/^openai\//, "");
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userContent },
          ],
          temperature: 0.4,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message ?? `OpenAI HTTP ${res.status}`);
      }
      return data.choices?.[0]?.message?.content?.trim() || message;
    } catch (error) {
      errors.push(`openai: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (anthropicKey) {
    try {
      const model =
        process.env.ANTHROPIC_MODEL?.trim() ||
        (String(agent.model).startsWith("anthropic/")
          ? agent.model.replace(/^anthropic\//, "")
          : "claude-sonnet-4-5");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": anthropicKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          max_tokens: 1200,
          temperature: 0.4,
          system,
          messages: [{ role: "user", content: userContent }],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message ?? `Anthropic HTTP ${res.status}`);
      }
      const text = Array.isArray(data.content)
        ? data.content
            .filter((part) => part?.type === "text")
            .map((part) => part.text)
            .join("\n")
            .trim()
        : "";
      return text || message;
    } catch (error) {
      errors.push(`anthropic: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(errors.join(" | ") || "No LLM provider available");
}

export function resolveFollowupAgents(primaryId, mode) {
  if (mode === "none" || mode === "off" || mode === "false") return [];
  if (mode === "hermes" || mode === "mentor") {
    return primaryId === "mor-hermes" ? [] : ["mor-hermes"];
  }
  if (mode === "all") {
    return ROUNDTABLE_ORDER.filter((id) => id !== primaryId);
  }
  if (mode === "auto" || !mode) {
    return FOLLOWUP_PEERS[primaryId] ?? [];
  }
  return mode
    .split(",")
    .map((s) => s.trim())
    .filter((id) => VALID_AGENTS.has(id) && id !== primaryId && id !== "main");
}

function transcriptHasHermes(transcript) {
  return transcript.some((entry) => entry.id === "mor-hermes");
}

function transcriptHasMorSpecialists(transcript) {
  return transcript.some((entry) => entry.id !== "mor-hermes" && entry.id !== "main");
}

export async function deliverAgentToSlack({
  cfg,
  agentId,
  message,
  to,
  token,
  channel,
  threadTs,
  transcript,
  contextBlock,
  allowFallback = true,
}) {
  const agent = resolveAgent(cfg, agentId);
  let reply;
  try {
    reply = await runAgentTurn({
      agent,
      agentId,
      message,
      contextBlock,
      transcript,
    });
  } catch (err) {
    if (!allowFallback) throw err;
    console.warn(`→ ${agentId} turn failed (${err.message}); using fallback text`);
    reply = message;
  }

  const posted = await postSlackMessage({
    channel,
    text: reply,
    name: agent.name,
    avatar: agent.avatar,
    token,
    threadTs,
  });

  const username = posted.message?.username ?? "(default bot)";
  if (username !== agent.name) {
    throw new Error(`expected ${agent.name}, got ${username}`);
  }

  console.log(`Delivered as: ${agent.name}`);
  return { id: agentId, name: agent.name, text: reply, ts: posted.ts };
}

/** Hermes reviews MOR specialist transcript (phase 2). */
export async function runHermesReviewPass({
  cfg,
  transcript,
  userTopic,
  to,
  token,
  channel,
  threadTs,
}) {
  if (!transcriptHasMorSpecialists(transcript)) return null;
  console.log("→ Hermes mentor review");
  return deliverAgentToSlack({
    cfg,
    agentId: "mor-hermes",
    message: `${HERMES_REVIEW_PROMPT} User topic: ${userTopic}`,
    to,
    token,
    channel,
    threadTs,
    transcript,
    contextBlock: await fetchHermesContext(),
  });
}

/** MOR specialists respond to Hermes (phase 3). */
export async function runMorResponseToHermes({
  cfg,
  transcript,
  userTopic,
  to,
  token,
  channel,
  threadTs,
  responders = MOR_HERMES_RESPONDERS,
}) {
  if (!transcriptHasHermes(transcript)) return [];

  const entries = [];
  for (const agentId of responders) {
    console.log(`→ MOR response to Hermes: ${agentId}`);
    const entry = await deliverAgentToSlack({
      cfg,
      agentId,
      message: `${MOR_RESPONSE_TO_HERMES_PROMPT} ${userTopic}`,
      to,
      token,
      channel,
      threadTs,
      transcript,
      contextBlock: await fetchAgentContext(agentId),
    });
    transcript.push(entry);
    entries.push(entry);
  }
  return entries;
}

/** Commander synthesizes Hermes ↔ MOR dialogue (phase 4). */
export async function runCommanderSynthesis({
  cfg,
  transcript,
  userTopic,
  to,
  token,
  channel,
  threadTs,
  allowFallback = true,
}) {
  console.log("→ Commander synthesis (Hermes ↔ MOR dialogue)");
  const synthesisPrompt = `Synthesize this MOR engineering dialogue for the user. Include Hermes mentor findings AND how MOR specialists responded. Reference each agent by name. Summarize agreements, tensions, open questions. Top 3 engineering actions. No revenue rollup. End with a clearly labeled final section titled CONCLUSION that briefly closes the full discussion thread. User focus: ${userTopic}`;
  return deliverAgentToSlack({
    cfg,
    agentId: "main",
    message: synthesisPrompt,
    to,
    token,
    channel,
    threadTs,
    transcript,
    contextBlock: await fetchMorContext(),
    allowFallback,
  });
}

/**
 * Full Hermes ↔ MOR collaboration on Slack.
 * MOR intel → Hermes review → MOR response → optional Commander synthesis.
 */
export async function runHermesMorCollaboration({
  cfg,
  message,
  to,
  token,
  channel,
  threadTs: initialThreadTs,
  agents = MOR_INTEL_ORDER,
  hermesReview = true,
  morResponse = true,
  synthesize = true,
}) {
  const transcript = [];
  let threadTs = initialThreadTs ?? "";
  const contextBlock = await fetchMorContext();

  for (const agentId of agents) {
    console.log(`→ MOR intel: ${agentId}`);
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

  if (hermesReview) {
    const hermesEntry = await runHermesReviewPass({
      cfg,
      transcript,
      userTopic: message,
      to,
      token,
      channel,
      threadTs: threadTs || undefined,
    });
    if (hermesEntry) transcript.push(hermesEntry);
  }

  if (morResponse) {
    await runMorResponseToHermes({
      cfg,
      transcript,
      userTopic: message,
      to,
      token,
      channel,
      threadTs: threadTs || undefined,
    });
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

  return { transcript, threadTs };
}
