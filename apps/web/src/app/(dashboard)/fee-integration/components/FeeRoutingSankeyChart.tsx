"use client";

import { useMemo } from "react";
import FluentSankeyChartCard from "@/components/ui/charts/FluentSankeyChartCard";
import { toFluentSankeyChartProps } from "@/lib/sankeyChart";
import { FEE_PAIR_CHART_HEIGHT } from "../chartLayout";
import { feeRoutingSankey } from "../data";

export default function FeeRoutingSankeyChart() {
  const data = useMemo(() => toFluentSankeyChartProps(feeRoutingSankey), []);

  return (
    <FluentSankeyChartCard
      title="Fee Routing Flow"
      description="How captured 1% fees distribute across treasury buckets"
      data={data}
      height={FEE_PAIR_CHART_HEIGHT}
      className="h-full"
    />
  );
}
