"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { resolveActiveDsaAccount } from "@/hooks/useLiveDsaWalletData";
import {
  fetchDsaAccountsForOwner,
  fetchMorDeployments,
  type DsaAccountSummary,
} from "@/lib/dsaApi";

export function useMorDeployments() {
  return useQuery({
    queryKey: ["mor-deployments"],
    queryFn: fetchMorDeployments,
    staleTime: 60_000 * 10,
  });
}

export function useDsaAccounts() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["dsa-accounts", address],
    queryFn: () => fetchDsaAccountsForOwner(address!),
    enabled: isConnected && !!address,
    staleTime: 30_000,
  });
}

export function usePrimaryDsaAccount(): {
  account: DsaAccountSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
} {
  const query = useDsaAccounts();

  return {
    account: resolveActiveDsaAccount(query.data),
    isLoading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: () => {
      void query.refetch();
    },
  };
}
