import type { Hash } from "viem";
import type {
  ArbitrageExecutionRow,
} from "@/app/(dashboard)/arbitrage-monitor/data";
import type { DexSlug } from "@/lib/dexRegistry";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export type ArbitrageExecutionResponse = {
  id: string;
  txHash: Hash;
  pair: string;
  chain: "arbitrum";
  route: string;
  routeDexes: [string, string];
  profitUsd: number;
  gasUsd: number;
  status: "Executed" | "Skipped" | "Failed";
  executedAt: string;
  executedAtIso?: string | null;
  blockNumber: number;
  dsaAddress: string;
  nonce: number;
  isLive: true;
};

export type ArbitrageExecutionsPageResponse = {
  chainId: number;
  chain: string;
  platformDsa: string | null;
  executions: ArbitrageExecutionResponse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  ethUsdPrice: number;
  isLive: true;
};

export type FetchArbitrageExecutionsParams = {
  page?: number;
  pageSize?: number;
  walletAddress?: string;
  search?: string;
  sortBy?: string;
};

export async function fetchArbitrageExecutions(
  params: FetchArbitrageExecutionsParams = {}
) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.walletAddress) query.set("wallet", params.walletAddress);
  if (params.search) query.set("search", params.search);
  if (params.sortBy) query.set("sortBy", params.sortBy);

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  const response = await fetch(`${API_BASE}/arbitrage/executions${suffix}`);
  const payload = (await response.json().catch(() => ({}))) as
    ArbitrageExecutionsPageResponse & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load arbitrage executions.");
  }

  return payload;
}

function toDexSlug(value: string): DexSlug {
  const normalized = value.toLowerCase();
  if (
    normalized === "sushiswap" ||
    normalized === "pancakeswap" ||
    normalized === "curve" ||
    normalized === "balancer"
  ) {
    return normalized;
  }
  return "uniswap";
}

export function mapLiveArbitrageExecutions(
  rows: ArbitrageExecutionResponse[]
): ArbitrageExecutionRow[] {
  return rows.map((row) => ({
    id: row.id,
    txHash: row.txHash,
    pair: row.pair,
    chain: row.chain,
    route: row.route,
    routeDexes: [toDexSlug(row.routeDexes[0]), toDexSlug(row.routeDexes[1])],
    profitUsd: row.profitUsd,
    gasUsd: row.gasUsd,
    status: row.status,
    executedAt: row.executedAt,
    isLive: true,
  }));
}
