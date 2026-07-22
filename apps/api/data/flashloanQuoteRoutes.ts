import type { Address, Chain } from "viem";
import { getAddress } from "viem";
import { arbitrum, base, optimism } from "viem/chains";

/**
 * Multi-chain curated flashloan quote graph (recommend-only).
 * Quotes are read-only eth_call / Quoter staticCall. No execution.
 */
export type FlashloanChainId = "arbitrum" | "base" | "optimism";

export type FlashloanQuoteToken = {
  symbol: string;
  address: Address;
  decimals: number;
};

export type FlashloanQuoteLeg =
  | {
      type: "v3";
      dex: string;
      label: string;
      tokenIn: string;
      tokenOut: string;
      fee: number;
      pool: Address;
    }
  | {
      type: "v2";
      dex: string;
      label: string;
      tokenIn: string;
      tokenOut: string;
      router: Address;
      pool?: Address;
    };

export type FlashloanQuoteRoute = {
  id: string;
  pair: string;
  flashToken: string;
  legs: [FlashloanQuoteLeg, FlashloanQuoteLeg];
  sizesFlashToken: number[];
};

export type FlashloanChainConfig = {
  id: FlashloanChainId;
  name: string;
  chainId: number;
  viemChain: Chain;
  rpcEnvKeys: string[];
  defaultRpc: string;
  quoter: Address;
  quoterStyle: "v1" | "v2";
  tokens: Record<string, FlashloanQuoteToken>;
  routes: FlashloanQuoteRoute[];
};

function token(
  symbol: string,
  address: string,
  decimals: number,
): FlashloanQuoteToken {
  return { symbol, address: getAddress(address), decimals };
}

function v3Leg(
  label: string,
  tokenIn: string,
  tokenOut: string,
  fee: number,
  pool: string,
): FlashloanQuoteLeg {
  return {
    type: "v3",
    dex: "uniswap",
    label,
    tokenIn,
    tokenOut,
    fee,
    pool: getAddress(pool),
  };
}

function feeTierRoute(options: {
  id: string;
  pair: string;
  flashToken: string;
  buyFee: number;
  sellFee: number;
  buyPool: string;
  sellPool: string;
  tokenMid: string;
  sizes?: number[];
}): FlashloanQuoteRoute {
  return {
    id: options.id,
    pair: options.pair,
    flashToken: options.flashToken,
    sizesFlashToken: options.sizes ?? [0.25, 0.5, 1],
    legs: [
      v3Leg(
        `UniswapV3-${options.buyFee}`,
        options.flashToken,
        options.tokenMid,
        options.buyFee,
        options.buyPool,
      ),
      v3Leg(
        `UniswapV3-${options.sellFee}`,
        options.tokenMid,
        options.flashToken,
        options.sellFee,
        options.sellPool,
      ),
    ],
  };
}

/** @deprecated Prefer FLASHLOAN_CHAIN_CONFIGS.arbitrum — kept for Arbitrum callers. */
export const UNISWAP_V3_QUOTER =
  getAddress("0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6");
export const SUSHISWAP_V2_ROUTER =
  getAddress("0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506");

