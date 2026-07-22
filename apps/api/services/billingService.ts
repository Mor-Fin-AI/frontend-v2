import type Stripe from "stripe";
import { env } from "../config/env.js";
import { HttpError } from "../middleware/errorHandler.js";
import { createServiceClient } from "../lib/supabase.js";
import {
  getStripe,
  intervalFromPriceId,
  mapStripeSubscriptionStatus,
  resolveStripePriceId,
  tierFromPriceId,
  type BillingInterval,
  type BillingTier,
} from "../lib/stripe.js";

export type SubscriptionRecord = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  tier: "free" | BillingTier;
  billing_period: BillingInterval | null;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

async function getSubscriptionRow(userId: string): Promise<SubscriptionRecord | null> {
  const client = createServiceClient();
  const { data, error } = await client
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new HttpError(500, error.message);
  }

  return data as SubscriptionRecord | null;
}

async function upsertSubscriptionRow(
  userId: string,
  patch: Partial<SubscriptionRecord>
) {
  const client = createServiceClient();
  const { error } = await client.from("subscriptions").upsert(
    {
      user_id: userId,
      ...patch,
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw new HttpError(500, error.message);
  }
}

async function getOrCreateStripeCustomer(
  userId: string,
  email: string | null | undefined
) {
  const stripe = getStripe();
  const existing = await getSubscriptionRow(userId);

  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    metadata: { userId },
  });

  await upsertSubscriptionRow(userId, {
    stripe_customer_id: customer.id,
    tier: "free",
    status: "inactive",
    billing_period: null,
    stripe_subscription_id: null,
    current_period_end: null,
    cancel_at_period_end: false,
  });

  return customer.id;
}

export function getPublicPlans() {
  return {
    tiers: [
      {
        id: "public" as const,
        label: "Public",
        monthlyAmount: 9900,
        annualAmount: 94800,
        currency: "usd",
        features: [
          "Infrastructure Impact Tracking",
          "Do-Nou Safety Certification Training",
          "Platform Features & Governance",
          "Skills Upgrade Modules",
          "Education & Learning Programs",
          "Community Engagement",
        ],
      },
      {
        id: "private" as const,
        label: "Private",
        monthlyAmount: 99900,
        annualAmount: 958800,
        currency: "usd",
        features: [
          "Everything in Public",
          "Leadership Role: Coordinator, Mentor, Or Surveyor",
          "Project Management Dashboard",
          "Quarterly Impact Reporting",
          "Governance Voting On All Proposals",
          "Full Audit Log Access",
          "Team Onboarding + Training Tools",
        ],
      },
    ],
    stripeConfigured: Boolean(env.STRIPE_SECRET_KEY),
  };
}

export async function getUserSubscription(userId: string) {
  const row = await getSubscriptionRow(userId);
  if (!row) {
    return {
      tier: "free" as const,
      status: "inactive" as const,
      billingPeriod: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      isActive: false,
    };
  }

  const isActive = row.status === "active" || row.status === "trialing";

  return {
    tier: row.tier,
    status: row.status,
    billingPeriod: row.billing_period,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    isActive,
  };
}

export async function createCheckoutSession(input: {
  userId: string;
  email?: string | null;
  tier: BillingTier;
  interval: BillingInterval;
}) {
  const stripe = getStripe();
  const priceId = resolveStripePriceId(input.tier, input.interval);
  const customerId = await getOrCreateStripeCustomer(input.userId, input.email);

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${env.clientOrigins[0]}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.clientOrigins[0]}/pricing/cancel`,
    client_reference_id: input.userId,
    metadata: {
      userId: input.userId,
      tier: input.tier,
      interval: input.interval,
    },
    subscription_data: {
      metadata: {
        userId: input.userId,
        tier: input.tier,
        interval: input.interval,
      },
    },
    allow_promotion_codes: true,
  });

  if (!session.url) {
    throw new HttpError(500, "Stripe did not return a checkout URL.");
  }

  return { url: session.url, sessionId: session.id };
}

export async function createBillingPortalSession(userId: string) {
  const stripe = getStripe();
  const row = await getSubscriptionRow(userId);

  if (!row?.stripe_customer_id) {
    throw new HttpError(400, "No Stripe customer found. Subscribe to a plan first.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: row.stripe_customer_id,
    return_url: `${env.clientOrigins[0]}/pricing`,
  });

  return { url: session.url };
}

async function syncSubscriptionFromStripe(
  userId: string,
  subscription: Stripe.Subscription
) {
  const priceId = subscription.items.data[0]?.price.id;
  const tier = tierFromPriceId(priceId) ?? "public";
  const interval = intervalFromPriceId(priceId);
  const status = mapStripeSubscriptionStatus(subscription.status);
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const periodEnd =
    subscription.items.data[0]?.current_period_end ??
    (subscription as { current_period_end?: number }).current_period_end;

  await upsertSubscriptionRow(userId, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    tier: status === "canceled" || status === "inactive" ? "free" : tier,
    billing_period: interval,
    status,
    current_period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
  });
}

export async function handleStripeWebhook(rawBody: Buffer, signature: string) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new HttpError(503, "STRIPE_WEBHOOK_SECRET is not configured.");
  }

  const stripe = getStripe();
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId ?? session.client_reference_id;
      if (!userId || !session.subscription) break;

      const subscription = await stripe.subscriptions.retrieve(
        String(session.subscription)
      );
      await syncSubscriptionFromStripe(userId, subscription);
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (!userId) break;
      await syncSubscriptionFromStripe(userId, subscription);
      break;
    }
    default:
      break;
  }

  return { received: true };
}

export async function verifyCheckoutSession(userId: string, sessionId: string) {
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.client_reference_id !== userId && session.metadata?.userId !== userId) {
    throw new HttpError(403, "Checkout session does not belong to this user.");
  }

  if (session.subscription && typeof session.subscription === "string") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    await syncSubscriptionFromStripe(userId, subscription);
  }

  return getUserSubscription(userId);
}
