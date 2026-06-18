"use client";

import GoogleGaugeChartCard from "@/components/ui/charts/GoogleGaugeChartCard";
import { LENDING_PAIR_CHART_HEIGHT } from "../chartLayout";
import { lendingDebtDischargeMetrics } from "../data";

export default function RepaymentGaugeChart() {
  return (
    <GoogleGaugeChartCard
      title="Debt Repayment Gauge"
      description={`$${lendingDebtDischargeMetrics.debtRepaidUsd.toLocaleString()} repaid of $${lendingDebtDischargeMetrics.debtTotalUsd.toLocaleString()} total debt`}
      label="Debt Repayment"
      value={lendingDebtDischargeMetrics.debtRepaymentPercent}
      statusLabel={lendingDebtDischargeMetrics.debtRepaymentStatus}
      height={LENDING_PAIR_CHART_HEIGHT}
      className="h-full"
    />
  );
}
