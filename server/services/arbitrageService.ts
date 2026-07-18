import {
  createPublicClient,
  decodeEventLog,
  formatEther,
  formatUnits,
  getAddress,
  http,
  isAddress,
  type Address,
  type Hash,
  type Log,
} from "viem";
import { arbitrum } from "viem/chains";
import {
  ARBITRUM_WETH,
  getArbitrumRpcUrl,
  loadMorDeployments,
} from "../lib/contracts.js";
import {
  erc20TransferTopic,
  flashloanExecutedAbi,
  morDsaCastAbi,
  swapExecutedAbi,
  uniswapV2SwapTopic,
  uniswapV3SwapTopic,
} from "../lib/arbitrageAbi.js";
import {
  loadConnectorRegistry,
  loadKnownPoolRegistry,
  type ConnectorMeta,
} from "../lib/arbitrageConnectors.js";
import { getDsaAccountsForOwner } from "./dsaService.js";

const ARBITRUM_USDC = "0xaf88d065e77c8cc2239327c5edb3a432268e5831" as Address;
const ARBITRUM_ARB = "0x912CE59144191C1204E64559FE8253a0e49E6548" as Address;

const TOKEN_SYMBOLS: Record<string, { symbol: string; decimals: number }> = {
  [ARBITRUM_WETH.toLowerCase()]: { symbol: "ETH", decimals: 18 },
  [ARBITRUM_USDC.toLowerCase()]: { symbol: "USDC", decimals: 6 },
  [ARBITRUM_ARB.toLowerCase()]: { symbol: "ARB", decimals: 18 },
};

export type ArbitrageExecutionStatus = "Executed" | "Skipped" | "Failed";

export type ArbitrageExecutionResponse = {
  id: string;
  txHash: Hash;
  pair: string;
  chain: "arbitrum";
  route: string;
  routeDexes: [string, string];
  profitUsd: number;
  gasUsd: number;
  status: ArbitrageExecutionStatus;
  executedAt: string;
  executedAtIso: string | null;
  blockNumber: number;
  dsaAddress: Address;
  nonce: number;
  isLive: true;
};

export type ArbitrageExecutionsPageResponse = {
  chainId: number;
  chain: string;
  platformDsa: Address | null;
  executions: ArbitrageExecutionResponse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  ethUsdPrice: number;
  isLive: true;
};

type CachedCast = {
  txHash: Hash;
  blockNumber: bigint;
  dsaAddress: Address;
  origin: Address;
  nonce: bigint;
  spellCount: bigint;
};

type CastCache = {
  fetchedAt: number;
  dsaKey: string;
  casts: CachedCast[];
};

let castCache: CastCache | null = null;
const CACHE_TTL_MS = 60_000;

function getClient() {
  return createPublicClient({
    chain: arbitrum,
    transport: http(getArbitrumRpcUrl()),
  });
}

function getEthUsdPrice() {
  const raw = process.env.ETH_USD_PRICE ?? "2350";
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 2350;
}

