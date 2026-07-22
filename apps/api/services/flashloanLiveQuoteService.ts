import {
  createPublicClient,
  formatUnits,
  http,
  parseUnits,
  type PublicClient,
} from "viem";
import {
  FLASHLOAN_LIVE_QUOTE_DEFAULTS,
  FLASHLOAN_PROVIDERS,
} from "../data/flashloanOpportunityConfig.js";
import {
  FLASHLOAN_CHAIN_CONFIGS,
  isFlashloanChainId,
  listFlashloanChains,
  resolveChainRpcUrl,
  type FlashloanChainConfig,
  type FlashloanChainId,
  type FlashloanQuoteLeg,
  type FlashloanQuoteRoute,
} from "../data/flashloanQuoteRoutes.js";
import type { SmartRouterCandidateInput } from "./smartRouterScoringService.js";

const quoterV1Abi = [
  {
    type: "function",
    name: "quoteExactInputSingle",
    stateMutability: "nonpayable",
    inputs: [
      { name: "tokenIn", type: "address" },
      { name: "tokenOut", type: "address" },
      { name: "fee", type: "uint24" },
      { name: "amountIn", type: "uint256" },
      { name: "sqrtPriceLimitX96", type: "uint160" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
  },
] as const;

const quoterV2Abi = [
  {
    type: "function",
    name: "quoteExactInputSingle",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "fee", type: "uint24" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      },
    ],
    outputs: [
      { name: "amountOut", type: "uint256" },
      { name: "sqrtPriceX96After", type: "uint160" },
      { name: "initializedTicksCrossed", type: "uint32" },
      { name: "gasEstimate", type: "uint256" },
    ],
  },
] as const;

const v2RouterAbi = [
  {
    type: "function",
    name: "getAmountsOut",
    stateMutability: "view",
    inputs: [
      { name: "amountIn", type: "uint256" },
      { name: "path", type: "address[]" },
    ],
    outputs: [{ name: "amounts", type: "uint256[]" }],
  },
] as const;

export type LiveFlashloanQuote = {
  chain: FlashloanChainId;
  chainName: string;
  chainId: number;
  routeId: string;
  pair: string;
  routePath: string;
  routeDexes: [string, string];
  flashToken: string;
  sizeFlashToken: number;
  amountIn: string;
  amountOut: string;
  intermediateAmount: string;
  inputTradeSizeUsd: number;
  expectedOutputUsd: number;
  grossArbitrageProfitUsd: number;
  expectedBps: number;
  quotedAt: string;
};

