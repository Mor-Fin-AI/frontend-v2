"use client";

import { Caption1 } from "@fluentui/react-components";
import { L2_EVM_CHAINS } from "@/lib/l2EvmChains";
import ChainIcon from "./ChainIcon";

type MonitoredChainsStripProps = {
  title?: string;
  chains?: typeof L2_EVM_CHAINS;
  iconSize?: number;
};

export default function MonitoredChainsStrip({
  title = "Monitored L2 networks",
  chains = L2_EVM_CHAINS,
  iconSize = 22,
}: MonitoredChainsStripProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3">
      <Caption1 className="text-muted-foreground">{title}</Caption1>
      <div className="flex flex-wrap items-center gap-2">
        {chains.map((chain) => (
          <span
            key={chain.slug}
            className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1"
            title={chain.name}
          >
            <ChainIcon chain={chain.slug} size={iconSize} title={chain.name} />
            <span className="text-xs font-medium text-foreground">{chain.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
