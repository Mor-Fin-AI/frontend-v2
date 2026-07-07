"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchOpenClawAgents } from "@/lib/agentsApi";

export function useOpenClawAgents() {
  return useQuery({
    queryKey: ["openclaw-agents"],
    queryFn: fetchOpenClawAgents,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
