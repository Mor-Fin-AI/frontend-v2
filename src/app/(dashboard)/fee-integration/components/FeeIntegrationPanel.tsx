"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import FramerCountUp from "@/components/ui/FramerCountUp";
import DashboardStatCardsGrid, {
  statCardItemVariants,
} from "@/components/ui/DashboardStatCardsGrid";
import TestFeeSendModal from "./TestFeeSendModal";
import {
  buildFeeIntegrationMetrics,
  feeIntegrationMetrics,
  type FeeIntegrationMetric,
} from "../data";

function MetricValue({ metric }: { metric: FeeIntegrationMetric }) {
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

export default function FeeIntegrationPanel({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const metrics = useMemo(
    () => buildFeeIntegrationMetrics(feeIntegrationMetrics),
    []
  );

  return (
    <div className="flex flex-col gap-6">
      <DashboardStatCardsGrid
        isLoading={isLoading}
        loadingLabel="Loading fee integration metrics"
        className="grid grid-cols-1 gap-4 lg:grid-cols-3"
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
              trend={metric.trend}
              trendVariant="badge"
            />
          </motion.div>
        ))}
      </DashboardStatCardsGrid>

      <div className="flex justify-end">
        <TestFeeSendModal feeRatePercent={feeIntegrationMetrics.feeRatePercent} />
      </div>
    </div>
  );
}
