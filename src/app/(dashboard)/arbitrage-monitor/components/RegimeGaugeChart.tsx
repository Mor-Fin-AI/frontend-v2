"use client";

import GoogleGaugeChartCard from "@/components/ui/charts/GoogleGaugeChartCard";
import { ARBITRAGE_PAIR_CHART_HEIGHT } from "../chartLayout";
import { arbitrageMonitorMetrics } from "../data";

export default function RegimeGaugeChart() {
  return (
    <GoogleGaugeChartCard
      title="Regime Score Gauge"
      description="Market regime confidence for current arbitrage window"
      label="Regime Score"
      value={arbitrageMonitorMetrics.regimeScore}
      statusLabel={arbitrageMonitorMetrics.regime}
      height={ARBITRAGE_PAIR_CHART_HEIGHT}
      className="h-full"
    />
  );
}
