"use client";

import { Link } from "react-router-dom";
import { Text } from "@fluentui/react-components";
import NeuButton from "@/components/ui/NeuButton";
import PanelCard, { PanelCardBody, PanelCardHeader } from "@/components/ui/PanelCard";

export default function PricingCancelPage() {
  return (
    <div className="mt-6 flex flex-col gap-6">
      <PanelCard>
        <PanelCardHeader
          title="Checkout canceled"
          description="No charge was made to your card."
        />
        <PanelCardBody className="flex flex-col gap-4">
          <Text className="text-muted-foreground">
            You can return to pricing anytime to choose a Public or Private membership tier.
          </Text>
          <Link to="/pricing">
            <NeuButton variant="primary" size="sm">
              Return to pricing
            </NeuButton>
          </Link>
        </PanelCardBody>
      </PanelCard>
    </div>
  );
}
