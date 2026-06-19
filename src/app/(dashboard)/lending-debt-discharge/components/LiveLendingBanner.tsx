"use client";

import { Caption1, Text } from "@fluentui/react-components";
import { CheckmarkCircle24Regular } from "@fluentui/react-icons";
import { useAccount } from "wagmi";
import { useLendingDischargeData } from "@/hooks/useLendingDischarge";

function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function LiveLendingBanner() {
  const { address, isConnected } = useAccount();
  const { data, isLoading, isError } = useLendingDischargeData();

  if (isLoading) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
        <Caption1 className="text-muted-foreground">
          Loading live lending &amp; discharge data from MorTreasuryFlowPanel on
          Arbitrum…
        </Caption1>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
        <Caption1 className="text-muted-foreground">
          Live lending data unavailable — ensure the API server is running and
          Arbitrum RPC is reachable.
        </Caption1>
      </div>
    );
  }

  const panelLabel = truncateAddress(data.treasuryFlowPanel);
  const positionCount = data.loanPositions.length;
  const activeDischarges = data.metrics.dischargesActive;
  const pendingDischarges = data.metrics.dischargesPending;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#22C38E]/30 bg-[#22C38E]/5 px-4 py-3">
      <CheckmarkCircle24Regular className="mt-0.5 h-5 w-5 shrink-0 text-[#22C38E]" />
      <div className="min-w-0">
        <Text weight="semibold" block>
          Live MorTreasuryFlowPanel data
        </Text>
        <Caption1 block className="mt-1 text-muted-foreground">
          Panel {panelLabel} · {positionCount} position
          {positionCount === 1 ? "" : "s"} · {activeDischarges} active /{" "}
          {pendingDischarges} pending discharge
          {pendingDischarges === 1 ? "" : "s"}
          {isConnected && address
            ? ` · wallet ${truncateAddress(address)} included`
            : " · connect wallet to include your MorDSA"}
        </Caption1>
      </div>
    </div>
  );
}
