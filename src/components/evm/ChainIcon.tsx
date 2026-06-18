"use client";

import { mergeClasses } from "@fluentui/react-components";
import type { L2ChainSlug } from "@/lib/l2EvmChains";
import { CHAIN_ICON_REGISTRY } from "./chainIconRegistry";

type ChainIconProps = {
  chain: L2ChainSlug;
  size?: number;
  variant?: "branded" | "mono" | "background";
  className?: string;
  title?: string;
};

export default function ChainIcon({
  chain,
  size = 20,
  variant = "branded",
  className,
  title,
}: ChainIconProps) {
  const Icon = CHAIN_ICON_REGISTRY[chain];

  return (
    <span title={title} className="inline-flex">
      <Icon
        size={size}
        variant={variant}
        className={mergeClasses("shrink-0", className)}
        aria-label={title}
      />
    </span>
  );
}
