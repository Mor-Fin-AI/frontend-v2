"use client";

import { ArrowRight16Regular } from "@fluentui/react-icons";
import { mergeClasses } from "@fluentui/react-components";
import { parseDexRoute, type DexSlug } from "@/lib/dexRegistry";
import DexIcon from "./DexIcon";

type DexRouteDisplayProps = {
  route: string;
  dexes?: DexSlug[];
  size?: number;
  className?: string;
  showLabels?: boolean;
};

export default function DexRouteDisplay({
  route,
  dexes,
  size = 18,
  className,
  showLabels = false,
}: DexRouteDisplayProps) {
  const steps = dexes ?? parseDexRoute(route);

  if (steps.length === 0) {
    return <span className={className}>{route}</span>;
  }

  return (
    <div
      className={mergeClasses(
        "flex min-w-0 flex-wrap items-center gap-1.5",
        className
      )}
    >
      {steps.map((dex, index) => (
        <span key={`${dex}-${index}`} className="inline-flex items-center gap-1">
          {index > 0 ? (
            <ArrowRight16Regular className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : null}
          <DexIcon dex={dex} size={size} />
          {showLabels ? (
            <span className="text-sm text-foreground">{dex}</span>
          ) : null}
        </span>
      ))}
    </div>
  );
}
