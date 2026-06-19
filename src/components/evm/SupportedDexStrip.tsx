"use client";

import { Caption1 } from "@fluentui/react-components";
import { DEX_PROTOCOLS } from "@/lib/dexRegistry";
import { useMorContractsOptional } from "@/context/MorContractsContext";
import DexIcon from "./DexIcon";

/** Maps UI DEX slug → platformStatus.connectors key */
const DEX_CONNECTOR_KEYS: Partial<Record<string, string>> = {
  uniswap: "uniswapConnector",
  sushiswap: "sushiConnector",
  pancakeswap: "pancakeSwapV3Connector",
};

type SupportedDexStripProps = {
  title?: string;
  iconSize?: number;
};

export default function SupportedDexStrip({
  title = "Supported DEX routers (Arbitrum connectors)",
  iconSize = 22,
}: SupportedDexStripProps) {
  const context = useMorContractsOptional();
  const connectors = context?.platformStatus?.connectors ?? [];

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3">
      <Caption1 className="text-muted-foreground">{title}</Caption1>
      <div className="flex flex-wrap items-center gap-2">
        {DEX_PROTOCOLS.map((dex) => {
          const connectorKey = DEX_CONNECTOR_KEYS[dex.slug];
          const live = connectorKey
            ? connectors.find((item) => item.key === connectorKey)
            : undefined;

          return (
            <span
              key={dex.slug}
              className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1"
              title={
                live?.enabled
                  ? `${dex.name} · on-chain connector enabled`
                  : live?.enabled === false
                    ? `${dex.name} · connector disabled`
                    : dex.name
              }
            >
              <DexIcon dex={dex.slug} size={iconSize} title={dex.name} />
              <span className="text-xs font-medium text-foreground">{dex.name}</span>
              {live?.enabled ? (
                <span className="text-[10px] font-semibold uppercase text-[#22C38E]">
                  live
                </span>
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}
