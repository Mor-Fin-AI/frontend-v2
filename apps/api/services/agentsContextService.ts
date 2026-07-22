import { AGENT_LIMITATIONS } from "../data/agentLimitations.js";
import { SLACK_REPORTING_PHASE } from "../data/slackReportingPhase.js";
import { getArbitrageExecutions } from "./arbitrageService.js";
import { getGovernanceStatus } from "./governanceService.js";
import { getLendingDischargeData } from "./lendingService.js";
import { getPlatformStatus } from "./platformService.js";
import { evaluateFlashloanOpportunities } from "./flashloanOpportunityService.js";
import type { FlashloanOpportunityResult } from "./flashloanOpportunityService.js";
import { scanLiveFlashloanQuotes } from "./flashloanLiveQuoteService.js";
import { evaluateSmartRouterFromExecutions } from "./smartRouterScoringService.js";
import type { SmartRouterEvaluationResult } from "./smartRouterScoringService.js";

const STALE_DATA_MS = 6 * 60 * 60 * 1000;

export type AgentsDataQuality = {
  flags: string[];
  recommendPaused: boolean;
  confidenceCap: number | null;
  newestExecutionAt: string | null;
  executionCount: number;
  lendingLtvPercent: number | null;
  lendingLtvAnomaly: boolean;
  dischargesFailed: number;
};

export type AgentsContextSnapshot = {
  generatedAt: string;
  service: "morfinance-api";
  limitations: typeof AGENT_LIMITATIONS;
  slackReporting: typeof SLACK_REPORTING_PHASE;
  dataQuality: AgentsDataQuality;
  agentFramework: {
    mode: "recommend-only";
    docsPath: "docs/agents/prompts";
    limitationsDoc: "docs/agents/prompts/agent-limitations.md";
    executionHierarchy: ["agents-recommend", "risk-engine-approves", "execution-engine-executes"];
  };
  summary: {
    arbitrageExecutions24hEstimate: number;
    arbitrageFailureRatePct: number | null;
    avgRealizedProfitUsd: number | null;
    platformEthBalance: string | null;
    platformWethBalance: string | null;
    lendingLtvPct: number | null;
    activeGovernanceProposals: number;
  };
  arbitrage: Awaited<ReturnType<typeof getArbitrageExecutions>>;
  lending: Awaited<ReturnType<typeof getLendingDischargeData>>;
  platform: Awaited<ReturnType<typeof getPlatformStatus>>;
  governance: Awaited<ReturnType<typeof getGovernanceStatus>>;
  smartRouter: SmartRouterEvaluationResult;
  flashloanOpportunities: FlashloanOpportunityResult;
};

