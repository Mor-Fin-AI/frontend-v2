#!/usr/bin/env node
/**
 * Bootstrap MOR OpenClaw integration inside this repo.
 * - Agent workspaces under integrations/openclaw/workspaces/
 * - Config at integrations/openclaw/openclaw.json
 * - State at integrations/openclaw/state/
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const INTEGRATION_DIR = path.join(REPO_ROOT, "integrations/openclaw");
const STATE_DIR = path.join(INTEGRATION_DIR, "state");
const PROMPTS_DIR = path.join(REPO_ROOT, "docs/agents/prompts");
const TEMPLATE_PATH = path.join(INTEGRATION_DIR, "openclaw.template.json");
const CONFIG_PATH = path.join(INTEGRATION_DIR, "openclaw.json");

const AGENTS = [
  { id: "mor-pnl", name: "PnL Intelligence Agent", emoji: "📈", prompt: "pnl-intelligence.md", skills: ["mor-finance", "mor-pnl"] },
  { id: "mor-smart-router", name: "Smart Router Agent", emoji: "🧭", prompt: "smart-router-intelligence.md", skills: ["mor-finance", "mor-smart-router"] },
  { id: "mor-liquidity", name: "Liquidity Intelligence Agent", emoji: "💧", prompt: "liquidity-intelligence.md", skills: ["mor-finance", "mor-liquidity"] },
  { id: "mor-dd-risk", name: "DD / Risk Agent", emoji: "🛡️", prompt: "dd-risk.md", skills: ["mor-finance", "mor-risk"] },
  { id: "mor-market-mode", name: "Market Mode Intelligence Agent", emoji: "📊", prompt: "market-mode-intelligence.md", skills: ["mor-finance", "mor-mode"] },
  { id: "mor-capital-ladder", name: "Capital Ladder Agent", emoji: "🏦", prompt: "capital-ladder.md", skills: ["mor-finance", "mor-capital"] },
  { id: "mor-governance", name: "Governance Intelligence Agent", emoji: "🗳️", prompt: "governance-intelligence.md", skills: ["mor-finance", "mor-governance"] },
  { id: "mor-ops", name: "Ops / Health Watch Agent", emoji: "🩺", prompt: "ops-health.md", skills: ["mor-finance", "mor-health"] },
  { id: "mor-hermes", name: "Hermes Engineering Mentor", emoji: "⚡", prompt: "hermes-mentor.md", skills: ["mor-finance", "mor-hermes"] },
];

const SPAWN_TARGETS = AGENTS.map((a) => a.id);

const MAIN_SKILLS = [
  "mor-finance",
  "mor-pnl",
  "mor-smart-router",
  "mor-liquidity",
  "mor-risk",
  "mor-mode",
  "mor-capital",
  "mor-review",
  "mor-governance",
  "mor-health",
  "mor-brief",
  "mor-roundtable",
  "mor-hermes",
  "mor-collab",
];

const MOR_SKILL_NAMES = MAIN_SKILLS;

const COLLABORATION_SECTION = `## Slack collaboration (cross-agent follow-up)

Specialists **interact on Slack in the same thread** and reference each other by display name.

When another MOR specialist posted before you:
1. **Name them** (e.g. "*MOR Risk Guard* said BLOCK — …")
2. **Follow up** with your domain view; do not repeat their bullets
3. **Agree or disagree** with evidence from live context

Delivery scripts auto-chain follow-ups (\`--followup all\`). Full ordered roundtable:

\`node scripts/deliver-slack-roundtable.mjs "<topic>" --to <SenderId> --thread-ts <MessageThreadId>\`
`;

/** Slack display names + avatars (requires chat:write.customize scope). */
const AGENT_PROFILES = {
  main: {
    slackName: "MOR Commander",
    displayEmoji: "🐾",
    slackEmoji: ":compass:",
    theme: "Orchestrator — delegates to MOR specialists",
    avatar:
      "https://ui-avatars.com/api/?name=CMD&background=0f172a&color=fff&size=128&bold=true",
  },
  "mor-pnl": {
    slackName: "MOR PnL Intel",
    displayEmoji: "📈",
    slackEmoji: ":chart_with_upwards_trend:",
    theme: "Route quality and opportunity scoring",
    avatar:
      "https://ui-avatars.com/api/?name=PNL&background=16a34a&color=fff&size=128&bold=true",
  },
  "mor-smart-router": {
    slackName: "MOR Smart Router",
    displayEmoji: "🧭",
    slackEmoji: ":compass:",
    theme: "Execution-quality route ranking by confidence and success probability",
    avatar:
      "https://ui-avatars.com/api/?name=RT&background=0d9488&color=fff&size=128&bold=true",
  },
  "mor-liquidity": {
    slackName: "MOR Liquidity",
    displayEmoji: "💧",
    slackEmoji: ":droplet:",
    theme: "Pool depth and safe sizing",
    avatar:
      "https://ui-avatars.com/api/?name=LIQ&background=0284c7&color=fff&size=128&bold=true",
  },
  "mor-dd-risk": {
    slackName: "MOR Risk Guard",
    displayEmoji: "🛡️",
    slackEmoji: ":shield:",
    theme: "Debt discharge and treasury safety",
    avatar:
      "https://ui-avatars.com/api/?name=RISK&background=dc2626&color=fff&size=128&bold=true",
  },
  "mor-market-mode": {
    slackName: "MOR Market Mode",
    displayEmoji: "📊",
    slackEmoji: ":bar_chart:",
    theme: "Deployment tier classification",
    avatar:
      "https://ui-avatars.com/api/?name=MODE&background=7c3aed&color=fff&size=128&bold=true",
  },
  "mor-capital-ladder": {
    slackName: "MOR Capital",
    displayEmoji: "🏦",
    slackEmoji: ":bank:",
    theme: "Treasury allocation and scaling",
    avatar:
      "https://ui-avatars.com/api/?name=CAP&background=d97706&color=fff&size=128&bold=true",
  },
  "mor-governance": {
    slackName: "MOR Governance",
    displayEmoji: "🗳️",
    slackEmoji: ":ballot_box_with_ballot:",
    theme: "Proposals, voting, and timelock posture",
    avatar:
      "https://ui-avatars.com/api/?name=GOV&background=4338ca&color=fff&size=128&bold=true",
  },
  "mor-ops": {
    slackName: "MOR Ops Watch",
    displayEmoji: "🩺",
    slackEmoji: ":stethoscope:",
    theme: "API health and operational readiness",
    avatar:
      "https://ui-avatars.com/api/?name=OPS&background=475569&color=fff&size=128&bold=true",
  },
  "mor-hermes": {
    slackName: "Hermes",
    displayEmoji: "⚡",
    slackEmoji: ":zap:",
    theme: "Engineering mentor — code review, optimizations, failure analysis, templates",
    avatar:
      "https://ui-avatars.com/api/?name=HER&background=0891b2&color=fff&size=128&bold=true",
  },
};

