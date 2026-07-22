"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { fetchLendingDischargeData } from "@/lib/lendingApi";

export function useLendingDischargeData() {
  const { address, isConnected } = useAccount();

  return useQuery({
    queryKey: ["lending-discharge", address],
    queryFn: () =>
      fetchLendingDischargeData(isConnected ? address : undefined),
    staleTime: 30_000,
  });
}
