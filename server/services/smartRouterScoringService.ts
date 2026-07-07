import {
  SMART_ROUTER_PENALTIES,
  SMART_ROUTER_THRESHOLDS,
  SMART_ROUTER_WEIGHTS,
} from "../data/smartRouterConfig.js";
import type { ArbitrageExecutionResponse } from "./arbitrageService.js";

export type SmartRouterRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type SmartRouterCandidateInput = {
  routePath: string;
  tokenSequence: string[];
  inputTradeSizeUsd: number;
  expectedOutputUsd?: number;
  grossArbitrageProfitUsd: number;
  expectedBps: number;
  gasEstimateUsd: number;
  flashLoanFeeUsd?: number;
  liquidityDepthUsd?: number;
  priceImpactBps?: number;
  slippageEstimateBps?: number;
  dexHopCount: number;
  historicalSuccessRate?: number;
  historicalRealizedVsQuotedRatio?: number;
  historicalLatencyMs?: number;
  historicalFailureReason?: string | null;
  poolTvlUsd?: number;
  poolVolatilityScore?: number;
  blockTimestamp?: string;
  chainCongestionScore?: number;
  pair?: string;
  routeDexes?: [string, string];
};

export type SmartRouterRouteLearning = {
  routeKey: string;
  detectionCount: number;
  executionAttempts: number;
  successfulExecutions: number;
  failedExecutions: number;
  skippedExecutions: number;
  avgRealizedProfitUsd: number | null;
  avgRealizedBps: number | null;
  avgGasUsd: number | null;
  avgLatencyMs: number | null;
  roi: number | null;
  lastFailureReason: string | null;
};

export type SmartRouterRecommendation = {
  route: string;
  routePath: string;
  pair: string;
  routeDexes: [string, string];
  expectedNetProfitUsd: number;
  expectedBps: number;
  confidenceScore: number;
  successProbability: number;
  gasEstimateUsd: number;
  slippageEstimateBps: number;
  liquidityScore: number;
  recommendedTradeSizeUsd: number;
  riskLevel: SmartRouterRiskLevel;
  executionPriority: number;
  compositeScore: number;
  rejected: boolean;
  eliminationReasons: string[];
  learning: SmartRouterRouteLearning;
};

