"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Caption1,
  Subtitle1,
  Text,
  Title1,
} from "@fluentui/react-components";
import NeuButton from "@/components/ui/NeuButton";
import AppSpinner from "@/components/ui/AppSpinner";
import AppBadge from "@/components/ui/AppBadge";
import PanelCard, {
  PanelCardBody,
  PanelCardFooter,
  PanelCardHeader,
} from "@/components/ui/PanelCard";
import { useAuth } from "@/context/AuthContext";
import {
  createBillingPortalSession,
  createCheckoutSession,
  formatMonthlyFromAnnual,
  formatUsdCents,
  type BillingInterval,
  type BillingTier,
} from "@/lib/billingApi";
import {
  canUpgradeTo,
  isCurrentPlan,
  useBillingPlans,
  useSubscription,
} from "@/hooks/useBilling";

type BillingPeriod = BillingInterval;

function CheckIcon() {
  return (
    <svg
      width="20"
      height="15"
      viewBox="0 0 20 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 text-[var(--action-green)]"
    >
      <path
        d="M6.35588 11.8345L1.61455 7.17002L0 8.7472L6.35588 15L20 1.57718L18.3968 0L6.35588 11.8345Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <CheckIcon />
      <span className="text-base text-muted-foreground">{text}</span>
    </div>
  );
}

