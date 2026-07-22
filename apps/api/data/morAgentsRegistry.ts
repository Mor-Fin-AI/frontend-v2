export type MorAgentDefinition = {
  id: string;
  name: string;
  emoji: string;
  role: string;
  outputs: string[];
  promptFile: string | null;
  kpi: string;
  isOrchestrator?: boolean;
};

export { AGENT_LIMITATIONS } from "./agentLimitations.js";

export const MOR_AGENT_DEFINITIONS: MorAgentDefinition[] = [
  {
    id: "main",
    name: "MOR Orchestrator",
    emoji: "🐾",
    role: "Coordinates specialist agents and synthesizes unified recommendations.",
    outputs: ["Unified intelligence summary"],
    promptFile: null,
    kpi: "Route requests to the right specialists via OpenClaw subagents.",
    isOrchestrator: true,
  },
  {
    id: "mor-pnl",
    name: "PnL Intelligence",
    emoji: "📈",
    role: "Route profitability ranking, health scoring, and opportunity frequency.",
    outputs: ["PRIORITIZE", "MAINTAIN", "DEPRIORITIZE", "RETIRE"],
    promptFile: "docs/agents/prompts/pnl-intelligence.md",
    kpi: "Maximize realized profitable opportunities while preserving route quality.",
  },
  {
    id: "mor-smart-router",
    name: "Smart Router",
    emoji: "🧭",
    role: "Route selection by execution probability and realized net profit — not spread alone.",
    outputs: ["ROUTE", "REDUCE SIZE", "WATCH", "AVOID"],
    promptFile: "docs/agents/prompts/smart-router-intelligence.md",
    kpi: "Maximize realized net profit via highest-confidence execution-quality routing.",
  },
  {
    id: "mor-liquidity",
    name: "Liquidity Intelligence",
    emoji: "💧",
    role: "Pool depth monitoring, safe sizing, and slippage forecasting.",
    outputs: ["SAFE SIZE", "REDUCE SIZE", "AVOID ROUTE"],
    promptFile: "docs/agents/prompts/liquidity-intelligence.md",
    kpi: "Deploy maximum safe capital without reducing profitability.",
  },
  {
    id: "mor-dd-risk",
    name: "DD / Risk",
    emoji: "🛡️",
    role: "Borrow utilization, collateral health, and failure-rate monitoring.",
    outputs: ["APPROVE", "REDUCE", "BLOCK"],
    promptFile: "docs/agents/prompts/dd-risk.md",
    kpi: "Protect treasury while enabling safe scaling.",
  },
  {
    id: "mor-market-mode",
    name: "Market Mode",
    emoji: "📊",
    role: "Classifies operating conditions and recommends deployment tier.",
    outputs: ["BASELINE", "BURST", "5× DEPLOYMENT TIER", "10× DEPLOYMENT TIER"],
    promptFile: "docs/agents/prompts/market-mode-intelligence.md",
    kpi: "Accurate deployment-tier recommendations from measured market conditions.",
  },
  {
    id: "mor-capital-ladder",
    name: "Capital Ladder",
    emoji: "🏦",
    role: "Treasury monitoring, capital allocation, and scaling recommendations.",
    outputs: ["MAINTAIN", "SCALE", "PAUSE", "UPGRADE DEPLOYMENT TIER", "DOWNGRADE DEPLOYMENT TIER"],
    promptFile: "docs/agents/prompts/capital-ladder.md",
    kpi: "Compound treasury growth using validated production data.",
  },
  {
    id: "mor-governance",
    name: "Governance Intelligence",
    emoji: "🗳️",
    role: "Proposal monitoring and voting posture recommendations.",
    outputs: ["MONITOR", "PREPARE", "URGENT", "PAUSE OPS"],
    promptFile: "docs/agents/prompts/governance-intelligence.md",
    kpi: "Timely governance visibility before treasury moves.",
  },
  {
    id: "mor-ops",
    name: "Ops / Health Watch",
    emoji: "🩺",
    role: "API health, data freshness, and platform observability.",
    outputs: ["HEALTHY", "DEGRADED", "DOWN", "ACTION REQUIRED"],
    promptFile: "docs/agents/prompts/ops-health.md",
    kpi: "Reliable observability for all intelligence agents.",
  },
  {
    id: "mor-hermes",
    name: "Hermes",
    emoji: "⚡",
    role: "Engineering mentor — code review, optimizations, failure analysis, templates.",
    outputs: ["REVIEW", "OPTIMIZE", "EXPLAIN_FAILURE", "TEMPLATE"],
    promptFile: "docs/agents/prompts/hermes-mentor.md",
    kpi: "Continuous improvement of prompts, code, and agent workflows without auto-modifying production.",
  },
];

export const EXECUTION_HIERARCHY = [
  "Agents recommend",
  "Risk Engine approves or rejects",
  "Execution Engine executes",
] as const;
