"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import FramerCountUp from "@/components/ui/FramerCountUp";
import DashboardStatCardsGrid, {
  statCardItemVariants,
} from "@/components/ui/DashboardStatCardsGrid";
import { useLiveDsaWalletData } from "@/hooks/useLiveDsaWalletData";
import { getCombinedEthBalance } from "@/lib/dsaApi";
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

  const live = useLiveDsaWalletData();

  const metrics = useMemo(() => {
    const baseMetrics = buildArbitrageMetrics(
      arbitrageMonitorMetrics,
      killSwitchStatus
    );

    if (!live.isLive) {
      return baseMetrics;
    }

    const ethExposure = live.activeDsa
      ? getCombinedEthBalance(live.activeDsa)
      : Number(live.platformStatus?.platformEthBalanceFormatted ?? 0);
    const enabledConnectors =
      live.platformStatus?.connectors.filter((c) => c.enabled).length ?? 0;

    return baseMetrics.map((metric) => {
      if (metric.id === "eth-modulation") {
        return {
          ...metric,
          subtitle: `Live MorDSA exposure: ${ethExposure.toFixed(4)} ETH`,
        };
      }
      if (metric.id === "regime-score") {
        return {
          ...metric,
          subtitle: `${enabledConnectors} DEX connectors enabled on Arbitrum`,
        };
      }
      return metric;
    });
  }, [killSwitchStatus, live.isLive, live.activeDsa, live.platformStatus]);

  return (
    <div className="flex flex-col gap-6">
      <DashboardStatCardsGrid
        isLoading={isLoading || (live.isConnected && live.isLoading)}
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