export type LiveFlashloanQuoteScan = {
  generatedAt: string;
  mode: "recommend-only";
  dataSource: "live-quotes";
  ethUsdPrice: number;
  chainsScanned: FlashloanChainId[];
  routesConfigured: number;
  quotesAttempted: number;
  quotesSucceeded: number;
  quotes: LiveFlashloanQuote[];
  candidates: SmartRouterCandidateInput[];
  byChain: Record<
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

type QuoteCache = {
  fetchedAt: number;
  cacheKey: string;
  scan: LiveFlashloanQuoteScan;
};

let quoteCache: QuoteCache | null = null;

function getEthUsdPrice() {
  const raw = process.env.ETH_USD_PRICE ?? "2350";
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 2350;
}

function round(value: number, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function tokenUsd(symbol: string, amount: number, ethUsd: number) {
  if (symbol === "WETH" || symbol === "ETH") return amount * ethUsd;
  if (symbol === "USDC" || symbol === "USDT" || symbol === "DAI") return amount;
  if (symbol === "ARB") {
    const arbUsd = Number(process.env.ARB_USD_PRICE ?? "0.35");
    return amount * (Number.isFinite(arbUsd) && arbUsd > 0 ? arbUsd : 0.35);
  }
  if (symbol === "OP") {
    const opUsd = Number(process.env.OP_USD_PRICE ?? "0.7");
    return amount * (Number.isFinite(opUsd) && opUsd > 0 ? opUsd : 0.7);
  }
  return amount * ethUsd;
}

function getClient(config: FlashloanChainConfig): PublicClient {
  return createPublicClient({
    chain: config.viemChain,
    transport: http(resolveChainRpcUrl(config)),
  });
}

async function quoteLeg(
  client: PublicClient,
  chain: FlashloanChainConfig,
  leg: FlashloanQuoteLeg,
  amountIn: bigint,
): Promise<bigint | null> {
  const tokenIn = chain.tokens[leg.tokenIn];
  const tokenOut = chain.tokens[leg.tokenOut];
  if (!tokenIn || !tokenOut || amountIn <= 0n) return null;

  try {
    if (leg.type === "v3") {
      if (chain.quoterStyle === "v2") {
        const result = await client.simulateContract({
          address: chain.quoter,
          abi: quoterV2Abi,
          functionName: "quoteExactInputSingle",
          args: [
            {
              tokenIn: tokenIn.address,
              tokenOut: tokenOut.address,
              amountIn,
              fee: leg.fee,
              sqrtPriceLimitX96: 0n,
            },
          ],
        });
        const amountOut = result.result[0];
        return amountOut > 0n ? amountOut : null;
      }

      const result = await client.simulateContract({
        address: chain.quoter,
        abi: quoterV1Abi,
        functionName: "quoteExactInputSingle",
        args: [tokenIn.address, tokenOut.address, leg.fee, amountIn, 0n],
      });
      return result.result > 0n ? result.result : null;
    }

    const amounts = await client.readContract({
      address: leg.router,
      abi: v2RouterAbi,
      functionName: "getAmountsOut",
      args: [amountIn, [tokenIn.address, tokenOut.address]],
    });
    const amountOut = amounts[amounts.length - 1];
    return amountOut !== undefined && amountOut > 0n ? amountOut : null;
  } catch {
    return null;
  }
}

async function quoteRouteSize(
  client: PublicClient,
  chain: FlashloanChainConfig,
  route: FlashloanQuoteRoute,
  sizeFlashToken: number,
  ethUsd: number,
  quotedAt: string,
): Promise<{ quote: LiveFlashloanQuote; candidate: SmartRouterCandidateInput } | null> {
  const flash = chain.tokens[route.flashToken];
  if (!flash) return null;

  const amountIn = parseUnits(String(sizeFlashToken), flash.decimals);
  const mid = await quoteLeg(client, chain, route.legs[0], amountIn);
  if (mid === null) return null;
  const amountOut = await quoteLeg(client, chain, route.legs[1], mid);
  if (amountOut === null) return null;

  const outHuman = Number(formatUnits(amountOut, flash.decimals));
  const profitToken = outHuman - sizeFlashToken;
  const profitPct = (profitToken / sizeFlashToken) * 100;
  if (profitPct > FLASHLOAN_LIVE_QUOTE_DEFAULTS.maxPlausibleProfitPct) return null;
  if (profitPct < -FLASHLOAN_LIVE_QUOTE_DEFAULTS.maxPlausibleLossPct) return null;

  const inputTradeSizeUsd = round(tokenUsd(route.flashToken, sizeFlashToken, ethUsd), 2);
  const expectedOutputUsd = round(tokenUsd(route.flashToken, outHuman, ethUsd), 2);
  const grossArbitrageProfitUsd = round(expectedOutputUsd - inputTradeSizeUsd, 4);
  const expectedBps = round(
    (grossArbitrageProfitUsd / Math.max(inputTradeSizeUsd, 1e-9)) * 10_000,
    2,
  );
  const flashLoanFeeUsd = round(
    (inputTradeSizeUsd * FLASHLOAN_PROVIDERS["aave-v3"].feeBps) / 10_000,
    4,
  );
  const routePath = `${chain.name}:${route.legs[0].label}→${route.legs[1].label}`;
  const routeDexes: [string, string] = [route.legs[0].label, route.legs[1].label];

  const quote: LiveFlashloanQuote = {
    chain: chain.id,
    chainName: chain.name,
    chainId: chain.chainId,
    routeId: route.id,
    pair: route.pair,
    routePath,
    routeDexes,
    flashToken: route.flashToken,
    sizeFlashToken,
    amountIn: amountIn.toString(),
    amountOut: amountOut.toString(),
    intermediateAmount: mid.toString(),
    inputTradeSizeUsd,
    expectedOutputUsd,
    grossArbitrageProfitUsd,
    expectedBps,
    quotedAt,
  };

  const candidate: SmartRouterCandidateInput = {
    routePath: `${chain.id}:${route.pair}:${route.id}@${sizeFlashToken}`,
    tokenSequence: route.pair.split("/"),
    inputTradeSizeUsd,
    expectedOutputUsd,
    grossArbitrageProfitUsd,
    expectedBps,
    gasEstimateUsd: FLASHLOAN_LIVE_QUOTE_DEFAULTS.gasEstimateUsd,
    flashLoanFeeUsd,
    liquidityDepthUsd: round(inputTradeSizeUsd * 25, 0),
    priceImpactBps: Math.max(5, Math.abs(expectedBps) * 0.15),
    slippageEstimateBps: FLASHLOAN_LIVE_QUOTE_DEFAULTS.slippageEstimateBps,
    dexHopCount: 2,
    historicalSuccessRate: FLASHLOAN_LIVE_QUOTE_DEFAULTS.coldStartSuccessProbability,
    historicalRealizedVsQuotedRatio: 0.85,
    historicalLatencyMs: FLASHLOAN_LIVE_QUOTE_DEFAULTS.historicalLatencyMs,
    historicalFailureReason: null,
    poolTvlUsd: round(inputTradeSizeUsd * 40, 0),
    poolVolatilityScore: 35,
    blockTimestamp: quotedAt,
    chainCongestionScore: 25,
    pair: `${route.pair} (${chain.name})`,
    routeDexes,
  };

  return { quote, candidate };
}

const INTER_QUOTE_DELAY_MS = 120;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveChains(filter?: FlashloanChainId | FlashloanChainId[]): FlashloanChainConfig[] {
  if (!filter) return listFlashloanChains();
  const ids = Array.isArray(filter) ? filter : [filter];
  return ids
    .filter(isFlashloanChainId)
    .map((id) => FLASHLOAN_CHAIN_CONFIGS[id]);
}

/**
 * Read-only on-chain quote scan across curated L2 flashloan routes.
 * Never signs, casts, or executes.
 */
export async function scanLiveFlashloanQuotes(options?: {
  forceRefresh?: boolean;
  chains?: FlashloanChainId | FlashloanChainId[];
}): Promise<LiveFlashloanQuoteScan> {
  const chains = resolveChains(options?.chains);
  const cacheKey = chains.map((c) => c.id).sort().join(",");
  const now = Date.now();
  if (
    !options?.forceRefresh &&
    quoteCache &&
    quoteCache.cacheKey === cacheKey &&
    now - quoteCache.fetchedAt < FLASHLOAN_LIVE_QUOTE_DEFAULTS.quoteCacheTtlMs
  ) {
    return quoteCache.scan;
  }

  const ethUsdPrice = getEthUsdPrice();
  const quotedAt = new Date().toISOString();
  const quotes: LiveFlashloanQuote[] = [];
  const candidates: SmartRouterCandidateInput[] = [];
  const errors: string[] = [];
  const byChain: LiveFlashloanQuoteScan["byChain"] = {};
  let quotesAttempted = 0;
  let routesConfigured = 0;

  for (const chain of chains) {
    routesConfigured += chain.routes.length;
    byChain[chain.id] = {
      routesConfigured: chain.routes.length,
      quotesAttempted: 0,
      quotesSucceeded: 0,
      pairs: [...new Set(chain.routes.map((route) => route.pair))],
    };
    const client = getClient(chain);

    for (const route of chain.routes) {
      for (const size of route.sizesFlashToken) {
        quotesAttempted += 1;
        byChain[chain.id].quotesAttempted += 1;
        try {
          const result = await quoteRouteSize(
            client,
            chain,
            route,
            size,
            ethUsdPrice,
            quotedAt,
          );
          if (!result) {
            errors.push(`${chain.id}:${route.id}@${size}:quote-null-or-implausible`);
            continue;
          }
          quotes.push(result.quote);
          candidates.push(result.candidate);
          byChain[chain.id].quotesSucceeded += 1;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push(`${chain.id}:${route.id}@${size}:${message.slice(0, 120)}`);
        }
        // Gentle pacing so public RPCs (Base especially) don't rate-limit bursts.
        await sleep(INTER_QUOTE_DELAY_MS);
      }
    }
  }

  const bestByRoute = new Map<string, SmartRouterCandidateInput>();
  for (const candidate of candidates) {
    const key = candidate.routePath.split("@")[0] ?? candidate.routePath;
    const existing = bestByRoute.get(key);
    if (!existing || candidate.grossArbitrageProfitUsd > existing.grossArbitrageProfitUsd) {
      bestByRoute.set(key, candidate);
    }
  }

  const scan: LiveFlashloanQuoteScan = {
    generatedAt: quotedAt,
    mode: "recommend-only",
    dataSource: "live-quotes",
    ethUsdPrice,
    chainsScanned: chains.map((c) => c.id),
    routesConfigured,
    quotesAttempted,
    quotesSucceeded: quotes.length,
    quotes: quotes.sort((a, b) => b.grossArbitrageProfitUsd - a.grossArbitrageProfitUsd),
    candidates: [...bestByRoute.values()].sort(
      (a, b) => b.grossArbitrageProfitUsd - a.grossArbitrageProfitUsd,
    ),
    byChain,
    errors: errors.slice(0, 40),
  };

  quoteCache = { fetchedAt: now, cacheKey, scan };
  return scan;
}
