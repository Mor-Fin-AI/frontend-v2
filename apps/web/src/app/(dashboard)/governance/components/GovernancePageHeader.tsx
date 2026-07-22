"use client";

import { Link } from "react-router-dom";
import { Add24Regular } from "@fluentui/react-icons";
import NeuButton from "@/components/ui/NeuButton";
import { Caption1, Text } from "@fluentui/react-components";

type GovernancePageHeaderProps = {
  source?: "chain" | "mock" | "loading";
  showCreate?: boolean;
};

export default function GovernancePageHeader({
  source = "loading",
  showCreate = true,
}: GovernancePageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <Text weight="semibold" block>
          Mor Governor on Arbitrum
        </Text>
        <Caption1 className="text-muted-foreground">
          {source === "chain"
            ? "Live proposals from MorGovernorTimeLocked"
            : source === "mock"
              ? "Showing sample proposals — create one on-chain to get started"
              : "Loading governance data…"}
        </Caption1>
      </div>
      {showCreate ? (
        <Link to="/governance/create" className="shrink-0">
          <NeuButton variant="primary" size="sm" className="inline-flex items-center gap-2">
            <Add24Regular className="h-4 w-4" />
            Create Proposal
          </NeuButton>
        </Link>
      ) : null}
    </div>
  );
}
