"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import FramerCountUp from "@/components/ui/FramerCountUp";
import DashboardStatCardsGrid, {
  statCardItemVariants,
} from "@/components/ui/DashboardStatCardsGrid";
import {
  buildLendingDebtMetrics,
  lendingDebtDischargeMetrics,
  type LendingDebtMetric,
} from "../data";

function MetricValue({ metric }: { metric: LendingDebtMetric }) {
  if (metric.format === "timer" || typeof metric.value === "string") {
    return <span className={metric.valueColor}>{metric.value}</span>;
  }

  return (
    <span className={metric.valueColor}>
      <FramerCountUp
        to={metric.value}
        prefix={metric.valuePrefix}
        suffix={metric.valueSuffix}
      />
    </span>
  );
}

export default function LendingDebtDischargePanel({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const metrics = useMemo(
    () => buildLendingDebtMetrics(lendingDebtDischargeMetrics),
    []
  );

  return (
    <DashboardStatCardsGrid
      isLoading={isLoading}
      loadingLabel="Loading lending and debt discharge metrics"
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
