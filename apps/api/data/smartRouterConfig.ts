/** Configurable thresholds for Smart Router elimination rules. */
export const SMART_ROUTER_THRESHOLDS = {
  minNetProfitUsd: 0,
  maxGasUsd: 15,
  maxSlippageBps: 50,
  minLiquidityDepthUsd: 1_000,
  minHistoricalSuccessRate: 0.5,
  maxHistoricalLatencyMs: 120_000,
  minConfidenceForRecommendation: 40,
  maxRecommendations: 5,
  defaultTradeSizeUsd: 5_000,
} as const;

/** Weighted scoring model — positive factors dominate; penalties applied separately. */
export const SMART_ROUTER_WEIGHTS = {
  netProfit: 0.25,
  expectedBps: 0.1,
  liquidityDepth: 0.15,
  lowSlippage: 0.1,
  gasEfficiency: 0.1,
  executionSuccessHistory: 0.2,
  lowLatency: 0.05,
  routeConsistency: 0.05,
} as const;

export const SMART_ROUTER_PENALTIES = {
  thinLiquidity: 0.15,
  highPriceImpact: 0.12,
  excessiveGas: 0.1,
  multiHop: 0.08,
  historicalFailures: 0.15,
  highVolatility: 0.1,
  chainCongestion: 0.08,
} as const;
