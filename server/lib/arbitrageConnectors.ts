import { getAddress, isAddress, type Address } from "viem";
import type { MorDeploymentRecord } from "./contracts.js";

export type ConnectorMeta = {
  key: string;
  address: Address;
  label: string;
  slug: string;
};

const CONNECTOR_DEFINITIONS = [
  { key: "uniswapConnector", label: "Uniswap", slug: "uniswap" },
  { key: "sushiConnector", label: "SushiSwap", slug: "sushiswap" },
  { key: "camelotV2Connector", label: "Camelot V2", slug: "uniswap" },
  { key: "camelotV3Connector", label: "Camelot V3", slug: "uniswap" },
  { key: "pancakeSwapV2Connector", label: "PancakeSwap V2", slug: "pancakeswap" },
  { key: "pancakeSwapV3Connector", label: "PancakeSwap V3", slug: "pancakeswap" },
  { key: "zyberSwapConnector", label: "ZyberSwap", slug: "uniswap" },
  { key: "arbSwapConnector", label: "ArbSwap", slug: "uniswap" },
  { key: "deltaSwapConnector", label: "DeltaSwap", slug: "uniswap" },
  { key: "ramsesV3Connector", label: "Ramses V3", slug: "uniswap" },
] as const;

export function loadConnectorRegistry(
  deployments: MorDeploymentRecord
): ConnectorMeta[] {
  return CONNECTOR_DEFINITIONS.flatMap((definition) => {
    const raw = deployments[definition.key];
    if (typeof raw !== "string" || !isAddress(raw)) {
      return [];
    }
    return [
      {
        ...definition,
        address: getAddress(raw),
      },
    ];
  });
}

export function loadKnownPoolRegistry(
  deployments: MorDeploymentRecord
): Record<string, { label: string; slug: string }> {
  const pools: Record<string, { label: string; slug: string }> = {};
  const wethUsdc = deployments.wethUsdcV3Pool;
  if (typeof wethUsdc === "string" && isAddress(wethUsdc)) {
    pools[getAddress(wethUsdc).toLowerCase()] = {
      label: "Uniswap V3",
      slug: "uniswap",
    };
  }
  return pools;
}
