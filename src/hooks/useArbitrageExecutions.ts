"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import {
  fetchArbitrageExecutions,
  type FetchArbitrageExecutionsParams,
} from "@/lib/arbitrageApi";

export function useArbitrageExecutions(
  params: Omit<FetchArbitrageExecutionsParams, "walletAddress"> = {}
) {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: [
      "arbitrage-executions",
      address,
      params.page,
      params.pageSize,
      params.search,
      params.sortBy,
    ],
    queryFn: () =>
      fetchArbitrageExecutions({
        ...params,
        walletAddress: isConnected ? address : undefined,
      }),
    staleTime: 30_000,
    placeholderData: (previous) => previous,
  });
}
