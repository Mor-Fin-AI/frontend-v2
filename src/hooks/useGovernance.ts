"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import {
  fetchGovernanceProposal,
  fetchGovernanceProposals,
  fetchGovernanceStatus,
  fetchWalletGovernanceStats,
} from "@/lib/governanceApi";
import {
  getProposalById as getMockProposalById,
  proposals as mockProposals,
  type Proposal,
} from "@/app/(dashboard)/governance/data";
import type { OnChainProposal } from "@/lib/governanceApi";

export function useGovernanceStatus() {
  return useQuery({
    queryKey: ["governance-status"],
    queryFn: fetchGovernanceStatus,
    staleTime: 30_000,
  });
}

export function useGovernanceProposals() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["governance-proposals", address],
    queryFn: () => fetchGovernanceProposals(isConnected ? address : undefined),
    staleTime: 30_000,
  });
}

export function useGovernanceProposal(proposalId: string | undefined) {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["governance-proposal", proposalId, address],
    queryFn: () =>
      fetchGovernanceProposal(proposalId!, isConnected ? address : undefined),
    enabled: !!proposalId && /^\d+$/.test(proposalId),
    staleTime: 20_000,
  });
}

export function useWalletGovernanceStats() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["governance-wallet-stats", address],
    queryFn: () => fetchWalletGovernanceStats(address!),
    enabled: isConnected && !!address,
    staleTime: 30_000,
  });
}

export function resolveProposalList(
  onChain: OnChainProposal[] | undefined,
  isLoading: boolean
): { proposals: Proposal[]; source: "chain" | "mock" | "loading" } {
  if (isLoading) {
    return { proposals: [], source: "loading" };
  }
  if (onChain && onChain.length > 0) {
    return { proposals: onChain, source: "chain" };
  }
  return { proposals: mockProposals, source: "mock" };
}

export function resolveProposalDetail(
  proposalId: string | undefined,
  onChainProposal: OnChainProposal | undefined,
  isLoadingOnChain: boolean
): {
  proposal: Proposal | undefined;
  isOnChain: boolean;
  isLoading: boolean;
} {
  if (!proposalId) {
    return { proposal: undefined, isOnChain: false, isLoading: false };
  }

  if (/^\d+$/.test(proposalId)) {
    if (isLoadingOnChain) {
      return { proposal: undefined, isOnChain: true, isLoading: true };
    }
    if (onChainProposal) {
      return { proposal: onChainProposal, isOnChain: true, isLoading: false };
    }
    return { proposal: undefined, isOnChain: true, isLoading: false };
  }

  return {
    proposal: getMockProposalById(proposalId),
    isOnChain: false,
    isLoading: false,
  };
}
