export const AGENT_LIMITATIONS = {
  mode: "recommend-only" as const,
  policyDoc: "docs/agents/AGENT-LIMITATIONS.md",
  promptDoc: "docs/agents/prompts/agent-limitations.md",
  executionHierarchy: [
    "Agents recommend",
    "Risk Engine approves or rejects",
    "Execution Engine executes",
  ] as const,
  general: [
    "No autonomous trade execution",
    "No direct treasury access",
    "No capital allocation without Risk Engine approval",
    "No protocol configuration changes without authorization",
    "No contract or infrastructure deployment without authorization",
  ],
  tradingRisk: [
    "Recommend routes and trade sizing only",
    "Borrow/lending recommendations require DD/Risk Agent and Risk Engine validation",
    "Never bypass risk limits, kill switches, or daily loss limits",
    "Pause recommendations when market or data confidence is low",
  ],
  dataQuality: [
    "Detect stale or missing data and flag it",
    "Report confidence scores for all recommendations",
    "Escalate conflicting signals instead of guessing",
  ],
  mentors: {
    claude: {
      allowed: ["Education", "Explanations", "Documentation", "Learning guidance"],
      denied: [
        "Autonomous production code modification",
        "Deployments",
        "Financial execution",
      ],
    },
    hermes: {
      allowed: [
        "Code review",
        "Optimization suggestions",
        "Failure explanations",
        "Template generation",
      ],
      denied: [
        "Automatic production code modification",
        "Deployments",
        "Financial execution",
      ],
    },
  },
  security: [
    "No access to private keys or wallet secrets",
    "No ability to sign transactions independently",
    "No access to owner-only financial dashboard data",
  ],
  dashboardRbac: {
    engineeringRole: "user",
    ownerRole: "admin",
    engineeringVisibility: [
      "Operational metrics",
      "Health status",
      "Agent feedback",
      "Latency",
      "Liquidity and risk status",
      "System KPIs",
    ],
    ownerVisibility: [
      "Revenue",
      "Realized PnL",
      "Treasury balances",
      "Financial reports",
      "Arbitrage monitor",
      "Fee integration",
    ],
  },
  slackReporting: {
    phase: "engineering-intelligence",
    policyDoc: "docs/agents/prompts/slack-engineering-focus.md",
    excludeFromAutomatedAlerts: [
      "Daily revenue notifications",
      "Daily realized PnL rollups",
      "Profit/loss standups",
    ],
  },
} as const;

export type AgentLimitations = typeof AGENT_LIMITATIONS;