function identityBlock(agentId) {
  const profile = AGENT_PROFILES[agentId];
  if (!profile) return undefined;
  return {
    name: profile.slackName,
    emoji: profile.slackEmoji,
    theme: profile.theme,
    avatar: profile.avatar,
  };
}

function applyAgentIdentities(config) {
  for (const agent of config.agents?.list ?? []) {
    const identity = identityBlock(agent.id);
    if (identity) agent.identity = identity;
    const spec = AGENTS.find((a) => a.id === agent.id);
    if (spec?.skills) agent.skills = spec.skills;
    if (agent.id === "main") {
      agent.skills = MAIN_SKILLS;
      agent.subagents = {
        ...agent.subagents,
        allowAgents: SPAWN_TARGETS,
      };
    }
  }
  if (config.agents?.defaults) {
    config.agents.defaults.skills = MAIN_SKILLS;
    config.agents.defaults.subagents = {
      ...config.agents.defaults.subagents,
      maxChildrenPerAgent: 9,
      maxConcurrent: 9,
      allowAgents: SPAWN_TARGETS,
    };
  }
  if (config.tools?.agentToAgent) {
    config.tools.agentToAgent.allow = ["main", ...SPAWN_TARGETS];
  }
}

function morSkillEnv() {
  return {
    MOR_API_BASE: "http://localhost:3001/api",
    MOR_DASHBOARD_URL: "http://localhost:5173",
    MOR_REPO: REPO_ROOT,
  };
}