function pct(numerator: number, denominator: number) {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

function avg(values: number[]) {
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100;
}

function executionTimestampMs(
  row: Awaited<ReturnType<typeof getArbitrageExecutions>>["executions"][number],
) {
  if (row.executedAtIso) {
    const isoMs = new Date(row.executedAtIso).getTime();
    if (Number.isFinite(isoMs)) return isoMs;
  }
  const parsed = new Date(row.executedAt).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function buildDataQuality(
  executions: Awaited<ReturnType<typeof getArbitrageExecutions>>["executions"],
  lending: Awaited<ReturnType<typeof getLendingDischargeData>>,
): AgentsDataQuality {
  const flags: string[] = [];
  const now = Date.now();

  if (executions.length === 0) {
    flags.push("missing-arbitrage-executions");
  }

  const timestamps = executions
    .map(executionTimestampMs)
    .filter((value): value is number => value !== null);

  const newestMs = timestamps.length > 0 ? Math.max(...timestamps) : null;
  const newestExecutionAt =
    newestMs !== null ? new Date(newestMs).toISOString() : null;

  if (newestMs !== null && now - newestMs > STALE_DATA_MS) {
    flags.push("stale-arbitrage-executions");
  }

  const lendingLtvPercent = lending.metrics?.loanToValueRatio ?? null;
  const lendingLtvAnomaly = lending.metrics?.loanToValueAnomaly ?? false;
  const dischargesFailed = lending.metrics?.dischargesFailed ?? 0;

  if (lendingLtvAnomaly) {
    flags.push("anomalous-lending-ltv");
  }
  if (dischargesFailed > 0) {
    flags.push("lending-discharge-failures");
  }
  if (
    lending.metrics &&
    Number(lending.metrics.collateralEth) < 0.01 &&
    Number(lending.metrics.borrowedEth) > 0
  ) {
    flags.push("low-treasury-collateral-buffer");
  }

  const recommendPaused = flags.length > 0;
  const confidenceCap = recommendPaused ? 50 : null;

  return {
    flags,
    recommendPaused,
    confidenceCap,
    newestExecutionAt,
    executionCount: executions.length,
    lendingLtvPercent: Number.isFinite(lendingLtvPercent) ? lendingLtvPercent : null,
    lendingLtvAnomaly,
    dischargesFailed,
  };
}

export async function getAgentsContextSnapshot(): Promise<AgentsContextSnapshot> {
  const [arbitrage, lending, platform, governance] = await Promise.all([
    getArbitrageExecutions({ page: 1, pageSize: 50, sortBy: "time" }),
    getLendingDischargeData(),
    getPlatformStatus(),
    getGovernanceStatus(),
  ]);

  const executed = arbitrage.executions.filter((row) => row.status === "Executed");
  const failed = arbitrage.executions.filter((row) => row.status === "Failed");
  const decisionTotal = executed.length + failed.length;

  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentExecutions = arbitrage.executions.filter((row) => {
    const ts = executionTimestampMs(row);
    return ts !== null && ts >= oneDayAgo;
  });

  const ltvPct = lending.metrics?.loanToValueRatio ?? null;

  const dataQuality = buildDataQuality(arbitrage.executions, lending);

  const liveQuotes = await scanLiveFlashloanQuotes();
  const smartRouter =
    liveQuotes.candidates.length > 0
      ? evaluateSmartRouterFromExecutions({
          executions: arbitrage.executions,
          // Live quotes are fresh; do not inherit stale-history confidence caps.
          confidenceCap: null,
          candidates: liveQuotes.candidates,
        })
      : evaluateSmartRouterFromExecutions({
          executions: arbitrage.executions,
          confidenceCap: dataQuality.confidenceCap,
        });
  const flashloanOpportunities = evaluateFlashloanOpportunities({
    smartRouter,
    dataSource: liveQuotes.candidates.length > 0 ? "live-quotes" : undefined,
    liveQuoteScan:
      liveQuotes.candidates.length > 0
        ? {
            quotesAttempted: liveQuotes.quotesAttempted,
            quotesSucceeded: liveQuotes.quotesSucceeded,
            ethUsdPrice: liveQuotes.ethUsdPrice,
            chainsScanned: liveQuotes.chainsScanned,
            byChain: liveQuotes.byChain,
            errors: liveQuotes.errors,
          }
        : undefined,
  });

  return {
    generatedAt: new Date().toISOString(),
    service: "morfinance-api",
    limitations: AGENT_LIMITATIONS,
    slackReporting: SLACK_REPORTING_PHASE,
    dataQuality,
    agentFramework: {
      mode: "recommend-only",
      docsPath: "docs/agents/prompts",
      limitationsDoc: "docs/agents/prompts/agent-limitations.md",
      executionHierarchy: [
        "agents-recommend",
        "risk-engine-approves",
        "execution-engine-executes",
      ],
    },
    summary: {
      arbitrageExecutions24hEstimate: recentExecutions.length,
      arbitrageFailureRatePct: pct(failed.length, decisionTotal),
      avgRealizedProfitUsd: avg(executed.map((row) => row.profitUsd)),
      platformEthBalance: platform.platformEthBalanceFormatted ?? null,
      platformWethBalance: platform.platformWethBalanceFormatted ?? null,
      lendingLtvPct: Number.isFinite(ltvPct) ? ltvPct : null,
      activeGovernanceProposals: governance.activeProposals,
    },
    arbitrage,
    lending,
    platform,
    governance,
    smartRouter,
    flashloanOpportunities,
  };
}