function formatExecutionTime(timestamp: bigint | number) {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toExecutionIso(timestamp: bigint | number) {
  const ms = Number(timestamp) * 1000;
  return Number.isFinite(ms) && ms > 0 ? new Date(ms).toISOString() : null;
}

function buildPairLabel(tokens: Set<string>) {
  const symbols = [...tokens]
    .map((token) => TOKEN_SYMBOLS[token.toLowerCase()]?.symbol)
    .filter(Boolean) as string[];

  if (symbols.length >= 2) {
    return `${symbols[0]}/${symbols[1]}`;
  }
  if (symbols.length === 1) {
    return `${symbols[0]}/USDC`;
  }
  return "ETH/USDC";
}

function buildRouteLabel(labels: string[]) {
  const unique = [...new Set(labels.filter(Boolean))];
  if (unique.length === 0) return "MorDSA spell cast";
  if (unique.length === 1) return unique[0];
  return unique.join(" → ");
}

function toRouteDexes(labels: string[]): [string, string] {
  const slugs = labels.map((label) => {
    const normalized = label.toLowerCase();
    if (normalized.includes("sushi")) return "sushiswap";
    if (normalized.includes("pancake")) return "pancakeswap";
    if (normalized.includes("curve")) return "curve";
    if (normalized.includes("balancer")) return "balancer";
    return "uniswap";
  });
  if (slugs.length === 0) return ["uniswap", "uniswap"];
  if (slugs.length === 1) return [slugs[0], slugs[0]] as [string, string];
  return [slugs[0], slugs[1]] as [string, string];
}

function computeGasUsd(
  gasUsed: bigint,
  effectiveGasPrice: bigint,
  ethUsdPrice: number
) {
  const gasEth = Number(formatEther(gasUsed * effectiveGasPrice));
  return gasEth * ethUsdPrice;
}

function computeProfitUsd(
  logs: Log[],
  dsaAddress: Address,
  ethUsdPrice: number
) {
  const weth = ARBITRUM_WETH.toLowerCase();
  const usdc = ARBITRUM_USDC.toLowerCase();
  const dsa = dsaAddress.toLowerCase();
  let wethDelta = 0n;
  let usdcDelta = 0n;

  for (const log of logs) {
    if (log.topics[0]?.toLowerCase() !== erc20TransferTopic) continue;
    if (log.topics.length < 3) continue;

    const token = log.address.toLowerCase();
    const from = `0x${log.topics[1]!.slice(26)}`.toLowerCase();
    const to = `0x${log.topics[2]!.slice(26)}`.toLowerCase();
    const amount = BigInt(log.data);

    if (token === weth) {
      if (to === dsa) wethDelta += amount;
      if (from === dsa) wethDelta -= amount;
    }
    if (token === usdc) {
      if (to === dsa) usdcDelta += amount;
      if (from === dsa) usdcDelta -= amount;
    }
  }

  const wethProfit = Number(formatEther(wethDelta > 0n ? wethDelta : 0n));
  const usdcProfit = Number(formatUnits(usdcDelta > 0n ? usdcDelta : 0n, 6));
  return wethProfit * ethUsdPrice + usdcProfit;
}

function collectTokensFromLogs(logs: Log[]) {
  const tokens = new Set<string>();

  for (const log of logs) {
    if (log.topics[0]?.toLowerCase() === erc20TransferTopic) {
      tokens.add(log.address);
    }

    try {
      const decoded = decodeEventLog({
        abi: swapExecutedAbi,
        data: log.data,
        topics: log.topics,
      });
      tokens.add(String(decoded.args.tokenIn));
      tokens.add(String(decoded.args.tokenOut));
    } catch {
      // not a connector swap log
    }
  }

  return tokens;
}

function collectDexLabels(
  logs: Log[],
  connectorByAddress: Map<string, ConnectorMeta>,
  poolByAddress: Record<string, { label: string; slug: string }>
) {
  const labels: string[] = [];

  for (const log of logs) {
    const address = log.address.toLowerCase();
    const connector = connectorByAddress.get(address);
    if (connector) {
      labels.push(connector.label);
      continue;
    }

    const pool = poolByAddress[address];
    if (pool) {
      labels.push(pool.label);
      continue;
    }

    const topic = log.topics[0]?.toLowerCase();
    if (topic === uniswapV3SwapTopic) {
      labels.push("Uniswap V3");
    } else if (topic === uniswapV2SwapTopic) {
      labels.push("Uniswap V2");
    }

    try {
      decodeEventLog({
        abi: flashloanExecutedAbi,
        data: log.data,
        topics: log.topics,
      });
      labels.push("Flashloan");
    } catch {
      // ignore
    }
  }

  return labels;
}

async function resolveDsaAddresses(walletAddress?: string) {
  const deployments = loadMorDeployments();
  const addresses: Address[] = [];

  const platformRaw = deployments.dsaProxy;
  if (typeof platformRaw === "string" && isAddress(platformRaw)) {
    addresses.push(getAddress(platformRaw));
  }

  if (walletAddress && isAddress(walletAddress)) {
    try {
      const owner = getAddress(walletAddress);
      const dsaResponse = await getDsaAccountsForOwner(owner);
      for (const account of dsaResponse.accounts) {
        if (
          !addresses.some(
            (a) => a.toLowerCase() === account.address.toLowerCase()
          )
        ) {
          addresses.push(getAddress(account.address));
        }
      }
    } catch {
      // ignore wallet lookup failures
    }
  }

  return addresses;
}

function classifyStatus(
  receiptStatus: "success" | "reverted",
  dexLabels: string[],
  spellCount: bigint
): ArbitrageExecutionStatus {
  if (receiptStatus === "reverted") return "Failed";
  if (dexLabels.length > 0 || spellCount > 0n) return "Executed";
  return "Skipped";
}

async function loadCastEvents(dsaAddresses: Address[]): Promise<CachedCast[]> {
  const dsaKey = dsaAddresses
    .map((a) => a.toLowerCase())
    .sort()
    .join(",");
  const now = Date.now();

  if (
    castCache &&
    castCache.dsaKey === dsaKey &&
    now - castCache.fetchedAt < CACHE_TTL_MS
  ) {
    return castCache.casts;
  }

  const client = getClient();
  const uniqueDsas = [...new Set(dsaAddresses.map((a) => getAddress(a)))];

  const results = await Promise.all(
    uniqueDsas.map(async (dsaAddress) => {
      const events = await client.getContractEvents({
        address: dsaAddress,
        abi: morDsaCastAbi,
        eventName: "Cast",
        fromBlock: 0n,
        toBlock: "latest",
      });

      return events.map((event) => ({
        txHash: event.transactionHash,
        blockNumber: event.blockNumber ?? 0n,
        dsaAddress,
        origin: getAddress(event.args.origin!),
        nonce: event.args.nonce ?? 0n,
        spellCount: event.args.spellCount ?? 0n,
      }));
    })
  );

  const casts = results
    .flat()
    .sort((a, b) => {
      if (a.blockNumber === b.blockNumber) {
        return a.txHash.localeCompare(b.txHash);
      }
      return Number(b.blockNumber - a.blockNumber);
    });

  castCache = { fetchedAt: now, dsaKey, casts };
  return casts;
}

function filterCasts(casts: CachedCast[], search: string) {
  const query = search.trim().toLowerCase();
  if (!query) return casts;

  return casts.filter((cast) =>
    [
      cast.txHash,
      cast.dsaAddress,
      String(cast.nonce),
      String(cast.blockNumber),
    ].some((value) => value.toLowerCase().includes(query))
  );
}

function sortCasts(casts: CachedCast[], sortBy: string) {
  const rows = [...casts];
  if (sortBy === "pair") {
    rows.sort((a, b) => Number(b.nonce - a.nonce));
    return rows;
  }
  return rows.sort((a, b) => {
    if (a.blockNumber === b.blockNumber) {
      return a.txHash.localeCompare(b.txHash);
    }
    return Number(b.blockNumber - a.blockNumber);
  });
}

async function enrichCastPage(
  casts: CachedCast[],
  ethUsdPrice: number
): Promise<ArbitrageExecutionResponse[]> {
  if (casts.length === 0) return [];

  const deployments = loadMorDeployments();
  const client = getClient();
  const connectors = loadConnectorRegistry(deployments);
  const connectorByAddress = new Map(
    connectors.map((connector) => [connector.address.toLowerCase(), connector])
  );
  const poolByAddress = loadKnownPoolRegistry(deployments);

  const blockNumbers = [...new Set(casts.map((cast) => cast.blockNumber))];
  const blockTimestamps = new Map<bigint, bigint>();
  for (const blockNumber of blockNumbers) {
    const block = await client.getBlock({ blockNumber });
    blockTimestamps.set(blockNumber, block.timestamp);
  }

  const rows = await Promise.all(
    casts.map(async (cast) => {
      const receipt = await client.getTransactionReceipt({ hash: cast.txHash });
      const dexLabels = collectDexLabels(
        receipt.logs,
        connectorByAddress,
        poolByAddress
      );
      const tokens = collectTokensFromLogs(receipt.logs);
      for (const token of [ARBITRUM_WETH, ARBITRUM_USDC, ARBITRUM_ARB]) {
        if (
          receipt.logs.some(
            (log) => log.address.toLowerCase() === token.toLowerCase()
          )
        ) {
          tokens.add(token);
        }
      }

      const status = classifyStatus(
        receipt.status,
        dexLabels,
        cast.spellCount
      );
      const routeLabels = dexLabels.length
        ? dexLabels
        : cast.spellCount > 0n
          ? [`MorDSA Cast #${cast.nonce}`]
          : ["MorDSA Cast"];
      const route = buildRouteLabel(routeLabels);
      const routeDexes = toRouteDexes(routeLabels);
      const profitUsd = computeProfitUsd(
        receipt.logs,
        cast.dsaAddress,
        ethUsdPrice
      );
      const gasUsd = computeGasUsd(
        receipt.gasUsed,
        receipt.effectiveGasPrice,
        ethUsdPrice
      );
      const timestamp = blockTimestamps.get(cast.blockNumber) ?? 0n;

      return {
        id: cast.txHash,
        txHash: cast.txHash,
        pair: buildPairLabel(tokens),
        chain: "arbitrum" as const,
        route,
        routeDexes,
        profitUsd: Math.max(0, profitUsd),
        gasUsd,
        status,
        executedAt: formatExecutionTime(timestamp),
        executedAtIso: toExecutionIso(timestamp),
        blockNumber: Number(cast.blockNumber),
        dsaAddress: cast.dsaAddress,
        nonce: Number(cast.nonce),
        isLive: true as const,
      };
    })
  );

  if (casts.length > 1) {
    rows.sort((a, b) => b.blockNumber - a.blockNumber);
  }

  return rows;
}

export async function getArbitrageExecutions(options: {
  page?: number;
  pageSize?: number;
  walletAddress?: string;
  search?: string;
  sortBy?: string;
}): Promise<ArbitrageExecutionsPageResponse> {
  const deployments = loadMorDeployments();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(5, options.pageSize ?? 10));
  const ethUsdPrice = getEthUsdPrice();
  const dsaAddresses = await resolveDsaAddresses(options.walletAddress);
  const allCasts = sortCasts(
    filterCasts(await loadCastEvents(dsaAddresses), options.search ?? ""),
    options.sortBy ?? "time"
  );

  const total = allCasts.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const resolvedPage = Math.min(page, totalPages);
  const pageCasts = allCasts.slice(
    (resolvedPage - 1) * pageSize,
    resolvedPage * pageSize
  );

  let executions = await enrichCastPage(pageCasts, ethUsdPrice);
  if (options.sortBy === "profit") {
    executions = [...executions].sort((a, b) => b.profitUsd - a.profitUsd);
  } else if (options.sortBy === "pair") {
    executions = [...executions].sort((a, b) => a.pair.localeCompare(b.pair));
  }

  const platformDsaRaw = deployments.dsaProxy;
  const platformDsa =
    typeof platformDsaRaw === "string" && isAddress(platformDsaRaw)
      ? getAddress(platformDsaRaw)
      : null;

  return {
    chainId: Number(deployments.chainId),
    chain: String(deployments.chain),
    platformDsa,
    executions,
    page: resolvedPage,
    pageSize,
    total,
    totalPages,
    ethUsdPrice,
    isLive: true,
  };
}
