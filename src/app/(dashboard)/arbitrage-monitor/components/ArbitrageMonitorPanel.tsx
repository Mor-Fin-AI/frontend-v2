"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import FramerCountUp from "@/components/ui/FramerCountUp";
import DashboardStatCardsGrid, {
  statCardItemVariants,
} from "@/components/ui/DashboardStatCardsGrid";
import KillSwitchModal from "./KillSwitchModal";
import {
  arbitrageMonitorMetrics,
  buildArbitrageMetrics,
  type ArbitrageMetric,
  type KillSwitchStatus,
} from "../data";

function MetricValue({ metric }: { metric: ArbitrageMetric }) {
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

export default function ArbitrageMonitorPanel({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const [killSwitchStatus, setKillSwitchStatus] =
    useState<KillSwitchStatus>("running");

  const metrics = useMemo(
    () => buildArbitrageMetrics(arbitrageMonitorMetrics, killSwitchStatus),
    [killSwitchStatus]
  );

  return (
    <div className="flex flex-col gap-6">
      <DashboardStatCardsGrid
        isLoading={isLoading}
        loadingLabel="Loading arbitrage monitor metrics"
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

      <div className="flex justify-end">
        <KillSwitchModal
          status={killSwitchStatus}
          onStatusChange={setKillSwitchStatus}
        />
      </div>
    </div>
  );
}