export default function MorPricingSection() {
  const [selected, setSelected] = useState<BillingPeriod>("monthly");
  const plansQuery = useBillingPlans();
  const subscriptionQuery = useSubscription();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const subscription = subscriptionQuery.data;
  const plans = plansQuery.data?.tiers ?? [];
  const stripeConfigured = plansQuery.data?.stripeConfigured ?? false;

  const startCheckout = async (tier: BillingTier) => {
    setError(null);

    if (!isAuthenticated) {
      navigate("/sign-in", { state: { from: "/pricing" } });
      return;
    }

    if (!stripeConfigured) {
      setError("Stripe is not configured on the server yet. Add your Stripe keys to .env.");
      return;
    }

    setLoadingTier(`${tier}-${selected}`);

    const { data, error: checkoutError } = await createCheckoutSession({
      tier,
      interval: selected,
    });

    setLoadingTier(null);

    if (checkoutError || !data?.url) {
      setError(checkoutError ?? "Could not start checkout.");
      return;
    }

    window.location.href = data.url;
  };

  const openPortal = async () => {
    setError(null);
    setLoadingTier("portal");
    const { data, error: portalError } = await createBillingPortalSession();
    setLoadingTier(null);

    if (portalError || !data?.url) {
      setError(portalError ?? "Could not open billing portal.");
      return;
    }

    window.location.href = data.url;
  };

  const getCta = (tier: BillingTier, label: string) => {
    if (isCurrentPlan(subscription ?? undefined, tier, selected)) {
      return { label: "Current plan", disabled: true, variant: "secondary" as const };
    }

    if (subscription?.isActive && subscription.tier === tier) {
      return {
        label: "Manage billing",
        disabled: false,
        variant: "dark" as const,
        onClick: openPortal,
      };
    }

    if (subscription?.isActive && !canUpgradeTo(subscription.tier, tier)) {
      return { label: "Included in your plan", disabled: true, variant: "secondary" as const };
    }

    return {
      label: `Join ${label} tier`,
      disabled: false,
      variant: tier === "private" ? ("primary" as const) : ("dark" as const),
      onClick: () => startCheckout(tier),
    };
  };

  if (plansQuery.isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <AppSpinner size="small" label="Loading pricing plans" />
      </div>
    );
  }

  return (
    <section className="relative w-full overflow-hidden rounded-2xl bg-inherit px-4 py-12 text-inherit lg:px-8 lg:py-24">
      <div className="relative z-10 mb-12 lg:mb-16">
        <Title1 block align="center" className="mb-6 !font-semibold !text-foreground">
          Mor Finance membership
        </Title1>
        <Subtitle1 block align="center" className="mx-auto mb-8 max-w-2xl !text-muted-foreground">
          Choose the tier that matches your role on the Do-Nou Infrastructure Project.
          Subscribe securely with Stripe — cancel anytime from your billing portal.
        </Subtitle1>

        {subscription?.isActive ? (
          <div className="mx-auto mb-6 flex max-w-xl flex-col items-center gap-2 rounded-xl border border-[var(--action-green)]/30 bg-[var(--action-green)]/5 px-4 py-3 text-center">
            <AppBadge tone="success" appearance="tint">
              Active: {subscription.tier} · {subscription.billingPeriod}
            </AppBadge>
            {subscription.currentPeriodEnd ? (
              <Caption1 className="text-muted-foreground">
                Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                {subscription.cancelAtPeriodEnd ? " (cancels at period end)" : ""}
              </Caption1>
            ) : null}
            <NeuButton
              variant="secondary"
              size="sm"
              loading={loadingTier === "portal"}
              onClick={openPortal}
            >
              Manage subscription
            </NeuButton>
          </div>
        ) : null}

        <div className="flex items-center justify-center gap-3">
          <NeuButton
            onClick={() => setSelected("monthly")}
            variant={selected === "monthly" ? "dark" : "secondary"}
            active={selected === "monthly"}
            className="w-28 py-3"
          >
            Monthly
          </NeuButton>
          <NeuButton
            onClick={() => setSelected("annual")}
            variant={selected === "annual" ? "dark" : "secondary"}
            active={selected === "annual"}
            className="w-28 py-3"
          >
            Annual
          </NeuButton>
        </div>
        {selected === "annual" ? (
          <Caption1 block align="center" className="mt-3 text-[var(--action-green)]">
            Save ~20% with annual billing
          </Caption1>
        ) : null}
      </div>

      {error ? (
        <div className="relative z-10 mx-auto mb-6 max-w-2xl rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-center text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8 lg:flex-row lg:gap-6">
        {plans.map((plan) => {
          const monthlyDisplay =
            selected === "monthly"
              ? formatUsdCents(plan.monthlyAmount)
              : formatMonthlyFromAnnual(plan.annualAmount);
          const suffix = selected === "monthly" ? "/month" : "/month · billed annually";
          const annualTotal =
            selected === "annual" ? formatUsdCents(plan.annualAmount) : null;
          const cta = getCta(plan.id, plan.label);
          const loading = loadingTier === `${plan.id}-${selected}`;

          return (
            <PanelCard key={plan.id} className="w-full flex-1">
              <PanelCardHeader
                title={plan.label}
                description={
                  plan.id === "public"
                    ? "For builders and community members on the ground."
                    : "For coordinators, mentors, and project leaders."
                }
                headingAs="h5"
              />
              <PanelCardBody>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${plan.id}-${selected}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p
                      className={`text-5xl font-bold ${
                        plan.id === "private" ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {monthlyDisplay}
                      <span className="text-xl font-normal text-muted-foreground">
                        {suffix}
                      </span>
                    </p>
                    {annualTotal ? (
                      <Caption1 className="mt-1 text-muted-foreground">
                        {annualTotal} billed once per year
                      </Caption1>
                    ) : null}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-6">
                  {plan.features.map((feature) => (
                    <Feature key={feature} text={feature} />
                  ))}
                </div>
              </PanelCardBody>
              <PanelCardFooter className="!justify-stretch">
                <NeuButton
                  variant={cta.variant}
                  size="lg"
                  fullWidth
                  disabled={cta.disabled || loading}
                  loading={loading}
                  onClick={cta.onClick}
                >
                  {cta.label}
                </NeuButton>
              </PanelCardFooter>
            </PanelCard>
          );
        })}
      </div>

      <div className="relative z-10 mx-auto mt-10 max-w-2xl text-center">
        <Text block className="text-muted-foreground">
          Platform fee remains 1% on eligible Mor protocol flows. Membership unlocks
          dashboard modules, governance participation, and training programs.
        </Text>
        {!stripeConfigured ? (
          <Caption1 block className="mt-2 text-amber-600 dark:text-amber-400">
            Stripe keys are not configured — add STRIPE_SECRET_KEY and price IDs to enable checkout.
          </Caption1>
        ) : null}
      </div>

      <TopLeftCircle />
      <BottomRightCircle />
    </section>
  );
}

function TopLeftCircle() {
  return (
    <motion.div
      initial={{ rotate: "0deg" }}
      animate={{ rotate: "360deg" }}
      transition={{ duration: 100, ease: "linear", repeat: Infinity }}
      className="absolute -left-[250px] -top-[200px] z-0 h-[450px] w-[450px] rounded-full border-2 border-dotted border-border"
    />
  );
}

function BottomRightCircle() {
  return (
    <motion.div
      initial={{ rotate: "0deg" }}
      animate={{ rotate: "-360deg" }}
      transition={{ duration: 100, ease: "linear", repeat: Infinity }}
      className="absolute -bottom-[200px] -right-[250px] z-0 h-[450px] w-[450px] rounded-full border-2 border-dotted border-border"
    />
  );
}
