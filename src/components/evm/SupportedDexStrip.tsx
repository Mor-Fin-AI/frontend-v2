"use client";

import { Caption1 } from "@fluentui/react-components";
import { DEX_PROTOCOLS } from "@/lib/dexRegistry";
import DexIcon from "./DexIcon";

type SupportedDexStripProps = {
  title?: string;
  iconSize?: number;
};

export default function SupportedDexStrip({
  title = "Supported DEX routers",
  iconSize = 22,
}: SupportedDexStripProps) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card px-4 py-3">
      <Caption1 className="text-muted-foreground">{title}</Caption1>
      <div className="flex flex-wrap items-center gap-2">
        {DEX_PROTOCOLS.map((dex) => (
          <span
            key={dex.slug}
            className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1"
            title={dex.name}
          >
            <DexIcon dex={dex.slug} size={iconSize} title={dex.name} />
            <span className="text-xs font-medium text-foreground">{dex.name}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
