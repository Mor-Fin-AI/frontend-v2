import fs from "node:fs";
import path from "node:path";

const WORKFLOW_CHANNELS = {
  "mor-agents": "SLACK_CHANNEL_MOR_AGENTS",
  "mor-audit": "SLACK_CHANNEL_MOR_AUDIT",
  "mor-github-events": "SLACK_CHANNEL_MOR_GITHUB_EVENTS",
  "mor-suggestion": "SLACK_CHANNEL_MOR_SUGGESTION",
  "mor-codefix": "SLACK_CHANNEL_MOR_CODEFIX",
};

const WORKFLOW_PROMPTS = {
  "mor-agents": "docs/agents/prompts/github-agents-collab.md",
  "mor-audit": "docs/agents/prompts/github-audit.md",
  "mor-suggestion": "docs/agents/prompts/github-suggestion.md",
  "mor-codefix": "docs/agents/prompts/github-codefix.md",
};

export function resolveWorkflowChannel(workflowId) {
  const envKey = WORKFLOW_CHANNELS[workflowId];
  if (!envKey) return null;
  const value = String(process.env[envKey] ?? "").trim();
  return /^[CG][A-Z0-9]+$/i.test(value) ? value : null;
}

export function loadWorkflowPrompt(workflowId, repoRoot) {
  const rel = WORKFLOW_PROMPTS[workflowId];
  if (!rel) return "";
  const abs = path.join(repoRoot, rel);
  if (!fs.existsSync(abs)) return "";
  return fs.readFileSync(abs, "utf8");
}

export function workflowInstructions(workflowId) {
  const blocks = {
    "mor-agents":
      "Channel workflow: mor-agents. Run full Hermes ↔ MOR collaboration. Specialists interact, Hermes reviews, MOR responds, Commander synthesizes.",
    "mor-audit":
      "Channel workflow: mor-audit. Code audit on GitHub-linked change. Hermes REVIEW + MOR Ops/Risk. Output PASS/WARN/FAIL/NEEDS_HUMAN with prioritized fixes.",
    "mor-suggestion":
      "Channel workflow: mor-suggestion. Propose 3–7 ranked engineering suggestions with impact/effort. Categories: architecture, agents, routing, observability, dx. When GitHub review context contains competing code-fix paths, run the patch-vote stage and conclude with the selected patch or blocker.",
    "mor-codefix":
      "Channel workflow: mor-codefix. Diagnose issue, FIX_PLAN, TEMPLATE for PR. Never open PR without human approval. Output READY_FOR_PR only when fix plan is complete. When multiple patch paths exist, run the agent patch-vote stage before final synthesis.",
  };
  return blocks[workflowId] ?? "";
}

export const WORKFLOW_AGENT_PLANS = {
  "mor-agents": { mode: "collab" },
  "mor-audit": {
    mode: "sequence",
    agents: ["mor-hermes", "mor-ops", "mor-dd-risk"],
    hermesReview: false,
    synthesize: true,
  },
  "mor-suggestion": {
    mode: "sequence",
    agents: ["mor-ops", "mor-pnl", "mor-hermes", "main"],
    hermesReview: false,
    synthesize: true,
  },
  "mor-codefix": {
    mode: "sequence",
    agents: ["mor-hermes", "mor-ops"],
    morResponse: true,
    synthesize: true,
  },
};
