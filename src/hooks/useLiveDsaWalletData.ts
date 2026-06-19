"use client";

import { useMemo } from "react";
import { useAccount } from "wagmi";
import { useMorContractsOptional } from "@/context/MorContractsContext";
import { useDsaAccounts } from "@/hooks/useDsaAccount";
import type { DsaAccountSummary, DsaOwnerResponse } from "@/lib/dsaApi";

export function resolveActiveDsaAccount(
  dsaResponse: DsaOwnerResponse | undefined
): DsaAccountSummary | null {
  if (!dsaResponse?.accounts.length) {
    return null;
  }

  const platform = dsaResponse.accounts.find(
    (account) => account.source === "platform"
  );
  if (platform) {
    return platform;
  }

  return dsaResponse.accounts[0] ?? null;
}

export function useLiveDsaWalletData() {
  const { address, isConnected } = useAccount();
  const contracts = useMorContractsOptional();
  const dsaQuery = useDsaAccounts();

  const activeDsa = useMemo(
    () => resolveActiveDsaAccount(dsaQuery.data),
    [dsaQuery.data]
  );

  const platformStatus = contracts?.platformStatus;
  const isLoading =
    (isConnected && dsaQuery.isLoading) || (contracts?.isLoading ?? false);

  const isLive = isConnected && !!platformStatus && !isLoading;

  return {
    isConnected,
    isLive,
    isPlatformOwner: dsaQuery.data?.isPlatformOwner ?? false,
    activeDsa,
    platformStatus,
    connectedAddress: address,
    accounts: dsaQuery.data?.accounts ?? [],
    isLoading,
    refetch: () => {
      void dsaQuery.refetch();
      contracts?.refetch();
    },
  };
}
