const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export type FlashloanOpportunityAction = "OPPORTUNITY" | "WATCH" | "REJECT";
export type FlashloanRiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type FlashloanOpportunityRow = {
  chain: string;
  route: string;
  pair: string;
  routeDexes: [string, string];
  providerId: string;
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
  riskLevel: FlashloanRiskLevel;
  executionPriority: number;
  profitToFeeRatio: number | null;
  rejectionReasons: string[];
};

export type FlashloanOpportunitiesResponse = {
  generatedAt: string;
  mode: "recommend-only";
  executionPolicy: string;
  dataSource: "live-quotes" | "live-candidates" | "historical-executions";
  provider: {
    id: string;
    name: string;
    feeBps: number;
  };
  candidatesEvaluated: number;
  opportunitiesFound: number;
  opportunities: FlashloanOpportunityRow[];
  rejected: FlashloanOpportunityRow[];
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

export type FetchFlashloanOpportunitiesParams = {
  provider?: string;
  chain?: string;
  refresh?: boolean;
};

export async function fetchFlashloanOpportunities(
  params: FetchFlashloanOpportunitiesParams = {},
) {
  const query = new URLSearchParams();
  if (params.provider) query.set("provider", params.provider);
  if (params.chain) query.set("chain", params.chain);
  if (params.refresh) query.set("refresh", "1");

  const qs = query.toString();
  const response = await fetch(
    `${API_BASE}/agents/flashloan-opportunities${qs ? `?${qs}` : ""}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to load flashloan opportunities (${response.status})`);
  }
  return (await response.json()) as FlashloanOpportunitiesResponse;
}
