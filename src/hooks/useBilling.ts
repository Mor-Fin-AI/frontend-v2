"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import {
  fetchBillingPlans,
  fetchSubscription,
  type BillingInterval,
  type BillingTier,
} from "@/lib/billingApi";

export function useBillingPlans() {
  return useQuery({
    queryKey: ["billing-plans"],
    queryFn: fetchBillingPlans,
    staleTime: 60_000 * 10,
  });
}

export function useSubscription() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["billing-subscription"],
    queryFn: async () => {
      const { data, error, status } = await fetchSubscription();
      if (status === 401) {
        return null;
      }
      if (error) {
        throw new Error(error);
      }
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
    retry: false,
  });
}

export function useRefreshSubscription() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["billing-subscription"] });
  };
}

export function tierRank(tier: string) {
  if (tier === "private") return 2;
  if (tier === "public") return 1;
  return 0;
}

export function canUpgradeTo(
  currentTier: string,
  targetTier: BillingTier
) {
  return tierRank(targetTier) > tierRank(currentTier);
}

export function isCurrentPlan(
  subscription: { tier: string; billingPeriod: BillingInterval | null; isActive: boolean } | undefined,
  tier: BillingTier,
  interval: BillingInterval
) {
  if (!subscription?.isActive) return false;
  return subscription.tier === tier && subscription.billingPeriod === interval;
}
