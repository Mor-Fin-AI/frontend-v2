"use client";

import GoogleGaugeChartCard from "@/components/ui/charts/GoogleGaugeChartCard";
import { useLendingDischargeData } from "@/hooks/useLendingDischarge";
import { LENDING_PAIR_CHART_HEIGHT } from "../chartLayout";

export default function RepaymentGaugeChart() {
  const { data, isLoading, isError } = useLendingDischargeData();
  const metrics = data?.metrics;

  const repaid = metrics ? Number(metrics.debtRepaidEth) : 0;
  const total = metrics ? Number(metrics.debtTotalEth) : 0;
  const percent = metrics?.debtRepaymentPercent ?? 0;
  const status = metrics?.debtRepaymentStatus ?? "On Track";

  const description = metrics
    ? `${repaid.toFixed(4)} WETH recycled of ${total.toFixed(4)} WETH total deployed`
    : isError
      ? "Live panel unavailable"
      : "Loading from MorTreasuryFlowPanel…";

  return (
    <GoogleGaugeChartCard
      title="Debt Repayment Gauge"
      description={description}
      label="Debt Repayment"
      value={isLoading ? 0 : percent}
      statusLabel={status}
      height={LENDING_PAIR_CHART_HEIGHT}
      className="h-full"
      isLoading={isLoading}
    />
  );
}
