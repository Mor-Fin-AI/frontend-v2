"use client";

import { mergeClasses } from "@fluentui/react-components";
import type { DexSlug } from "@/lib/dexRegistry";
import { getDexBySlug } from "@/lib/dexRegistry";
import { DEX_ICON_REGISTRY } from "./dexIconRegistry";
import CurveExchangeIcon from "./icons/CurveExchangeIcon";

type DexIconProps = {
  dex: DexSlug;
  size?: number;
  variant?: "branded" | "mono" | "background";
  className?: string;
  title?: string;
};

export default function DexIcon({
  dex,
  size = 20,
  variant = "branded",
  className,
  title,
}: DexIconProps) {
  const Icon = DEX_ICON_REGISTRY[dex];
  const label = title ?? getDexBySlug(dex)?.name ?? dex;

  if (dex === "curve") {
    return (
      <span title={label} className="inline-flex">
        <CurveExchangeIcon
          size={size}
          className={mergeClasses("shrink-0", className)}
          aria-label={label}
        />
      </span>
    );
  }

  return (
    <span title={label} className="inline-flex">
      <Icon
        size={size}
        variant={variant}
        className={mergeClasses("shrink-0", className)}
        aria-label={label}
      />
    </span>
  );
}
