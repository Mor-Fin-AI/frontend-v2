import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { Address } from "viem";

// apps/api/lib → repo root
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const deploymentsPath = join(
  repoRoot,
  "apps/web/src/lib/contracts/deployments.arbitrum.json"
);

export type MorDeploymentRecord = Record<string, string | number | object>;

let cachedDeployments: MorDeploymentRecord | null = null;

export function loadMorDeployments(): MorDeploymentRecord {
  if (!cachedDeployments) {
    cachedDeployments = JSON.parse(
      readFileSync(deploymentsPath, "utf-8")
    ) as MorDeploymentRecord;
  }
  return cachedDeployments;
}

export function getArbitrumRpcUrl() {
  return (
    process.env.ARBITRUM_RPC_URL ??
    process.env.VITE_ARBITRUM_RPC_URL ??
    "https://arb1.arbitrum.io/rpc"
  );
}

export const ARBITRUM_WETH =
  "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1" as Address;

export const morDsaFactoryAbi = [
  {
    type: "function",
    name: "getAccounts",
    stateMutability: "view",
    inputs: [{ name: "owner_", type: "address" }],
    outputs: [{ type: "address[]" }],
  },
] as const;

export const morDsaAbi = [
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
  {
    type: "function",
    name: "nonce",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "registry",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const;

export const erc20Abi = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;
