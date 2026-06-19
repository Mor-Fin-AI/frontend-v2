"use client";

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Caption1, Text, Title2 } from "@fluentui/react-components";
import { CheckmarkCircle24Regular } from "@fluentui/react-icons";
import NeuButton from "@/components/ui/NeuButton";
import PanelCard, { PanelCardBody, PanelCardHeader } from "@/components/ui/PanelCard";
import AppSpinner from "@/components/ui/AppSpinner";
import { verifyCheckoutSession } from "@/lib/billingApi";
import { useRefreshSubscription } from "@/hooks/useBilling";

export default function PricingSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const refreshSubscription = useRefreshSubscription();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [tier, setTier] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("ready");
      refreshSubscription();
      return;
    }

    void verifyCheckoutSession(sessionId).then(({ data, error }) => {
      if (error || !data) {
        setStatus("error");
        return;
      }
      setTier(data.tier);
      setStatus("ready");
      refreshSubscription();
    });
  }, [sessionId, refreshSubscription]);

  return (
    <div className="mt-6 flex flex-col gap-6">
      <PanelCard>
        <PanelCardHeader
          title="Subscription confirmed"
          description="Your Mor Finance membership is being activated."
        />
        <PanelCardBody className="flex flex-col items-start gap-4">
          {status === "loading" ? (
            <AppSpinner size="small" label="Confirming your Stripe checkout" />
          ) : status === "error" ? (
            <Caption1 className="text-destructive">
              Payment received, but we could not verify the session yet. Your plan should
              appear shortly — refresh the pricing page or contact support.
            </Caption1>
          ) : (
            <>
              <div className="flex items-start gap-3">
                <CheckmarkCircle24Regular className="mt-0.5 h-6 w-6 text-[var(--action-green)]" />
                <div>
                  <Title2 className="!text-lg">
                    {tier ? `${tier.charAt(0).toUpperCase()}${tier.slice(1)} tier active` : "Welcome to Mor Finance"}
                  </Title2>
                  <Text block className="mt-1 text-muted-foreground">
                    You can manage billing, invoices, and cancellation anytime from the
                    pricing page.
                  </Text>
                </div>
              </div>
            </>
          )}
          <div className="flex flex-wrap gap-3">
            <Link to="/dashboard">
              <NeuButton variant="primary" size="sm">
                Go to dashboard
              </NeuButton>
            </Link>
            <Link to="/pricing">
              <NeuButton variant="secondary" size="sm">
                Back to pricing
              </NeuButton>
            </Link>
          </div>
        </PanelCardBody>
      </PanelCard>
    </div>
  );
}