function applySkillsEntries(config) {
  config.skills = config.skills ?? { load: {}, entries: {} };
  config.skills.load.extraDirs = [path.join(INTEGRATION_DIR, "skills")];
  config.skills.entries = config.skills.entries ?? {};
  for (const name of MOR_SKILL_NAMES) {
    config.skills.entries[name] = {
      enabled: true,
      env: morSkillEnv(),
    };
  }
}

const MOR_TOOLS = `### MOR Finance API

- Repo: \`${REPO_ROOT}\`
- API: \`http://localhost:3001/api\`
- Dashboard: \`http://localhost:5173\`
- Live snapshot: \`GET /api/agents/context\`
- Skill: \`mor-finance\`

**Never execute trades.** Recommend only → Risk Engine → Execution Engine.`;

async function readText(filePath) {
  return fs.readFile(filePath, "utf8");
}

async function writeAgentWorkspace({ id, name, emoji, prompt }) {
  const ws = path.join(INTEGRATION_DIR, "workspaces", id);
  await fs.mkdir(path.join(ws, "memory"), { recursive: true });
  const profile = AGENT_PROFILES[id];

  const shared = await readText(path.join(PROMPTS_DIR, "shared-system-context.md"));
  const limitations = await readText(path.join(PROMPTS_DIR, "agent-limitations.md"));
  const slackFocus = await readText(path.join(PROMPTS_DIR, "slack-engineering-focus.md"));
  const hermesCollab = await readText(path.join(PROMPTS_DIR, "hermes-mor-collaboration.md"));
  const role = await readText(path.join(PROMPTS_DIR, prompt));

  const agentsMd = `# MOR Finance — ${name}

You are a specialist agent in the MOR Finance intelligence layer. You **never execute trades**.

${limitations}

---

${slackFocus}

---

${hermesCollab}

---

${shared}

---

${role}

---

${COLLABORATION_SECTION}

---

## Session workflow

1. Check API health: \`GET http://localhost:3001/api/health\`
2. Pull live context: \`GET http://localhost:3001/api/agents/context\`
3. Apply your role framework to current data
4. Output: **Summary**, **Evidence**, **Recommendation**, **Confidence** (0–100), **Risk notes**, **Escalation**

Full prompt library: \`${PROMPTS_DIR}/\`

## Sub-agent note

When spawned by the main orchestrator, you receive AGENTS.md + TOOLS.md only. Pull live data from MOR API; output your role's action labels.
`;

  const identityMd = `# IDENTITY.md — ${profile?.slackName ?? name}

- **Name:** ${profile?.slackName ?? name}
- **Emoji:** ${profile?.displayEmoji ?? emoji}
- **Theme:** ${profile?.theme ?? "MOR Finance specialist"}
- **Avatar:** ${profile?.avatar ?? ""}
- **Creature:** MOR Finance intelligence agent
- **Vibe:** Analytical, measured, production-data-driven
- **Mission:** Recommend only — never execute. Risk Engine approves; Execution Engine executes.

When announcing to Slack, you post as **${profile?.slackName ?? name}** with your own profile (not the orchestrator).
`;

  await fs.writeFile(path.join(ws, "AGENTS.md"), agentsMd);
  await fs.writeFile(path.join(ws, "IDENTITY.md"), identityMd);
  await fs.writeFile(path.join(ws, "TOOLS.md"), `# TOOLS.md — ${name}\n\n${MOR_TOOLS}\n`);
}

