import { apiRequest } from "@/lib/apiClient";

export type BillingTier = "public" | "private";
export type BillingInterval = "monthly" | "annual";

export type SubscriptionSummary = {
  tier: "free" | BillingTier;
  status: string;
  billingPeriod: BillingInterval | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isActive: boolean;
};

export type BillingPlan = {
  id: BillingTier;
  label: string;
  monthlyAmount: number;
  annualAmount: number;
  currency: string;
  features: string[];
};

export type BillingPlansResponse = {
  tiers: BillingPlan[];
  stripeConfigured: boolean;
};

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export async function fetchBillingPlans() {
  const response = await fetch(`${API_BASE}/billing/plans`);
  const payload = (await response.json().catch(() => ({}))) as BillingPlansResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load billing plans.");
  }

  return payload;
}

export async function fetchSubscription() {
  return apiRequest<SubscriptionSummary>("/billing/subscription");
}

export async function createCheckoutSession(input: {
  tier: BillingTier;
  interval: BillingInterval;
}) {
  return apiRequest<{ url: string; sessionId: string }>("/billing/checkout", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createBillingPortalSession() {
  return apiRequest<{ url: string }>("/billing/portal", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function verifyCheckoutSession(sessionId: string) {
  return apiRequest<SubscriptionSummary>(
    `/billing/session/${encodeURIComponent(sessionId)}`
  );
}

export function formatUsdCents(cents: number) {
  return `$${(cents / 100).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export function formatMonthlyFromAnnual(annualCents: number) {
  return `$${Math.round(annualCents / 12 / 100)}`;
}