export const FLASHLOAN_CHAIN_CONFIGS: Record<FlashloanChainId, FlashloanChainConfig> = {
  arbitrum: {
    id: "arbitrum",
    name: "Arbitrum One",
    chainId: 42161,
    viemChain: arbitrum,
    rpcEnvKeys: ["ARBITRUM_RPC_URL", "VITE_ARBITRUM_RPC_URL"],
    defaultRpc: "https://arb1.arbitrum.io/rpc",
    quoter: UNISWAP_V3_QUOTER,
    quoterStyle: "v1",
    tokens: {
      WETH: token("WETH", "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", 18),
      USDC: token("USDC", "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", 6),
      ARB: token("ARB", "0x912CE59144191C1204E64559FE8253a0e49E6548", 18),
    },
    routes: [
      feeTierRoute({
        id: "arb-weth-usdc-500-3000",
        pair: "WETH/USDC",
        flashToken: "WETH",
        tokenMid: "USDC",
        buyFee: 500,
        sellFee: 3000,
        buyPool: "0xC6962004f452bE9203591991D15f6b388e09E8D0",
        sellPool: "0xc473e2aEE3441BF9240Be85eb122aBB059A3B57c",
      }),
      feeTierRoute({
        id: "arb-weth-usdc-3000-500",
        pair: "WETH/USDC",
        flashToken: "WETH",
        tokenMid: "USDC",
        buyFee: 3000,
        sellFee: 500,
        buyPool: "0xc473e2aEE3441BF9240Be85eb122aBB059A3B57c",
        sellPool: "0xC6962004f452bE9203591991D15f6b388e09E8D0",
      }),
      feeTierRoute({
        id: "arb-weth-arb-500-3000",
        pair: "WETH/ARB",
        flashToken: "WETH",
        tokenMid: "ARB",
        buyFee: 500,
        sellFee: 3000,
        buyPool: "0xC6F780497A95e246EB9449f5e4770916DCd6396A",
        sellPool: "0x92c63d0e701CAAe670C9415d91C474F686298f00",
      }),
      feeTierRoute({
        id: "arb-weth-arb-3000-500",
        pair: "WETH/ARB",
        flashToken: "WETH",
        tokenMid: "ARB",
        buyFee: 3000,
        sellFee: 500,
        buyPool: "0x92c63d0e701CAAe670C9415d91C474F686298f00",
        sellPool: "0xC6F780497A95e246EB9449f5e4770916DCd6396A",
      }),
      {
        id: "arb-weth-usdc-uni500-sushi",
        pair: "WETH/USDC",
        flashToken: "WETH",
        sizesFlashToken: [0.25, 0.5, 1],
        legs: [
          v3Leg(
            "UniswapV3-500",
            "WETH",
            "USDC",
            500,
            "0xC6962004f452bE9203591991D15f6b388e09E8D0",
          ),
          {
            type: "v2",
            dex: "sushi",
            label: "SushiSwapV2",
            tokenIn: "USDC",
            tokenOut: "WETH",
            router: SUSHISWAP_V2_ROUTER,
          },
        ],
      },
      {
        id: "arb-weth-usdc-sushi-uni500",
        pair: "WETH/USDC",
        flashToken: "WETH",
        sizesFlashToken: [0.25, 0.5, 1],
        legs: [
          {
            type: "v2",
            dex: "sushi",
            label: "SushiSwapV2",
            tokenIn: "WETH",
            tokenOut: "USDC",
            router: SUSHISWAP_V2_ROUTER,
          },
          v3Leg(
            "UniswapV3-500",
            "USDC",
            "WETH",
            500,
            "0xC6962004f452bE9203591991D15f6b388e09E8D0",
          ),
        ],
      },
    ],
  },

  optimism: {
    id: "optimism",
    name: "Optimism",
    chainId: 10,
    viemChain: optimism,
    rpcEnvKeys: ["OPTIMISM_RPC_URL", "VITE_OPTIMISM_RPC_URL"],
    defaultRpc: "https://mainnet.optimism.io",
    quoter: getAddress("0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"),
    quoterStyle: "v1",
    tokens: {
      WETH: token("WETH", "0x4200000000000000000000000000000000000006", 18),
      USDC: token("USDC", "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", 6),
      OP: token("OP", "0x4200000000000000000000000000000000000042", 18),
    },
    routes: [
      feeTierRoute({
        id: "op-weth-usdc-500-3000",
        pair: "WETH/USDC",
        flashToken: "WETH",
        tokenMid: "USDC",
        buyFee: 500,
        sellFee: 3000,
        buyPool: "0x1fb3cf6e48F1E7B10213E7b6d87D4c073C7Fdb7b",
        sellPool: "0xc1738D90E2E26C35784A0d3E3d8A9f795074bcA4",
      }),
      feeTierRoute({
        id: "op-weth-usdc-3000-500",
        pair: "WETH/USDC",
        flashToken: "WETH",
        tokenMid: "USDC",
        buyFee: 3000,
        sellFee: 500,
        buyPool: "0xc1738D90E2E26C35784A0d3E3d8A9f795074bcA4",
        sellPool: "0x1fb3cf6e48F1E7B10213E7b6d87D4c073C7Fdb7b",
      }),
      // fee=100 WETH/USDC pool on Optimism is dust (-96% round trips) — excluded
      feeTierRoute({
        id: "op-weth-op-500-3000",
        pair: "WETH/OP",
        flashToken: "WETH",
        tokenMid: "OP",
        buyFee: 500,
        sellFee: 3000,
        buyPool: "0xFC1f3296458F9b2a27a0B91dd7681C4020E09D05",
        sellPool: "0x68F5C0A2DE713a54991E01858Fd27a3832401849",
      }),
      feeTierRoute({
        id: "op-weth-op-3000-500",
        pair: "WETH/OP",
        flashToken: "WETH",
        tokenMid: "OP",
        buyFee: 3000,
        sellFee: 500,
        buyPool: "0x68F5C0A2DE713a54991E01858Fd27a3832401849",
        sellPool: "0xFC1f3296458F9b2a27a0B91dd7681C4020E09D05",
      }),
    ],
  },

  base: {
    id: "base",
    name: "Base",
    chainId: 8453,
    viemChain: base,
    rpcEnvKeys: ["BASE_RPC_URL", "VITE_BASE_RPC_URL"],
    // mainnet.base.org aggressively rate-limits eth_call bursts
    defaultRpc: "https://base-rpc.publicnode.com",
    // Uniswap V3 QuoterV2 on Base
    quoter: getAddress("0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a"),
    quoterStyle: "v2",
    tokens: {
      WETH: token("WETH", "0x4200000000000000000000000000000000000006", 18),
      USDC: token("USDC", "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", 6),
    },
    routes: [
      feeTierRoute({
        id: "base-weth-usdc-500-3000",
        pair: "WETH/USDC",
        flashToken: "WETH",
        tokenMid: "USDC",
        buyFee: 500,
        sellFee: 3000,
        buyPool: "0xd0b53D9277642d899DF5C87A3966A349A798F224",
        sellPool: "0x6c561B446416E1A00E8E93E221854d6eA4171372",
      }),
      feeTierRoute({
        id: "base-weth-usdc-3000-500",
        pair: "WETH/USDC",
        flashToken: "WETH",
        tokenMid: "USDC",
        buyFee: 3000,
        sellFee: 500,
        buyPool: "0x6c561B446416E1A00E8E93E221854d6eA4171372",
        sellPool: "0xd0b53D9277642d899DF5C87A3966A349A798F224",
      }),
      feeTierRoute({
        id: "base-weth-usdc-100-500",
        pair: "WETH/USDC",
        flashToken: "WETH",
        tokenMid: "USDC",
        buyFee: 100,
        sellFee: 500,
        buyPool: "0xb4CB800910B228ED3d0834cF79D697127BBB00e5",
        sellPool: "0xd0b53D9277642d899DF5C87A3966A349A798F224",
      }),
      feeTierRoute({
        id: "base-weth-usdc-500-100",
        pair: "WETH/USDC",
        flashToken: "WETH",
        tokenMid: "USDC",
        buyFee: 500,
        sellFee: 100,
        buyPool: "0xd0b53D9277642d899DF5C87A3966A349A798F224",
        sellPool: "0xb4CB800910B228ED3d0834cF79D697127BBB00e5",
      }),
    ],
  },
};

/** Flat Arbitrum-only route list (backward compatible). */
export const FLASHLOAN_QUOTE_ROUTES =
  FLASHLOAN_CHAIN_CONFIGS.arbitrum.routes;

/** Flat Arbitrum token map (backward compatible). */
export const FLASHLOAN_QUOTE_TOKENS =
  FLASHLOAN_CHAIN_CONFIGS.arbitrum.tokens;

export function isFlashloanChainId(value: unknown): value is FlashloanChainId {
  return typeof value === "string" && value in FLASHLOAN_CHAIN_CONFIGS;
}

export function listFlashloanChains(): FlashloanChainConfig[] {
  return Object.values(FLASHLOAN_CHAIN_CONFIGS);
}

export function resolveChainRpcUrl(config: FlashloanChainConfig): string {
  for (const key of config.rpcEnvKeys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return config.defaultRpc;
}