async function writeMainWorkspace() {
  const ws = path.join(INTEGRATION_DIR, "workspaces", "main");
  await fs.mkdir(path.join(ws, "memory"), { recursive: true });

  const limitations = await readText(path.join(PROMPTS_DIR, "agent-limitations.md"));
  const slackFocus = await readText(path.join(PROMPTS_DIR, "slack-engineering-focus.md"));
  const hermesCollab = await readText(path.join(PROMPTS_DIR, "hermes-mor-collaboration.md"));

  const orchestrator = `# MOR Finance — Orchestrator (main)

You coordinate MOR specialist sub-agents. **Never execute trades.** Agents recommend → Risk Engine → Execution Engine.

${limitations}

---

${slackFocus}

---

${hermesCollab}

---

## Sub-agent environment

- \`requireAgentId: true\` — always pass explicit \`agentId\` to \`sessions_spawn\`
- \`delegationMode: prefer\` — delegate analysis to specialists; synthesize results for the user
- Env: \`MOR_API_BASE\`, \`MOR_REPO\` (see skill \`mor-finance\` and \`integrations/openclaw/SUBAGENTS.md\`)

## Specialist agents (spawn targets)

| agentId | Role | Output labels |
|---------|------|---------------|
| mor-pnl | Route profitability | PRIORITIZE, MAINTAIN, DEPRIORITIZE, RETIRE |
| mor-smart-router | Execution-quality routing | ROUTE, REDUCE SIZE, WATCH, AVOID |
| mor-liquidity | Pool depth / sizing | SAFE SIZE, REDUCE SIZE, AVOID ROUTE |
| mor-dd-risk | Debt discharge / risk | APPROVE, REDUCE, BLOCK |
| mor-market-mode | Operating mode | BASELINE, BURST, 5×, 10× DEPLOYMENT TIER |
| mor-capital-ladder | Treasury allocation | MAINTAIN, SCALE, PAUSE, UPGRADE/DOWNGRADE TIER |
| mor-governance | Governance proposals | MONITOR, PREPARE, URGENT, PAUSE OPS |
| mor-ops | API / platform health | HEALTHY, DEGRADED, DOWN, ACTION REQUIRED |
| mor-hermes | Engineering mentor | REVIEW, OPTIMIZE, EXPLAIN_FAILURE, TEMPLATE |

## Channels & nodes

- **Slack** — primary alerts and slash commands (\`/mor_pnl\`, \`/mor_health\`, etc.)
- **Webchat / Control UI** — \`http://127.0.0.1:18789/\` (same main agent)
- **Paired nodes** — browser, canvas, screen via \`openclaw nodes status\` (local loopback auto-approved)

## Workflow

1. \`GET http://localhost:3001/api/health\` then \`GET /api/agents/context\`
2. For full reviews, run **roundtable** on Slack (all specialists follow up on each other), then synthesize
3. In-gateway parallel \`sessions_spawn\` is for fast analysis without Slack thread — prefer deliver scripts for user-visible collaboration
4. Synthesize: Summary, Evidence, unified Recommendation, Confidence, Risk notes, Escalation

## Slack identity (important)

Spawned sub-agents **report to you first**. The \`message\` tool always posts as **MOR Commander** — never prefix text like \`MOR PnL Intel:\` to fake another agent's avatar.

### Direct specialist routing (do this first)

When the user names a specialist **or** asks why they are not getting reports from one, **run deliver immediately** — do not only explain spawn routing.

| User intent | Action |
|-------------|--------|
| \`/mor_pnl\`, \`/mor_risk\`, etc. | Deliver that specialist (slash skill) |
| "why isn't mor-pnl reporting", "have pnl report to me" | Deliver that specialist **now** |
| "full brief", "run all agents", \`/mor_review\`, \`/mor_roundtable\` | **Roundtable** on Slack — all specialists follow up on each other, then Commander synthesizes |

Natural language → agent id: pnl → \`mor-pnl\`, router/smart router → \`mor-smart-router\`, liquidity → \`mor-liquidity\`, risk/dd → \`mor-dd-risk\`, mode → \`mor-market-mode\`, capital → \`mor-capital-ladder\`, hermes/code review → \`mor-hermes\`.

\`\`\`bash
node scripts/deliver-slack-collab.mjs "<topic>" --to <SenderId> --thread-ts <MessageThreadId>
node scripts/deliver-slack-roundtable.mjs "<user message>" --to <SenderId> --thread-ts <MessageThreadId>
\`\`\`

Single specialist slash (use \`--followup all\` so all peers chime in on Slack):

\`\`\`bash
node scripts/deliver-slack-agent.mjs mor-pnl "<message>" --to <SenderId> --thread-ts <MessageThreadId> --followup all
\`\`\`

Cron specialist jobs already deliver direct to \`SLACK_ALERT_USER_ID\` on schedule.

### One Slack app, many specialists

| Slash | Specialist |
|-------|------------|
| \`/mor_roundtable\` | All specialists — ordered thread with follow-ups |
| \`/mor_review\` | Same as roundtable + Commander synthesis |
| \`/mor_brief\` | Executive brief (no spawn) |
| \`/mor_health\` | MOR Ops Watch |
| \`/mor_hermes\` | Hermes — code review & prompt improvements |
| \`/mor_collab\` | Full Hermes ↔ MOR dialogue (all specialists + mentor + synthesis) |
| \`/mor_governance\` | MOR Governance |
| \`/mor_pnl\` | MOR PnL Intel |
| \`/mor_router\` | MOR Smart Router |

When a slash command fires, run **bash** deliver (not \`message\`, not \`openclaw agent\` CLI):

\`\`\`bash
node scripts/deliver-slack-agent.mjs mor-pnl "<user text>" --to <SenderId> --thread-ts <MessageThreadId> --followup all
\`\`\`

Map: \`mor-risk\` → \`mor-dd-risk\`, \`mor-mode\` → \`mor-market-mode\`, \`mor-capital\` → \`mor-capital-ladder\`.

Identity demo: \`npm run openclaw:test-identities\`

## Example spawn

\`\`\`
sessions_spawn({
  agentId: "mor-pnl",
  task: "Analyze /api/agents/context. Output route actions: PRIORITIZE/MAINTAIN/DEPRIORITIZE/RETIRE."
})
\`\`\`

Prompts: \`${PROMPTS_DIR}/\`
Sub-agent docs: \`${INTEGRATION_DIR}/SUBAGENTS.md\`
`;

  await fs.writeFile(path.join(ws, "AGENTS.md"), orchestrator);
  await fs.writeFile(
    path.join(ws, "IDENTITY.md"),
    `# IDENTITY.md — ${AGENT_PROFILES.main.slackName}

- **Name:** ${AGENT_PROFILES.main.slackName}
- **Emoji:** ${AGENT_PROFILES.main.displayEmoji}
- **Theme:** ${AGENT_PROFILES.main.theme}
- **Avatar:** ${AGENT_PROFILES.main.avatar}
- **Role:** Delegate to MOR specialist sub-agents and synthesize intelligence.

When you reply directly in Slack, post as **${AGENT_PROFILES.main.slackName}**.
When the user wants a specialist's own Slack name/avatar, run \`npm run openclaw:deliver -- <agentId> "…" --to <userId>\` — never impersonate via text prefix.
`
  );
  await fs.writeFile(
    path.join(ws, "TOOLS.md"),
    `# TOOLS.md — MOR Orchestrator\n\n${MOR_TOOLS}\n\nUse \`sessions_spawn\` with explicit \`agentId\` for each specialist.\n`
  );

  const heartbeat = `# HEARTBEAT.md — MOR Slack alerts

On heartbeat, check MOR intelligence and alert on Slack when warranted:

1. \`GET http://localhost:3001/api/health\` — skip if API down
2. \`GET /api/agents/context\` — review summary metrics
3. If failure rate >20%, LTV stressed, or opportunity drop → spawn mor-dd-risk + mor-pnl
4. If metrics stable → reply \`HEARTBEAT_OK\`

**Never execute trades.** Recommend only.
`;
  await fs.writeFile(path.join(ws, "HEARTBEAT.md"), heartbeat);
}