export type SmartRouterEvaluationResult = {
  generatedAt: string;
  specVersion: "1.0.0";
  mode: "recommend-only";
  thresholds: typeof SMART_ROUTER_THRESHOLDS;
  dataSource: "live-candidates" | "historical-executions";
  candidatesEvaluated: number;
  routesRejected: number;
  routesRecommended: number;
  learning: SmartRouterRouteLearning[];
  recommendations: SmartRouterRecommendation[];
  rejected: SmartRouterRecommendation[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function normalize(value: number, min: number, max: number) {
  if (max <= min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

function routeKeyFromExecution(row: ArbitrageExecutionResponse) {
  return `${row.pair}::${row.routeDexes[0]}::${row.routeDexes[1]}`;
}

function routeKeyFromCandidate(candidate: SmartRouterCandidateInput) {
  if (candidate.pair && candidate.routeDexes) {
    return `${candidate.pair}::${candidate.routeDexes[0]}::${candidate.routeDexes[1]}`;
  }
  return candidate.routePath.toLowerCase().replace(/\s+/g, "-");
}

function parsePairTokens(pair: string): string[] {
  return pair.split("/").map((token) => token.trim()).filter(Boolean);
}

function executionTimestampMs(row: ArbitrageExecutionResponse) {
  if (row.executedAtIso) {
    const isoMs = new Date(row.executedAtIso).getTime();
    if (Number.isFinite(isoMs)) return isoMs;
  }
  const parsed = new Date(row.executedAt).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function estimateBps(profitUsd: number, tradeSizeUsd: number) {
  if (tradeSizeUsd <= 0) return 0;
  return round((profitUsd / tradeSizeUsd) * 10_000, 2);
}

function inferFailureReason(row: ArbitrageExecutionResponse): string | null {
  if (row.status !== "Failed") return null;
  if (row.profitUsd <= 0 && row.gasUsd > 0) return "negative-or-zero-profit";
  if (row.gasUsd > SMART_ROUTER_THRESHOLDS.maxGasUsd) return "excessive-gas";
  return "execution-failed";
}

function buildLearningIndex(
  executions: ArbitrageExecutionResponse[],
): Map<string, SmartRouterRouteLearning> {
  const groups = new Map<string, ArbitrageExecutionResponse[]>();

  for (const row of executions) {
    const key = routeKeyFromExecution(row);
    const bucket = groups.get(key) ?? [];
    bucket.push(row);
    groups.set(key, bucket);
  }

  const learning = new Map<string, SmartRouterRouteLearning>();

  for (const [routeKey, rows] of groups) {
    const sorted = [...rows].sort((a, b) => {
      const aTs = executionTimestampMs(a) ?? 0;
      const bTs = executionTimestampMs(b) ?? 0;
      return aTs - bTs;
    });

    const executed = sorted.filter((row) => row.status === "Executed");
    const failed = sorted.filter((row) => row.status === "Failed");
    const skipped = sorted.filter((row) => row.status === "Skipped");
    const attempts = executed.length + failed.length;

    const latencies: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      const prev = executionTimestampMs(sorted[i - 1]);
      const curr = executionTimestampMs(sorted[i]);
      if (prev !== null && curr !== null && curr > prev) {
        latencies.push(curr - prev);
      }
    }

    const avgProfit =
      executed.length > 0
        ? round(
            executed.reduce((sum, row) => sum + row.profitUsd, 0) / executed.length,
          )
        : null;

    const avgGas =
      rows.length > 0
        ? round(rows.reduce((sum, row) => sum + row.gasUsd, 0) / rows.length)
        : null;

    const avgBps =
      avgProfit !== null
        ? estimateBps(avgProfit, SMART_ROUTER_THRESHOLDS.defaultTradeSizeUsd)
        : null;

    const avgLatency =
      latencies.length > 0
        ? round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length, 0)
        : null;

    const totalGas = rows.reduce((sum, row) => sum + row.gasUsd, 0);
    const totalProfit = executed.reduce((sum, row) => sum + row.profitUsd, 0);
    const roi =
      totalGas > 0 ? round(((totalProfit - totalGas) / totalGas) * 100, 2) : null;

    const lastFailure = [...sorted].reverse().find((row) => row.status === "Failed");

    learning.set(routeKey, {
      routeKey,
      detectionCount: rows.length,
      executionAttempts: attempts,
      successfulExecutions: executed.length,
      failedExecutions: failed.length,
      skippedExecutions: skipped.length,
      avgRealizedProfitUsd: avgProfit,
      avgRealizedBps: avgBps,
      avgGasUsd: avgGas,
      avgLatencyMs: avgLatency,
      roi,
      lastFailureReason: lastFailure ? inferFailureReason(lastFailure) : null,
    });
  }

  return learning;
}

export function buildCandidatesFromExecutions(
  executions: ArbitrageExecutionResponse[],
): SmartRouterCandidateInput[] {
  const learning = buildLearningIndex(executions);
  const latestByRoute = new Map<string, ArbitrageExecutionResponse>();

  for (const row of executions) {
    const key = routeKeyFromExecution(row);
    const existing = latestByRoute.get(key);
    if (!existing) {
      latestByRoute.set(key, row);
      continue;
    }
    const existingTs = executionTimestampMs(existing) ?? 0;
    const rowTs = executionTimestampMs(row) ?? 0;
    if (rowTs >= existingTs) latestByRoute.set(key, row);
  }

  const candidates: SmartRouterCandidateInput[] = [];

  for (const [routeKey, row] of latestByRoute) {
    const stats = learning.get(routeKey);
    const tradeSize = SMART_ROUTER_THRESHOLDS.defaultTradeSizeUsd;
    const grossProfit = stats?.avgRealizedProfitUsd ?? row.profitUsd;
    const gasEstimate = stats?.avgGasUsd ?? row.gasUsd;
    const successRate =
      stats && stats.executionAttempts > 0
        ? stats.successfulExecutions / stats.executionAttempts
        : row.status === "Executed"
          ? 1
          : 0;

    const failurePenalty = stats?.failedExecutions ?? 0;
    const volatilityScore = clamp(30 + failurePenalty * 12, 0, 100);
    const slippageEstimateBps = clamp(
      Math.max(5, (1 - successRate) * 40 + (stats?.avgRealizedBps ? Math.max(0, 25 - stats.avgRealizedBps) : 10)),
      0,
      200,
    );

    candidates.push({
      routePath: row.route,
      tokenSequence: parsePairTokens(row.pair),
      inputTradeSizeUsd: tradeSize,
      expectedOutputUsd: round(tradeSize + grossProfit),
      grossArbitrageProfitUsd: grossProfit,
      expectedBps: stats?.avgRealizedBps ?? estimateBps(grossProfit, tradeSize),
      gasEstimateUsd: gasEstimate,
      flashLoanFeeUsd: round(tradeSize * 0.0009, 2),
      liquidityDepthUsd: round(tradeSize * (1.5 + successRate), 0),
      priceImpactBps: slippageEstimateBps * 0.6,
      slippageEstimateBps,
      dexHopCount: row.routeDexes.length,
      historicalSuccessRate: successRate,
      historicalRealizedVsQuotedRatio:
        row.status === "Executed" && grossProfit > 0 ? clamp(grossProfit / Math.max(row.profitUsd, 0.01), 0, 2) : 0.5,
      historicalLatencyMs: stats?.avgLatencyMs ?? undefined,
      historicalFailureReason: stats?.lastFailureReason ?? null,
      poolTvlUsd: round(tradeSize * 20 * (0.5 + successRate), 0),
      poolVolatilityScore: volatilityScore,
      blockTimestamp: row.executedAtIso ?? undefined,
      chainCongestionScore: clamp(20 + (gasEstimate / SMART_ROUTER_THRESHOLDS.maxGasUsd) * 50, 0, 100),
      pair: row.pair,
      routeDexes: row.routeDexes,
    });
  }

  return candidates;
}

function computeRiskLevel(
  successProbability: number,
  confidenceScore: number,
  eliminationReasons: string[],
): SmartRouterRiskLevel {
  if (eliminationReasons.length > 0 || successProbability < 0.55 || confidenceScore < 50) {
    return "HIGH";
  }
  if (successProbability >= 0.8 && confidenceScore >= 70) return "LOW";
  return "MEDIUM";
}

function applyEliminationRules(
  candidate: SmartRouterCandidateInput,
  netProfitUsd: number,
): string[] {
  const reasons: string[] = [];

  if (netProfitUsd <= SMART_ROUTER_THRESHOLDS.minNetProfitUsd) {
    reasons.push("expected-net-profit-non-positive");
  }
  if (candidate.gasEstimateUsd > SMART_ROUTER_THRESHOLDS.maxGasUsd) {
    reasons.push("gas-exceeds-threshold");
  }
  if (
    candidate.slippageEstimateBps !== undefined &&
    candidate.slippageEstimateBps > SMART_ROUTER_THRESHOLDS.maxSlippageBps
  ) {
    reasons.push("slippage-exceeds-threshold");
  }
  if (
    candidate.liquidityDepthUsd !== undefined &&
    candidate.liquidityDepthUsd < SMART_ROUTER_THRESHOLDS.minLiquidityDepthUsd
  ) {
    reasons.push("insufficient-liquidity-for-trade-size");
  }
  if (
    candidate.historicalSuccessRate !== undefined &&
    candidate.historicalSuccessRate < SMART_ROUTER_THRESHOLDS.minHistoricalSuccessRate
  ) {
    reasons.push("historical-success-rate-below-threshold");
  }
  if (
    candidate.historicalLatencyMs !== undefined &&
    candidate.historicalLatencyMs > SMART_ROUTER_THRESHOLDS.maxHistoricalLatencyMs
  ) {
    reasons.push("historical-latency-exceeds-profitability-window");
  }

  return reasons;
}

function scoreCandidate(
  candidate: SmartRouterCandidateInput,
  learning: SmartRouterRouteLearning | undefined,
  confidenceCap: number | null,
): SmartRouterRecommendation {
  const flashLoanFee = candidate.flashLoanFeeUsd ?? 0;
  const netProfitUsd = round(
    candidate.grossArbitrageProfitUsd - candidate.gasEstimateUsd - flashLoanFee,
  );

  const eliminationReasons = applyEliminationRules(candidate, netProfitUsd);

  const successProbability = clamp(
    candidate.historicalSuccessRate ??
      (learning && learning.executionAttempts > 0
        ? learning.successfulExecutions / learning.executionAttempts
        : 0.5),
    0,
    1,
  );

  const gasPct =
    candidate.grossArbitrageProfitUsd > 0
      ? candidate.gasEstimateUsd / candidate.grossArbitrageProfitUsd
      : 1;

  const liquidityDepth = candidate.liquidityDepthUsd ?? candidate.inputTradeSizeUsd;
  const slippageBps = candidate.slippageEstimateBps ?? 20;
  const latencyMs = candidate.historicalLatencyMs ?? 60_000;
  const volatility = candidate.poolVolatilityScore ?? 50;
  const congestion = candidate.chainCongestionScore ?? 30;
  const consistency =
    learning && learning.executionAttempts > 0
      ? learning.successfulExecutions / learning.executionAttempts
      : successProbability;

  const positiveScore =
    SMART_ROUTER_WEIGHTS.netProfit * normalize(netProfitUsd, 0, 25) +
    SMART_ROUTER_WEIGHTS.expectedBps * normalize(candidate.expectedBps, 0, 50) +
    SMART_ROUTER_WEIGHTS.liquidityDepth * normalize(liquidityDepth, 0, 50_000) +
    SMART_ROUTER_WEIGHTS.lowSlippage * (1 - normalize(slippageBps, 0, 100)) +
    SMART_ROUTER_WEIGHTS.gasEfficiency * (1 - normalize(gasPct, 0, 1)) +
    SMART_ROUTER_WEIGHTS.executionSuccessHistory * successProbability +
    SMART_ROUTER_WEIGHTS.lowLatency * (1 - normalize(latencyMs, 0, 180_000)) +
    SMART_ROUTER_WEIGHTS.routeConsistency * consistency;

  const penaltyScore =
    (liquidityDepth < candidate.inputTradeSizeUsd * 1.2
      ? SMART_ROUTER_PENALTIES.thinLiquidity
      : 0) +
    ((candidate.priceImpactBps ?? 0) > 30 ? SMART_ROUTER_PENALTIES.highPriceImpact : 0) +
    (gasPct > 0.5 ? SMART_ROUTER_PENALTIES.excessiveGas : 0) +
    (candidate.dexHopCount > 2 ? SMART_ROUTER_PENALTIES.multiHop : 0) +
    (successProbability < 0.7 ? SMART_ROUTER_PENALTIES.historicalFailures : 0) +
    (volatility > 60 ? SMART_ROUTER_PENALTIES.highVolatility : 0) +
    (congestion > 70 ? SMART_ROUTER_PENALTIES.chainCongestion : 0);

  const compositeScore = round(Math.max(0, positiveScore - penaltyScore), 4);

  let confidenceScore = round(
    compositeScore * 100 * (0.6 + successProbability * 0.4),
    1,
  );

  if (learning) {
    const failureStreakPenalty = Math.min(learning.failedExecutions * 4, 25);
    const successBonus = Math.min(learning.successfulExecutions * 2, 15);
    confidenceScore = round(
      clamp(confidenceScore - failureStreakPenalty + successBonus, 0, 100),
      1,
    );
  }

  if (confidenceCap !== null) {
    confidenceScore = Math.min(confidenceScore, confidenceCap);
  }

  const liquidityScore = round(
    normalize(liquidityDepth, 0, 100_000) * 100 * (0.7 + successProbability * 0.3),
    1,
  );

  const recommendedTradeSizeUsd = round(
    clamp(
      candidate.inputTradeSizeUsd *
        (liquidityDepth / Math.max(candidate.inputTradeSizeUsd, 1)) *
        (0.5 + successProbability * 0.5),
      1_000,
      10_000,
    ),
    0,
  );

  const rejected =
    eliminationReasons.length > 0 ||
    confidenceScore < SMART_ROUTER_THRESHOLDS.minConfidenceForRecommendation;

  const pair = candidate.pair ?? candidate.tokenSequence.join("/");
  const routeDexes = candidate.routeDexes ?? ["unknown", "unknown"];

  return {
    route: candidate.routePath,
    routePath: candidate.routePath,
    pair,
    routeDexes,
    expectedNetProfitUsd: netProfitUsd,
    expectedBps: candidate.expectedBps,
    confidenceScore,
    successProbability: round(successProbability, 3),
    gasEstimateUsd: candidate.gasEstimateUsd,
    slippageEstimateBps: slippageBps,
    liquidityScore,
    recommendedTradeSizeUsd,
    riskLevel: computeRiskLevel(successProbability, confidenceScore, eliminationReasons),
    executionPriority: 0,
    compositeScore,
    rejected,
    eliminationReasons,
    learning: learning ?? {
      routeKey: routeKeyFromCandidate(candidate),
      detectionCount: 0,
      executionAttempts: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      skippedExecutions: 0,
      avgRealizedProfitUsd: null,
      avgRealizedBps: null,
      avgGasUsd: null,
      avgLatencyMs: null,
      roi: null,
      lastFailureReason: candidate.historicalFailureReason ?? null,
    },
  };
}

function rankRecommendations(recommendations: SmartRouterRecommendation[]) {
  return [...recommendations].sort((a, b) => {
    if (b.expectedNetProfitUsd !== a.expectedNetProfitUsd) {
      return b.expectedNetProfitUsd - a.expectedNetProfitUsd;
    }
    if (b.successProbability !== a.successProbability) {
      return b.successProbability - a.successProbability;
    }
    if (b.expectedBps !== a.expectedBps) {
      return b.expectedBps - a.expectedBps;
    }
    const gasEffA = a.gasEstimateUsd > 0 ? a.expectedNetProfitUsd / a.gasEstimateUsd : 0;
    const gasEffB = b.gasEstimateUsd > 0 ? b.expectedNetProfitUsd / b.gasEstimateUsd : 0;
    if (gasEffB !== gasEffA) return gasEffB - gasEffA;
    return b.compositeScore - a.compositeScore;
  });
}

export function evaluateSmartRouterCandidates(options: {
  candidates: SmartRouterCandidateInput[];
  learningIndex?: Map<string, SmartRouterRouteLearning>;
  confidenceCap?: number | null;
}): SmartRouterEvaluationResult {
  const learningIndex = options.learningIndex ?? new Map<string, SmartRouterRouteLearning>();
  const confidenceCap = options.confidenceCap ?? null;

  const scored = options.candidates.map((candidate) => {
    const key = routeKeyFromCandidate(candidate);
    return scoreCandidate(candidate, learningIndex.get(key), confidenceCap);
  });

  const approved = scored.filter((row) => !row.rejected);
  const rejected = scored.filter((row) => row.rejected);
  const ranked = rankRecommendations(approved).slice(
    0,
    SMART_ROUTER_THRESHOLDS.maxRecommendations,
  );

  ranked.forEach((row, index) => {
    row.executionPriority = index + 1;
  });

  return {
    generatedAt: new Date().toISOString(),
    specVersion: "1.0.0",
    mode: "recommend-only",
    thresholds: SMART_ROUTER_THRESHOLDS,
    dataSource: "live-candidates",
    candidatesEvaluated: scored.length,
    routesRejected: rejected.length,
    routesRecommended: ranked.length,
    learning: [...learningIndex.values()].sort(
      (a, b) => b.successfulExecutions - a.successfulExecutions,
    ),
    recommendations: ranked,
    rejected: rankRecommendations(rejected),
  };
}

export function evaluateSmartRouterFromExecutions(options: {
  executions: ArbitrageExecutionResponse[];
  confidenceCap?: number | null;
  candidates?: SmartRouterCandidateInput[];
}): SmartRouterEvaluationResult {
  const learningIndex = buildLearningIndex(options.executions);
  const candidates =
    options.candidates && options.candidates.length > 0
      ? options.candidates
      : buildCandidatesFromExecutions(options.executions);

  const result = evaluateSmartRouterCandidates({
    candidates,
    learningIndex,
    confidenceCap: options.confidenceCap ?? null,
  });

  return {
    ...result,
    dataSource:
      options.candidates && options.candidates.length > 0
        ? "live-candidates"
        : "historical-executions",
  };
}
