"use client";

import { Caption1, Text } from "@fluentui/react-components";
import { useMorContractsOptional } from "@/context/MorContractsContext";

export default function LivePlatformMetrics() {
  const context = useMorContractsOptional();
  const status = context?.platformStatus;

  if (!status || context?.isLoading) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-xl border border-border bg-card px-4 py-3">
        <Caption1 className="text-muted-foreground">Platform DSA (live)</Caption1>
        <Text block weight="semibold" className="mt-1 tabular-nums">
          {status.platformEthBalanceFormatted} ETH
        </Text>
        <Caption1 block className="text-muted-foreground">
          + {status.platformWethBalanceFormatted} WETH
        </Caption1>
      </div>
      <div className="rounded-xl border border-border bg-card px-4 py-3">
        <Caption1 className="text-muted-foreground">Treasury WETH (live)</Caption1>
        <Text block weight="semibold" className="mt-1 tabular-nums">
          {status.treasuryWethBalanceFormatted} WETH
        </Text>
        <Caption1 block className="text-muted-foreground">
          MorTreasuryBalance contract
        </Caption1>
      </div>
      <div className="rounded-xl border border-border bg-card px-4 py-3">
        <Caption1 className="text-muted-foreground">Registry connectors</Caption1>
        <Text block weight="semibold" className="mt-1 tabular-nums">
          {status.registryConnectorCount}
        </Text>
        <Caption1 block className="text-muted-foreground">
          Whitelisted on core registry
        </Caption1>
      </div>
      <div className="rounded-xl border border-border bg-card px-4 py-3">
        <Caption1 className="text-muted-foreground">Governance threshold</Caption1>
        <Text block weight="semibold" className="mt-1 tabular-nums">
          {Number(status.governance.proposalThreshold) / 1e18} MOR
        </Text>
        <Caption1 block className="text-muted-foreground">
          Proposal minimum on governor
        </Caption1>
      </div>
    </div>
  );
}
