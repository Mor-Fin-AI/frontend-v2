import type { Address } from "viem";
import type { Proposal } from "@/app/(dashboard)/governance/data";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export type GovernanceStatusResponse = {
  chainId: number;
  chain: string;
  governor: Address;
  governanceHub: Address;
  token: Address;
  proposalThreshold: string;
  proposalThresholdFormatted: string;
  votingDelay: string;
  votingPeriod: string;
  quorumNumerator: number;
  activeProposals: number;
  totalProposals: number;
};

export type OnChainProposal = Proposal & {
  isOnChain: true;
  state: number;
  stateLabel: string;
  proposer?: Address;
  voteStart: number;
  voteEnd: number;
  targets: Address[];
  userHasVoted?: boolean;
};

export type WalletGovernanceStats = {
  votesCast: number;
  votingPower: string;
  votingPowerRaw: string;
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

export function fetchGovernanceStatus() {
  return publicGet<GovernanceStatusResponse>("/governance/status");
}

export function fetchGovernanceProposals(voterAddress?: string) {
  const query = voterAddress
    ? `?voter=${encodeURIComponent(voterAddress)}`
    : "";
  return publicGet<OnChainProposal[]>(`/governance/proposals${query}`);
}

export function fetchGovernanceProposal(
  proposalId: string,
  voterAddress?: string
) {
  const query = voterAddress
    ? `?voter=${encodeURIComponent(voterAddress)}`
    : "";
  return publicGet<OnChainProposal>(
    `/governance/proposals/${encodeURIComponent(proposalId)}${query}`
  );
}

export function fetchWalletGovernanceStats(walletAddress: string) {
  return publicGet<WalletGovernanceStats>(
    `/governance/wallet/${encodeURIComponent(walletAddress)}`
  );
}
