/** Slack workflow channels for GitHub + agent integration (set channel IDs in env). */

export type GithubSlackWorkflowId =
  | "mor-agents"
  | "mor-audit"
  | "mor-github-events"
  | "mor-suggestion"
  | "mor-codefix";

export type GithubSlackWorkflow = {
  id: GithubSlackWorkflowId;
  name: string;
  description: string;
  envChannelKey: string;
  slashSkill: string;
  promptFile: string | null;
};

export const GITHUB_SLACK_WORKFLOWS: GithubSlackWorkflow[] = [
  {
    id: "mor-agents",
    name: "MOR Agents",
    description: "Hermes and OpenClaw MOR specialists interact in a shared thread.",
    envChannelKey: "SLACK_CHANNEL_MOR_AGENTS",
    slashSkill: "mor-agents",
    promptFile: "docs/agents/prompts/github-agents-collab.md",
  },
  {
    id: "mor-audit",
    name: "MOR Audit",
    description: "Code audit reviews discussed by Hermes and MOR specialists.",
    envChannelKey: "SLACK_CHANNEL_MOR_AUDIT",
    slashSkill: "mor-audit",
    promptFile: "docs/agents/prompts/github-audit.md",
  },
  {
    id: "mor-github-events",
    name: "MOR GitHub Events",
    description: "GitHub PR, issue, and commit activity feed.",
    envChannelKey: "SLACK_CHANNEL_MOR_GITHUB_EVENTS",
    slashSkill: "mor-github-events",
    promptFile: null,
  },
  {
    id: "mor-suggestion",
    name: "MOR Suggestions",
    description: "Agents propose project improvements and engineering suggestions.",
    envChannelKey: "SLACK_CHANNEL_MOR_SUGGESTION",
    slashSkill: "mor-suggestion",
    promptFile: "docs/agents/prompts/github-suggestion.md",
  },
  {
    id: "mor-codefix",
    name: "MOR Codefix",
    description: "Agents discuss fixes and prepare PR proposals (human approval required).",
    envChannelKey: "SLACK_CHANNEL_MOR_CODEFIX",
    slashSkill: "mor-codefix",
    promptFile: "docs/agents/prompts/github-codefix.md",
  },
];

export function resolveWorkflowChannelId(workflowId: GithubSlackWorkflowId): string | null {
  const workflow = GITHUB_SLACK_WORKFLOWS.find((row) => row.id === workflowId);
  if (!workflow) return null;
  const value = process.env[workflow.envChannelKey]?.trim();
  return value && /^[CG][A-Z0-9]+$/i.test(value) ? value : null;
}

export function getGithubSlackWorkflow(workflowId: GithubSlackWorkflowId) {
  return GITHUB_SLACK_WORKFLOWS.find((row) => row.id === workflowId) ?? null;
}
