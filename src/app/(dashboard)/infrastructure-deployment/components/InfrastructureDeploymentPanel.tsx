"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import FramerCountUp from "@/components/ui/FramerCountUp";
import DashboardStatCardsGrid, {
  statCardItemVariants,
} from "@/components/ui/DashboardStatCardsGrid";
import {
  buildInfrastructureDeploymentMetrics,
  infrastructureDeploymentMetrics,
  type InfrastructureDeploymentMetric,
} from "../data";

function MetricValue({ metric }: { metric: InfrastructureDeploymentMetric }) {
  if (typeof metric.value === "string") {
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

export default function InfrastructureDeploymentPanel({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const metrics = useMemo(
    () => buildInfrastructureDeploymentMetrics(infrastructureDeploymentMetrics),
    []
  );

  return (
    <DashboardStatCardsGrid
      isLoading={isLoading}
      loadingLabel="Loading infrastructure deployment metrics"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
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