async function writeSubagentsEnv() {
  const examplePath = path.join(INTEGRATION_DIR, "subagents.env.example");
  const envPath = path.join(INTEGRATION_DIR, "subagents.env");
  try {
    await fs.access(envPath);
    return;
  } catch {
    const example = await readText(examplePath);
    await fs.writeFile(envPath, example.replaceAll("{{REPO_ROOT}}", REPO_ROOT));
  }
}

async function writeConfig() {
  let existing = {};
  try {
    existing = JSON.parse(await fs.readFile(CONFIG_PATH, "utf8"));
  } catch {
    // first run
  }

  const template = await readText(TEMPLATE_PATH);
  const config = JSON.parse(
    template.replaceAll("{{REPO_ROOT}}", REPO_ROOT).replaceAll("{{STATE_DIR}}", STATE_DIR),
  );

  const token = existing.gateway?.auth?.token;
  if (token && !String(token).includes("REPLACE_WITH")) {
    config.gateway.auth = existing.gateway.auth;
  }
  config.gateway = {
    ...config.gateway,
    port: existing.gateway?.port ?? config.gateway.port,
    controlUi: config.gateway.controlUi,
    nodes: config.gateway.nodes,
  };
  if (existing.channels?.slack) {
    config.channels.slack = {
      ...config.channels.slack,
      ...existing.channels.slack,
      enabled: existing.channels.slack.enabled ?? true,
      dmPolicy: existing.channels.slack.dmPolicy ?? "open",
      allowFrom: existing.channels.slack.allowFrom ?? ["*"],
    };
  } else {
    config.channels.slack.enabled = true;
    config.channels.slack.dmPolicy = "open";
    config.channels.slack.allowFrom = ["*"];
  }
  if (existing.plugins) {
    config.plugins = {
      ...config.plugins,
      ...existing.plugins,
      entries: { ...config.plugins?.entries, ...existing.plugins.entries },
    };
  }
  if (existing.commands?.ownerAllowFrom) {
    config.commands = { ...config.commands, ...existing.commands };
  }
  config.commands = {
    ...config.commands,
    allowFrom: {
      slack: ["*", ...(config.commands?.ownerAllowFrom ?? [])],
      ...config.commands?.allowFrom,
    },
  };
  if (existing.meta) config.meta = existing.meta;

  applyAgentIdentities(config);
  applySkillsEntries(config);

  await fs.mkdir(STATE_DIR, { recursive: true });
  await fs.writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`);
}

async function main() {
  console.log("MOR OpenClaw setup");
  console.log(`  Repo:   ${REPO_ROOT}`);
  console.log(`  Config: ${CONFIG_PATH}`);
  console.log(`  State:  ${STATE_DIR}`);

  for (const agent of AGENTS) {
    await writeAgentWorkspace(agent);
    console.log(`  ✓ workspace ${agent.id}`);
  }
  await writeMainWorkspace();
  console.log("  ✓ workspace main");
  await writeSubagentsEnv();
  console.log("  ✓ subagents.env");
  await writeConfig();
  console.log("  ✓ openclaw.json");

  console.log(`
Next steps:
  1. npm run dev
  2. cd openclaw && npm install   # first time only (large)
  3. openclaw doctor --generate-gateway-token   # or set token in integrations/openclaw/openclaw.json
  4. npm run openclaw:gateway

Dashboard: http://127.0.0.1:18789/
OpenClaw source: ${path.join(REPO_ROOT, "openclaw")} (git submodule)
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
