import {
  FLASHLOAN_OPPORTUNITY_THRESHOLDS,
  FLASHLOAN_PROVIDERS,
} from "../data/flashloanOpportunityConfig.js";
import type {
  SmartRouterEvaluationResult,
  SmartRouterRecommendation,
} from "./smartRouterScoringService.js";

export type FlashloanProviderId = keyof typeof FLASHLOAN_PROVIDERS;
export type FlashloanOpportunityAction = "OPPORTUNITY" | "WATCH" | "REJECT";

export type FlashloanOpportunity = {
  chain: string;
  route: string;
  pair: string;
  routeDexes: [string, string];
  providerId: FlashloanProviderId;
  providerName: string;
  action: FlashloanOpportunityAction;
  borrowAmountUsd: number;
  estimatedFlashloanFeeUsd: number;
  expectedNetProfitUsd: number;
  expectedRealizedProfitUsd: number;
  expectedValueUsd: number;
  expectedBps: number;
  confidenceScore: number;
  successProbability: number;
  gasEstimateUsd: number;
  slippageEstimateBps: number;
  liquidityScore: number;
  recommendedTradeSizeUsd: number;
  riskLevel: SmartRouterRecommendation["riskLevel"];
  executionPriority: number;
  profitToFeeRatio: number | null;
  rejectionReasons: string[];
};

export type FlashloanOpportunityResult = {
  generatedAt: string;
  mode: "recommend-only";
  executionPolicy: "risk-engine-approval-required";
  dataSource: "live-quotes" | "live-candidates" | "historical-executions";
  provider: {
    id: FlashloanProviderId;
    name: string;
    feeBps: number;
  };
  thresholds: typeof FLASHLOAN_OPPORTUNITY_THRESHOLDS;
  smartRouterGeneratedAt: string;
  candidatesEvaluated: number;
  opportunitiesFound: number;
  opportunities: FlashloanOpportunity[];
  rejected: FlashloanOpportunity[];
  liveQuoteScan?: {
    quotesAttempted: number;
    quotesSucceeded: number;
    ethUsdPrice: number;
    chainsScanned?: string[];
    byChain?: Record<
      string,
      {
        routesConfigured: number;
        quotesAttempted: number;
        quotesSucceeded: number;
        pairs: string[];
      }
    >;
    errors: string[];
  };
};

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function assessRecommendation(
  recommendation: SmartRouterRecommendation,
  providerId: FlashloanProviderId,
): FlashloanOpportunity {
  const provider = FLASHLOAN_PROVIDERS[providerId];
  const borrowAmountUsd = recommendation.recommendedTradeSizeUsd;
  const estimatedFlashloanFeeUsd = round((borrowAmountUsd * provider.feeBps) / 10_000);
  const sizeRatio =
    recommendation.inputTradeSizeUsd > 0
      ? Math.min(borrowAmountUsd / recommendation.inputTradeSizeUsd, 1)
      : 1;
  const scaledGrossProfitUsd = recommendation.grossArbitrageProfitUsd * sizeRatio;
  const expectedNetProfitUsd = round(
    scaledGrossProfitUsd - recommendation.gasEstimateUsd - estimatedFlashloanFeeUsd,
  );
  const successProbability = recommendation.successProbability;
  const expectedRealizedProfitUsd = round(
    expectedNetProfitUsd * successProbability,
  );
  const expectedFailureCostUsd = recommendation.gasEstimateUsd * (1 - successProbability);
  const expectedValueUsd = round(expectedRealizedProfitUsd - expectedFailureCostUsd);
  const profitToFeeRatio =
    estimatedFlashloanFeeUsd > 0
      ? round(expectedNetProfitUsd / estimatedFlashloanFeeUsd)
      : null;
  const rejectionReasons = [...recommendation.eliminationReasons];

  if (
    expectedNetProfitUsd < FLASHLOAN_OPPORTUNITY_THRESHOLDS.minExpectedNetProfitUsd
  ) {
    rejectionReasons.push("flashloan-net-profit-below-threshold");
  }
  if (
    expectedRealizedProfitUsd <
    FLASHLOAN_OPPORTUNITY_THRESHOLDS.minExpectedRealizedProfitUsd
  ) {
    rejectionReasons.push("expected-realized-profit-below-threshold");
  }
  if (
    successProbability < FLASHLOAN_OPPORTUNITY_THRESHOLDS.minSuccessProbability
  ) {
    rejectionReasons.push("success-probability-below-threshold");
  }
  if (
    recommendation.confidenceScore <
    FLASHLOAN_OPPORTUNITY_THRESHOLDS.minConfidenceScore
  ) {
    rejectionReasons.push("confidence-below-threshold");
  }
  if (
    profitToFeeRatio !== null &&
    profitToFeeRatio < FLASHLOAN_OPPORTUNITY_THRESHOLDS.minProfitToFeeRatio
  ) {
    rejectionReasons.push("profit-to-flashloan-fee-ratio-below-threshold");
  }

  const action: FlashloanOpportunityAction =
    rejectionReasons.length > 0
      ? "REJECT"
      : recommendation.riskLevel === "LOW" &&
          recommendation.confidenceScore >= 70
        ? "OPPORTUNITY"
        : "WATCH";

  return {
    chain: resolveOpportunityChain(recommendation),
    route: recommendation.route,
    pair: recommendation.pair,
    routeDexes: recommendation.routeDexes,
    providerId,
    providerName: provider.name,
    action,
    borrowAmountUsd,
    estimatedFlashloanFeeUsd,
    expectedNetProfitUsd,
    expectedRealizedProfitUsd,
    expectedValueUsd,
    expectedBps: recommendation.expectedBps,
    confidenceScore: recommendation.confidenceScore,
    successProbability,
    gasEstimateUsd: recommendation.gasEstimateUsd,
    slippageEstimateBps: recommendation.slippageEstimateBps,
    liquidityScore: recommendation.liquidityScore,
    recommendedTradeSizeUsd: recommendation.recommendedTradeSizeUsd,
    riskLevel: recommendation.riskLevel,
    executionPriority: 0,
    profitToFeeRatio,
    rejectionReasons,
  };
}

