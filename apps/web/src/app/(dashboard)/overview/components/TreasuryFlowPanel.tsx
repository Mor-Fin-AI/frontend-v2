"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import AppBadge from "@/components/ui/AppBadge";
import FramerCountUp from "@/components/ui/FramerCountUp";
import DashboardStatCardsGrid, {
  statCardItemVariants,
} from "@/components/ui/DashboardStatCardsGrid";
import { useLiveDsaWalletData } from "@/hooks/useLiveDsaWalletData";
import { getTreasuryMetrics } from "@/lib/liveWalletData";
import {
  type TreasuryFlowMetric,
} from "../treasuryData";
import { getCompactCurrencyCountUpTarget } from "@/lib/formatNumbers";

function MetricValue({ metric }: { metric: TreasuryFlowMetric }) {
  if (metric.format === "status" && typeof metric.value === "string") {
    return (
      <AppBadge tone="success" appearance="tint" size="medium">
        {metric.value}
      </AppBadge>
    );
  }

  if (typeof metric.value === "number") {
    if (metric.format === "currency") {
      const compact = getCompactCurrencyCountUpTarget(metric.value);
      return (
        <span className="whitespace-nowrap tabular-nums text-foreground">
          <FramerCountUp
            to={compact.to}
            prefix={compact.prefix}
            suffix={compact.suffix}
            decimals={compact.decimals}
          />
        </span>
      );
    }

    if (metric.format === "token") {
      return (
        <span className="whitespace-nowrap tabular-nums text-foreground">
          <FramerCountUp
            to={metric.value}
            prefix={metric.valuePrefix}
            suffix={metric.valueSuffix}
            decimals={4}
          />
        </span>
      );
    }

    return (
      <span className="whitespace-nowrap tabular-nums text-foreground">
        <FramerCountUp
          to={metric.value}
          prefix={metric.valuePrefix}
          suffix={metric.valueSuffix}
        />
      </span>
    );
  }

  return <span className="text-foreground">{metric.value}</span>;
}

export default function TreasuryFlowPanel({ isLoading = false }: { isLoading?: boolean }) {
  const live = useLiveDsaWalletData();

  const metrics = useMemo(
    () =>
      getTreasuryMetrics(
        live.activeDsa,
        live.platformStatus,
        live.isPlatformOwner,
        live.isLive
      ),
    [
      live.activeDsa,
      live.platformStatus,
      live.isPlatformOwner,
      live.isLive,
    ]
  );

  return (
    <DashboardStatCardsGrid
      isLoading={isLoading || (live.isConnected && live.isLoading)}
      loadingLabel="Loading treasury flow metrics"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5"
    >
      {metrics.map((metric) => (
        <motion.div key={metric.id} variants={statCardItemVariants} className="min-w-0">
          <Card
            title={metric.title}
            value={<MetricValue metric={metric} />}
            subtitle={metric.subtitle}
            icon={metric.icon}
            iconBg={metric.iconBg}
            iconColor={metric.iconColor}
            className="h-full"
          />
        </motion.div>
      ))}
    </DashboardStatCardsGrid>
  );
}
