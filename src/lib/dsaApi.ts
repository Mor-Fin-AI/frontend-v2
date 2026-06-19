import type { Address } from "viem";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export type DsaAccountSummary = {
  address: Address;
  owner: Address;
  nonce: string;
  registry: Address;
  ethBalance: string;
  ethBalanceFormatted: string;
  wethBalance: string;
  wethBalanceFormatted: string;
  source: "factory" | "platform";
};

export type DsaOwnerResponse = {
  chainId: number;
  chain: string;
  owner: Address;
  accounts: DsaAccountSummary[];
  platformDsa: Address | null;
  isPlatformOwner: boolean;
  factories: {
    core: Address;
    dao: Address;
  };
};

export type MorDeploymentsResponse = {
  chainId: number;
  chain: string;
  deployedAt?: string;
  core: Record<string, string>;
  governance: Record<string, string>;
  connectors: Record<string, string>;
  spells: Record<string, string>;
  resolvers: Record<string, string>;
};

export type PlatformStatusResponse = {
  chainId: number;
  chain: string;
  deployedAt?: string;
  platformDsa: `0x${string}` | null;
  platformOwner: `0x${string}` | null;
  platformEthBalance: string;
  platformEthBalanceFormatted: string;
  platformWethBalance: string;
  platformWethBalanceFormatted: string;
  registryConnectorCount: string;
  treasuryWethBalance: string;
  treasuryWethBalanceFormatted: string;
  treasuryWallet: `0x${string}`;
  governance: {
    proposalThreshold: string;
    votingDelay: string;
    votingPeriod: string;
  };
  connectors: Array<{
    key: string;
    address: `0x${string}` | null;
    enabled: boolean;
  }>;
};

async function publicGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  const payload = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? `Request failed (${response.status})`);
  }

  return payload as T;
}

export function fetchMorDeployments() {
  return publicGet<MorDeploymentsResponse>("/dsa/deployments");
}

export function fetchPlatformStatus() {
  return publicGet<PlatformStatusResponse>("/dsa/status");
}

export function fetchDsaAccountsForOwner(walletAddress: string) {
  return publicGet<DsaOwnerResponse>(
    `/dsa/accounts/${encodeURIComponent(walletAddress)}`
  );
}

export function fetchDsaAccount(dsaAddress: string) {
  return publicGet<DsaAccountSummary>(
    `/dsa/account/${encodeURIComponent(dsaAddress)}`
  );
}

export function getArbitrumExplorerAddressUrl(address: string) {
  return `https://arbiscan.io/address/${address}`;
}

export function getCombinedEthBalance(account: DsaAccountSummary) {
  const eth = Number(account.ethBalanceFormatted);
  const weth = Number(account.wethBalanceFormatted);
  return eth + weth;
}
