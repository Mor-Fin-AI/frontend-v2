import Stripe from "stripe";
import { env } from "../config/env.js";
import { HttpError } from "../middleware/errorHandler.js";

let stripeClient: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new HttpError(
      503,
      "Stripe is not configured. Add STRIPE_SECRET_KEY and price IDs to your server .env."
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

export type BillingTier = "public" | "private";
export type BillingInterval = "monthly" | "annual";

export function resolveStripePriceId(
  tier: BillingTier,
  interval: BillingInterval
): string {
  const priceMap: Record<BillingTier, Record<BillingInterval, string | undefined>> = {
    public: {
      monthly: env.STRIPE_PRICE_PUBLIC_MONTHLY,
      annual: env.STRIPE_PRICE_PUBLIC_ANNUAL,
    },
    private: {
      monthly: env.STRIPE_PRICE_PRIVATE_MONTHLY,
      annual: env.STRIPE_PRICE_PRIVATE_ANNUAL,
    },
  };

  const priceId = priceMap[tier][interval];
  if (!priceId) {
    throw new HttpError(
      503,
      `Stripe price not configured for ${tier} ${interval}. Set STRIPE_PRICE_${tier.toUpperCase()}_${interval.toUpperCase()} in .env.`
    );
  }

  return priceId;
}

export function tierFromPriceId(priceId: string | null | undefined): BillingTier | null {
  if (!priceId) return null;
  if (
    priceId === env.STRIPE_PRICE_PUBLIC_MONTHLY ||
    priceId === env.STRIPE_PRICE_PUBLIC_ANNUAL
  ) {
    return "public";
  }
  if (
    priceId === env.STRIPE_PRICE_PRIVATE_MONTHLY ||
    priceId === env.STRIPE_PRICE_PRIVATE_ANNUAL
  ) {
    return "private";
  }
  return null;
}

export function intervalFromPriceId(
  priceId: string | null | undefined
): BillingInterval | null {
  if (!priceId) return null;
  if (
    priceId === env.STRIPE_PRICE_PUBLIC_MONTHLY ||
    priceId === env.STRIPE_PRICE_PRIVATE_MONTHLY
  ) {
    return "monthly";
  }
  if (
    priceId === env.STRIPE_PRICE_PUBLIC_ANNUAL ||
    priceId === env.STRIPE_PRICE_PRIVATE_ANNUAL
  ) {
    return "annual";
  }
  return null;
}

export function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status
): "inactive" | "trialing" | "active" | "past_due" | "canceled" | "unpaid" {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "canceled";
    case "unpaid":
      return "unpaid";
    default:
      return "inactive";
  }
}