function resolveOpportunityChain(recommendation: SmartRouterRecommendation): string {
  const fromRoute = recommendation.route.split(":")[0]?.trim();
  if (fromRoute === "arbitrum" || fromRoute === "base" || fromRoute === "optimism") {
    return fromRoute;
  }
  const pair = recommendation.pair.toLowerCase();
  if (pair.includes("base")) return "base";
  if (pair.includes("optimism")) return "optimism";
  return "arbitrum";
}

export function evaluateFlashloanOpportunities(options: {
  smartRouter: SmartRouterEvaluationResult;
  providerId?: FlashloanProviderId;
  dataSource?: FlashloanOpportunityResult["dataSource"];
  liveQuoteScan?: FlashloanOpportunityResult["liveQuoteScan"];
}): FlashloanOpportunityResult {
  const providerId = options.providerId ?? "aave-v3";
  const provider = FLASHLOAN_PROVIDERS[providerId];
  const smartRouterRows = [
    ...options.smartRouter.recommendations,
    ...options.smartRouter.rejected,
  ];
  const assessed = smartRouterRows.map((row) => assessRecommendation(row, providerId));
  const opportunities = assessed
    .filter((row) => row.action !== "REJECT")
    .sort((a, b) => {
      if (b.expectedValueUsd !== a.expectedValueUsd) {
        return b.expectedValueUsd - a.expectedValueUsd;
      }
      if (b.successProbability !== a.successProbability) {
        return b.successProbability - a.successProbability;
      }
      return b.confidenceScore - a.confidenceScore;
    })
    .slice(0, FLASHLOAN_OPPORTUNITY_THRESHOLDS.maxOpportunities);

  opportunities.forEach((row, index) => {
    row.executionPriority = index + 1;
  });

  return {
    generatedAt: new Date().toISOString(),
    mode: "recommend-only",
    executionPolicy: "risk-engine-approval-required",
    dataSource:
      options.dataSource ??
      (options.smartRouter.dataSource === "live-candidates"
        ? "live-candidates"
        : "historical-executions"),
    provider: {
      id: providerId,
      name: provider.name,
      feeBps: provider.feeBps,
    },
    thresholds: FLASHLOAN_OPPORTUNITY_THRESHOLDS,
    smartRouterGeneratedAt: options.smartRouter.generatedAt,
    candidatesEvaluated: assessed.length,
    opportunitiesFound: opportunities.length,
    opportunities,
    rejected: assessed
      .filter((row) => row.action === "REJECT")
      .sort((a, b) => b.expectedValueUsd - a.expectedValueUsd),
    liveQuoteScan: options.liveQuoteScan,
  };
}

export function isFlashloanProviderId(value: unknown): value is FlashloanProviderId {
  return typeof value === "string" && value in FLASHLOAN_PROVIDERS;
}
