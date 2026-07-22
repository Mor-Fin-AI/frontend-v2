export const SLACK_REPORTING_PHASE = {
  phase: "engineering-intelligence" as const,
  policyDoc: "docs/agents/prompts/slack-engineering-focus.md",
  goal:
    "Validate agent reasoning, collaboration, and framework improvement before production financial reporting.",
  collaborationDoc: "docs/agents/prompts/hermes-mor-collaboration.md",
  dialoguePhases: [
    "MOR intelligence specialists",
    "Hermes mentor review",
    "MOR response to Hermes",
    "Commander synthesis",
  ],
  reportTopics: [
    "Market observations",
    "Route quality and opportunity scoring",
    "Liquidity analysis",
    "Risk Engine decisions",
    "DD/Risk alerts",
    "Capital Ladder recommendations",
    "Borrow/Lending health",
    "Data freshness checks",
    "Execution latency",
    "Failed execution diagnostics",
    "Infrastructure health",
    "AI optimization recommendations",
    "Cross-chain observations",
    "Suggested prompt improvements",
    "Agent-to-agent communication summaries",
  ],
  excludedFromSlackAlerts: [
    "Daily revenue notifications",
    "Daily realized PnL rollups",
    "Profit/loss standups or evening financial summaries",
    "Treasury balance headlines as primary alert metric",
  ],
} as const;

export type SlackReportingPhase = typeof SLACK_REPORTING_PHASE;
