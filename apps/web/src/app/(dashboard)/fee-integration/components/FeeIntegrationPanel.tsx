"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import Card from "@/components/ui/Card";
import FramerCountUp from "@/components/ui/FramerCountUp";
import DashboardStatCardsGrid, {
  statCardItemVariants,
} from "@/components/ui/DashboardStatCardsGrid";
import { useLiveDsaWalletData } from "@/hooks/useLiveDsaWalletData";
import TestFeeSendModal from "./TestFeeSendModal";
import {
  buildFeeIntegrationMetrics,
  feeIntegrationMetrics,
  type FeeIntegrationMetric,
} from "../data";

function MetricValue({ metric }: { metric: FeeIntegrationMetric }) {
  const isToken =
    metric.valueSuffix?.includes("WETH") || metric.valueSuffix?.includes("ETH");

  return (
    <span className={metric.valueColor}>
      <FramerCountUp
        to={metric.value}
        prefix={metric.valuePrefix}
        suffix={metric.valueSuffix}
        decimals={isToken ? 4 : undefined}
      />
    </span>
  );
}

export default function FeeIntegrationPanel({
  isLoading = false,
}: {
  isLoading?: boolean;
}) {
  const live = useLiveDsaWalletData();

  const metrics = useMemo(() => {
    const baseMetrics = buildFeeIntegrationMetrics(feeIntegrationMetrics);

    if (!live.isLive || !live.platformStatus) {
      return baseMetrics;
    }

    const treasuryWeth = Number(
      live.platformStatus.treasuryWethBalanceFormatted
    );

    return baseMetrics.map((metric) => {
      if (metric.id === "fee-routed") {
        return {
          ...metric,
          value: treasuryWeth,
          valuePrefix: undefined,
          valueSuffix: " WETH",
          subtitle: "Live MorTreasuryBalance on Arbitrum",
        };
      }
      if (metric.id === "volume-captured") {
        const dsaWeth = live.activeDsa
          ? Number(live.activeDsa.wethBalanceFormatted)
          : Number(live.platformStatus!.platformWethBalanceFormatted);
        return {
          ...metric,
          value: dsaWeth,
          valuePrefix: undefined,
          valueSuffix: " WETH",
          subtitle: live.activeDsa
            ? `MorDSA WETH · ${live.activeDsa.address.slice(0, 6)}…`
            : "Platform MorDSA WETH balance",
        };
      }
      if (metric.id === "distribution-status") {
        const enabled =
          live.platformStatus!.connectors.filter((c) => c.enabled).length;
        const total = live.platformStatus!.connectors.length;
        const pct = total > 0 ? Math.round((enabled / total) * 100) : 0;
        return {
          ...metric,
          value: pct,
          subtitle: `${enabled}/${total} connectors enabled · live contract sync`,
        };
      }
      return metric;
    });
  }, [live.isLive, live.platformStatus, live.activeDsa]);

  return (
    <div className="flex flex-col gap-6">
      <DashboardStatCardsGrid
        isLoading={isLoading || (live.isConnected && live.isLoading)}
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
