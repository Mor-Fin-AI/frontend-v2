"use client";

import GoogleGaugeChartCard from "@/components/ui/charts/GoogleGaugeChartCard";
import { feeIntegrationMetrics } from "../data";

export default function DistributionGaugeChart() {
  return (
    <GoogleGaugeChartCard
      title="Distribution Status Gauge"
      description="Fee allocation progress across all treasury buckets"
      label="Distribution Complete"
      value={feeIntegrationMetrics.distributionCompletePercent}
      statusLabel={feeIntegrationMetrics.distributionStatus}
      height={300}
    />
  );
}
