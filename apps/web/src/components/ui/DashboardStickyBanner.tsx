"use client";

import type { RefObject } from "react";
import { Link } from "react-router-dom";
import { StickyBanner } from "@/components/ui/StickyBanner";

export default function DashboardStickyBanner({
  scrollContainerRef,
}: {
  scrollContainerRef?: RefObject<HTMLElement | null>;
}) {
  return (
    <StickyBanner hideOnScroll scrollContainerRef={scrollContainerRef}>
      <p className="text-sm font-medium tracking-wide text-primary-foreground">
        Morfinance treasury dashboard is live — track flows, arbitrage, and
        governance from one workspace.{" "}
        <Link
          to="/overview"
          className="font-semibold underline decoration-primary-foreground/40 underline-offset-4 transition-colors hover:decoration-primary-foreground"
        >
          Open Treasury Flow
        </Link>
      </p>
    </StickyBanner>
  );
}
