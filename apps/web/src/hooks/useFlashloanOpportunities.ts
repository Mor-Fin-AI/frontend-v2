"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchFlashloanOpportunities,
  type FetchFlashloanOpportunitiesParams,
} from "@/lib/flashloanOpportunitiesApi";

export function useFlashloanOpportunities(
  params: FetchFlashloanOpportunitiesParams = {},
) {
  return useQuery({
    queryKey: [
      "flashloan-opportunities",
      params.provider ?? "aave-v3",
      params.chain ?? "all",
      params.refresh ? "refresh" : "cached",
    ],
    queryFn: () => fetchFlashloanOpportunities(params),
    staleTime: 20_000,
    refetchInterval: 30_000,
    placeholderData: (previous) => previous,
  });
}
