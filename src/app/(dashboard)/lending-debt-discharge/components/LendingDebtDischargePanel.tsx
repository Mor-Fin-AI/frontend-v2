"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import FramerCountUp from "@/components/ui/FramerCountUp";
import DashboardStatCardsGrid, {
  statCardItemVariants,
} from "@/components/ui/DashboardStatCardsGrid";
import { useLendingDischargeData } from "@/hooks/useLendingDischarge";
import { buildLiveLendingMetrics } from "@/lib/lendingApi";
import type { LendingDebtMetric } from "../data";

function MetricValue({ metric }: { metric: LendingDebtMetric }) {
  if (metric.format === "timer" || typeof metric.value === "string") {
    return <span className={metric.valueColor}>{metric.value}</span>;
  }

  if (metric.format === "token") {
    return (
      <span className={metric.valueColor}>
        <FramerCountUp
          to={metric.value as number}
          suffix={metric.valueSuffix}
          decimals={4}
        />
      </span>
    );
  }

  return (
    <span className={metric.valueColor}>
      <FramerCountUp
        to={metric.value as number}
        prefix={metric.valuePrefix}
        suffix={metric.valueSuffix}
        decimals={metric.format === "percent" ? 0 : undefined}
      />
    </span>
  );
}

export default function LendingDebtDischargePanel({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const liveQuery = useLendingDischargeData();

  const metrics = useMemo(() => {
    if (!liveQuery.data?.metrics) return [];
    return buildLiveLendingMetrics(liveQuery.data.metrics);
  }, [liveQuery.data?.metrics]);

  const loading = isLoading || liveQuery.isLoading;

  if (!loading && liveQuery.isError) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-6 text-center text-sm text-muted-foreground">
        Could not load live lending data from MorTreasuryFlowPanel. Check your
        connection and try again.
      </div>
    );
  }

  return (
    <DashboardStatCardsGrid
      isLoading={loading}
      loadingLabel="Loading lending and debt discharge metrics from Arbitrum"
    >
      {metrics.map((metric) => (
        <motion.div key={metric.id} variants={statCardItemVariants} className="min-w-0">
          <Card
            title={metric.title}
            value={<MetricValue metric={metric} />}
            valueColor={metric.valueColor}
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
