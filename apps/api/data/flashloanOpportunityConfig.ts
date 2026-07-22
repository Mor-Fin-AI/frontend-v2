/**
 * Flashloan screening defaults. Provider fees may be overridden by callers
 * when evaluating a candidate set.
 */
export const FLASHLOAN_PROVIDERS = {
  "aave-v3": {
    name: "Aave V3",
    feeBps: 9,
  },
  "balancer-v2": {
    name: "Balancer V2",
    feeBps: 0,
  },
} as const;

export const FLASHLOAN_OPPORTUNITY_THRESHOLDS = {
  minExpectedNetProfitUsd: 1,
  minExpectedRealizedProfitUsd: 0.5,
  minSuccessProbability: 0.6,
  minConfidenceScore: 50,
  minProfitToFeeRatio: 2,
  maxOpportunities: 5,
} as const;

/** Priors applied to live DEX quotes that have no route execution history yet. */
export const FLASHLOAN_LIVE_QUOTE_DEFAULTS = {
  coldStartSuccessProbability: 0.72,
  gasEstimateUsd: 2,
  slippageEstimateBps: 15,
  historicalLatencyMs: 12_000,
  maxPlausibleProfitPct: 5,
  maxPlausibleLossPct: 8,
  quoteCacheTtlMs: 30_000,
} as const;
